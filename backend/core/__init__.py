# @file backend/core/__init__.py
# @brief 核心模块导出
# @create 2026-03-09

from core.hook_manager import hook_manager, HookManager
from core.plugin_manager import plugin_manager, PluginManager
from core.router_loader import include_routers_from_directory
from core.hooks import *

__all__ = [
    'hook_manager',
    'HookManager',
    'plugin_manager',
    'PluginManager',
    'include_routers_from_directory',
]
