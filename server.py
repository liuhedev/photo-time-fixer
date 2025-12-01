#!/usr/bin/env python3
import os
import re
import subprocess
import tempfile
import zipfile
from datetime import datetime
from io import BytesIO
from pathlib import Path

from flask import Flask, request, send_file, render_template_string

app = Flask(__name__)

HTML = '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>照片时间修正</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            padding: 20px;
            color: #e8e8e8;
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
        }
        h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 24px;
            text-align: center;
            color: #00d9ff;
            text-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
        }
        .upload-area {
            border: 2px dashed #00d9ff;
            border-radius: 16px;
            padding: 40px 20px;
            text-align: center;
            background: rgba(0, 217, 255, 0.05);
            transition: all 0.3s;
            cursor: pointer;
        }
        .upload-area:hover, .upload-area.dragover {
            background: rgba(0, 217, 255, 0.15);
            border-color: #00ffcc;
        }
        .upload-area input { display: none; }
        .upload-icon {
            font-size: 48px;
            margin-bottom: 12px;
        }
        .upload-text { color: #aaa; font-size: 14px; }
        .file-list {
            margin-top: 20px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 16px;
            max-height: 300px;
            overflow-y: auto;
        }
        .file-item {
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            font-size: 13px;
            display: flex;
            justify-content: space-between;
        }
        .file-item:last-child { border-bottom: none; }
        .file-name { color: #e8e8e8; word-break: break-all; }
        .file-time { color: #00d9ff; white-space: nowrap; margin-left: 10px; }
        .file-error { color: #ff6b6b; }
        .btn {
            width: 100%;
            padding: 16px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s;
        }
        .btn-primary {
            background: linear-gradient(135deg, #00d9ff, #00ffcc);
            color: #1a1a2e;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 217, 255, 0.3); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .status {
            text-align: center;
            margin-top: 16px;
            font-size: 14px;
            color: #aaa;
        }
        .progress {
            margin-top: 16px;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            height: 8px;
            overflow: hidden;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #00d9ff, #00ffcc);
            width: 0%;
            transition: width 0.3s;
        }
        .stats {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 16px;
            font-size: 13px;
        }
        .stat { color: #00d9ff; }
        .stat-error { color: #ff6b6b; }
    </style>
</head>
<body>
    <div class="container">
        <h1>照片时间修正</h1>
        <div class="upload-area" id="uploadArea">
            <div class="upload-icon">📷</div>
            <div class="upload-text">点击选择文件 / 长按选择文件夹</div>
            <input type="file" id="fileInput" multiple accept="image/*,video/*">
            <input type="file" id="folderInput" webkitdirectory>
        </div>
        <div class="file-list" id="fileList" style="display:none;"></div>
        <div class="stats" id="stats" style="display:none;">
            <span class="stat" id="statOk"></span>
            <span class="stat-error" id="statErr"></span>
        </div>
        <button class="btn btn-primary" id="submitBtn" disabled>处理并下载</button>
        <div class="progress" id="progress" style="display:none;"><div class="progress-bar" id="progressBar"></div></div>
        <div class="status" id="status"></div>
    </div>
    <script>
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        const submitBtn = document.getElementById('submitBtn');
        const status = document.getElementById('status');
        const stats = document.getElementById('stats');
        let files = [];

        const folderInput = document.getElementById('folderInput');
        let pressTimer;
        uploadArea.onclick = () => fileInput.click();
        uploadArea.oncontextmenu = e => { e.preventDefault(); folderInput.click(); };
        uploadArea.ontouchstart = () => { pressTimer = setTimeout(() => folderInput.click(), 500); };
        uploadArea.ontouchend = () => clearTimeout(pressTimer);
        uploadArea.ondragover = e => { e.preventDefault(); uploadArea.classList.add('dragover'); };
        uploadArea.ondragleave = () => uploadArea.classList.remove('dragover');
        uploadArea.ondrop = e => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        };
        fileInput.onchange = () => handleFiles(fileInput.files);
        folderInput.onchange = () => handleFiles(folderInput.files);

        async function handleFiles(newFiles) {
            files = [...files, ...Array.from(newFiles)];
            const resp = await fetch('/parse', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({names: files.map(f => f.name)})
            });
            const parsed = await resp.json();
            
            // 按解析时间排序（新的在前）
            const items = files.map((f, i) => ({file: f, time: parsed[i], idx: i}));
            items.sort((a, b) => {
                if (!a.time && !b.time) return 0;
                if (!a.time) return 1;
                if (!b.time) return -1;
                return new Date(b.time) - new Date(a.time);
            });
            files = items.map(it => it.file);
            const sortedTimes = items.map(it => it.time);
            
            let ok = 0, err = 0;
            fileList.innerHTML = '';
            files.forEach((f, i) => {
                const div = document.createElement('div');
                div.className = 'file-item';
                const time = sortedTimes[i];
                if (time) {
                    div.innerHTML = `<span class="file-name">${f.name}</span><span class="file-time">${time}</span>`;
                    ok++;
                } else {
                    div.innerHTML = `<span class="file-name">${f.name}</span><span class="file-error">无法解析</span>`;
                    err++;
                }
                fileList.appendChild(div);
            });
            fileList.style.display = 'block';
            stats.style.display = 'flex';
            document.getElementById('statOk').textContent = `可处理: ${ok}`;
            document.getElementById('statErr').textContent = `跳过: ${err}`;
            submitBtn.disabled = ok === 0;
        }

        submitBtn.onclick = async () => {
            submitBtn.disabled = true;
            const progress = document.getElementById('progress');
            const progressBar = document.getElementById('progressBar');
            progress.style.display = 'block';
            
            const BATCH_SIZE = 20;
            const validFiles = files.filter(f => {
                const resp = fetch('/parse', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({names: [f.name]})
                });
                return true;
            });
            
            const allBlobs = [];
            for (let i = 0; i < files.length; i += BATCH_SIZE) {
                const batch = files.slice(i, i + BATCH_SIZE);
                status.textContent = `上传中 ${Math.min(i + BATCH_SIZE, files.length)}/${files.length}`;
                progressBar.style.width = `${(i / files.length) * 50}%`;
                
                const formData = new FormData();
                batch.forEach(f => formData.append('files', f));
                
                const resp = await fetch('/process', { method: 'POST', body: formData });
                if (resp.ok) {
                    allBlobs.push(await resp.blob());
                }
                progressBar.style.width = `${((i + BATCH_SIZE) / files.length) * 50 + 50}%`;
            }
            
            status.textContent = '打包中...';
            progressBar.style.width = '100%';
            
            if (allBlobs.length === 1) {
                const url = URL.createObjectURL(allBlobs[0]);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'photos_fixed.zip';
                a.click();
            } else {
                for (let i = 0; i < allBlobs.length; i++) {
                    const url = URL.createObjectURL(allBlobs[i]);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `photos_fixed_${i + 1}.zip`;
                    a.click();
                    await new Promise(r => setTimeout(r, 500));
                }
            }
            
            status.textContent = `下载完成，共 ${allBlobs.length} 个压缩包`;
            submitBtn.disabled = false;
        };
    </script>
</body>
</html>
'''


def parse_time_from_filename(filename: str) -> datetime | None:
    name = Path(filename).stem
    
    if m := re.match(r'mmexport(\d{13})', name):
        ts = int(m.group(1)) / 1000
        return datetime.fromtimestamp(ts)
    
    if m := re.match(r'mmexport_(\d{13})', name):
        ts = int(m.group(1)) / 1000
        return datetime.fromtimestamp(ts)
    
    if m := re.search(r'_(\d{14})$', name):
        return datetime.strptime(m.group(1), '%Y%m%d%H%M%S')
    
    if m := re.match(r'petal_(\d{8})_(\d{6})', name):
        return datetime.strptime(m.group(1) + m.group(2), '%Y%m%d%H%M%S')
    
    if m := re.match(r'TG-(\d{4})-(\d{2})-(\d{2})-(\d{6})', name):
        dt_str = m.group(1) + m.group(2) + m.group(3) + m.group(4)
        return datetime.strptime(dt_str, '%Y%m%d%H%M%S')
    
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
    
    # Notepad_YYYYMMDDHHMM_xxx 或 vp_output_YYYYMMDDHHMM
    if m := re.search(r'_(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])([0-5]\d)$', name):
        return datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)), int(m.group(4)), int(m.group(5)), 0)
    
    # video_YYMMDD_HHMMSS
    if m := re.match(r'video_(\d{2})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})', name):
        year = 2000 + int(m.group(1))
        return datetime(year, int(m.group(2)), int(m.group(3)), int(m.group(4)), int(m.group(5)), int(m.group(6)))
    
    return None


@app.route('/')
def index():
    return render_template_string(HTML)


@app.route('/parse', methods=['POST'])
def parse():
    names = request.json.get('names', [])
    results = []
    for name in names:
        dt = parse_time_from_filename(name)
        results.append(dt.strftime('%Y-%m-%d %H:%M:%S') if dt else None)
    return results


@app.route('/process', methods=['POST'])
def process():
    files = request.files.getlist('files')
    
    with tempfile.TemporaryDirectory() as tmpdir:
        processed = []
        
        for f in files:
            dt = parse_time_from_filename(f.filename)
            if not dt:
                continue
            
            filepath = os.path.join(tmpdir, f.filename)
            f.save(filepath)
            
            dt_str = dt.strftime('%Y:%m:%d %H:%M:%S')
            subprocess.run([
                'exiftool', '-overwrite_original',
                f'-AllDates={dt_str}',
                f'-FileModifyDate={dt_str}',
                f'-FileCreateDate={dt_str}',
                filepath
            ], capture_output=True)
            
            ts = dt.timestamp()
            os.utime(filepath, (ts, ts))
            
            processed.append(filepath)
        
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for fp in processed:
                zf.write(fp, os.path.basename(fp))
        
        zip_buffer.seek(0)
        return send_file(zip_buffer, mimetype='application/zip', download_name='photos_fixed.zip')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

