# @file backend/core/router_loader.py
# @brief 自动路由加载器 - 通用工具函数
# @create 2026-03-07 10:00:00

from fastapi import APIRouter
import importlib
from pathlib import Path
from typing import List, Optional


def include_routers_from_directory(
    parent_router: APIRouter,
    package_name: str,
    directory_path: Path,
    *,
    skip_modules: Optional[List[str]] = None,
    auto_tag: bool = False,
    auto_prefix: bool = False
) -> None:
    """
    自动扫描并加载指定目录下所有包含 `router` 属性的模块。

    Args:
        parent_router: 父级 APIRouter 实例，子路由将挂载到这里
        package_name: 当前包名 (__package__)，用于相对导入
        directory_path: 要扫描的目录路径 (Path(__file__).parent)
        skip_modules: 可选，指定要跳过的模块名列表 (如 ["utils", "deprecated"])
        auto_tag: 是否自动用模块名作为 Swagger 标签 (Tags)
        auto_prefix: 是否自动用模块名作为 URL 前缀
    """
    if skip_modules is None:
        skip_modules = []

    # 遍历目录
    for path in directory_path.iterdir():
        # 1. 基础过滤
        if path.name == "__init__.py":
            continue
        
        module_name = None

        # 2. 识别模块类型
        if path.is_file() and path.suffix == ".py":
            module_name = path.stem
        elif path.is_dir() and (path / "__init__.py").exists():
            module_name = path.name

        # 3. 检查是否在跳过列表中
        if not module_name or module_name in skip_modules:
            continue

        # 4. 动态导入与挂载
        try:
            # 相对导入模块
            module = importlib.import_module(f".{module_name}", package=package_name)
            
            # 检查是否存在 router
            if hasattr(module, "router"):
                sub_router = getattr(module, "router")
                
                # 构建可选参数
                kwargs = {}
                if auto_tag:
                    kwargs["tags"] = [module_name]
                if auto_prefix:
                    kwargs["prefix"] = f"/{module_name}"

                # 执行挂载
                parent_router.include_router(sub_router, **kwargs)
                print(f"[RouterLoader] 已挂载: {package_name}.{module_name}")

        except Exception as e:
            print(f"[RouterLoader] 挂载失败 {module_name}: {str(e)}")