# @file plugins/knowflow_openclaw/hooks.py
# @brief KnowFlow OpenClaw桥接插件钩子
# @create 2026-03-27

from core.hook_manager import hook_manager
from core.hooks import ITEM_CREATE_AFTER, ITEM_UPDATE_AFTER, ITEM_DELETE_BEFORE
import logging

logger = logging.getLogger(__name__)


@hook_manager.hook(ITEM_CREATE_AFTER)
async def on_item_create_after(result, *args, **kwargs) -> None:
    """
    知识项创建后钩子

    Args:
        result: 创建结果
    """
    if result and isinstance(result, dict):
        logger.debug(f"[KnowFlowOpenClawHook] 知识项已创建: {result.get('item', {}).get('id')}")


@hook_manager.hook(ITEM_UPDATE_AFTER)
async def on_item_update_after(result, *args, **kwargs) -> None:
    """
    知识项更新后钩子

    Args:
        result: 更新结果
    """
    if result and isinstance(result, dict):
        logger.debug(f"[KnowFlowOpenClawHook] 知识项已更新: {result.get('item', {}).get('id')}")


@hook_manager.hook(ITEM_DELETE_BEFORE)
async def on_item_delete_before(item_id, *args, **kwargs) -> None:
    """
    知识项删除前钩子

    Args:
        item_id: 要删除的知识项 ID
    """
    logger.debug(f"[KnowFlowOpenClawHook] 知识项即将删除: {item_id}")


async def register_hooks() -> None:
    """
    注册插件钩子（可选，PluginManager 会自动加载 hooks_entry）
    """
    logger.info("[KnowFlowOpenClawHook] 插件钩子已就绪")
