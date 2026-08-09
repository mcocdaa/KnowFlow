# @file backend/test/plugin_helpers.py
# @brief 测试用插件加载公共工具
# @create 2026-08-08 10:00:00

import importlib.util
import os
from pathlib import Path

PLUGINS_ROOT = Path(__file__).resolve().parents[2] / "plugins"


def get_plugin_path(plugin_name: str) -> str:
    """返回插件目录路径"""
    return str(PLUGINS_ROOT / plugin_name)


def load_plugin_backend(plugin_name: str, module_name: str = "plugin_backend"):
    """加载插件的 backend.py 并返回模块"""
    plugin_path = os.path.join(get_plugin_path(plugin_name), "backend.py")
    spec = importlib.util.spec_from_file_location(module_name, plugin_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
