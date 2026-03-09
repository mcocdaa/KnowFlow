# @file backend/plugins/builtin_star_rating/__init__.py
# @brief 内置星级评分插件
# @create 2026-03-07 10:00:00

from datetime import datetime


def register_keys():
    return {
        "star_rating": {
            "name": "星级评分",
            "value_type": "rating",
            "default_value": "0",
            "description": "用户评分",
            "category_id": "4",
            "is_builtin": True,
            "is_required": False,
            "is_visible": True,
            "plugin_name": "builtin_star_rating",
            "delete_with_plugin": False,
            "is_public": True,
            "is_private": False,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
    }
