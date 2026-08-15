# @file backend/test/test_key_manager.py
# @brief 键管理器单元测试
# @create 2026-03-08 10:00:00

from datetime import datetime
from unittest.mock import patch

import pytest

from managers.key_manager import KeyManager


class TestKeyManager:
    @pytest.fixture
    def key_manager(self, mock_db_manager):
        manager = KeyManager()
        with patch("managers.key_manager.db_manager", mock_db_manager):
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
            "updated_at": "2026-03-08T10:00:00",
        }
        assert key_manager.validate(valid_key) is True

    def test_validate_invalid_key_missing_fields(self, key_manager):
        invalid_key = {"name": "test_key"}
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
            "updated_at": "2026-03-08T10:00:00",
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
            "updated_at": "2026-03-08T10:00:00",
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
            "updated_at": "2026-03-08T10:00:00",
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
            "updated_at": "2026-03-08T10:00:00",
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
            "updated_at": "2026-03-08T10:00:00",
        }
        mock_db_manager.find_one.side_effect = [None, None]

        with pytest.raises(ValueError, match="category with name"):
            await key_manager.create(key_data)

    @pytest.mark.asyncio
    async def test_get_all_success(self, key_manager, mock_db_manager):
        expected_keys = [{"name": "key1"}, {"name": "key2"}]
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
            "updated_at": "2026-03-08T10:00:00",
        }
        update_data = {"title": "New Title"}

        mock_db_manager.find.return_value = [existing_key]
        mock_db_manager.find_one.side_effect = [existing_key, {"name": "test_category"}, None]
        mock_db_manager.update_one.return_value = 1

        await key_manager.update("old_name", update_data)

        mock_db_manager.update_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_not_found(self, key_manager, mock_db_manager):
        mock_db_manager.find.return_value = []

        with pytest.raises(ValueError, match="does not exist"):
            await key_manager.update("nonexistent", {})

    @pytest.mark.asyncio
    async def test_update_builtin_key(self, key_manager, mock_db_manager):
        existing_key = {"name": "builtin_key", "is_builtin": True}
        mock_db_manager.find.return_value = [existing_key]

        with pytest.raises(ValueError, match="builtin keys cannot be modified"):
            await key_manager.update("builtin_key", {})

    @pytest.mark.asyncio
    async def test_delete_success(self, key_manager, mock_db_manager):
        existing_key = {"name": "test_key", "is_builtin": False}
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
        existing_key = {"name": "builtin_key", "is_builtin": True}
        mock_db_manager.find.return_value = [existing_key]

        with pytest.raises(ValueError, match="builtin keys cannot be deleted"):
            await key_manager.delete("builtin_key")

    @pytest.mark.asyncio
    async def test_delete_by_plugin(self, key_manager, mock_db_manager):
        mock_db_manager.find.return_value = [
            {"name": "plugin_key", "plugin_name": "rating", "delete_with_plugin": True},
            {"name": "plugin_keep", "plugin_name": "rating", "delete_with_plugin": False},
            {"name": "other_key", "plugin_name": "other", "delete_with_plugin": True},
        ]
        mock_db_manager.delete_many.return_value = 1

        deleted = await key_manager.delete_by_plugin("rating")

        assert deleted == 1
        mock_db_manager.delete_many.assert_called_once_with("keys", {"name": {"$in": ["plugin_key"]}})

    @pytest.mark.asyncio
    async def test_delete_by_plugin_none_found(self, key_manager, mock_db_manager):
        mock_db_manager.find.return_value = [{"name": "other_key", "plugin_name": "other", "delete_with_plugin": True}]

        deleted = await key_manager.delete_by_plugin("unknown")

        assert deleted == 0
        mock_db_manager.delete_one.assert_not_called()


class TestKeyManagerExtraction:
    @pytest.fixture
    def key_manager(self, mock_db_manager):
        manager = KeyManager()
        with patch("managers.key_manager.db_manager", mock_db_manager):
            yield manager

    @pytest.mark.asyncio
    async def test_ensure_category_ok(self, key_manager, mock_db_manager):
        mock_db_manager.find_one.return_value = {"name": "tech"}

        await key_manager._ensure_category("tech")

        mock_db_manager.find_one.assert_called_once_with("categories", {"name": "tech"})

    @pytest.mark.asyncio
    async def test_ensure_category_missing_raises(self, key_manager, mock_db_manager):
        mock_db_manager.find_one.return_value = None

        with pytest.raises(ValueError, match="category with name ghost does not exist"):
            await key_manager._ensure_category("ghost")

    def test_stamp_timestamps_create(self, key_manager):
        doc: dict = {"name": "k"}
        key_manager._stamp_timestamps(doc, created=True)

        assert "created_at" in doc
        assert "updated_at" in doc

    def test_stamp_timestamps_update_only_updated_at(self, key_manager):
        doc: dict = {"name": "k", "created_at": "2026-01-01T00:00:00"}
        key_manager._stamp_timestamps(doc)

        assert doc["created_at"] == "2026-01-01T00:00:00"
        assert "updated_at" in doc

    @pytest.mark.asyncio
    async def test_delete_by_plugin_uses_batch_delete(self, key_manager, mock_db_manager):
        key_manager._cache = [
            {"name": "a", "plugin_name": "p1", "delete_with_plugin": True},
            {"name": "b", "plugin_name": "p1", "delete_with_plugin": False},
            {"name": "c", "plugin_name": "p2", "delete_with_plugin": True},
        ]
        key_manager._cache_time = datetime.now()  # 必须，否则缓存失效会走 db_manager.find
        mock_db_manager.delete_many.return_value = 1

        result = await key_manager.delete_by_plugin("p1")

        assert result == 1
        mock_db_manager.delete_many.assert_called_once_with("keys", {"name": {"$in": ["a"]}})

    @pytest.mark.asyncio
    async def test_delete_by_plugin_no_match_skips_db(self, key_manager, mock_db_manager):
        key_manager._cache = [{"name": "c", "plugin_name": "p2", "delete_with_plugin": True}]
        key_manager._cache_time = datetime.now()  # 同上，必须设置

        result = await key_manager.delete_by_plugin("p1")

        assert result == 0
        mock_db_manager.delete_many.assert_not_called()
