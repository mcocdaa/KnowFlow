# @file backend/api/v1/plugins/__init__.py
# @brief API v1 模块导出
# @create 2026-03-06 10:00:00

from fastapi import APIRouter
from pathlib import Path
from core.router_loader import include_routers_from_directory

# 1. 创建父路由
router = APIRouter()

# 2. 调用工具函数，自动加载当前目录下的所有子路由
include_routers_from_directory(
    parent_router=router,
    package_name=__package__,
    directory_path=Path(__file__).parent,
    auto_tag=False,
    auto_prefix=True,
    skip_modules=[],
)
