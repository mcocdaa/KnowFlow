# @file backend/api/deps.py
# @brief FastAPI 依赖注入：向路由提供 manager 单例（官方推荐的依赖声明方式）
# @create 2026-08-11 10:00:00

from core.plugin_manager import PluginManager, plugin_manager
from managers.category_manager import CategoryManager, category_manager
from managers.db_manager import DBManager, db_manager
from managers.item_manager import ItemManager, item_manager
from managers.key_manager import KeyManager, key_manager


def get_db() -> DBManager:
    """提供全局数据库管理器实例"""
    return db_manager


def get_item_manager() -> ItemManager:
    """提供全局知识项管理器实例"""
    return item_manager


def get_key_manager() -> KeyManager:
    """提供全局 Key 管理器实例"""
    return key_manager


def get_category_manager() -> CategoryManager:
    """提供全局分类管理器实例"""
    return category_manager


def get_plugin_manager() -> PluginManager:
    """提供全局插件管理器实例"""
    return plugin_manager
