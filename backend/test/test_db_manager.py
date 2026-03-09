# @file backend/test/test_db_manager.py
# @brief 数据库管理器单元测试
# @create 2026-03-08 10:00:00

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from managers.db_manager import DBManager, retry_on_connection_error


class TestRetryOnConnectionError:
    @pytest.mark.asyncio
    async def test_retry_decorator_success_on_first_attempt(self):
        mock_func = AsyncMock(return_value="success")
        
        @retry_on_connection_error
        async def test_func(self):
            return await mock_func()
        
        db_manager = DBManager()
        db_manager.db = MagicMock()
        
        result = await test_func(db_manager)
        
        assert result == "success"
        assert mock_func.call_count == 1

    @pytest.mark.asyncio
    async def test_retry_decorator_retries_on_failure(self):
        mock_func = AsyncMock(side_effect=[Exception("fail1"), Exception("fail2"), "success"])
        
        @retry_on_connection_error
        async def test_func(self):
            return await mock_func()
        
        db_manager = DBManager()
        db_manager.db = MagicMock()
        db_manager.reconnect = AsyncMock()
        
        result = await test_func(db_manager)
        
        assert result == "success"
        assert mock_func.call_count == 3


class TestDBManager:
    @pytest.fixture
    def db_manager(self):
        return DBManager()

    @pytest.mark.asyncio
    async def test_initialize(self, db_manager):
        with patch('motor.motor_asyncio.AsyncIOMotorClient') as mock_client:
            mock_db_instance = MagicMock()
            mock_client.return_value.__getitem__.return_value = mock_db_instance
            mock_db_instance["categories"].create_index = AsyncMock()
            mock_db_instance["keys"].create_index = AsyncMock()
            mock_db_instance["items"].create_index = AsyncMock()
            
            await db_manager.initialize()
            
            assert db_manager.client is not None
            assert db_manager.db is not None
            mock_client.assert_called_once()

    @pytest.mark.asyncio
    async def test_close(self, db_manager):
        mock_client = MagicMock()
        db_manager.client = mock_client
        db_manager.db = MagicMock()
        
        await db_manager.close()
        
        mock_client.close.assert_called_once()
        assert db_manager.client is None
        assert db_manager.db is None

    @pytest.mark.asyncio
    async def test_insert_one(self, db_manager):
        mock_collection = MagicMock()
        mock_collection.insert_one = AsyncMock(return_value=MagicMock(inserted_id="test_id"))
        mock_db = MagicMock()
        mock_db.__getitem__.return_value = mock_collection
        
        db_manager.db = mock_db
        
        result = await db_manager.insert_one("test_collection", {"name": "test"})
        
        assert result == "test_id"
        mock_collection.insert_one.assert_called_once_with({"name": "test"})

    @pytest.mark.asyncio
    async def test_find_one(self, db_manager):
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value={"_id": "test_id", "name": "test"})
        mock_db = MagicMock()
        mock_db.__getitem__.return_value = mock_collection
        
        db_manager.db = mock_db
        
        result = await db_manager.find_one("test_collection", {"name": "test"})
        
        assert result == {"_id": "test_id", "name": "test"}
        mock_collection.find_one.assert_called_once_with({"name": "test"})

    @pytest.mark.asyncio
    async def test_find(self, db_manager):
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=[{"_id": "1"}, {"_id": "2"}])
        mock_collection = MagicMock()
        mock_collection.find.return_value = mock_cursor
        mock_db = MagicMock()
        mock_db.__getitem__.return_value = mock_collection
        
        db_manager.db = mock_db
        
        result = await db_manager.find("test_collection", {"name": "test"})
        
        assert len(result) == 2
        mock_collection.find.assert_called_once_with({"name": "test"})

    @pytest.mark.asyncio
    async def test_update_one(self, db_manager):
        mock_collection = MagicMock()
        mock_collection.update_one = AsyncMock(return_value=MagicMock(modified_count=1))
        mock_db = MagicMock()
        mock_db.__getitem__.return_value = mock_collection
        
        db_manager.db = mock_db
        
        result = await db_manager.update_one("test_collection", {"name": "test"}, {"$set": {"name": "new"}})
        
        assert result == 1
        mock_collection.update_one.assert_called_once_with({"name": "test"}, {"$set": {"name": "new"}}, upsert=False)

    @pytest.mark.asyncio
    async def test_delete_one(self, db_manager):
        mock_collection = MagicMock()
        mock_collection.delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))
        mock_db = MagicMock()
        mock_db.__getitem__.return_value = mock_collection
        
        db_manager.db = mock_db
        
        result = await db_manager.delete_one("test_collection", {"name": "test"})
        
        assert result == 1
        mock_collection.delete_one.assert_called_once_with({"name": "test"})

    @pytest.mark.asyncio
    async def test_count_documents(self, db_manager):
        mock_collection = MagicMock()
        mock_collection.count_documents = AsyncMock(return_value=5)
        mock_db = MagicMock()
        mock_db.__getitem__.return_value = mock_collection
        
        db_manager.db = mock_db
        
        result = await db_manager.count_documents("test_collection", {"name": "test"})
        
        assert result == 5
        mock_collection.count_documents.assert_called_once_with({"name": "test"})
