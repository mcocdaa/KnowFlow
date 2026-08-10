# @file backend/managers/item_manager.py
# @brief 知识项管理核心逻辑（MongoDB 版）
# @create 2026-03-07 10:00:00

import json
import re
from datetime import datetime
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId

from core import hook_manager
from core.hooks import (
    ITEM_CREATE_AFTER,
    ITEM_CREATE_BEFORE,
    ITEM_DELETE_AFTER,
    ITEM_DELETE_BEFORE,
    ITEM_GET_AFTER,
    ITEM_GET_BEFORE,
    ITEM_LIST_AFTER,
    ITEM_LIST_BEFORE,
    ITEM_UPDATE_AFTER,
    ITEM_UPDATE_BEFORE,
    SEARCH_AFTER,
    SEARCH_BEFORE,
)

from .db_manager import db_manager
from .key_manager import key_manager

VALID_SORTS = ("recent", "rating", "name")


def extract_key_values(item_data: dict[str, Any]) -> dict[str, Any]:
    """兼容 keyValues / attributes 两种字段名，统一提取键值"""
    return item_data.get("keyValues", {}) or item_data.get("attributes", {}) or {}


def validate_required(item_data: dict[str, Any], required_keys: list[dict[str, Any]]) -> list[str]:
    """校验必填 key 是否提供；返回缺失的 key 名列表（提取 keyValues/attributes + 顶层字段）"""
    key_values = extract_key_values(item_data)
    missing = []
    for key in required_keys:
        name = key["name"]
        if name not in key_values and name not in item_data:
            missing.append(name)
        elif name in key_values and key_values[name] is None:
            if name not in item_data or item_data.get(name) is None:
                missing.append(name)
    return missing


