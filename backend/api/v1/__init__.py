# @file backend/api/v1/__init__.py
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
    package_name=__package__,          # 传入当前包名
    directory_path=Path(__file__).parent, # 传入当前目录
    auto_tag=False,                      # (可选) 自动在 Swagger 文档中按模块名分组
    auto_prefix=False,                  # (可选) 是否强制在 URL 前加模块名
    skip_modules=[]              # (可选) 跳过不想加载的文件
)
