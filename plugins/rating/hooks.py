# @file plugins/rating/hooks.py
# @brief 星级评分插件 Hooks
# @create 2026-03-27

import logging

from core import hook_manager
from core.hooks import ITEM_CREATE_AFTER, ITEM_UPDATE_AFTER

logger = logging.getLogger(__name__)


@hook_manager.hook(ITEM_CREATE_AFTER)
async def on_item_create(result, *args, **kwargs):
    """知识项创建后自动写入默认评分"""
    if not result or not isinstance(result, dict):
        return

    item = result.get("item", {})
    attributes = result.get("attributes", {})
    item_id = item.get("id")
    if not item_id or "rating" in attributes:
        return

    from managers.item_manager import item_manager
    from managers.key_manager import key_manager

    key_def = await key_manager.get_by_name("rating")
    if not key_def:
        return

    default_rating = key_def.get("default_value", 0)
    if not default_rating:  # skip when default is 0 / None / ""
        return

    await item_manager.update(item_id, {"attributes": {"rating": default_rating}})
    logger.info(f"[RatingHook] 知识项 {item_id} 已设置默认评分: {default_rating}")


@hook_manager.hook(ITEM_UPDATE_AFTER)
async def on_item_update(result, *args, **kwargs):
    """知识项更新后检查评分变化"""
    if result and isinstance(result, dict):
        rating = result.get("attributes", {}).get("rating")
        if rating is not None:
            logger.info(f"[RatingHook] 知识项评分已更新: {rating}")
