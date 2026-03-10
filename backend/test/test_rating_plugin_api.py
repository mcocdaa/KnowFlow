# @file backend/test/test_rating_plugin_api.py
# @brief 星级插件API单元测试
# @create 2026-03-09 10:00:00

import pytest
import yaml
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
import importlib.util
import os


def get_plugin_path():
    return os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "plugins", "rating"
    )


def load_rating_backend():
    plugin_path = os.path.join(get_plugin_path(), "backend.py")
    spec = importlib.util.spec_from_file_location("rating_backend", plugin_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def mock_item_manager():
    manager = MagicMock()
    manager.update_item = AsyncMock()
    manager.get_item = AsyncMock()
    return manager


@pytest.fixture
def app_with_rating_plugin():
    app = FastAPI()
    module = load_rating_backend()
    app.include_router(module.router, prefix="/plugins/rating")
    return app


@pytest.fixture
def client(app_with_rating_plugin):
    return TestClient(app_with_rating_plugin)


class TestRatingPluginAPI:
    def test_update_rating_valid_1(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            mock_item_manager.update_item.return_value = {"id": "test_id"}

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 1})

            assert response.status_code == 200
            assert response.json()["success"] is True
            assert response.json()["rating"] == 1

    def test_update_rating_valid_5(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            mock_item_manager.update_item.return_value = {"id": "test_id"}

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 5})

            assert response.status_code == 200
            assert response.json()["success"] is True
            assert response.json()["rating"] == 5

    def test_update_rating_invalid_0(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 0})

            assert response.status_code == 400
            assert "1-5" in response.json()["detail"]

    def test_update_rating_invalid_6(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 6})

            assert response.status_code == 400
            assert "1-5" in response.json()["detail"]

    def test_update_rating_invalid_negative(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": -1})

            assert response.status_code == 400
            assert "1-5" in response.json()["detail"]

    def test_update_rating_invalid_100(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 100})

            assert response.status_code == 400
            assert "1-5" in response.json()["detail"]

    def test_get_rating_exists(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            mock_item_manager.get_item.return_value = {
                "item": {"id": "test_id"},
                "attributes": {"rating": 3}
            }

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 200
            assert response.json()["rating"] == 3

    def test_get_rating_not_set(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            mock_item_manager.get_item.return_value = {
                "item": {"id": "test_id"},
                "attributes": {}
            }

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 200
            assert response.json()["rating"] == 0

    def test_get_rating_none_value(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            mock_item_manager.get_item.return_value = {
                "item": {"id": "test_id"},
                "attributes": {"rating": None}
            }

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 200
            assert response.json()["rating"] is None

    def test_update_rating_manager_error(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            mock_item_manager.update_item.side_effect = Exception("Database error")

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 3})

            assert response.status_code == 500

    def test_get_rating_manager_error(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            mock_item_manager.get_item.side_effect = Exception("Database error")

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 500

    def test_update_rating_missing_body(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            response = client.put("/plugins/rating/items/test_id/rating")

            assert response.status_code == 422

    def test_update_rating_wrong_type(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": "five"})

            assert response.status_code == 422

    def test_update_rating_float_value(self, client, mock_item_manager):
        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 3.5})

            assert response.status_code == 422


class TestRatingPluginHooks:
    @pytest.mark.asyncio
    async def test_on_load_executes(self):
        module = load_rating_backend()

        await module.on_load()

    @pytest.mark.asyncio
    async def test_on_unload_executes(self):
        module = load_rating_backend()

        await module.on_unload()


class TestRatingPluginRouter:
    def test_router_has_routes(self):
        module = load_rating_backend()

        routes = [route.path for route in module.router.routes]

        assert any("/items/{item_id}/rating" in route for route in routes)

    def test_router_has_put_method(self):
        module = load_rating_backend()

        methods = [route.methods for route in module.router.routes if hasattr(route, 'methods')]

        assert any('PUT' in m for m in methods)

    def test_router_has_get_method(self):
        module = load_rating_backend()

        methods = [route.methods for route in module.router.routes if hasattr(route, 'methods')]

        assert any('GET' in m for m in methods)


class TestRatingPluginConfig:
    def test_plugin_yaml_exists(self):
        plugin_yaml_path = os.path.join(get_plugin_path(), "plugin.yaml")

        assert os.path.exists(plugin_yaml_path)

    def test_plugin_yaml_content(self):
        plugin_yaml_path = os.path.join(get_plugin_path(), "plugin.yaml")

        with open(plugin_yaml_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)

        assert config["name"] == "rating"
        assert config["version"] == "1.0.0"
        assert "keys" in config
        assert len(config["keys"]) == 1
        assert config["keys"][0]["name"] == "rating"
        assert config["keys"][0]["value_type"] == "number"
        assert config["backend_entry"] == "backend.py"
        assert config["frontend_entry"] == "frontend.tsx"
