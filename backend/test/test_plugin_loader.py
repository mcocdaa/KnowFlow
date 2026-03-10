# @file backend/test/test_plugin_loader.py
# @brief 插件加载器单元测试
# @create 2026-03-09 10:00:00

import pytest
import yaml
from unittest.mock import AsyncMock, MagicMock, patch
from pathlib import Path
from core.plugin_loader import PluginLoader


@pytest.fixture
def mock_app():
    app = MagicMock()
    app.include_router = MagicMock()
    return app


@pytest.fixture
def temp_plugins_dir(tmp_path):
    plugins_dir = tmp_path / "plugins"
    plugins_dir.mkdir()
    return plugins_dir


@pytest.fixture
def plugin_loader(mock_app, temp_plugins_dir):
    loader = PluginLoader()
    loader.initialize(mock_app, str(temp_plugins_dir))
    return loader


@pytest.fixture
def mock_key_manager():
    manager = MagicMock()
    manager.get_by_name = AsyncMock(return_value=None)
    manager.create = AsyncMock()
    manager.delete_by_plugin = AsyncMock(return_value=0)
    return manager


class TestPluginLoader:
    def test_load_config_exists(self, plugin_loader, temp_plugins_dir):
        config_content = yaml.dump({
            "plugins": {
                "rating": {"enabled": True},
                "disabled_plugin": {"enabled": False}
            }
        })
        (temp_plugins_dir / "plugins.yaml").write_text(config_content)

        config = plugin_loader.load_config()

        assert "plugins" in config
        assert config["plugins"]["rating"]["enabled"] is True
        assert config["plugins"]["disabled_plugin"]["enabled"] is False

    def test_load_config_missing_file(self, plugin_loader):
        config = plugin_loader.load_config()
        assert config == {"plugins": {}}

    @pytest.mark.asyncio
    async def test_load_all_plugins(self, plugin_loader, temp_plugins_dir, mock_key_manager):
        with patch('managers.key_manager.key_manager', mock_key_manager):
            plugin1_dir = temp_plugins_dir / "plugin1"
            plugin1_dir.mkdir()
            (plugin1_dir / "plugin.yaml").write_text(yaml.dump({
                "name": "plugin1",
                "version": "1.0.0",
                "keys": [{"name": "key1", "title": "Key1", "value_type": "string", "default_value": "", "description": "", "category_name": "basic_category"}]
            }))

            plugin2_dir = temp_plugins_dir / "plugin2"
            plugin2_dir.mkdir()
            (plugin2_dir / "plugin.yaml").write_text(yaml.dump({
                "name": "plugin2",
                "version": "1.0.0",
                "keys": []
            }))

            disabled_dir = temp_plugins_dir / "disabled_plugin"
            disabled_dir.mkdir()
            (disabled_dir / "plugin.yaml").write_text(yaml.dump({
                "name": "disabled_plugin",
                "version": "1.0.0"
            }))

            hidden_dir = temp_plugins_dir / ".hidden"
            hidden_dir.mkdir()

            config_content = yaml.dump({"plugins": {"plugin1": {"enabled": True}, "plugin2": {"enabled": True}, "disabled_plugin": {"enabled": False}}})
            (temp_plugins_dir / "plugins.yaml").write_text(config_content)

            await plugin_loader.load_all_plugins()

            assert "plugin1" in plugin_loader.loaded_plugins
            assert "plugin2" in plugin_loader.loaded_plugins
            assert "disabled_plugin" not in plugin_loader.loaded_plugins

    @pytest.mark.asyncio
    async def test_load_plugin_success(self, plugin_loader, temp_plugins_dir, mock_key_manager):
        with patch('managers.key_manager.key_manager', mock_key_manager):
            plugin_dir = temp_plugins_dir / "test_plugin"
            plugin_dir.mkdir()

            plugin_config = {
                "name": "test_plugin",
                "version": "1.0.0",
                "description": "Test plugin",
                "keys": [{"name": "test_key", "title": "Test Key", "value_type": "string", "default_value": "", "description": "", "category_name": "basic_category"}]
            }
            (plugin_dir / "plugin.yaml").write_text(yaml.dump(plugin_config))

            await plugin_loader.load_plugin(plugin_dir)

            assert "test_plugin" in plugin_loader.loaded_plugins
            assert plugin_loader.loaded_plugins["test_plugin"]["config"]["name"] == "test_plugin"

    @pytest.mark.asyncio
    async def test_load_plugin_missing_yaml(self, plugin_loader, temp_plugins_dir):
        plugin_dir = temp_plugins_dir / "broken_plugin"
        plugin_dir.mkdir()

        await plugin_loader.load_plugin(plugin_dir)

        assert "broken_plugin" not in plugin_loader.loaded_plugins

    @pytest.mark.asyncio
    async def test_register_keys_new(self, plugin_loader, mock_key_manager):
        with patch('managers.key_manager.key_manager', mock_key_manager):
            keys = [
                {
                    "name": "rating",
                    "title": "星级",
                    "value_type": "number",
                    "default_value": 0,
                    "description": "星级评分",
                    "category_name": "basic_category"
                }
            ]

            await plugin_loader._register_keys(keys, "test_plugin")

            mock_key_manager.create.assert_called_once()
            call_args = mock_key_manager.create.call_args[0][0]
            assert call_args["plugin_name"] == "test_plugin"

    @pytest.mark.asyncio
    async def test_register_keys_already_exists(self, plugin_loader, mock_key_manager):
        mock_key_manager.get_by_name = AsyncMock(return_value={"name": "rating"})

        with patch('managers.key_manager.key_manager', mock_key_manager):
            keys = [
                {
                    "name": "rating",
                    "title": "星级",
                    "value_type": "number",
                    "default_value": 0,
                    "description": "星级评分",
                    "category_name": "basic_category"
                }
            ]

            await plugin_loader._register_keys(keys, "test_plugin")

            mock_key_manager.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_load_backend_with_router(self, plugin_loader, temp_plugins_dir):
        plugin_dir = temp_plugins_dir / "router_plugin"
        plugin_dir.mkdir()

        backend_content = '''
from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test():
    return {"status": "ok"}
'''
        backend_path = plugin_dir / "backend.py"
        backend_path.write_text(backend_content)

        await plugin_loader._load_backend(backend_path, "router_plugin")

        plugin_loader.app.include_router.assert_called_once()
        call_args = plugin_loader.app.include_router.call_args
        assert call_args[1]["prefix"] == "/plugins/router_plugin"

    @pytest.mark.asyncio
    async def test_load_backend_with_on_load(self, plugin_loader, temp_plugins_dir):
        plugin_dir = temp_plugins_dir / "lifecycle_plugin"
        plugin_dir.mkdir()

        backend_content = '''
on_load_called = False

async def on_load():
    global on_load_called
    on_load_called = True
'''
        backend_path = plugin_dir / "backend.py"
        backend_path.write_text(backend_content)

        await plugin_loader._load_backend(backend_path, "lifecycle_plugin")

        assert "lifecycle_plugin" in plugin_loader._plugin_modules

    def test_get_plugin_manifests(self, plugin_loader):
        plugin_loader.loaded_plugins = {
            "rating": {
                "config": {
                    "name": "rating",
                    "version": "1.0.0",
                    "description": "星级评分插件",
                    "author": "KnowFlow",
                    "frontend_entry": "frontend.tsx"
                },
                "path": "/plugins/rating"
            }
        }

        manifests = plugin_loader.get_plugin_manifests()

        assert len(manifests) == 1
        assert manifests[0]["name"] == "rating"
        assert manifests[0]["version"] == "1.0.0"

    def test_get_plugin_config_exists(self, plugin_loader):
        plugin_loader.loaded_plugins = {
            "rating": {
                "config": {"name": "rating", "version": "1.0.0"},
                "path": "/plugins/rating"
            }
        }

        config = plugin_loader.get_plugin_config("rating")

        assert config is not None
        assert config["name"] == "rating"

    def test_get_plugin_config_not_exists(self, plugin_loader):
        config = plugin_loader.get_plugin_config("nonexistent")

        assert config is None

    def test_get_plugin_frontend_code_exists(self, plugin_loader, temp_plugins_dir):
        plugin_dir = temp_plugins_dir / "frontend_plugin"
        plugin_dir.mkdir()

        frontend_content = "const Component = () => <div>Hello</div>;"
        (plugin_dir / "frontend.tsx").write_text(frontend_content)

        plugin_loader.loaded_plugins = {
            "frontend_plugin": {
                "config": {
                    "frontend_entry": "frontend.tsx"
                },
                "path": str(plugin_dir)
            }
        }

        code = plugin_loader.get_plugin_frontend_code("frontend_plugin")

        assert code == frontend_content

    def test_get_plugin_frontend_code_no_entry(self, plugin_loader):
        plugin_loader.loaded_plugins = {
            "no_frontend": {
                "config": {},
                "path": "/plugins/no_frontend"
            }
        }

        code = plugin_loader.get_plugin_frontend_code("no_frontend")

        assert code is None

    def test_get_plugin_frontend_code_plugin_not_loaded(self, plugin_loader):
        code = plugin_loader.get_plugin_frontend_code("nonexistent")

        assert code is None

    @pytest.mark.asyncio
    async def test_unload_plugin_success(self, plugin_loader, mock_key_manager):
        mock_key_manager.delete_by_plugin = AsyncMock(return_value=2)

        with patch('managers.key_manager.key_manager', mock_key_manager):
            plugin_loader.loaded_plugins = {
                "test_plugin": {
                    "config": {"name": "test_plugin"},
                    "path": "/plugins/test_plugin"
                }
            }
            plugin_loader._plugin_modules = {}

            result = await plugin_loader.unload_plugin("test_plugin")

            assert result is True
            assert "test_plugin" not in plugin_loader.loaded_plugins
            mock_key_manager.delete_by_plugin.assert_called_once_with("test_plugin")

    @pytest.mark.asyncio
    async def test_unload_plugin_not_loaded(self, plugin_loader):
        result = await plugin_loader.unload_plugin("nonexistent")

        assert result is False
