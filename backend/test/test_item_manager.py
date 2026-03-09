# @file backend/test/test_item_manager.py
# @brief 知识项管理器单元测试
# @create 2026-03-08 10:00:00

import pytest
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch
from managers.item_manager import ItemManager
from bson import ObjectId


class TestItemManager:
    @pytest.fixture
    def item_manager(self, mock_db_manager):
        manager = ItemManager()
        with patch('managers.item_manager.db_manager', mock_db_manager):
            with patch('managers.item_manager.key_manager') as mock_key_manager:
                mock_key_manager.get_all = AsyncMock(return_value=[])
                yield manager

    def test_convert_value_string(self, item_manager):
        result = item_manager._convert_value("test", "string")
        assert result == "test"

    def test_convert_value_int(self, item_manager):
        result = item_manager._convert_value("42", "int")
        assert result == 42

    def test_convert_value_float(self, item_manager):
        result = item_manager._convert_value("3.14159", "float")
        assert result == 3.14

    def test_convert_value_bool_true(self, item_manager):
        assert item_manager._convert_value("true", "bool") is True
        assert item_manager._convert_value("1", "bool") is True
        assert item_manager._convert_value("yes", "bool") is True

    def test_convert_value_bool_false(self, item_manager):
        assert item_manager._convert_value("false", "bool") is False
        assert item_manager._convert_value("0", "bool") is False
        assert item_manager._convert_value("no", "bool") is False

    def test_convert_to_string_int(self, item_manager):
        result = item_manager._convert_to_string(42, "int")
        assert result == "42"

    def test_convert_to_string_float(self, item_manager):
        result = item_manager._convert_to_string(3.14, "float")
        assert result == "3.14"

    def test_convert_to_string_bool(self, item_manager):
        assert item_manager._convert_to_string(True, "bool") == "true"
        assert item_manager._convert_to_string(False, "bool") == "false"

    @pytest.mark.asyncio
    async def test_format_item_response(self, item_manager, mock_db_manager):
        test_item = {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "name": "Test Item",
            "created_at": datetime(2026, 3, 8, 10, 0, 0),
            "updated_at": datetime(2026, 3, 8, 10, 0, 0),
            "test_key": "test_value"
        }
        
        with patch('managers.item_manager.key_manager') as mock_key_manager:
            mock_key_manager.get_all = AsyncMock(return_value=[{
                "name": "test_key",
                "title": "Test Key",
                "value_type": "string",
                "is_visible": True,
                "is_required": False
            }])
            
            result = await item_manager._format_item_response(test_item)
            
            assert "item" in result
            assert "attributes" in result
            assert "key_info" in result
            assert result["item"]["id"] == "507f1f77bcf86cd799439011"
            assert result["item"]["name"] == "Test Item"

    @pytest.mark.asyncio
    async def test_get_all_success(self, item_manager, mock_db_manager):
        mock_items = [
            {
                "_id": ObjectId("507f1f77bcf86cd799439011"),
                "name": "Item 1"
            },
            {
                "_id": ObjectId("507f1f77bcf86cd799439012"),
                "name": "Item 2"
            }
        ]
        mock_db_manager.find.return_value = mock_items
        
        with patch('managers.item_manager.key_manager') as mock_key_manager:
            mock_key_manager.get_all = AsyncMock(return_value=[])
            
            result = await item_manager.get_all()
            
            assert len(result) == 2
            mock_db_manager.find.assert_called_once_with("items")

    @pytest.mark.asyncio
    async def test_get_by_id_success(self, item_manager, mock_db_manager):
        test_id = "507f1f77bcf86cd799439011"
        mock_item = {
            "_id": ObjectId(test_id),
            "name": "Test Item"
        }
        mock_db_manager.find_one.return_value = mock_item
        
        with patch('managers.item_manager.key_manager') as mock_key_manager:
            mock_key_manager.get_all = AsyncMock(return_value=[])
            
            result = await item_manager.get_by_id(test_id)
            
            assert result is not None
            mock_db_manager.find_one.assert_called_once_with("items", {"_id": ObjectId(test_id)})

    @pytest.mark.asyncio
    async def test_get_by_id_invalid_object_id(self, item_manager, mock_db_manager):
        result = await item_manager.get_by_id("invalid_id")
        assert result is None

    @pytest.mark.asyncio
    async def test_get_by_id_not_found(self, item_manager, mock_db_manager):
        test_id = "507f1f77bcf86cd799439011"
        mock_db_manager.find_one.return_value = None
        
        result = await item_manager.get_by_id(test_id)
        
        assert result is None

    @pytest.mark.asyncio
    async def test_create_success(self, item_manager, mock_db_manager):
        item_data = {
            "name": "New Item",
            "keyValues": {
                "test_key": "test_value"
            }
        }
        mock_inserted_id = ObjectId("507f1f77bcf86cd799439011")
        mock_db_manager.insert_one.return_value = mock_inserted_id
        
        with patch('managers.item_manager.key_manager') as mock_key_manager:
            mock_key_manager.get_all = AsyncMock(return_value=[{
                "name": "test_key",
                "title": "Test Key",
                "value_type": "string",
                "is_visible": True,
                "is_required": False
            }])
            mock_db_manager.find_one.return_value = {
                "_id": mock_inserted_id,
                "name": "New Item"
            }
            
            result = await item_manager.create(item_data)
            
            assert result is not None
            mock_db_manager.insert_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_with_attributes(self, item_manager, mock_db_manager):
        item_data = {
            "name": "New Item",
            "attributes": {
                "test_key": "test_value"
            }
        }
        mock_inserted_id = ObjectId("507f1f77bcf86cd799439011")
        mock_db_manager.insert_one.return_value = mock_inserted_id
        
        with patch('managers.item_manager.key_manager') as mock_key_manager:
            mock_key_manager.get_all = AsyncMock(return_value=[{
                "name": "test_key",
                "title": "Test Key",
                "value_type": "string",
                "is_visible": True,
                "is_required": False
            }])
            mock_db_manager.find_one.return_value = {
                "_id": mock_inserted_id,
                "name": "New Item"
            }
            
            result = await item_manager.create(item_data)
            
            assert result is not None

    @pytest.mark.asyncio
    async def test_update_success(self, item_manager, mock_db_manager):
        test_id = "507f1f77bcf86cd799439011"
        existing_item = {
            "_id": ObjectId(test_id),
            "name": "Old Name"
        }
        update_data = {
            "name": "New Name",
            "keyValues": {
                "test_key": "new_value"
            }
        }
        mock_db_manager.find_one.return_value = existing_item
        
        with patch('managers.item_manager.key_manager') as mock_key_manager:
            mock_key_manager.get_all = AsyncMock(return_value=[{
                "name": "test_key",
                "title": "Test Key",
                "value_type": "string",
                "is_visible": True,
                "is_required": False
            }])
            
            result = await item_manager.update(test_id, update_data)
            
            mock_db_manager.update_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_invalid_object_id(self, item_manager, mock_db_manager):
        result = await item_manager.update("invalid_id", {})
        assert result is None

    @pytest.mark.asyncio
    async def test_update_not_found(self, item_manager, mock_db_manager):
        test_id = "507f1f77bcf86cd799439011"
        mock_db_manager.find_one.return_value = None
        
        result = await item_manager.update(test_id, {})
        
        assert result is None

    @pytest.mark.asyncio
    async def test_delete_success(self, item_manager, mock_db_manager):
        test_id = "507f1f77bcf86cd799439011"
        mock_db_manager.delete_one.return_value = 1
        
        result = await item_manager.delete(test_id)
        
        assert result is True
        mock_db_manager.delete_one.assert_called_once_with("items", {"_id": ObjectId(test_id)})

    @pytest.mark.asyncio
    async def test_delete_invalid_object_id(self, item_manager, mock_db_manager):
        result = await item_manager.delete("invalid_id")
        assert result is False

    @pytest.mark.asyncio
    async def test_delete_not_found(self, item_manager, mock_db_manager):
        test_id = "507f1f77bcf86cd799439011"
        mock_db_manager.delete_one.return_value = 0
        
        result = await item_manager.delete(test_id)
        
        assert result is False
