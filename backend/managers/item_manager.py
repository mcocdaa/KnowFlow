# @file backend/managers/item_manager.py
# @brief 知识项管理核心逻辑（MongoDB 版）
# @create 2026-03-07 10:00:00

from typing import Dict, Any, List, Optional
from datetime import datetime
from bson import ObjectId
from .db_manager import db_manager
from .key_manager import key_manager


class ItemManager:
    def __init__(self):
        self.items_collection = "items"

    def _convert_value(self, value: str, value_type: str) -> Any:
        if value_type == "int":
            return int(value)
        elif value_type == "float":
            return round(float(value), 2)
        elif value_type == "bool":
            return value.lower() in ("true", "1", "yes")
        elif value_type == "rating":
            return int(value)
        return value

    def _convert_to_string(self, value: Any, value_type: str) -> str:
        if value_type in ("int", "float", "rating"):
            return str(value)
        elif value_type == "bool":
            return "true" if value else "false"
        return str(value)

    async def _format_item_response(self, item: Dict) -> Dict[str, Any]:
        all_keys = await key_manager.get_all()
        key_dict = {key['name']: key for key in all_keys}

        item_attributes = {}
        key_info = {}

        for key_name, key_def in key_dict.items():
            if key_def.get("is_visible", True):
                if key_name in item:
                    value = item[key_name]
                    item_attributes[key_name] = self._convert_value(str(value), key_def["value_type"])
                    key_info[key_name] = key_def
                elif key_def.get("is_required", False):
                    item_attributes[key_name] = self._convert_value(
                        key_def["default_value"],
                        key_def["value_type"]
                    )
                    key_info[key_name] = key_def

        knowflow_item = {
            "id": str(item["_id"]),
        }

        if "name" in item:
            knowflow_item["name"] = item["name"]

        for key_name in ["created_at", "updated_at"]:
            if key_name in item:
                if hasattr(item[key_name], "isoformat"):
                    knowflow_item[key_name] = item[key_name].isoformat()
                else:
                    knowflow_item[key_name] = str(item[key_name]) if item[key_name] else None

        return {
            "item": knowflow_item,
            "attributes": item_attributes,
            "key_info": key_info
        }

    async def get_all(self) -> List[Dict[str, Any]]:
        """
        获取所有知识项
        """
        items = await db_manager.find(self.items_collection)

        result = []
        for item in items:
            result.append(await self._format_item_response(item))

        return result

    async def get_by_id(self, item_id: str) -> Optional[Dict[str, Any]]:
        """
        根据ID获取知识项
        """
        try:
            oid = ObjectId(item_id)
        except:
            return None

        item = await db_manager.find_one(self.items_collection, {"_id": oid})
        if not item:
            return None

        return await self._format_item_response(item)

    async def create(self, item_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        创建新知识项
        """
        now = datetime.now()

        all_keys = await key_manager.get_all()
        key_dict = {key['name']: key for key in all_keys}

        knowflow_item = {
            "created_at": now,
            "updated_at": now,
        }

        if "name" in item_data:
            knowflow_item["name"] = item_data["name"]

        key_values = item_data.get("keyValues", {}) or item_data.get("attributes", {})
        for key_name, value in key_values.items():
            if key_name in key_dict:
                key_def = key_dict[key_name]
                knowflow_item[key_name] = self._convert_to_string(value, key_def["value_type"])

        item_id = await db_manager.insert_one(self.items_collection, knowflow_item)

        return await self.get_by_id(str(item_id))

    async def update(self, item_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        更新知识项
        """
        try:
            oid = ObjectId(item_id)
        except:
            return None

        now = datetime.now()

        existing_item = await db_manager.find_one(self.items_collection, {"_id": oid})
        if not existing_item:
            return None

        update_fields = {}
        if "name" in updates:
            update_fields["name"] = updates["name"]

        all_keys = await key_manager.get_all()
        key_dict = {key['name']: key for key in all_keys}
        key_values = updates.get("keyValues", {}) or updates.get("attributes", {})

        for key_name, value in key_values.items():
            if key_name in key_dict:
                key_def = key_dict[key_name]
                update_fields[key_name] = self._convert_to_string(value, key_def["value_type"])

        if update_fields:
            update_fields["updated_at"] = now
            await db_manager.update_one(
                self.items_collection,
                {"_id": oid},
                {"$set": update_fields}
            )

        return await self.get_by_id(item_id)

    async def delete(self, item_id: str) -> bool:
        """
        删除知识项
        """
        try:
            oid = ObjectId(item_id)
        except:
            return False

        deleted_count = await db_manager.delete_one(self.items_collection, {"_id": oid})
        return deleted_count > 0

    async def search(
        self,
        q: str = "",
        category: str = None,
        key: str = None,
        key_value: str = None,
        sort: str = "recent",
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        搜索知识项
        """
        query = {}

        if q:
            all_keys = await key_manager.get_all()
            search_fields = ["name"]
            for k in all_keys:
                search_fields.append(k["name"])

            or_conditions = []
            for field in search_fields:
                or_conditions.append({field: {"$regex": q, "$options": "i"}})
            query["$or"] = or_conditions

        if category:
            query["category"] = category

        if key and key_value:
            query[key] = {"$regex": key_value, "$options": "i"}

        sort_options = []
        if sort == "recent":
            sort_options = [("created_at", -1)]
        elif sort == "rating":
            sort_options = [("rating", -1)]
        elif sort == "clickCount":
            sort_options = [("click_count", -1)]
        elif sort == "name":
            sort_options = [("name", 1)]

        skip = (page - 1) * page_size

        items = await db_manager.find(
            self.items_collection,
            query=query,
            sort=sort_options,
            limit=page_size,
            skip=skip
        )

        total = await db_manager.count_documents(self.items_collection, query)

        result = []
        for item in items:
            result.append(await self._format_item_response(item))

        return {
            "items": result,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }


# 全局知识项管理实例
item_manager = ItemManager()
