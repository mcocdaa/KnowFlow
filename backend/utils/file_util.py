# @file backend/utils/file_util.py
# @brief 文件处理、路径工具
# @create 2026-03-06 10:00:00

import os
import uuid
from config.settings import UPLOAD_DIR

def generate_file_path(filename: str) -> str:
    return os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}-{filename}")
