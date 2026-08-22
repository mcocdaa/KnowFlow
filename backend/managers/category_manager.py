# @file backend/managers/category_manager.py
# @brief 分类管理核心逻辑（数据库版）
# @create 2026-03-06 10:00:00

from typing import Any

from config import CATEGORY_STYLE, DEFAULT_CATEGORIES_PATH
from utils.doc_util import convert_doc, convert_docs, parse_object_id

# 统一从 base 复用 db_manager：模板方法与子类方法共享同一命名空间，
# 测试只需 patch("managers.base.db_manager") 一个点（skill 坑 #1）
from .base import NamedResourceManager


class CategoryManager(NamedResourceManager):
    collection = "categories"
    defaults_path = DEFAULT_CATEGORIES_PATH
    entity_label = "category"
    label = "category"
    plural = "categories"
    style_properties = CATEGORY_STYLE["property"]
    allowed_update_fields = {"name", "title", "parent_name"}

    def prepare_defaults(self, docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """内置分类先父后子创建（create 校验父分类存在）"""
        parents, children = [], []
        for doc in docs:
            if doc.get("parent_name") in (None, "None"):
                doc["parent_name"] = None
                parents.append(doc)
            else:
                children.append(doc)
        return parents + children

    async def pre_create(self, doc: dict[str, Any]) -> None:
        if doc.get("parent_name") is not None:
            parent = await self._db.find_one(self.collection, {"name": doc["parent_name"]})
            if not parent:
                raise ValueError(f"parent category with name {doc['parent_name']} does not exist")

    async def pre_update(self, resource_name: str, update_data: dict[str, Any]) -> None:
        if "parent_name" in update_data and update_data["parent_name"] is not None:
            parent_name = update_data["parent_name"]
            if parent_name == resource_name:
                raise ValueError("category cannot be its own parent")

            parent = await self.get_by_name(parent_name)
            if not parent:
                raise ValueError(f"parent category with name {parent_name} does not exist")

            # Cycle detection: walk up ancestors (max 100)
            cursor = parent
            for _ in range(100):
                if cursor.get("parent_name") in (None, "None"):
                    break
                if cursor["parent_name"] == resource_name:
                    raise ValueError(f"would create a cycle: {resource_name} → {parent_name}")
                cursor = await self.get_by_name(cursor["parent_name"])
                if not cursor:
                    break

    async def pre_delete(self, doc: dict[str, Any]) -> None:
        children = await self.get_children(doc["name"])
        if children:
            raise ValueError("cannot delete category with existing children")

    async def get_by_id(self, category_id: str) -> dict[str, Any] | None:
        """
        根据数据库 ID 获取分类
        """
        oid = parse_object_id(category_id)
        if oid is None:
            return None
        doc = await self._db.find_one(self.collection, {"_id": oid})
        return convert_doc(doc)

    async def get_children(self, parent_name: str | None = None) -> list[dict[str, Any]]:
        """
        获取指定父分类的子分类
        """
        docs = await self._db.find(self.collection, {"parent_name": parent_name}, sort=[("name", 1)])
        return convert_docs(docs)


# 全局分类管理实例
category_manager = CategoryManager()
