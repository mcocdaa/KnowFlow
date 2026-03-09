# @file backend/managers/category_manager.py
# @brief 分类管理核心逻辑（数据库版）
# @create 2026-03-07 10:00:00

from typing import Dict, Any, List, Optional
from config import CATEGORY_STYLE, DEFAULT_CATEGORIES_PATH
import yaml
from bson import ObjectId
from .db_manager import db_manager


class CategoryManager:
    def __init__(self):
        self.collection = "categories"

    def _convert_doc(self, doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if doc and '_id' in doc:
            doc['id'] = str(doc['_id'])
            del doc['_id']
        return doc

    def _convert_docs(self, docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self._convert_doc(doc) for doc in docs]

    async def initialize(self):
        """
        初始化分类定义，从默认配置加载到数据库
        """
        count = await db_manager.count_documents(self.collection)
        if count == 0:
            with open(DEFAULT_CATEGORIES_PATH, "r", encoding="utf-8") as f:
                default_categories = yaml.safe_load(f)
                
                parent_categories = []
                child_categories = []
                
                for category in default_categories:
                    if category.get('parent_name') in (None, 'None'):
                        category['parent_name'] = None
                        parent_categories.append(category)
                    else:
                        child_categories.append(category)
                
                for category in parent_categories:
                    await self.create(category)
                
                for category in child_categories:
                    await self.create(category)

    def validate(self, category: Dict[str, Any]) -> bool:
        """
        验证分类定义是否有效
        """
        if not isinstance(category, dict):
            raise ValueError("category must be a dict")
        
        for key in CATEGORY_STYLE['property']:
            if key not in category:
                raise ValueError(f"category must contain {key}")
        
        if not isinstance(category['name'], str) or not category['name'].strip():
            raise ValueError("category name must be non-empty string")
        
        return True

    async def create(self, category: Dict[str, Any]) -> Dict[str, Any]:
        """
        创建新分类
        """
        self.validate(category)
        
        existing = await db_manager.find_one(self.collection, {"name": category['name']})
        if existing:
            raise ValueError(f"category with name {category['name']} already exists")
        
        if category.get('parent_name') is not None:
            parent = await db_manager.find_one(self.collection, {"name": category['parent_name']})
            if not parent:
                raise ValueError(f"parent category with name {category['parent_name']} does not exist")
        
        await db_manager.insert_one(self.collection, category)
        return category

    async def get_by_id(self, category_id: str) -> Optional[Dict[str, Any]]:
        """
        根据数据库 ID 获取分类
        """
        try:
            oid = ObjectId(category_id)
            doc = await db_manager.find_one(self.collection, {"_id": oid})
            return self._convert_doc(doc)
        except:
            return None

    async def get_by_name(self, category_name: str) -> Optional[Dict[str, Any]]:
        """
        根据名称获取分类
        """
        doc = await db_manager.find_one(self.collection, {"name": category_name})
        return self._convert_doc(doc)

    async def get_all(self) -> List[Dict[str, Any]]:
        """
        获取所有分类
        """
        docs = await db_manager.find(self.collection, sort=[("name", 1)])
        return self._convert_docs(docs)

    async def get_children(self, parent_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        获取指定父分类的子分类
        """
        docs = await db_manager.find(self.collection, {"parent_name": parent_name}, sort=[("name", 1)])
        return self._convert_docs(docs)

    async def update(self, category_name: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        更新分类
        """
        existing = await self.get_by_name(category_name)
        if not existing:
            raise ValueError(f"category with name {category_name} does not exist")
        
        if existing.get('is_builtin', False):
            raise ValueError("builtin categories cannot be modified")
        
        merged = {**existing, **update_data}
        merged['name'] = category_name
        self.validate(merged)
        
        if 'parent_name' in update_data and update_data['parent_name'] is not None:
            if update_data['parent_name'] == category_name:
                raise ValueError("category cannot be its own parent")
            
            parent = await self.get_by_name(update_data['parent_name'])
            if not parent:
                raise ValueError(f"parent category with name {update_data['parent_name']} does not exist")
        
        if 'name' in update_data and update_data['name'] != category_name:
            new_name = update_data['name']
            name_exists = await self.get_by_name(new_name)
            if name_exists:
                raise ValueError(f"category with name {new_name} already exists")
        
        await db_manager.update_one(
            self.collection,
            {"name": category_name},
            {"$set": update_data}
        )
        
        new_category_name = update_data.get('name', category_name)
        return await self.get_by_name(new_category_name)

    async def delete(self, category_name: str) -> bool:
        """
        删除分类
        """
        category = await self.get_by_name(category_name)
        if not category:
            raise ValueError(f"category with name {category_name} does not exist")
        
        if category.get('is_builtin', False):
            raise ValueError("builtin categories cannot be deleted")
        
        children = await self.get_children(category_name)
        if children:
            raise ValueError("cannot delete category with existing children")
        
        deleted_count = await db_manager.delete_one(self.collection, {"name": category_name})
        return deleted_count > 0


# 全局分类管理实例
category_manager = CategoryManager()
