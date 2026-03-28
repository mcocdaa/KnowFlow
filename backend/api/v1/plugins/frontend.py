# @file backend/api/v1/plugins/frontend.py
# @brief 插件清单子路由
# @create 2026-03-06 10:00:00

from fastapi import APIRouter
from core import plugin_manager

router = APIRouter()

@router.get("/{plugin_name}/frontend")
async def get_plugin_frontend(plugin_name: str):
    code = plugin_manager.get_plugin_frontend_code(plugin_name)
    if code is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Plugin or frontend not found")

    return {"code": code}
