# @file backend/test/conftest.py
# @brief 测试配置和公共夹具
# @create 2026-03-08 10:00:00

from unittest.mock import AsyncMock, MagicMock

import pytest

from managers.db_manager import DBManager


@pytest.fixture
def mock_db_manager():
    db_manager = DBManager()
    db_manager.client = MagicMock()
    db_manager.db = MagicMock()

    db_manager.insert_one = AsyncMock()
    db_manager.find_one = AsyncMock()
    db_manager.find = AsyncMock()
    db_manager.update_one = AsyncMock()
    db_manager.delete_one = AsyncMock()
    db_manager.count_documents = AsyncMock()
    db_manager.initialize = AsyncMock()
    db_manager.close = AsyncMock()

    return db_manager
