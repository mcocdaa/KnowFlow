# @file backend/api/v1/upload.py
# @brief 文件上传接口
# @create 2026-03-06 10:00:00

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from managers.item_manager import item_manager
from managers.key_manager import key_manager
from utils.file_util import generate_file_path
import json

router = APIRouter()


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    data: str = Form(...)
):
    try:
        item_data = json.loads(data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in data field")
    
    all_keys = await key_manager.get_all()
    
    required_keys = [key for key in all_keys if key.get('is_required', False)]
    
    file_path = generate_file_path(file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    key_values = item_data.get("keyValues", {}) or item_data.get("attributes", {})
    
    key_values['file_path'] = file_path
    key_values['file_type'] = file.content_type or ""
    
    if "name" not in key_values and "name" in item_data:
        key_values['name'] = item_data["name"]
    
    for req_key in required_keys:
        req_key_name = req_key['name']
        if req_key_name not in key_values or key_values[req_key_name] is None:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required key: {req_key_name}"
            )
    
    new_item = {
        "name": key_values.get("name", ""),
        "keyValues": key_values
    }
    
    try:
        return await item_manager.create(new_item)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
