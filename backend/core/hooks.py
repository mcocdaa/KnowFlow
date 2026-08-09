# @file backend/core/hooks.py
# @brief 系统钩子点定义
# @create 2026-03-27

# ============================================
# 系统钩子点常量定义
# ============================================

# 知识项（Item）钩子
ITEM_CREATE_BEFORE = "item_create_before"
ITEM_CREATE_AFTER = "item_create_after"
ITEM_UPDATE_BEFORE = "item_update_before"
ITEM_UPDATE_AFTER = "item_update_after"
ITEM_DELETE_BEFORE = "item_delete_before"
ITEM_DELETE_AFTER = "item_delete_after"
ITEM_GET_BEFORE = "item_get_before"
ITEM_GET_AFTER = "item_get_after"
ITEM_LIST_BEFORE = "item_list_before"
ITEM_LIST_AFTER = "item_list_after"

# 搜索钩子
SEARCH_BEFORE = "search_before"
SEARCH_AFTER = "search_after"

__all__ = [
    "ITEM_CREATE_BEFORE",
    "ITEM_CREATE_AFTER",
    "ITEM_UPDATE_BEFORE",
    "ITEM_UPDATE_AFTER",
    "ITEM_DELETE_BEFORE",
    "ITEM_DELETE_AFTER",
    "ITEM_GET_BEFORE",
    "ITEM_GET_AFTER",
    "ITEM_LIST_BEFORE",
    "ITEM_LIST_AFTER",
    "SEARCH_BEFORE",
    "SEARCH_AFTER",
]
