# @file backend/managers/__init__.py
# @brief 管理模块初始化
# @create 2026-03-06 10:00:00

from .key_manager import key_manager
from .item_manager import item_manager
from .category_manager import category_manager

__all__ = ['key_manager', 'item_manager', 'category_manager']
