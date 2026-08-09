# @file plugins/rating/backend.py
# @brief 星级评分插件后端
# @create 2026-03-09 10:00:00

import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from api.errors import ok
from managers.item_manager import item_manager

logger = logging.getLogger(__name__)

router = APIRouter()


class RatingUpdate(BaseModel):
    rating: int


@router.put("/items/{item_id}/rating")
async def update_rating(item_id: str, data: RatingUpdate) -> dict[str, Any]:
    if not 1 <= data.rating <= 5:
        raise HTTPException(status_code=400, detail="星级必须在1-5之间")

    updated = await item_manager.update(item_id, {"attributes": {"rating": data.rating}})
    if updated is None:
        raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
    return ok({"rating": data.rating})


@router.get("/items/{item_id}/rating")
async def get_rating(item_id: str) -> dict[str, Any]:
    item = await item_manager.get_by_id(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
    rating = item.get("attributes", {}).get("rating", 0)
    return ok({"rating": rating})


async def on_load():
    logger.info("[RatingPlugin] 星级评分插件已加载")


async def on_unload():
    logger.info("[RatingPlugin] 星级评分插件已卸载")
