# @file backend/test/test_rating_plugin.py
# @brief 星级评分插件单元测试
# @create 2026-03-09 10:00:00

import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import yaml
from fastapi import FastAPI
from fastapi.testclient import TestClient

from test.plugin_helpers import get_plugin_path, load_plugin_backend


@pytest.fixture
def mock_item_manager():
    manager = MagicMock()
    manager.update = AsyncMock()
    manager.get_by_id = AsyncMock()
    return manager


class TestRatingPluginBackend:
    def test_router_defined(self):
        module = load_plugin_backend("rating")

        assert hasattr(module, "router")
        assert module.router is not None

    def test_update_rating_valid(self, mock_item_manager):
        app = FastAPI()
        module = load_plugin_backend("rating")
        app.include_router(module.router, prefix="/plugins/rating")

        with patch("managers.item_manager.item_manager", mock_item_manager):
            client = TestClient(app)

            mock_item_manager.update.return_value = {"id": "test_id", "rating": 5}

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 5})

            assert response.status_code == 200
            assert response.json()["success"] is True
            assert response.json()["rating"] == 5

    def test_update_rating_invalid_value(self, mock_item_manager):
        app = FastAPI()
        module = load_plugin_backend("rating")
        app.include_router(module.router, prefix="/plugins/rating")

        with patch("managers.item_manager.item_manager", mock_item_manager):
            client = TestClient(app)

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 6})

            assert response.status_code == 400

    def test_update_rating_zero(self, mock_item_manager):
        app = FastAPI()
        module = load_plugin_backend("rating")
        app.include_router(module.router, prefix="/plugins/rating")

        with patch("managers.item_manager.item_manager", mock_item_manager):
            client = TestClient(app)

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 0})

            assert response.status_code == 400

    def test_update_rating_negative(self, mock_item_manager):
        app = FastAPI()
        module = load_plugin_backend("rating")
        app.include_router(module.router, prefix="/plugins/rating")

        with patch("managers.item_manager.item_manager", mock_item_manager):
            client = TestClient(app)

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": -1})

            assert response.status_code == 400

    def test_get_rating_success(self, mock_item_manager):
        app = FastAPI()
        module = load_plugin_backend("rating")
        app.include_router(module.router, prefix="/plugins/rating")

        mock_item_manager.get_by_id.return_value = {"item": {"id": "test_id"}, "attributes": {"rating": 4}}

        with patch("managers.item_manager.item_manager", mock_item_manager):
            client = TestClient(app)

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 200
            assert response.json()["rating"] == 4

    def test_get_rating_default(self, mock_item_manager):
        app = FastAPI()
        module = load_plugin_backend("rating")
        app.include_router(module.router, prefix="/plugins/rating")

        mock_item_manager.get_by_id.return_value = {"item": {"id": "test_id"}, "attributes": {}}

        with patch("managers.item_manager.item_manager", mock_item_manager):
            client = TestClient(app)

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 200
            assert response.json()["rating"] == 0

    def test_on_load_hook(self):
        module = load_plugin_backend("rating")

        assert hasattr(module, "on_load")
        assert module.on_load is not None

    def test_on_unload_hook(self):
        module = load_plugin_backend("rating")

        assert hasattr(module, "on_unload")
        assert module.on_unload is not None


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
