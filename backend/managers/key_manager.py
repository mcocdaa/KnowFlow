# @file backend/managers/key_manager.py
# @brief Key定义管理核心逻辑（数据库版）
# @create 2026-03-07 10:00:00

import logging
from datetime import datetime
from typing import Any

import yaml

from config import DEFAULT_KEYS_PATH, KEY_STYLE
from utils.doc_util import convert_docs

from .db_manager import db_manager

logger = logging.getLogger(__name__)


class KeyManager:
    def __init__(self):
        self.collection = "keys"
        self._cache: list[dict[str, Any]] | None = None
        self._cache_time: datetime | None = None
        self._cache_ttl = 300

    def _is_cache_valid(self) -> bool:
        if self._cache is None or self._cache_time is None:
            return False
        return (datetime.now() - self._cache_time).total_seconds() < self._cache_ttl

    def _invalidate_cache(self):
        self._cache = None
        self._cache_time = None

    async def _load_cache(self) -> list[dict[str, Any]]:
        if not self._is_cache_valid():
            keys = await db_manager.find(self.collection, sort=[("name", 1)])
            self._cache = convert_docs(keys)
            self._cache_time = datetime.now()
        return self._cache

    async def initialize(self):
        """
        初始化Key定义：首次加载默认配置，之后幂等补齐缺失的内置 Key（存量库也能获得新增内置 Key）
        """
        with open(DEFAULT_KEYS_PATH, encoding="utf-8") as f:
            default_keys = yaml.safe_load(f)

        for key_def in default_keys:
            existing = await db_manager.find_one(self.collection, {"name": key_def["name"]})
            if existing:
                continue
            try:
                await self.create(key_def)
            except ValueError as e:
                logger.warning(f"初始化 Key {key_def['name']} 跳过: {e}")

    def validate(self, key_def: dict[str, Any]) -> bool:
        """
        验证Key定义是否符合样式
        """
        if not isinstance(key_def, dict):
            raise ValueError("key definition must be a dict")

        for required_key in KEY_STYLE["property"]:
            if required_key not in key_def:
                raise ValueError(f"key definition must contain {required_key}")

        if not isinstance(key_def["name"], str) or not key_def["name"].strip():
            raise ValueError("key name must be non-empty string")

        if key_def["value_type"] not in ["string", "number", "boolean", "array", "object"]:
            raise ValueError("invalid value_type, must be one of: string, number, boolean, array, object")

        return True

    async def create(self, key_def: dict[str, Any]) -> dict[str, Any]:
        """
        创建新Key定义
        """
        self.validate(key_def)

        existing = await db_manager.find_one(self.collection, {"name": key_def["name"]})
        if existing:
            raise ValueError(f"key with name {key_def['name']} already exists")

        category = await db_manager.find_one("categories", {"name": key_def["category_name"]})
        if not category:
            raise ValueError(f"category with name {key_def['category_name']} does not exist")

        if "created_at" not in key_def:
            key_def["created_at"] = datetime.now().isoformat()
        if "updated_at" not in key_def:
            key_def["updated_at"] = datetime.now().isoformat()

        await db_manager.insert_one(self.collection, key_def)
        self._invalidate_cache()
        return key_def

    async def get_by_name(self, key_name: str) -> dict[str, Any] | None:
        """
        根据名称获取Key定义
        """
        keys = await self._load_cache()
        for key in keys:
            if key["name"] == key_name:
                return key
        return None

    async def get_all(self) -> list[dict[str, Any]]:
        """
        获取所有Key定义（带缓存）
        """
        return [dict(key) for key in await self._load_cache()]

    # Fields allowed for client-driven update; is_builtin is server-only
    _ALLOWED_UPDATE_FIELDS = {
        "name",
        "title",
        "value_type",
        "default_value",
        "description",
        "category_name",
        "is_required",
        "is_visible",
        "is_public",
        "is_private",
        "plugin_name",
        "delete_with_plugin",
    }

    async def update(self, key_name: str, update_data: dict[str, Any]) -> dict[str, Any] | None:
        """
        更新Key定义
        """
        existing = await self.get_by_name(key_name)
        if not existing:
            raise ValueError(f"key with name {key_name} does not exist")

        if existing.get("is_builtin", False):
            raise ValueError("builtin keys cannot be modified")

        # Reject protected fields (is_builtin / id / _id / created_at / updated_at)
        protected = {"is_builtin", "id", "_id", "created_at", "updated_at"} & set(update_data)
        if protected:
            raise ValueError(f"field(s) not allowed in update: {', '.join(sorted(protected))}")

        # Whitelist: only allow known fields through
        update_data = {k: v for k, v in update_data.items() if k in self._ALLOWED_UPDATE_FIELDS}
        if not update_data:
            raise ValueError("no valid fields to update")

        merged = {**existing, **update_data}
        merged["name"] = key_name
        self.validate(merged)

        if "category_name" in update_data:
            category = await db_manager.find_one("categories", {"name": update_data["category_name"]})
            if not category:
                raise ValueError(f"category with name {update_data['category_name']} does not exist")

        update_data["updated_at"] = datetime.now().isoformat()
        if "name" in update_data and update_data["name"] != key_name:
            new_name = update_data["name"]
            name_exists = await self.get_by_name(new_name)
            if name_exists:
                raise ValueError(f"key with name {new_name} already exists")

        await db_manager.update_one(self.collection, {"name": key_name}, {"$set": update_data})
        self._invalidate_cache()

        new_key_name = update_data.get("name", key_name)
        return await self.get_by_name(new_key_name)

    async def delete(self, key_name: str) -> bool:
        """
        删除Key定义
        """
        key = await self.get_by_name(key_name)
        if not key:
            raise ValueError(f"key with name {key_name} does not exist")

        if key.get("is_builtin", False):
            raise ValueError("builtin keys cannot be deleted")

        deleted_count = await db_manager.delete_one(self.collection, {"name": key_name})
        self._invalidate_cache()
        return deleted_count > 0

    async def delete_by_plugin(self, plugin_name: str) -> int:
        """
        删除指定插件注册的 Key（仅删除 delete_with_plugin=True 的）
        """
        keys = await self.get_all()
        deleted = 0
        for key in keys:
            if key.get("plugin_name") == plugin_name and key.get("delete_with_plugin", True):
                await db_manager.delete_one(self.collection, {"name": key["name"]})
                deleted += 1
        if deleted:
            self._invalidate_cache()
        return deleted


# 全局Key管理实例
key_manager = KeyManager()
