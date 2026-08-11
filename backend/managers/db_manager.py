# @file backend/managers/db_manager.py
# @brief MongoDB 数据库管理类，提供连接和重试机制
# @create 2026-03-07 10:00:00

import asyncio
from functools import wraps
from typing import Any

import motor.motor_asyncio
from pymongo.errors import (
    AutoReconnect,
    ConnectionFailure,
    NetworkTimeout,
    ServerSelectionTimeoutError,
)

from config import DB_RETRY_COUNT, MONGODB_DB_NAME, MONGODB_URL

CONNECTION_ERRORS = (ConnectionFailure, AutoReconnect, NetworkTimeout, ServerSelectionTimeoutError)


def retry_on_connection_error(func):
    """
    数据库连接失败时重试的装饰器；非连接类异常直接抛出，不重试
    """

    @wraps(func)
    async def wrapper(self, *args, **kwargs):
        last_exception = None
        for attempt in range(DB_RETRY_COUNT):
            try:
                if self.db is None:
                    await self.initialize()
                return await func(self, *args, **kwargs)
            except CONNECTION_ERRORS as e:
                last_exception = e
                if attempt < DB_RETRY_COUNT - 1:
                    await asyncio.sleep(1 * (attempt + 1))
                    await self.reconnect()
        raise last_exception

    return wrapper


class DBManager:
    def __init__(self):
        self.client: motor.motor_asyncio.AsyncIOMotorClient | None = None
        self.db: motor.motor_asyncio.AsyncIOMotorDatabase | None = None

    async def initialize(self):
        """
        初始化数据库连接
        """
        if not self.client:
            self.client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
            self.db = self.client[MONGODB_DB_NAME]

            await self._create_indexes()

    async def reconnect(self):
        """
        重新连接数据库
        """
        if self.client:
            self.client.close()
        self.client = None
        self.db = None
        await self.initialize()

    async def close(self):
        """
        关闭数据库连接
        """
        if self.client:
            self.client.close()
            self.client = None
            self.db = None

    async def _create_indexes(self):
        """
        创建必要的索引
        """
        await self.db["categories"].create_index([("name", 1)], unique=True)
        await self.db["keys"].create_index([("name", 1)], unique=True)
        await self.db["items"].create_index([("name", 1)])
        await self.db["items"].create_index([("created_at", -1)])

    @retry_on_connection_error
    async def insert_one(self, collection: str, document: dict[str, Any]) -> Any:
        """
        插入单个文档
        """
        result = await self.db[collection].insert_one(document)
        return result.inserted_id

    @retry_on_connection_error
    async def find_one(self, collection: str, query: dict[str, Any]) -> dict[str, Any] | None:
        """
        查询单个文档
        """
        return await self.db[collection].find_one(query)

    @retry_on_connection_error
    async def find(
        self,
        collection: str,
        query: dict[str, Any] = None,
        sort: list = None,
        limit: int = 0,
        skip: int = 0,
    ) -> list[dict[str, Any]]:
        """
        查询多个文档
        """
        query = query or {}
        cursor = self.db[collection].find(query)
        if sort:
            cursor = cursor.sort(sort)
        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)
        return await cursor.to_list(length=limit if limit > 0 else None)

    @retry_on_connection_error
    async def update_one(
        self,
        collection: str,
        query: dict[str, Any],
        update: dict[str, Any],
        upsert: bool = False,
    ) -> int:
        """
        更新单个文档
        """
        result = await self.db[collection].update_one(query, update, upsert=upsert)
        return result.modified_count

    @retry_on_connection_error
    async def delete_one(self, collection: str, query: dict[str, Any]) -> int:
        """
        删除单个文档
        """
        result = await self.db[collection].delete_one(query)
        return result.deleted_count

    @retry_on_connection_error
    async def delete_many(self, collection: str, query: dict[str, Any]) -> int:
        """
        批量删除多个文档
        """
        result = await self.db[collection].delete_many(query)
        return result.deleted_count

    @retry_on_connection_error
    async def aggregate(self, collection: str, pipeline: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """
        聚合查询
        """
        cursor = self.db[collection].aggregate(pipeline)
        return await cursor.to_list(length=None)

    @retry_on_connection_error
    async def count_documents(self, collection: str, query: dict[str, Any] = None) -> int:
        """
        统计文档数量
        """
        query = query or {}
        return await self.db[collection].count_documents(query)


# 全局数据库实例
db_manager = DBManager()
