# @file backend/managers/key_manager.py
# @brief Key定义管理核心逻辑（数据库版）
# @create 2026-03-07 10:00:00

from datetime import datetime
from typing import Any

from config import DEFAULT_KEYS_PATH, KEY_STYLE
from utils.doc_util import convert_docs

# 统一从 base 复用 db_manager：模板方法与子类方法共享同一命名空间，
# 测试只需 patch("managers.base.db_manager") 一个点（skill 坑 #1）
from .base import NamedResourceManager

VALID_VALUE_TYPES = ("string", "number", "boolean", "array", "object")


class KeyManager(NamedResourceManager):
    collection = "keys"
    defaults_path = DEFAULT_KEYS_PATH
    entity_label = "key definition"
    label = "key"
    plural = "keys"
    style_properties = KEY_STYLE["property"]
    # created_at / updated_at 由服务端 _stamp_timestamps 自动补齐，不要求客户端提供
    validate_exclude = {"created_at", "updated_at"}
    # Fields allowed for client-driven update; is_builtin is server-only
    allowed_update_fields = {
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

    def __init__(self):
        self._cache: list[dict[str, Any]] | None = None
        self._cache_time: datetime | None = None
        self._cache_ttl = 300

    # ---------- 缓存 ----------

    def _is_cache_valid(self) -> bool:
        if self._cache is None or self._cache_time is None:
            return False
        return (datetime.now() - self._cache_time).total_seconds() < self._cache_ttl

    def _invalidate_cache(self):
        self._cache = None
        self._cache_time = None

    async def _load_cache(self) -> list[dict[str, Any]]:
        if not self._is_cache_valid():
            keys = await self._db.find(self.collection, sort=[("name", 1)])
            self._cache = convert_docs(keys)
            self._cache_time = datetime.now()
        return self._cache

    def on_changed(self) -> None:
        self._invalidate_cache()

    # ---------- 差异钩子 ----------

    def validate_extra(self, doc: dict[str, Any]) -> None:
        """校验 value_type 合法性"""
        if doc["value_type"] not in VALID_VALUE_TYPES:
            raise ValueError("invalid value_type, must be one of: string, number, boolean, array, object")

    async def pre_create(self, doc: dict[str, Any]) -> None:
        await self._ensure_category(doc["category_name"])

    async def pre_update(self, resource_name: str, update_data: dict[str, Any]) -> None:
        if "category_name" in update_data:
            await self._ensure_category(update_data["category_name"])

    async def _ensure_category(self, category_name: str) -> None:
        """校验分类存在，不存在抛 ValueError"""
        category = await self._db.find_one("categories", {"name": category_name})
        if not category:
            raise ValueError(f"category with name {category_name} does not exist")

    # ---------- 缓存覆写与扩展方法 ----------

    async def get_by_name(self, key_name: str) -> dict[str, Any] | None:
        """
        根据名称获取Key定义（走缓存）
        """
        keys = await self._load_cache()
        for key in keys:
            if key["name"] == key_name:
                return key
        return None

    async def get_all(self) -> list[dict[str, Any]]:
        """
        获取所有Key定义（带缓存，返回防御性拷贝）
        """
        return [dict(key) for key in await self._load_cache()]

    async def delete_by_plugin(self, plugin_name: str) -> int:
        """
        删除指定插件注册的 Key（仅删除 delete_with_plugin=True 的）
        """
        keys = await self.get_all()
        names = [
            key["name"] for key in keys if key.get("plugin_name") == plugin_name and key.get("delete_with_plugin", True)
        ]
        if not names:
            return 0

        deleted_count = await self._db.delete_many(self.collection, {"name": {"$in": names}})
        self._invalidate_cache()
        return deleted_count


# 全局Key管理实例
key_manager = KeyManager()
