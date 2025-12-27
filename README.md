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
python3 fix_time.py <目录路径> [--rename] [--only-special]
```

- `--rename`: 重命名文件为 `YYYYMMDDHHMMSS_时间戳.扩展名` 格式
- `--only-special`: 批量模式，仅处理 `mmexport` 或 `petal` 开头的文件

### 高效批量处理（手机局域网方案）

如果手机中照片过多，通过 Web 上传较慢，推荐使用 **SMB/网络邻居** 方式：

1. **电脑开启共享**：
   - **macOS**: 系统设置 -> 通用 -> 共享 -> 开启“文件共享”，添加一个空的共享文件夹。
2. **手机连接电脑**：
   - **iPhone**: “文件”App -> 右上角 `...` -> 连接服务器 -> 输入电脑 IP。
   - **Android**: 使用文件管理器（如 ES 文件浏览器）连接局域网 SMB。
3. **传输与处理**：
   - 将手机相册中的 `mmexport`/`petal` 照片移动到共享文件夹。
   - 在电脑端运行脚本：
     ```bash
     python3 fix_time.py /path/to/shared/folder --rename --only-special
     ```
   - 处理完成后，直接在手机“文件”App 中即可查看到修正后的文件。

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

