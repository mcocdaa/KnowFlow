# @file backend/api/v1/item.py
# @brief 知识项 CRUD 接口（异步版）
# @create 2026-03-07 10:00:00

from fastapi import APIRouter, HTTPException, Query

from api.errors import ok
from managers.item_manager import extract_key_values, item_manager

router = APIRouter()


@router.get("/item")
async def list_items():
    return ok(await item_manager.get_all())


@router.get("/item/search")
async def search_items(
    q: str = Query("", max_length=100),
    key: str | None = None,
    key_value: str | None = None,
    sort: str = Query("recent", pattern="^(recent|rating|name)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    return ok(await item_manager.search(q=q, key=key, key_value=key_value, sort=sort, page=page, page_size=page_size))


@router.get("/item/{item_id}")
async def get_item(item_id: str):
    item = await item_manager.get_by_id(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
    return ok(item)


@router.post("/item")
async def add_item(item: dict):
    key_values = extract_key_values(item)
    missing = [
        key["name"]
        for key in await item_manager.get_required_key_defs()
        if key["name"] not in key_values and key["name"] not in item
    ]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required keys: {', '.join(missing)}")
    return ok(await item_manager.create(item))


@router.put("/item/{item_id}")
async def update_item(item_id: str, item: dict):
    updated = await item_manager.update(item_id, item)
    if updated is None:
        raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
    return ok(updated)


@router.delete("/item/{item_id}")
async def delete_item(item_id: str):
    deleted = await item_manager.delete(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
    return ok(None, "Item deleted successfully")
