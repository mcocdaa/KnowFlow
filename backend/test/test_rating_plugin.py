# @file backend/test/test_rating_plugin.py
# @brief 星级评分插件单元测试
# @create 2026-03-09 10:00:00

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture
def mock_item_manager():
    manager = MagicMock()
    manager.update_item = AsyncMock()
    manager.get_item = AsyncMock()
    return manager


class TestRatingPluginBackend:
    def test_router_defined(self):
        import importlib.util
        import os

        plugin_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "plugins", "rating", "backend.py")
        spec = importlib.util.spec_from_file_location("rating_backend", plugin_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        assert hasattr(module, 'router')
        assert module.router is not None

    def test_update_rating_valid(self, mock_item_manager):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient

        app = FastAPI()

        import importlib.util
        import os

        plugin_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "plugins", "rating", "backend.py")
        spec = importlib.util.spec_from_file_location("rating_backend", plugin_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        app.include_router(module.router, prefix="/plugins/rating")

        with patch.dict('sys.modules', {'managers.item_manager.ItemManager': lambda: mock_item_manager}):
            with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
                client = TestClient(app)

                mock_item_manager.update_item.return_value = {"id": "test_id", "rating": 5}

                response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 5})

                assert response.status_code == 200
                assert response.json()["success"] is True
                assert response.json()["rating"] == 5

    def test_update_rating_invalid_value(self, mock_item_manager):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient

        app = FastAPI()

        import importlib.util
        import os

        plugin_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "plugins", "rating", "backend.py")
        spec = importlib.util.spec_from_file_location("rating_backend", plugin_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        app.include_router(module.router, prefix="/plugins/rating")

        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            client = TestClient(app)

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 6})

            assert response.status_code == 400

    def test_update_rating_zero(self, mock_item_manager):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient

        app = FastAPI()

        import importlib.util
        import os

        plugin_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "plugins", "rating", "backend.py")
        spec = importlib.util.spec_from_file_location("rating_backend", plugin_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        app.include_router(module.router, prefix="/plugins/rating")

        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            client = TestClient(app)

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": 0})

            assert response.status_code == 400

    def test_update_rating_negative(self, mock_item_manager):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient

        app = FastAPI()

        import importlib.util
        import os

        plugin_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "plugins", "rating", "backend.py")
        spec = importlib.util.spec_from_file_location("rating_backend", plugin_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        app.include_router(module.router, prefix="/plugins/rating")

        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            client = TestClient(app)

            response = client.put("/plugins/rating/items/test_id/rating", json={"rating": -1})

            assert response.status_code == 400

    def test_get_rating_success(self, mock_item_manager):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient

        app = FastAPI()

        import importlib.util
        import os

        plugin_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "plugins", "rating", "backend.py")
        spec = importlib.util.spec_from_file_location("rating_backend", plugin_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        app.include_router(module.router, prefix="/plugins/rating")

        mock_item_manager.get_item.return_value = {
            "item": {"id": "test_id"},
            "attributes": {"rating": 4}
        }

        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            client = TestClient(app)

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 200
            assert response.json()["rating"] == 4

    def test_get_rating_default(self, mock_item_manager):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient

        app = FastAPI()

        import importlib.util
        import os

        plugin_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "plugins", "rating", "backend.py")
        spec = importlib.util.spec_from_file_location("rating_backend", plugin_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        app.include_router(module.router, prefix="/plugins/rating")

        mock_item_manager.get_item.return_value = {
            "item": {"id": "test_id"},
            "attributes": {}
        }

        with patch('managers.item_manager.ItemManager', return_value=mock_item_manager):
            client = TestClient(app)

            response = client.get("/plugins/rating/items/test_id/rating")

            assert response.status_code == 200
            assert response.json()["rating"] == 0

    def test_on_load_hook(self):
        import importlib.util
        import os

        plugin_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "plugins", "rating", "backend.py")
        spec = importlib.util.spec_from_file_location("rating_backend", plugin_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        assert hasattr(module, 'on_load')
        assert module.on_load is not None

    def test_on_unload_hook(self):
        import importlib.util
        import os

        plugin_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "plugins", "rating", "backend.py")
        spec = importlib.util.spec_from_file_location("rating_backend", plugin_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        assert hasattr(module, 'on_unload')
        assert module.on_unload is not None


class TestRatingPluginConfig:
    def test_plugin_yaml_exists(self):
        import os

        plugin_yaml_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "plugins", "rating", "plugin.yaml"
        )

        assert os.path.exists(plugin_yaml_path)

    def test_plugin_yaml_content(self):
        import os
        import yaml

        plugin_yaml_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "plugins", "rating", "plugin.yaml"
        )

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
