#!/usr/bin/env python3
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def parse_time_from_filename(filename: str) -> datetime | None:
    name = Path(filename).stem
    
    # mmexport + 13位毫秒时间戳
    if m := re.match(r'mmexport(\d{13})', name):
        ts = int(m.group(1)) / 1000
        return datetime.fromtimestamp(ts)
    
    # lv_xxx_YYYYMMDDHHMMSS
    if m := re.search(r'_(\d{14})$', name):
        return datetime.strptime(m.group(1), '%Y%m%d%H%M%S')
    
    # petal_YYYYMMDD_HHMMSS
    if m := re.match(r'petal_(\d{8})_(\d{6})', name):
        return datetime.strptime(m.group(1) + m.group(2), '%Y%m%d%H%M%S')
    
    # TG-YYYY-MM-DD-HHMMSS
    if m := re.match(r'TG-(\d{4})-(\d{2})-(\d{2})-(\d{6})', name):
        dt_str = m.group(1) + m.group(2) + m.group(3) + m.group(4)
        return datetime.strptime(dt_str, '%Y%m%d%H%M%S')
    
    # 微信图片_YYYYMMDDHHMMSS_xxx_xx
    if m := re.match(r'微信图片_(\d{14})', name):
        return datetime.strptime(m.group(1), '%Y%m%d%H%M%S')
    
    # VID_YYYYMMDD_HHMMSS
    if m := re.match(r'VID_(\d{8})_(\d{6})', name):
        return datetime.strptime(m.group(1) + m.group(2), '%Y%m%d%H%M%S')
    
    # 通用：YYYYMMDD_HHMMSS 或 YYYYMMDDHHMMSS
    if m := re.search(r'(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[_-]?(\d{6})', name):
        dt_str = m.group(1) + m.group(2) + m.group(3) + m.group(4)
        return datetime.strptime(dt_str, '%Y%m%d%H%M%S')
    
    # 通用：YYYY-MM-DD 或 YYYY_MM_DD
    if m := re.search(r'(20\d{2})[-_](0[1-9]|1[0-2])[-_](0[1-9]|[12]\d|3[01])', name):
        return datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)), 12, 0, 0)
    
    # 通用：13位毫秒时间戳
    if m := re.search(r'(\d{13})', name):
        ts = int(m.group(1)) / 1000
        if 1000000000 < ts < 2000000000:
            return datetime.fromtimestamp(ts)
    
    # 通用：10位秒时间戳
    if m := re.search(r'(\d{10})', name):
        ts = int(m.group(1))
        if 1000000000 < ts < 2000000000:
            return datetime.fromtimestamp(ts)
    
    return None


def fix_exif_time(filepath: str, dt: datetime) -> bool:
    dt_str = dt.strftime('%Y:%m:%d %H:%M:%S')
    cmd = [
        'exiftool',
        '-overwrite_original',
        f'-AllDates={dt_str}',
        f'-FileModifyDate={dt_str}',
        f'-FileCreateDate={dt_str}',
        filepath
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        ts = dt.timestamp()
        os.utime(filepath, (ts, ts))
        return True
    return False


def main():
    if len(sys.argv) < 2:
        print("用法: python3 fix_time.py <目录路径>")
        sys.exit(1)
    
    target_dir = Path(sys.argv[1])
    if not target_dir.is_dir():
        print(f"错误: {target_dir} 不是有效目录")
        sys.exit(1)
    
    fixed = 0
    skipped = 0
    failed = 0
    
    for f in sorted(target_dir.iterdir()):
        if not f.is_file():
            continue
        
        dt = parse_time_from_filename(f.name)
        if dt:
            if fix_exif_time(str(f), dt):
                print(f"✓ {f.name} -> {dt}")
                fixed += 1
            else:
                print(f"✗ {f.name} (写入失败)")
                failed += 1
        else:
            print(f"- {f.name} (无法解析)")
            skipped += 1
    
    print(f"\n完成: 修正 {fixed} 个, 跳过 {skipped} 个, 失败 {failed} 个")


if __name__ == '__main__':
    main()
