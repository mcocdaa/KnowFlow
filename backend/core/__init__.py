# @file backend/core/__init__.py
# @brief 核心模块导出
# @create 2026-03-09

from core.hook_manager import HookManager, hook_manager
from core.plugin_manager import PluginManager, plugin_manager
from core.router_loader import include_routers_from_directory

__all__ = [
    "hook_manager",
    "HookManager",
    "plugin_manager",
    "PluginManager",
    "include_routers_from_directory",
]
