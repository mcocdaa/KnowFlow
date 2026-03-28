# @file plugins/knowflow_openclaw/hooks.py
# @brief KnowFlow OpenClaw桥接插件钩子
# @create 2026-03-27

from core.hook_manager import hook_manager
from core.hooks import ITEM_CREATE_AFTER, ITEM_UPDATE_AFTER, ITEM_DELETE_BEFORE
import logging

logger = logging.getLogger(__name__)


@hook_manager.hook(ITEM_CREATE_AFTER)
async def on_item_create_after(item: dict) -> None:
    """
    知识项创建后钩子

    Args:
        item: 知识项数据
    """
    logger.debug(f"[KnowFlowOpenClawHook] 知识项已创建: {item.get('id')}")


@hook_manager.hook(ITEM_UPDATE_AFTER)
async def on_item_update_after(old_item: dict, new_item: dict) -> None:
    """
    知识项更新后钩子

    Args:
        old_item: 更新前的知识项
        new_item: 更新后的知识项
    """
    logger.debug(f"[KnowFlowOpenClawHook] 知识项已更新: {new_item.get('id')}")


@hook_manager.hook(ITEM_DELETE_BEFORE)
async def on_item_delete_before(item: dict) -> None:
    """
    知识项删除前钩子

    Args:
        item: 要删除的知识项
    """
    logger.debug(f"[KnowFlowOpenClawHook] 知识项即将删除: {item.get('id')}")


async def register_hooks() -> None:
    """
    注册插件钩子（可选，PluginManager 会自动加载 hooks_entry）
    """
    logger.info("[KnowFlowOpenClawHook] 插件钩子已就绪")
