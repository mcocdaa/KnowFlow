# @file backend/test/test_category_manager.py
# @brief 分类管理器单元测试
# @create 2026-03-08 10:00:00

import pytest
from unittest.mock import AsyncMock, MagicMock, patch, mock_open
from managers.category_manager import CategoryManager


class TestCategoryManager:
    @pytest.fixture
    def category_manager(self, mock_db_manager):
        manager = CategoryManager()
        with patch('managers.category_manager.db_manager', mock_db_manager):
            yield manager

    def test_validate_valid_category(self, category_manager):
        valid_category = {
            "name": "test_category",
            "title": "Test Category",
            "parent_name": None,
            "is_builtin": False
        }
        assert category_manager.validate(valid_category) is True

    def test_validate_invalid_category_missing_fields(self, category_manager):
        invalid_category = {
            "name": "test_category"
        }
        with pytest.raises(ValueError, match="category must contain"):
            category_manager.validate(invalid_category)

    def test_validate_invalid_category_empty_name(self, category_manager):
        invalid_category = {
            "name": "",
            "title": "Test Category",
            "parent_name": None,
            "is_builtin": False
        }
        with pytest.raises(ValueError, match="category name must be non-empty string"):
            category_manager.validate(invalid_category)

    @pytest.mark.asyncio
    async def test_create_success(self, category_manager, mock_db_manager):
        category_data = {
            "name": "test_category",
            "title": "Test Category",
            "parent_name": None,
            "is_builtin": False
        }
        mock_db_manager.find_one.return_value = None
        mock_db_manager.insert_one.return_value = "category_id"
        
        result = await category_manager.create(category_data)
        
        assert result == category_data
        mock_db_manager.find_one.assert_called_once_with("categories", {"name": "test_category"})
        mock_db_manager.insert_one.assert_called_once_with("categories", category_data)

    @pytest.mark.asyncio
    async def test_create_already_exists(self, category_manager, mock_db_manager):
        category_data = {
            "name": "test_category",
            "title": "Test Category",
            "parent_name": None,
            "is_builtin": False
        }
        mock_db_manager.find_one.return_value = {"name": "test_category"}
        
        with pytest.raises(ValueError, match="already exists"):
            await category_manager.create(category_data)

    @pytest.mark.asyncio
    async def test_create_with_parent_not_found(self, category_manager, mock_db_manager):
        category_data = {
            "name": "test_category",
            "title": "Test Category",
            "parent_name": "nonexistent_parent",
            "is_builtin": False
        }
        mock_db_manager.find_one.side_effect = [None, None]
        
        with pytest.raises(ValueError, match="parent category"):
            await category_manager.create(category_data)

    @pytest.mark.asyncio
    async def test_get_by_id_success(self, category_manager, mock_db_manager):
        from bson import ObjectId
        test_oid = ObjectId("507f1f77bcf86cd799439011")
        expected_category = {"_id": test_oid, "name": "test_category"}
        mock_db_manager.find_one.return_value = expected_category
        
        result = await category_manager.get_by_id(str(test_oid))
        
        assert result == expected_category

    @pytest.mark.asyncio
    async def test_get_by_name_success(self, category_manager, mock_db_manager):
        expected_category = {"_id": "test_id", "name": "test_category"}
        mock_db_manager.find_one.return_value = expected_category
        
        result = await category_manager.get_by_name("test_category")
        
        assert result == expected_category
        mock_db_manager.find_one.assert_called_once_with("categories", {"name": "test_category"})

    @pytest.mark.asyncio
    async def test_get_all_success(self, category_manager, mock_db_manager):
        expected_categories = [
            {"name": "category1"},
            {"name": "category2"}
        ]
        mock_db_manager.find.return_value = expected_categories
        
        result = await category_manager.get_all()
        
        assert result == expected_categories
        mock_db_manager.find.assert_called_once_with("categories", sort=[("name", 1)])

    @pytest.mark.asyncio
    async def test_get_children_success(self, category_manager, mock_db_manager):
        expected_children = [
            {"name": "child1", "parent_name": "parent"},
            {"name": "child2", "parent_name": "parent"}
        ]
        mock_db_manager.find.return_value = expected_children
        
        result = await category_manager.get_children("parent")
        
        assert result == expected_children
        mock_db_manager.find.assert_called_once_with("categories", {"parent_name": "parent"}, sort=[("name", 1)])

    @pytest.mark.asyncio
    async def test_update_success(self, category_manager, mock_db_manager):
        existing_category = {
            "name": "old_name",
            "title": "Old Title",
            "parent_name": None,
            "is_builtin": False
        }
        update_data = {"title": "New Title"}
        
        mock_db_manager.find_one.side_effect = [existing_category, None]
        mock_db_manager.update_one.return_value = 1
        
        result = await category_manager.update("old_name", update_data)
        
        mock_db_manager.update_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_not_found(self, category_manager, mock_db_manager):
        mock_db_manager.find_one.return_value = None
        
        with pytest.raises(ValueError, match="does not exist"):
            await category_manager.update("nonexistent", {})

    @pytest.mark.asyncio
    async def test_update_builtin_category(self, category_manager, mock_db_manager):
        existing_category = {
            "name": "builtin",
            "title": "Builtin",
            "parent_name": None,
            "is_builtin": True
        }
        mock_db_manager.find_one.return_value = existing_category
        
        with pytest.raises(ValueError, match="builtin categories cannot be modified"):
            await category_manager.update("builtin", {})

    @pytest.mark.asyncio
    async def test_delete_success(self, category_manager, mock_db_manager):
        existing_category = {
            "name": "test_category",
            "is_builtin": False
        }
        mock_db_manager.find_one.return_value = existing_category
        mock_db_manager.find.return_value = []
        mock_db_manager.delete_one.return_value = 1
        
        result = await category_manager.delete("test_category")
        
        assert result is True

    @pytest.mark.asyncio
    async def test_delete_not_found(self, category_manager, mock_db_manager):
        mock_db_manager.find_one.return_value = None
        
        with pytest.raises(ValueError, match="does not exist"):
            await category_manager.delete("nonexistent")

    @pytest.mark.asyncio
    async def test_delete_builtin_category(self, category_manager, mock_db_manager):
        existing_category = {
            "name": "builtin",
            "is_builtin": True
        }
        mock_db_manager.find_one.return_value = existing_category
        
        with pytest.raises(ValueError, match="builtin categories cannot be deleted"):
            await category_manager.delete("builtin")

    @pytest.mark.asyncio
    async def test_delete_with_children(self, category_manager, mock_db_manager):
        existing_category = {
            "name": "parent",
            "is_builtin": False
        }
        mock_db_manager.find_one.return_value = existing_category
        mock_db_manager.find.return_value = [{"name": "child"}]
        
        with pytest.raises(ValueError, match="cannot delete category with existing children"):
            await category_manager.delete("parent")

    @pytest.mark.asyncio
    async def test_initialize_empty_db(self, category_manager, mock_db_manager):
        mock_db_manager.count_documents.return_value = 0
        mock_db_manager.find_one.return_value = None
        mock_yaml_data = [
            {"name": "default1", "title": "Default 1", "parent_name": None, "is_builtin": True}
        ]
        
        with patch('builtins.open', mock_open(read_data='')):
            with patch('yaml.safe_load', return_value=mock_yaml_data):
                await category_manager.initialize()
        
        mock_db_manager.count_documents.assert_called_once_with("categories")

    @pytest.mark.asyncio
    async def test_initialize_non_empty_db(self, category_manager, mock_db_manager):
        mock_db_manager.count_documents.return_value = 5
        
        await category_manager.initialize()
        
        mock_db_manager.count_documents.assert_called_once_with("categories")
