# @file backend/core/__init__.py
# @brief 核心模块导出
# @create 2026-03-09 10:00:00

from .plugin_loader import PluginLoader, plugin_loader

__all__ = ["PluginLoader", "plugin_loader"]
