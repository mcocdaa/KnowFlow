# @file backend/api/v1/plugins/manifests.py
# @brief 插件清单子路由
# @create 2026-03-06 10:00:00

from fastapi import APIRouter
from core.plugin_loader import plugin_loader

# 定义【子路由】：仅处理 /manifests 接口
router = APIRouter()

@router.get("/{plugin_name}/frontend")
async def get_plugin_frontend(plugin_name: str):
    code = plugin_loader.get_plugin_frontend_code(plugin_name)
    if code is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Plugin or frontend not found")
    
    return {"code": code}