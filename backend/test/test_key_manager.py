# @file backend/test/test_key_manager.py
# @brief 键管理器单元测试
# @create 2026-03-08 10:00:00

import pytest
from unittest.mock import AsyncMock, MagicMock, patch, mock_open
from managers.key_manager import KeyManager


class TestKeyManager:
    @pytest.fixture
    def key_manager(self, mock_db_manager):
        manager = KeyManager()
        with patch('managers.key_manager.db_manager', mock_db_manager):
            yield manager

    def test_validate_valid_key(self, key_manager):
        valid_key = {
            "name": "test_key",
            "title": "Test Key",
            "value_type": "string",
            "default_value": "",
            "description": "Test description",
            "category_name": "test_category",
            "is_required": False,
            "is_visible": True,
            "plugin_name": None,
            "delete_with_plugin": True,
            "is_public": True,
            "is_private": False,
            "created_at": "2026-03-08T10:00:00",
            "updated_at": "2026-03-08T10:00:00"
        }
        assert key_manager.validate(valid_key) is True

    def test_validate_invalid_key_missing_fields(self, key_manager):
        invalid_key = {
            "name": "test_key"
        }
        with pytest.raises(ValueError, match="key definition must contain"):
            key_manager.validate(invalid_key)

    def test_validate_invalid_key_empty_name(self, key_manager):
        invalid_key = {
            "name": "",
            "title": "Test Key",
            "value_type": "string",
            "default_value": "",
            "description": "Test description",
            "category_name": "test_category",
            "is_required": False,
            "is_visible": True,
            "plugin_name": None,
            "delete_with_plugin": True,
            "is_public": True,
            "is_private": False,
            "created_at": "2026-03-08T10:00:00",
            "updated_at": "2026-03-08T10:00:00"
        }
        with pytest.raises(ValueError, match="key name must be non-empty string"):
            key_manager.validate(invalid_key)

    def test_validate_invalid_value_type(self, key_manager):
        invalid_key = {
            "name": "test_key",
            "title": "Test Key",
            "value_type": "invalid_type",
            "default_value": "",
            "description": "Test description",
            "category_name": "test_category",
            "is_required": False,
            "is_visible": True,
            "plugin_name": None,
            "delete_with_plugin": True,
            "is_public": True,
            "is_private": False,
            "created_at": "2026-03-08T10:00:00",
            "updated_at": "2026-03-08T10:00:00"
        }
        with pytest.raises(ValueError, match="invalid value_type"):
            key_manager.validate(invalid_key)

    @pytest.mark.asyncio
    async def test_create_success(self, key_manager, mock_db_manager):
        key_data = {
            "name": "test_key",
            "title": "Test Key",
            "value_type": "string",
            "default_value": "",
            "description": "Test description",
            "category_name": "test_category",
            "is_required": False,
            "is_visible": True,
            "plugin_name": None,
            "delete_with_plugin": True,
            "is_public": True,
            "is_private": False,
            "created_at": "2026-03-08T10:00:00",
            "updated_at": "2026-03-08T10:00:00"
        }
        mock_db_manager.find_one.side_effect = [None, {"name": "test_category"}]
        mock_db_manager.insert_one.return_value = "key_id"
        
        result = await key_manager.create(key_data)
        
        assert result["name"] == "test_key"
        assert "created_at" in result
        assert "updated_at" in result

    @pytest.mark.asyncio
    async def test_create_already_exists(self, key_manager, mock_db_manager):
        key_data = {
            "name": "test_key",
            "title": "Test Key",
            "value_type": "string",
            "default_value": "",
            "description": "Test description",
            "category_name": "test_category",
            "is_required": False,
            "is_visible": True,
            "plugin_name": None,
            "delete_with_plugin": True,
            "is_public": True,
            "is_private": False,
            "created_at": "2026-03-08T10:00:00",
            "updated_at": "2026-03-08T10:00:00"
        }
        mock_db_manager.find_one.return_value = {"name": "test_key"}
        
        with pytest.raises(ValueError, match="already exists"):
            await key_manager.create(key_data)

    @pytest.mark.asyncio
    async def test_create_category_not_found(self, key_manager, mock_db_manager):
        key_data = {
            "name": "test_key",
            "title": "Test Key",
            "value_type": "string",
            "default_value": "",
            "description": "Test description",
            "category_name": "nonexistent_category",
            "is_required": False,
            "is_visible": True,
            "plugin_name": None,
            "delete_with_plugin": True,
            "is_public": True,
            "is_private": False,
            "created_at": "2026-03-08T10:00:00",
            "updated_at": "2026-03-08T10:00:00"
        }
        mock_db_manager.find_one.side_effect = [None, None]
        
        with pytest.raises(ValueError, match="category with name"):
            await key_manager.create(key_data)

    @pytest.mark.asyncio
    async def test_get_all_success(self, key_manager, mock_db_manager):
        expected_keys = [
            {"name": "key1"},
            {"name": "key2"}
        ]
        mock_db_manager.find.return_value = expected_keys
        
        result = await key_manager.get_all()
        
        assert result == expected_keys
        mock_db_manager.find.assert_called_once_with("keys", sort=[("name", 1)])

    @pytest.mark.asyncio
    async def test_get_by_name_success(self, key_manager, mock_db_manager):
        expected_key = {"name": "test_key", "title": "Test Key"}
        mock_db_manager.find.return_value = [expected_key]
        
        result = await key_manager.get_by_name("test_key")
        
        assert result == expected_key

    @pytest.mark.asyncio
    async def test_update_success(self, key_manager, mock_db_manager):
        existing_key = {
            "name": "old_name",
            "title": "Old Title",
            "value_type": "string",
            "default_value": "",
            "description": "Old description",
            "category_name": "test_category",
            "is_required": False,
            "is_visible": True,
            "plugin_name": None,
            "delete_with_plugin": True,
            "is_public": True,
            "is_private": False,
            "is_builtin": False,
            "created_at": "2026-03-08T10:00:00",
            "updated_at": "2026-03-08T10:00:00"
        }
        update_data = {"title": "New Title"}
        
        mock_db_manager.find.return_value = [existing_key]
        mock_db_manager.find_one.side_effect = [existing_key, {"name": "test_category"}, None]
        mock_db_manager.update_one.return_value = 1
        
        result = await key_manager.update("old_name", update_data)
        
        mock_db_manager.update_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_not_found(self, key_manager, mock_db_manager):
        mock_db_manager.find.return_value = []
        
        with pytest.raises(ValueError, match="does not exist"):
            await key_manager.update("nonexistent", {})

    @pytest.mark.asyncio
    async def test_update_builtin_key(self, key_manager, mock_db_manager):
        existing_key = {
            "name": "builtin_key",
            "is_builtin": True
        }
        mock_db_manager.find.return_value = [existing_key]
        
        with pytest.raises(ValueError, match="builtin keys cannot be modified"):
            await key_manager.update("builtin_key", {})

    @pytest.mark.asyncio
    async def test_delete_success(self, key_manager, mock_db_manager):
        existing_key = {
            "name": "test_key",
            "is_builtin": False
        }
        mock_db_manager.find.return_value = [existing_key]
        mock_db_manager.delete_one.return_value = 1
        
        result = await key_manager.delete("test_key")
        
        assert result is True

    @pytest.mark.asyncio
    async def test_delete_not_found(self, key_manager, mock_db_manager):
        mock_db_manager.find.return_value = []
        
        with pytest.raises(ValueError, match="does not exist"):
            await key_manager.delete("nonexistent")

    @pytest.mark.asyncio
    async def test_delete_builtin_key(self, key_manager, mock_db_manager):
        existing_key = {
            "name": "builtin_key",
            "is_builtin": True
        }
        mock_db_manager.find.return_value = [existing_key]
        
        with pytest.raises(ValueError, match="builtin keys cannot be deleted"):
            await key_manager.delete("builtin_key")

    @pytest.mark.asyncio
    async def test_delete_by_plugin(self, key_manager, mock_db_manager):
        plugin_keys = [
            {"name": "key1", "plugin_name": "test_plugin", "is_builtin": False, "delete_with_plugin": True},
            {"name": "key2", "plugin_name": "test_plugin", "is_builtin": False, "delete_with_plugin": True},
            {"name": "key3", "plugin_name": "test_plugin", "is_builtin": True, "delete_with_plugin": True}
        ]
        mock_db_manager.find.return_value = plugin_keys
        mock_db_manager.delete_one.return_value = 1
        
        result = await key_manager.delete_by_plugin("test_plugin")
        
        assert result == 2

    @pytest.mark.asyncio
    async def test_get_by_category(self, key_manager, mock_db_manager):
        all_keys = [
            {"name": "key1", "category_name": "cat1"},
            {"name": "key2", "category_name": "cat1"},
            {"name": "key3", "category_name": "cat2"}
        ]
        mock_db_manager.find.return_value = all_keys
        
        result = await key_manager.get_by_category("cat1")
        
        assert len(result) == 2
        assert all(key["category_name"] == "cat1" for key in result)

    @pytest.mark.asyncio
    async def test_get_by_plugin(self, key_manager, mock_db_manager):
        all_keys = [
            {"name": "key1", "plugin_name": "plugin1"},
            {"name": "key2", "plugin_name": "plugin1"},
            {"name": "key3", "plugin_name": "plugin2"}
        ]
        mock_db_manager.find.return_value = all_keys
        
        result = await key_manager.get_by_plugin("plugin1")
        
        assert len(result) == 2
        assert all(key["plugin_name"] == "plugin1" for key in result)