class ItemManager:
    def __init__(self):
        self.items_collection = "items"

    @staticmethod
    def _to_object_id(item_id: str) -> ObjectId | None:
        """将字符串 ID 解析为 ObjectId，非法输入返回 None"""
        if item_id is None:
            return None
        try:
            return ObjectId(item_id)
        except (ValueError, TypeError, InvalidId):
            return None

    def _convert_value(self, value: Any, value_type: str) -> Any:
        """将存储值转换为 value_type 对应的 Python 类型"""
        if value_type == "number":
            if isinstance(value, bool):
                return int(value)
            if isinstance(value, int | float):
                return value
            try:
                return int(str(value).strip())
            except ValueError:
                try:
                    return float(str(value).strip())
                except ValueError:
                    return value
        elif value_type == "boolean":
            if isinstance(value, str):
                return value.lower() in ("true", "1", "yes")
            return bool(value)
        elif value_type in ("array", "object"):
            if isinstance(value, str):
                try:
                    return json.loads(value)
                except (ValueError, TypeError):
                    return value
            return value
        return str(value) if value is not None else ""

    def _convert_to_string(self, value: Any, value_type: str) -> str:
        """将输入值按 value_type 规范化为存储字符串"""
        if value_type == "boolean":
            if isinstance(value, str):
                return value.lower()
            return "true" if value else "false"
        elif value_type in ("array", "object"):
            if isinstance(value, str):
                return value
            return json.dumps(value, ensure_ascii=False)
        return str(value) if value is not None else ""

    async def get_required_key_defs(self) -> list[dict[str, Any]]:
        """获取所有必填 Key 定义"""
        all_keys = await key_manager.get_all()
        return [key for key in all_keys if key.get("is_required", False)]

    def _format_item_response(self, item: dict, key_dict: dict[str, dict[str, Any]]) -> dict[str, Any]:
        item_attributes = {}
        key_info = {}

        for key_name, key_def in key_dict.items():
            if key_def.get("is_visible", True):
                if key_name in item:
                    value = item[key_name]
                    item_attributes[key_name] = self._convert_value(value, key_def["value_type"])
                    key_info[key_name] = key_def
                elif key_def.get("is_required", False):
                    item_attributes[key_name] = self._convert_value(key_def["default_value"], key_def["value_type"])
                    key_info[key_name] = key_def

        knowflow_item = {
            "id": str(item["_id"]),
        }

        if "name" in item:
            knowflow_item["name"] = item["name"]

        for key_name in ["created_at", "updated_at"]:
            if key_name in item and item[key_name]:
                if hasattr(item[key_name], "isoformat"):
                    knowflow_item[key_name] = item[key_name].isoformat()
                else:
                    knowflow_item[key_name] = str(item[key_name])

        return {"item": knowflow_item, "attributes": item_attributes, "key_info": key_info}

    @hook_manager.wrap_hooks(before=ITEM_LIST_BEFORE, after=ITEM_LIST_AFTER)
    async def get_all(self) -> list[dict[str, Any]]:
        """
        获取所有知识项
        """
        all_keys = await key_manager.get_all()
        key_dict = {key["name"]: key for key in all_keys}

        items = await db_manager.find(self.items_collection)

        return [self._format_item_response(item, key_dict) for item in items]

    @hook_manager.wrap_hooks(before=ITEM_GET_BEFORE, after=ITEM_GET_AFTER)
    async def get_by_id(self, item_id: str) -> dict[str, Any] | None:
        """
        根据ID获取知识项
        """
        oid = self._to_object_id(item_id)
        if oid is None:
            return None

        item = await db_manager.find_one(self.items_collection, {"_id": oid})
        if not item:
            return None

        all_keys = await key_manager.get_all()
        key_dict = {key["name"]: key for key in all_keys}
        return self._format_item_response(item, key_dict)

    @hook_manager.wrap_hooks(before=ITEM_CREATE_BEFORE, after=ITEM_CREATE_AFTER)
    async def create(self, item_data: dict[str, Any]) -> dict[str, Any]:
        """
        创建新知识项
        """
        now = datetime.now()

        all_keys = await key_manager.get_all()
        key_dict = {key["name"]: key for key in all_keys}

        knowflow_item = {
            "created_at": now,
            "updated_at": now,
        }

        if "name" in item_data:
            knowflow_item["name"] = item_data["name"]

        key_values = extract_key_values(item_data)
        for key_name, value in key_values.items():
            if key_name in key_dict:
                key_def = key_dict[key_name]
                knowflow_item[key_name] = self._convert_to_string(value, key_def["value_type"])

        item_id = await db_manager.insert_one(self.items_collection, knowflow_item)
        item = await db_manager.find_one(self.items_collection, {"_id": item_id})
        return self._format_item_response(item, key_dict)

    @hook_manager.wrap_hooks(before=ITEM_UPDATE_BEFORE, after=ITEM_UPDATE_AFTER)
    async def update(self, item_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        """
        更新知识项
        """
        oid = self._to_object_id(item_id)
        if oid is None:
            return None

        now = datetime.now()

        existing_item = await db_manager.find_one(self.items_collection, {"_id": oid})
        if not existing_item:
            return None

        update_fields = {}
        if "name" in updates:
            update_fields["name"] = updates["name"]

        all_keys = await key_manager.get_all()
        key_dict = {key["name"]: key for key in all_keys}
        key_values = extract_key_values(updates)

        for key_name, value in key_values.items():
            if key_name in key_dict:
                key_def = key_dict[key_name]
                update_fields[key_name] = self._convert_to_string(value, key_def["value_type"])

        if update_fields:
            update_fields["updated_at"] = now
            await db_manager.update_one(self.items_collection, {"_id": oid}, {"$set": update_fields})

        item = await db_manager.find_one(self.items_collection, {"_id": oid})
        return self._format_item_response(item, key_dict) if item else None

    @hook_manager.wrap_hooks(before=ITEM_DELETE_BEFORE, after=ITEM_DELETE_AFTER)
    async def delete(self, item_id: str) -> bool:
        """
        删除知识项
        """
        oid = self._to_object_id(item_id)
        if oid is None:
            return False

        deleted_count = await db_manager.delete_one(self.items_collection, {"_id": oid})
        return deleted_count > 0

    @hook_manager.wrap_hooks(before=SEARCH_BEFORE, after=SEARCH_AFTER)
    async def search(
        self,
        q: str = "",
        key: str | None = None,
        key_value: str | None = None,
        sort: str = "recent",
        page: int = 1,
        page_size: int = 20,
    ) -> dict[str, Any]:
        """
        搜索知识项
        """
        if sort not in VALID_SORTS:
            raise ValueError(f"invalid sort option: {sort}")

        all_keys = await key_manager.get_all()
        key_dict = {k["name"]: k for k in all_keys}

        query = {}

        if q:
            search_fields = ["name", *key_dict.keys()]
            escaped_q = re.escape(q)
            or_conditions = [{field: {"$regex": escaped_q, "$options": "i"}} for field in search_fields]
            query["$or"] = or_conditions

        if key and key_value:
            if key not in key_dict:
                raise ValueError(f"unknown key: {key}")
            query[key] = {"$regex": re.escape(key_value), "$options": "i"}

        skip = (page - 1) * page_size

        if sort == "rating":
            # rating 以字符串存储，需要数值化排序（兼容存量数据）
            items = await db_manager.aggregate(
                self.items_collection,
                [
                    {"$match": query},
                    {"$addFields": {"_sort_rating": {"$toDouble": {"$ifNull": ["$rating", "0"]}}}},
                    {"$sort": {"_sort_rating": -1}},
                    {"$skip": skip},
                    {"$limit": page_size},
                ],
            )
        else:
            sort_options = [("created_at", -1)] if sort == "recent" else [("name", 1)]
            items = await db_manager.find(
                self.items_collection, query=query, sort=sort_options, limit=page_size, skip=skip
            )

        total = await db_manager.count_documents(self.items_collection, query)

        result = [self._format_item_response(item, key_dict) for item in items]

        return {
            "items": result,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }


# 全局知识项管理实例
item_manager = ItemManager()
