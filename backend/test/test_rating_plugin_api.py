# @file backend/test/test_rating_plugin_api.py
# @brief 星级评分插件 API 单元测试
# @create 2026-03-09 10:00:00

import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import yaml
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.errors import register_exception_handlers
from test.plugin_helpers import get_plugin_path, load_plugin_backend


@pytest.fixture
def mock_item_manager():
    manager = MagicMock()
    manager.update = AsyncMock()
    manager.get_by_id = AsyncMock()
    return manager


@pytest.fixture
def app_with_rating_plugin():
    app = FastAPI()
    register_exception_handlers(app)
    module = load_plugin_backend("rating")
    app.include_router(module.router, prefix="/plugins/rating")
    return app, module


@pytest.fixture
def client(app_with_rating_plugin):
    app, _ = app_with_rating_plugin
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def rating_module(app_with_rating_plugin):
    _, module = app_with_rating_plugin
    return module


def patch_item_manager(rating_module, mock_item_manager):
    return patch.object(rating_module, "item_manager", mock_item_manager)


class TestUpdateRating:
    @pytest.mark.parametrize("rating", [1, 3, 5])
    def test_update_rating_valid(self, client, rating_module, mock_item_manager, rating):
        with patch_item_manager(rating_module, mock_item_manager):
            mock_item_manager.update.return_value = {"id": "test_id"}

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": rating})

            assert response.status_code == 200
            body = response.json()
            assert body["code"] == 0
            assert body["data"]["rating"] == rating

    @pytest.mark.parametrize("rating", [0, -1, 6, 100])
    def test_update_rating_invalid_value(self, client, rating_module, mock_item_manager, rating):
        with patch_item_manager(rating_module, mock_item_manager):
            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": rating})

            assert response.status_code == 400
            assert "1-5" in response.json()["message"]

    def test_update_rating_item_not_found(self, client, rating_module, mock_item_manager):
        with patch_item_manager(rating_module, mock_item_manager):
            mock_item_manager.update.return_value = None

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 3})

            assert response.status_code == 404

    def test_update_rating_manager_error(self, client, rating_module, mock_item_manager):
        with patch_item_manager(rating_module, mock_item_manager):
            mock_item_manager.update.side_effect = Exception("Database error")

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 3})

            assert response.status_code == 500

    def test_update_rating_missing_body(self, client, rating_module, mock_item_manager):
        with patch_item_manager(rating_module, mock_item_manager):
            response = client.put("/plugins/rating/items/test_id/rating")

            assert response.status_code == 422

    def test_update_rating_wrong_type(self, client, rating_module, mock_item_manager):
        with patch_item_manager(rating_module, mock_item_manager):
            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": "five"})

            assert response.status_code == 422

    def test_update_rating_float_value(self, client, rating_module, mock_item_manager):
        with patch_item_manager(rating_module, mock_item_manager):
            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 3.5})

            assert response.status_code == 422


class TestGetRating:
    def test_get_rating_exists(self, client, rating_module, mock_item_manager):
        with patch_item_manager(rating_module, mock_item_manager):
            mock_item_manager.get_by_id.return_value = {"item": {"id": "test_id"}, "attributes": {"rating": 3}}

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 200
            assert response.json()["data"]["rating"] == 3

    def test_get_rating_not_set(self, client, rating_module, mock_item_manager):
        with patch_item_manager(rating_module, mock_item_manager):
            mock_item_manager.get_by_id.return_value = {"item": {"id": "test_id"}, "attributes": {}}

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 200
            assert response.json()["data"]["rating"] == 0

    def test_get_rating_none_value(self, client, rating_module, mock_item_manager):
        with patch_item_manager(rating_module, mock_item_manager):
            mock_item_manager.get_by_id.return_value = {"item": {"id": "test_id"}, "attributes": {"rating": None}}

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 200
            assert response.json()["data"]["rating"] is None

    def test_get_rating_item_not_found(self, client, rating_module, mock_item_manager):
        with patch_item_manager(rating_module, mock_item_manager):
            mock_item_manager.get_by_id.return_value = None

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 404

    def test_get_rating_manager_error(self, client, rating_module, mock_item_manager):
        with patch_item_manager(rating_module, mock_item_manager):
            mock_item_manager.get_by_id.side_effect = Exception("Database error")

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 500


class TestRatingPluginHooks:
    @pytest.mark.asyncio
    async def test_on_load_executes(self):
        module = load_plugin_backend("rating")

        await module.on_load()

    @pytest.mark.asyncio
    async def test_on_unload_executes(self):
        module = load_plugin_backend("rating")

        await module.on_unload()


class TestRatingPluginRouter:
    def test_router_has_routes(self):
        module = load_plugin_backend("rating")

        routes = [route.path for route in module.router.routes]

        assert any("/items/{item_id}/rating" in route for route in routes)

    def test_router_has_put_method(self):
        module = load_plugin_backend("rating")

        methods = [route.methods for route in module.router.routes if hasattr(route, "methods")]

        assert any("PUT" in m for m in methods)

    def test_router_has_get_method(self):
        module = load_plugin_backend("rating")

        methods = [route.methods for route in module.router.routes if hasattr(route, "methods")]

        assert any("GET" in m for m in methods)


class TestRatingPluginConfig:
    def test_plugin_yaml_exists(self):
        assert os.path.exists(os.path.join(get_plugin_path("rating"), "plugin.yaml"))

    def test_plugin_yaml_content(self):
        with open(os.path.join(get_plugin_path("rating"), "plugin.yaml"), encoding="utf-8") as f:
            config = yaml.safe_load(f)

        assert config["name"] == "rating"
        assert config["version"] == "1.0.0"
        assert "keys" in config
        assert len(config["keys"]) == 1
        assert config["keys"][0]["name"] == "rating"
        assert config["keys"][0]["value_type"] == "number"
        assert config["backend_entry"] == "backend.py"
        assert config["frontend_entry"] == "frontend.tsx"
