# @file backend/test/test_openclaw_plugin_api.py
# @brief KnowFlow OpenClaw 桥接插件 API 单元测试
# @create 2026-08-09 10:00:00

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.errors import register_exception_handlers
from test.plugin_helpers import load_plugin_backend


@pytest.fixture
def mock_item_manager():
    manager = MagicMock()
    manager.update = AsyncMock()
    manager.get_by_id = AsyncMock()
    return manager


@pytest.fixture
def app_with_openclaw_plugin():
    app = FastAPI()
    register_exception_handlers(app)
    module = load_plugin_backend("knowflow_openclaw")
    app.include_router(module.router, prefix="/plugins/openclaw")
    return app, module


@pytest.fixture
def client(app_with_openclaw_plugin):
    app, _ = app_with_openclaw_plugin
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def openclaw_module(app_with_openclaw_plugin):
    _, module = app_with_openclaw_plugin
    return module


def patch_item_manager(openclaw_module, mock_item_manager):
    return patch.object(openclaw_module, "item_manager", mock_item_manager)


VALID_ATTRIBUTES = {
    "openclaw_project_id": "proj_123",
    "openclaw_archive_type": "code",
    "openclaw_fold_level": 2,
    "openclaw_agent_source": "agent-a",
    "openclaw_summary": "test summary",
    "openclaw_flow_id": "flow_1",
}


class TestUpdateOpenclaw:
    def test_put_success(self, client, openclaw_module, mock_item_manager):
        with patch_item_manager(openclaw_module, mock_item_manager):
            mock_item_manager.update.return_value = {"id": "item_1"}

            response = client.put("/plugins/openclaw/items/item_1/openclaw", json=VALID_ATTRIBUTES)

            assert response.status_code == 200
            body = response.json()
            assert body["code"] == 0
            assert body["data"]["openclaw_project_id"] == "proj_123"

    def test_put_item_not_found(self, client, openclaw_module, mock_item_manager):
        with patch_item_manager(openclaw_module, mock_item_manager):
            mock_item_manager.update.return_value = None

            response = client.put("/plugins/openclaw/items/item_1/openclaw", json=VALID_ATTRIBUTES)

            assert response.status_code == 404

    @pytest.mark.parametrize("archive_type", ["requirement", "code", "test", "document", "flow_record"])
    def test_put_valid_archive_types(self, client, openclaw_module, mock_item_manager, archive_type):
        with patch_item_manager(openclaw_module, mock_item_manager):
            mock_item_manager.update.return_value = {"id": "item_1"}
            data = {**VALID_ATTRIBUTES, "openclaw_archive_type": archive_type}

            response = client.put("/plugins/openclaw/items/item_1/openclaw", json=data)

            assert response.status_code == 200

    def test_put_invalid_archive_type(self, client, openclaw_module, mock_item_manager):
        with patch_item_manager(openclaw_module, mock_item_manager):
            data = {**VALID_ATTRIBUTES, "openclaw_archive_type": "invalid"}

            response = client.put("/plugins/openclaw/items/item_1/openclaw", json=data)

            assert response.status_code == 400
            assert "归档类型" in response.json()["message"]

    @pytest.mark.parametrize("fold_level", [0, 4, -1])
    def test_put_invalid_fold_level(self, client, openclaw_module, mock_item_manager, fold_level):
        with patch_item_manager(openclaw_module, mock_item_manager):
            data = {**VALID_ATTRIBUTES, "openclaw_fold_level": fold_level}

            response = client.put("/plugins/openclaw/items/item_1/openclaw", json=data)

            assert response.status_code == 400

    def test_put_empty_project_id(self, client, openclaw_module, mock_item_manager):
        with patch_item_manager(openclaw_module, mock_item_manager):
            data = {**VALID_ATTRIBUTES, "openclaw_project_id": ""}

            response = client.put("/plugins/openclaw/items/item_1/openclaw", json=data)

            assert response.status_code == 400


