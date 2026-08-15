# @file backend/api/v1/key.py
# @brief Key定义管理接口
# @create 2026-03-06 10:00:00

from fastapi import APIRouter, Depends, HTTPException

from api.deps import get_key_manager
from api.errors import ok
from managers.key_manager import KeyManager

router = APIRouter()


@router.get("/keys")
async def get_keys(manager: KeyManager = Depends(get_key_manager)):
    return ok(await manager.get_all())


@router.get("/keys/{key_name}")
async def get_key(key_name: str, manager: KeyManager = Depends(get_key_manager)):
    key = await manager.get_by_name(key_name)
    if key is None:
        raise HTTPException(status_code=404, detail=f"key with name {key_name} does not exist")
    return ok(key)


@router.post("/keys")
async def create_key(key: dict, manager: KeyManager = Depends(get_key_manager)):
    return ok(await manager.create(key))


@router.put("/keys/{key_name}")
async def update_key(key_name: str, updates: dict, manager: KeyManager = Depends(get_key_manager)):
    return ok(await manager.update(key_name, updates))


@router.delete("/keys/{key_name}")
async def delete_key(key_name: str, manager: KeyManager = Depends(get_key_manager)):
    await manager.delete(key_name)
    return ok(None, "Key deleted successfully")
