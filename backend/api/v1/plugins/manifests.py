# @file backend/api/v1/plugins/manifests.py
# @brief 插件清单子路由
# @create 2026-03-06 10:00:00

from fastapi import APIRouter, Depends

from api.deps import get_plugin_manager
from api.errors import ok
from core.plugin_manager import PluginManager

# 定义【子路由】：仅处理 /manifests 接口
router = APIRouter()


@router.get("/manifests")
async def get_plugin_manifests(manager: PluginManager = Depends(get_plugin_manager)):
    """获取所有插件清单"""
    return ok(manager.get_plugin_manifests())
