# @file backend/managers/key_manager.py
# @brief Key定义管理核心逻辑（数据库版）
# @create 2026-03-07 10:00:00

from typing import Dict, Any, List, Optional
from config import KEY_STYLE, DEFAULT_KEYS_PATH
import yaml
import os
from datetime import datetime
from bson import ObjectId
from .db_manager import db_manager


class KeyManager:
    def __init__(self):
        self.collection = "keys"
        self._cache: Optional[List[Dict[str, Any]]] = None
        self._cache_time: Optional[datetime] = None
        self._cache_ttl = 300

    def _convert_doc(self, doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if doc and '_id' in doc:
            doc['id'] = str(doc['_id'])
            del doc['_id']
        return doc

    def _convert_docs(self, docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self._convert_doc(doc) for doc in docs]

    def _is_cache_valid(self) -> bool:
        if self._cache is None or self._cache_time is None:
            return False
        return (datetime.now() - self._cache_time).total_seconds() < self._cache_ttl

    def _invalidate_cache(self):
        self._cache = None
        self._cache_time = None

    async def initialize(self):
        """
        初始化Key定义，从默认配置加载到数据库
        """
        count = await db_manager.count_documents(self.collection)
        if count == 0:
            with open(DEFAULT_KEYS_PATH, "r", encoding="utf-8") as f:
                default_keys = yaml.safe_load(f)
                for key_def in default_keys:
                    await self.create(key_def)

    def validate(self, key_def: Dict[str, Any]) -> bool:
        """
        验证Key定义是否符合样式
        """
        if not isinstance(key_def, dict):
            raise ValueError("key definition must be a dict")
        
        for required_key in KEY_STYLE['property']:
            if required_key not in key_def:
                raise ValueError(f"key definition must contain {required_key}")
        
        if not isinstance(key_def['name'], str) or not key_def['name'].strip():
            raise ValueError("key name must be non-empty string")
        
        if key_def['value_type'] not in ['string', 'number', 'boolean', 'array', 'object']:
            raise ValueError("invalid value_type, must be one of: string, number, boolean, array, object")
        
        return True

    async def create(self, key_def: Dict[str, Any]) -> Dict[str, Any]:
        """
        创建新Key定义
        """
        self.validate(key_def)
        
        existing = await db_manager.find_one(self.collection, {"name": key_def['name']})
        if existing:
            raise ValueError(f"key with name {key_def['name']} already exists")
        
        category = await db_manager.find_one("categories", {"name": key_def['category_name']})
        if not category:
            raise ValueError(f"category with name {key_def['category_name']} does not exist")
        
        if 'created_at' not in key_def:
            key_def['created_at'] = datetime.now().isoformat()
        if 'updated_at' not in key_def:
            key_def['updated_at'] = datetime.now().isoformat()
        
        await db_manager.insert_one(self.collection, key_def)
        self._invalidate_cache()
        return key_def

    async def get_by_id(self, key_id: str) -> Optional[Dict[str, Any]]:
        """
        根据数据库 ID 获取Key定义
        """
        try:
            oid = ObjectId(key_id)
            doc = await db_manager.find_one(self.collection, {"_id": oid})
            return self._convert_doc(doc)
        except:
            return None

    async def get_by_name(self, key_name: str) -> Optional[Dict[str, Any]]:
        """
        根据名称获取Key定义
        """
        keys = await self.get_all()
        for key in keys:
            if key['name'] == key_name:
                return key
        return None

    async def get_all(self) -> List[Dict[str, Any]]:
        """
        获取所有Key定义（带缓存）
        """
        if self._is_cache_valid():
            return self._cache
        
        keys = await db_manager.find(self.collection, sort=[("name", 1)])
        converted_keys = self._convert_docs(keys)
        self._cache = converted_keys
        self._cache_time = datetime.now()
        return converted_keys

    async def get_by_category(self, category_name: str) -> List[Dict[str, Any]]:
        """
        获取指定分类下的所有Key定义
        """
        keys = await self.get_all()
        return [key for key in keys if key['category_name'] == category_name]

    async def get_by_plugin(self, plugin_name: str) -> List[Dict[str, Any]]:
        """
        获取指定插件的所有Key定义
        """
        keys = await self.get_all()
        return [key for key in keys if key['plugin_name'] == plugin_name]

    async def update(self, key_name: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        更新Key定义
        """
        existing = await self.get_by_name(key_name)
        if not existing:
            raise ValueError(f"key with name {key_name} does not exist")
        
        if existing.get('is_builtin', False):
            raise ValueError("builtin keys cannot be modified")
        
        merged = {**existing, **update_data}
        merged['name'] = key_name
        self.validate(merged)
        
        if 'category_name' in update_data:
            category = await db_manager.find_one("categories", {"name": update_data['category_name']})
            if not category:
                raise ValueError(f"category with name {update_data['category_name']} does not exist")
        
        update_data['updated_at'] = datetime.now().isoformat()
        if 'name' in update_data and update_data['name'] != key_name:
            new_name = update_data['name']
            name_exists = await self.get_by_name(new_name)
            if name_exists:
                raise ValueError(f"key with name {new_name} already exists")
        
        await db_manager.update_one(
            self.collection,
            {"name": key_name},
            {"$set": update_data}
        )
        self._invalidate_cache()
        
        new_key_name = update_data.get('name', key_name)
        return await self.get_by_name(new_key_name)

    async def delete(self, key_name: str) -> bool:
        """
        删除Key定义
        """
        key = await self.get_by_name(key_name)
        if not key:
            raise ValueError(f"key with name {key_name} does not exist")
        
        if key.get('is_builtin', False):
            raise ValueError("builtin keys cannot be deleted")
        
        deleted_count = await db_manager.delete_one(self.collection, {"name": key_name})
        self._invalidate_cache()
        return deleted_count > 0

    async def delete_by_plugin(self, plugin_name: str) -> int:
        """
        删除指定插件的所有可删除Key定义
        """
        keys = await self.get_by_plugin(plugin_name)
        deleted_count = 0
        
        for key in keys:
            if key.get('delete_with_plugin', True) and not key.get('is_builtin', False):
                await self.delete(key['name'])
                deleted_count += 1
        
        return deleted_count


# 全局Key管理实例
key_manager = KeyManager()
