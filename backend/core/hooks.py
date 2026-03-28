# @file backend/core/hooks.py
# @brief 系统钩子点定义
# @create 2026-03-27

# ============================================
# 系统钩子点常量定义
# ============================================

# 插件管理器钩子
PLUGIN_MANAGER_CONSTRUCT_BEFORE = "plugin_manager_construct_before"
PLUGIN_MANAGER_CONSTRUCT_AFTER = "plugin_manager_construct_after"
PLUGIN_MANAGER_INIT_BEFORE = "plugin_manager_init_before"
PLUGIN_MANAGER_INIT_AFTER = "plugin_manager_init_after"
PLUGIN_MANAGER_REGISTER_ARGUMENTS = "plugin_manager_register_arguments"

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

# Key 钩子
KEY_CREATE_BEFORE = "key_create_before"
KEY_CREATE_AFTER = "key_create_after"
KEY_UPDATE_BEFORE = "key_update_before"
KEY_UPDATE_AFTER = "key_update_after"
KEY_DELETE_BEFORE = "key_delete_before"
KEY_DELETE_AFTER = "key_delete_after"

# Category 钩子
CATEGORY_CREATE_BEFORE = "category_create_before"
CATEGORY_CREATE_AFTER = "category_create_after"
CATEGORY_UPDATE_BEFORE = "category_update_before"
CATEGORY_UPDATE_AFTER = "category_update_after"
CATEGORY_DELETE_BEFORE = "category_delete_before"
CATEGORY_DELETE_AFTER = "category_delete_after"

# 文件上传钩子
UPLOAD_BEFORE = "upload_before"
UPLOAD_AFTER = "upload_after"

# 搜索钩子
SEARCH_BEFORE = "search_before"
SEARCH_AFTER = "search_after"
