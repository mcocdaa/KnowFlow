# @file backend/managers/base.py
# @brief 命名资源管理器基类：以 name 为唯一键的集合 CRUD 模板
# @create 2026-08-22 10:00:00

import logging
from datetime import datetime
from typing import Any

import yaml

from utils.doc_util import convert_doc, convert_docs

from .db_manager import db_manager

logger = logging.getLogger(__name__)


class NamedResourceManager:
    """以 name 为唯一键的资源管理基类。

    模板方法覆盖 initialize/create/get_by_name/get_all/update/delete 的公共骨架；
    子类通过类属性与钩子注入差异：

    类属性：
        collection: MongoDB 集合名
        defaults_path: initialize 加载的内置数据 YAML 路径
        entity_label: 校验错误信息中的实体称谓（如 "key definition" / "category"）
        label: 唯一性/存在性错误信息中的单数称谓（如 "key" / "category"）
        plural: builtin 保护错误信息中的复数称谓（如 "keys" / "categories"）
        style_properties: validate 必含字段列表
        validate_exclude: validate 时跳过的字段（服务端自动补齐的字段）
        allowed_update_fields: update 白名单字段

    钩子（默认无操作）：
        prepare_defaults(docs): 初始化时对默认文档排序/加工
        validate_extra(doc): 额外字段校验，不合法抛 ValueError
        pre_create(doc): 创建前引用完整性检查
        pre_update(name, data): 更新前引用完整性/一致性检查
        pre_delete(doc): 删除前附加约束检查
        on_changed(): 数据变更后回调（如缓存失效）

    时间戳语义：
        create: setdefault created_at/updated_at（不覆盖客户端已有值）
        update: 强制刷新 updated_at
    """

    PROTECTED_FIELDS = {"is_builtin", "id", "_id", "created_at", "updated_at"}

    @property
    def _db(self):
        """数据库访问入口。

        经由本模块全局名字空间在调用时解析（而非导入期绑定），
        使模板方法与子类方法共享同一 patch 点：patch("managers.base.db_manager")。
        """
        return db_manager

    collection: str = ""
    defaults_path: str = ""
    entity_label: str = "resource"
    label: str = "resource"
    plural: str = "resources"
    style_properties: list[str] = []
    validate_exclude: set[str] = set()
    allowed_update_fields: set[str] = set()

    async def initialize(self):
        """幂等补齐缺失的内置文档（存量库也能获得新增内置数据）"""
        with open(self.defaults_path, encoding="utf-8") as f:
            default_docs = yaml.safe_load(f) or []

        for doc in self.prepare_defaults(default_docs):
            existing = await self._db.find_one(self.collection, {"name": doc["name"]})
            if existing:
                continue
            try:
                await self.create(doc)
            except ValueError as e:
                logger.warning(f"初始化 {doc.get('name')} 跳过: {e}")

    def prepare_defaults(self, docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return docs

    def validate(self, doc: dict[str, Any]) -> bool:
        """校验文档结构：必含字段 + name 非空字符串 + 子类扩展校验"""
        if not isinstance(doc, dict):
            raise ValueError(f"{self.entity_label} must be a dict")

        for prop in self.style_properties:
            if prop in self.validate_exclude:
                continue
            if prop not in doc:
                raise ValueError(f"{self.entity_label} must contain {prop}")

        if not isinstance(doc["name"], str) or not doc["name"].strip():
            raise ValueError(f"{self.label} name must be non-empty string")

        self.validate_extra(doc)
        return True

    def validate_extra(self, doc: dict[str, Any]) -> None:
        pass

    @staticmethod
    def _stamp_timestamps(doc: dict[str, Any], created: bool = False) -> None:
        """写入时间戳：created=True 按 create 语义补齐（setdefault 不覆盖已有值），
        否则仅强制刷新 updated_at"""
        now = datetime.now().isoformat()
        if created:
            doc.setdefault("created_at", now)
            doc.setdefault("updated_at", now)
        else:
            doc["updated_at"] = now

    async def create(self, doc: dict[str, Any]) -> dict[str, Any]:
        """创建文档：validate → 重名校验 → 引用完整性 → 时间戳 → 插入"""
        self.validate(doc)

        existing = await self._db.find_one(self.collection, {"name": doc["name"]})
        if existing:
            raise ValueError(f"{self.label} with name {doc['name']} already exists")

        await self.pre_create(doc)

        stored = dict(doc)
        self._stamp_timestamps(stored, created=True)
        await self._db.insert_one(self.collection, stored)
        self.on_changed()
        return convert_doc(stored)

    async def pre_create(self, doc: dict[str, Any]) -> None:
        pass

    async def get_by_name(self, name: str) -> dict[str, Any] | None:
        """根据名称获取文档（直查数据库；带缓存的子类可覆写）"""
        doc = await self._db.find_one(self.collection, {"name": name})
        return convert_doc(doc)

    async def get_all(self) -> list[dict[str, Any]]:
        """获取所有文档（按 name 排序；带缓存的子类可覆写）"""
        docs = await self._db.find(self.collection, sort=[("name", 1)])
        return convert_docs(docs)

    async def update(self, resource_name: str, update_data: dict[str, Any]) -> dict[str, Any] | None:
        """更新文档：存在性/builtin/保护字段校验 → 白名单 → 合并校验 → 引用完整性 → 改名冲突 → 写入"""
        existing = await self.get_by_name(resource_name)
        if not existing:
            raise ValueError(f"{self.label} with name {resource_name} does not exist")

        if existing.get("is_builtin", False):
            raise ValueError(f"builtin {self.plural} cannot be modified")

        protected = self.PROTECTED_FIELDS & set(update_data)
        if protected:
            raise ValueError(f"field(s) not allowed in update: {', '.join(sorted(protected))}")

        update_data = {k: v for k, v in update_data.items() if k in self.allowed_update_fields}
        if not update_data:
            raise ValueError("no valid fields to update")

        merged = {**existing, **update_data}
        merged["name"] = resource_name
        self.validate(merged)

        await self.pre_update(resource_name, update_data)

        if "name" in update_data and update_data["name"] != resource_name:
            new_name = update_data["name"]
            name_exists = await self.get_by_name(new_name)
            if name_exists:
                raise ValueError(f"{self.label} with name {new_name} already exists")

        self._stamp_timestamps(update_data)
        await self._db.update_one(self.collection, {"name": resource_name}, {"$set": update_data})
        self.on_changed()

        return await self.get_by_name(update_data.get("name", resource_name))

    async def pre_update(self, resource_name: str, update_data: dict[str, Any]) -> None:
        pass

    async def delete(self, name: str) -> bool:
        """删除文档：存在性/builtin 校验 → 附加约束 → 删除"""
        doc = await self.get_by_name(name)
        if not doc:
            raise ValueError(f"{self.label} with name {name} does not exist")

        if doc.get("is_builtin", False):
            raise ValueError(f"builtin {self.plural} cannot be deleted")

        await self.pre_delete(doc)

        deleted_count = await self._db.delete_one(self.collection, {"name": name})
        self.on_changed()
        return deleted_count > 0

    async def pre_delete(self, doc: dict[str, Any]) -> None:
        pass

    def on_changed(self) -> None:
        pass
