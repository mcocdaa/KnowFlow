# @file backend/api/v1/plugins/manifests.py
# @brief 插件清单子路由
# @create 2026-03-06 10:00:00

from fastapi import APIRouter
from core.plugin_loader import plugin_loader

# 定义【子路由】：仅处理 /manifests 接口
router = APIRouter()

@router.get("/manifests")
async def get_plugin_manifests():
    """获取所有插件清单"""
    return plugin_loader.get_plugin_manifests()
