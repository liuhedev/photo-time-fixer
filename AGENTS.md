## Cursor Cloud specific instructions

### Overview

photo-time-fixer is a Python tool that parses timestamps from photo/video filenames and writes them into EXIF metadata using `exiftool`. It has two modes: CLI (`fix_time.py`) and Web (`server.py` on port 8080). See `README.md` for supported filename formats and usage.

### System dependency

`exiftool` (`libimage-exiftool-perl`) must be installed at the system level. Without it, both CLI and Web modes silently fail (EXIF writes return `False` / produce empty ZIPs). The update script handles this.

### Commands

- **Lint**: `pylint $(git ls-files '*.py')` (matches CI config in `.github/workflows/pylint.yml`)
- **Web server**: `python3 photo-time-fixer-core/src/server.py` (runs on port 8080)
- **CLI**: `python3 photo-time-fixer-core/src/fix_time.py <directory> [--rename] [--only-special]`

### Gotchas

- `kivy>=2.0.0` is listed in `requirements.txt` but is not used by any source file. It is safe to install but not required for testing.
- The project has no automated tests. Verification requires creating real image files (e.g. via Pillow) since `exiftool` cannot write EXIF to empty/corrupt files.
- Python packages install to `~/.local/bin` (user-level install). Ensure `$HOME/.local/bin` is on `PATH` if running `pylint` or `flask` CLI directly.
