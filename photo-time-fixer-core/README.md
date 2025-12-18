# photo-time-fixer

从文件名解析时间并写入 EXIF 元数据的工具。

## 依赖

- Python 3.x
- exiftool
- Flask（仅 Web 版需要）

## 安装

### exiftool

**macOS:**
```bash
brew install exiftool
```

**Linux:**
```bash
sudo apt-get install libimage-exiftool-perl
```

**Windows:**
从 [ExifTool 官网](https://exiftool.org/) 下载并安装。

### Python 依赖

```bash
pip install -r requirements.txt
```

## 使用方式

### 命令行

```bash
python3 fix_time.py <目录路径> [--rename]
```

- `--rename`: 重命名文件为 `YYYYMMDDHHMMSS_时间戳.扩展名` 格式

### Web 版

```bash
python3 server.py
```

访问 `http://localhost:8080`，上传文件后自动处理并下载。

## 支持的文件名格式

| 格式 | 示例 |
|------|------|
| mmexport + 13位时间戳 | `mmexport1234567890123.jpg` |
| petal_YYYYMMDD_HHMMSS | `petal_20231201_120000.jpg` |
| TG-YYYY-MM-DD-HHMMSS | `TG-2023-12-01-120000.jpg` |
| 微信图片_YYYYMMDDHHMMSS | `微信图片_20231201120000.jpg` |
| VID_YYYYMMDD_HHMMSS | `VID_20231201_120000.mp4` |
| YYYYMMDD_HHMMSS | `20231201_120000.jpg` |
| YYYY-MM-DD | `2023-12-01.jpg` |
| 13位/10位时间戳 | `1701388800000.jpg` |

