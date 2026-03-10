# @file backend/api/__init__.py
# @brief API 路由总入口 - 支持版本控制
# @create 2026-03-06

import importlib
from fastapi import FastAPI
from config.settings import API_VERSION

def register_routers(app: FastAPI):
    """
    自动注册指定版本的 API 路由：
    1. 根据 settings.API_VERSION 动态导入版本包 (如 api.v1)
    2. 查找该包下的全局 `router` 对象并挂载
    """
    # 1. 构建完整的包路径字符串 (例如: "backend.api.v1")
    # 注意：__name__ 在这里是 "backend.api"
    version_package_name = f"{__name__}.{API_VERSION}"

    try:
        # 2. 动态导入版本模块
        version_package = importlib.import_module(version_package_name)
    except ModuleNotFoundError:
        raise RuntimeError(f"API 版本模块不存在: {version_package_name}")

    # 3. 检查并挂载路由
    if hasattr(version_package, "router"):
        app.include_router(
            version_package.router,
            prefix=f"/api",
            tags=[API_VERSION.upper()] # 标签显示为 "V1"，更醒目
        )
        print(f"[Route] 已注册 API 版本: {API_VERSION}")
    else:
        raise AttributeError(f"模块 {version_package_name} 中未找到 'router' 对象")
