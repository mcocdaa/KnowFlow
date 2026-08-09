# @file backend/api/v1/item.py
# @brief 知识项 CRUD 接口（异步版）
# @create 2026-03-07 10:00:00

from fastapi import APIRouter, HTTPException

from managers.item_manager import item_manager
from managers.key_manager import key_manager

router = APIRouter()


@router.get("/item")
async def get_item():
    try:
        return await item_manager.get_all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/item/search")
async def search_items(
    q: str = "", key: str = None, key_value: str = None, sort: str = "recent", page: int = 1, page_size: int = 20
):
    try:
        return await item_manager.search(q=q, key=key, key_value=key_value, sort=sort, page=page, page_size=page_size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/item/{item_id}")
async def get_item_item(item_id: str):
    try:
        item = await item_manager.get_by_id(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
        return item
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/item")
async def add_item(item: dict):
    try:
        all_keys = await key_manager.get_all()
        key_values = item.get("keyValues", {}) or item.get("attributes", {})
        missing = [
            key["name"]
            for key in all_keys
            if key.get("is_required", False) and key["name"] not in key_values and key["name"] not in item
        ]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing required keys: {', '.join(missing)}")
        return await item_manager.create(item)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/item/{item_id}")
async def update_item(item_id: str, item: dict):
    try:
        updated = await item_manager.update(item_id, item)
        if updated is None:
            raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/item/{item_id}")
async def delete_item(item_id: str):
    try:
        deleted = await item_manager.delete(item_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
        return {"message": "Item deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
