# @file plugins/rating/backend.py
# @brief 星级评分插件后端
# @create 2026-03-09 10:00:00

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()


class RatingUpdate(BaseModel):
    rating: int


@router.put("/items/{item_id}/rating")
async def update_rating(item_id: str, data: RatingUpdate) -> Dict[str, Any]:
    if not 1 <= data.rating <= 5:
        raise HTTPException(status_code=400, detail="星级必须在1-5之间")

    from managers.item_manager import item_manager

    try:
        await item_manager.update(item_id, {"attributes": {"rating": data.rating}})
        return {"success": True, "rating": data.rating}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/items/{item_id}/rating")
async def get_rating(item_id: str) -> Dict[str, Any]:
    from managers.item_manager import item_manager

    try:
        item = await item_manager.get_by_id(item_id)
        rating = item.get("attributes", {}).get("rating", 0)
        return {"rating": rating}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def on_load():
    print("[RatingPlugin] 星级评分插件已加载")


async def on_unload():
    print("[RatingPlugin] 星级评分插件已卸载")
