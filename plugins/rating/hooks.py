# @file plugins/rating/hooks.py
# @brief 星级评分插件 Hooks
# @create 2026-03-27

from core import hook_manager
from core.hooks import ITEM_CREATE_AFTER, ITEM_UPDATE_AFTER


@hook_manager.hook(ITEM_CREATE_AFTER)
async def on_item_create(result, *args, **kwargs):
    """知识项创建后自动设置默认评分"""
    if result and isinstance(result, dict):
        print(f"[RatingHook] 知识项已创建: {result.get('item', {}).get('id')}")


@hook_manager.hook(ITEM_UPDATE_AFTER)
async def on_item_update(result, item_id, updates, *args, **kwargs):
    """知识项更新后检查评分变化"""
    if result and isinstance(result, dict):
        rating = result.get("attributes", {}).get("rating")
        if rating is not None:
            print(f"[RatingHook] 知识项评分已更新: {item_id} -> {rating}")