class TestPatchOpenclaw:
    def test_patch_success(self, client, openclaw_module, mock_item_manager):
        with patch_item_manager(openclaw_module, mock_item_manager):
            mock_item_manager.update.return_value = {"id": "item_1"}

            response = client.patch("/plugins/openclaw/items/item_1/openclaw", json={"openclaw_summary": "updated"})

            assert response.status_code == 200
            assert response.json()["data"]["openclaw_summary"] == "updated"

    def test_patch_item_not_found(self, client, openclaw_module, mock_item_manager):
        with patch_item_manager(openclaw_module, mock_item_manager):
            mock_item_manager.update.return_value = None

            response = client.patch("/plugins/openclaw/items/item_1/openclaw", json={"openclaw_summary": "x"})

            assert response.status_code == 404

    def test_patch_no_valid_fields(self, client, openclaw_module, mock_item_manager):
        with patch_item_manager(openclaw_module, mock_item_manager):
            response = client.patch("/plugins/openclaw/items/item_1/openclaw", json={"unknown_field": "x"})

            assert response.status_code == 400

    def test_patch_string_fold_level(self, client, openclaw_module, mock_item_manager):
        with patch_item_manager(openclaw_module, mock_item_manager):
            response = client.patch("/plugins/openclaw/items/item_1/openclaw", json={"openclaw_fold_level": "abc"})

            assert response.status_code == 400

    def test_patch_float_fold_level(self, client, openclaw_module, mock_item_manager):
        with patch_item_manager(openclaw_module, mock_item_manager):
            response = client.patch("/plugins/openclaw/items/item_1/openclaw", json={"openclaw_fold_level": 3.5})

            assert response.status_code == 400


class TestGetOpenclaw:
    def test_get_success(self, client, openclaw_module, mock_item_manager):
        with patch_item_manager(openclaw_module, mock_item_manager):
            mock_item_manager.get_by_id.return_value = {
                "item": {"id": "item_1"},
                "attributes": {
                    "openclaw_project_id": "proj_123",
                    "openclaw_archive_type": "code",
                    "openclaw_fold_level": 2,
                },
            }

            response = client.get("/plugins/openclaw/items/item_1/openclaw")

            assert response.status_code == 200
            body = response.json()["data"]
            assert body["openclaw_project_id"] == "proj_123"
            assert body["openclaw_archive_type"] == "code"
            assert body["openclaw_fold_level"] == 2

    def test_get_defaults(self, client, openclaw_module, mock_item_manager):
        with patch_item_manager(openclaw_module, mock_item_manager):
            mock_item_manager.get_by_id.return_value = {"item": {"id": "item_1"}, "attributes": {}}

            response = client.get("/plugins/openclaw/items/item_1/openclaw")

            assert response.status_code == 200
            body = response.json()["data"]
            assert body["openclaw_archive_type"] == "document"
            assert body["openclaw_fold_level"] == 3
            assert body["openclaw_project_id"] == ""

    def test_get_item_not_found(self, client, openclaw_module, mock_item_manager):
        with patch_item_manager(openclaw_module, mock_item_manager):
            mock_item_manager.get_by_id.return_value = None

            response = client.get("/plugins/openclaw/items/item_1/openclaw")

            assert response.status_code == 404


class TestOpenclawHooks:
    @pytest.mark.asyncio
    async def test_on_load_registers_category(self, openclaw_module, mock_item_manager):
        from managers.category_manager import category_manager

        async def fake_get_by_name(name):
            return None

        async def fake_create(category_data):
            return category_data

        with (
            patch.object(category_manager, "get_by_name", side_effect=fake_get_by_name),
            patch.object(category_manager, "create", side_effect=fake_create),
        ):
            await openclaw_module.on_load()
            category_manager.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_on_load_skips_existing_category(self, openclaw_module):
        from managers.category_manager import category_manager

        async def fake_get_by_name(name):
            return {"name": "openclaw_category"}

        with (
            patch.object(category_manager, "get_by_name", side_effect=fake_get_by_name),
            patch.object(category_manager, "create") as mock_create,
        ):
            await openclaw_module.on_load()
            mock_create.assert_not_called()
