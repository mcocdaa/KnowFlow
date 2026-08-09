# @file backend/utils/file_util.py
# @brief 文件处理、路径工具
# @create 2026-03-06 10:00:00

import os
import re
import uuid

from config.settings import UPLOAD_DIR


def generate_file_path(filename: str) -> str:
    """生成上传文件路径，使用 uuid 前缀防碰撞并消毒文件名防路径穿越"""
    safe_name = re.sub(r"[^A-Za-z0-9._\u4e00-\u9fff-]", "_", os.path.basename(filename))
    safe_name = safe_name.strip() or "upload"
    return os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}-{safe_name}")
