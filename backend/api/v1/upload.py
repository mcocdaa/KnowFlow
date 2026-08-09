# @file backend/api/v1/upload.py
# @brief 文件上传接口
# @create 2026-03-06 10:00:00

import json
import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from api.errors import ok
from config.settings import MAX_UPLOAD_SIZE
from managers.item_manager import extract_key_values, item_manager
from utils.file_util import generate_file_path

logger = logging.getLogger(__name__)

router = APIRouter()

_CHUNK_SIZE = 1024 * 1024


@router.post("/upload")
async def upload_file(file: UploadFile = File(...), data: str = Form(...)):
    try:
        item_data = json.loads(data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in data field")

    key_values = extract_key_values(item_data)
    key_values["file_path"] = file.filename or ""
    key_values["file_type"] = file.content_type or ""

    if "name" not in key_values and "name" in item_data:
        key_values["name"] = item_data["name"]

    for req_key in await item_manager.get_required_key_defs():
        req_key_name = req_key["name"]
        if req_key_name not in key_values or key_values[req_key_name] is None:
            raise HTTPException(status_code=400, detail=f"Missing required key: {req_key_name}")

    file_path = generate_file_path(file.filename or "upload")
    try:
        with open(file_path, "wb") as f:
            size = 0
            while chunk := await file.read(_CHUNK_SIZE):
                size += len(chunk)
                if size > MAX_UPLOAD_SIZE:
                    raise HTTPException(
                        status_code=413, detail=f"文件大小超过上限 {MAX_UPLOAD_SIZE // (1024 * 1024)}MB"
                    )
                f.write(chunk)

        key_values["file_path"] = file_path

        new_item = {"name": key_values.get("name", ""), "keyValues": key_values}

        return ok(await item_manager.create(new_item))
    except Exception:
        _cleanup_file(file_path)
        raise


def _cleanup_file(file_path: str):
    """清理已写入的孤儿文件"""
    import os

    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except OSError as e:
        logger.warning(f"清理上传文件失败: {file_path} - {e}")
