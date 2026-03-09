# @file backend/test/conftest.py
# @brief 测试配置和公共夹具
# @create 2026-03-08 10:00:00

import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock
from managers.db_manager import DBManager


@pytest.fixture
def mock_db_manager():
    db_manager = DBManager()
    db_manager.client = MagicMock()
    db_manager.db = MagicMock()
    
    db_manager.insert_one = AsyncMock()
    db_manager.insert_many = AsyncMock()
    db_manager.find_one = AsyncMock()
    db_manager.find = AsyncMock()
    db_manager.update_one = AsyncMock()
    db_manager.update_many = AsyncMock()
    db_manager.delete_one = AsyncMock()
    db_manager.delete_many = AsyncMock()
    db_manager.count_documents = AsyncMock()
    db_manager.initialize = AsyncMock()
    db_manager.close = AsyncMock()
    
    return db_manager


@pytest_asyncio.fixture
async def clean_test_db():
    import os
    from config.settings import MONGODB_DB_NAME
    
    original_db_name = MONGODB_DB_NAME
    os.environ["MONGODB_DB_NAME"] = "knowflow_test"
    
    from managers.db_manager import db_manager
    await db_manager.initialize()
    
    collections = await db_manager.db.list_collection_names()
    for collection in collections:
        await db_manager.db[collection].delete_many({})
    
    yield db_manager
    
    collections = await db_manager.db.list_collection_names()
    for collection in collections:
        await db_manager.db[collection].delete_many({})
    
    await db_manager.close()
    
    if original_db_name:
        os.environ["MONGODB_DB_NAME"] = original_db_name
    else:
        os.environ.pop("MONGODB_DB_NAME", None)
