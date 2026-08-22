# @file backend/test/test_deps.py
# @brief 依赖注入函数单元测试
# @create 2026-08-11 10:00:00

from unittest.mock import AsyncMock

import pytest

from api.deps import (
    get_category_manager,
    get_db,
    get_item_manager,
    get_item_or_404,
    get_key_manager,
    get_plugin_manager,
)
from core.plugin_manager import plugin_manager as pm_singleton
from managers.category_manager import category_manager as cm_singleton
from managers.db_manager import db_manager as db_singleton
from managers.item_manager import item_manager as im_singleton
from managers.key_manager import key_manager as km_singleton


class TestDeps:
    def test_get_db_returns_singleton(self):
        assert get_db() is db_singleton

    def test_get_item_manager_returns_singleton(self):
        assert get_item_manager() is im_singleton

    def test_get_key_manager_returns_singleton(self):
        assert get_key_manager() is km_singleton

    def test_get_category_manager_returns_singleton(self):
        assert get_category_manager() is cm_singleton

    def test_get_plugin_manager_returns_singleton(self):
        assert get_plugin_manager() is pm_singleton


class TestGetItemOr404:
    @pytest.mark.asyncio
    async def test_returns_item_when_found(self):
        manager = type("M", (), {"get_by_id": AsyncMock(return_value={"item": {"id": "i1"}})})()

        result = await get_item_or_404(manager, "i1")

        assert result == {"item": {"id": "i1"}}
        manager.get_by_id.assert_awaited_once_with("i1")

    @pytest.mark.asyncio
    async def test_raises_404_when_missing(self):
        from fastapi import HTTPException

        manager = type("M", (), {"get_by_id": AsyncMock(return_value=None)})()

        with pytest.raises(HTTPException) as exc_info:
            await get_item_or_404(manager, "ghost")

        assert exc_info.value.status_code == 404
        assert "ghost" in exc_info.value.detail
