# @file backend/test/test_plugin_manager.py
# @brief 插件管理器单元测试
# @create 2026-08-10 10:00:00

import types
from unittest.mock import AsyncMock, patch

import pytest

from core.plugin_manager import PluginManager


class TestPluginRegistry:
    @pytest.fixture
    def manager(self, tmp_path):
        mgr = PluginManager()
        mgr.plugins_dir = tmp_path
        return mgr

    def test_load_registry_directory_plugin(self, manager, tmp_path):
        (tmp_path / "plugins.yaml").write_text("plugins:\n  demo:\n    enabled: true\n", encoding="utf-8")
        (tmp_path / "demo").mkdir()
        (tmp_path / "demo" / "plugin.yaml").write_text(
            "name: demo\nversion: 1.0.0\ntype: demo\ndescription: demo plugin\n",
            encoding="utf-8",
        )

        result = manager._load_registry()

        assert "demo" in result
        assert result["demo"]["name"] == "demo"
        assert result["demo"]["enabled"] is True
        assert str(tmp_path / "demo") == result["demo"]["path"]

    def test_load_registry_single_py_plugin(self, manager, tmp_path):
        (tmp_path / "plugins.yaml").write_text(
            "plugins:\n  single:\n    enabled: true\n    path: single.py\n", encoding="utf-8"
        )
        (tmp_path / "single.py").write_text("router = None\n", encoding="utf-8")

        result = manager._load_registry()

        assert "single" in result
        assert result["single"]["type"] == "unknown"
        assert result["single"]["manifest"]["backend_entry"] == "single.py"

    def test_load_registry_skips_disabled(self, manager, tmp_path):
        (tmp_path / "plugins.yaml").write_text("plugins:\n  off:\n    enabled: false\n", encoding="utf-8")

        assert manager._load_registry() == {}

    def test_load_registry_skips_missing_path(self, manager, tmp_path):
        (tmp_path / "plugins.yaml").write_text("plugins:\n  ghost:\n    enabled: true\n", encoding="utf-8")

        assert manager._load_registry() == {}

    def test_load_registry_relative_path_resolution(self, manager, tmp_path):
        (tmp_path / "plugins.yaml").write_text(
            "plugins:\n  nested:\n    enabled: true\n    path: sub/demo\n", encoding="utf-8"
        )
        (tmp_path / "sub" / "demo").mkdir(parents=True)
        (tmp_path / "sub" / "demo" / "plugin.yaml").write_text(
            "name: demo\nversion: 1.0.0\ntype: demo\n", encoding="utf-8"
        )

        result = manager._load_registry()

        assert "nested" in result
        assert result["nested"]["path"] == str((tmp_path / "sub" / "demo").resolve())


class TestPluginHelpers:
    def test_plugin_route_prefix(self):
        assert PluginManager._plugin_route_prefix("rating") == "/api/v1/plugins/rating"
        assert PluginManager._plugin_route_prefix("a/b") == "/api/v1/plugins/a/b"

    def test_cleanup_modules_removes_sys_modules(self):
        import sys

        mgr = PluginManager()
        mgr.plugin_modules = {"demo": object(), "demo.hooks": object()}
        sys.modules["plugins.demo"] = object()
        sys.modules["plugins.demo.hooks"] = object()
        sys.modules["plugins.demo.extra"] = object()

        mgr._cleanup_modules("demo")

        assert "plugins.demo" not in sys.modules
        assert "plugins.demo.hooks" not in sys.modules
        assert "plugins.demo.extra" not in sys.modules
        assert mgr.plugin_modules == {}


class TestLifecycle:
    @pytest.fixture
    def manager(self):
        return PluginManager()

    @pytest.mark.asyncio
    async def test_call_lifecycle_sync_method(self, manager):
        calls: list[str] = []
        module = types.SimpleNamespace(on_load=lambda: calls.append("sync"))

        await manager._call_lifecycle(module, "on_load")

        assert calls == ["sync"]

    @pytest.mark.asyncio
    async def test_call_lifecycle_async_method(self, manager):
        calls: list[str] = []

        async def on_load():
            calls.append("async")

        module = types.SimpleNamespace(on_load=on_load)

        await manager._call_lifecycle(module, "on_load")

        assert calls == ["async"]

    @pytest.mark.asyncio
    async def test_call_lifecycle_missing_method_skips(self, manager):
        module = types.SimpleNamespace()

        await manager._call_lifecycle(module, "on_load")  # 不抛异常即通过

    @pytest.mark.asyncio
    async def test_load_plugin_module_uses_call_lifecycle(self, manager, tmp_path):
        module_file = tmp_path / "mod.py"
        module_file.write_text("def on_load():\n    pass\n", encoding="utf-8")
        calls: list[str] = []

        async def fake_call(module, method_name):
            calls.append(method_name)

        manager._call_lifecycle = fake_call  # type: ignore[method-assign]

        await manager._load_plugin_module("demo", module_file, {})

        assert calls == ["on_load"]
        # 清理测试注入的模块缓存（断言失败也不残留）
        import sys

        try:
            sys.modules.pop("plugins.demo", None)
        finally:
            manager.plugin_modules.clear()

    @pytest.mark.asyncio
    async def test_unload_plugin_calls_on_unload(self, manager):
        manager.loaded_plugins = {"demo": {"manifest": {}}}
        manager.plugin_modules = {"demo": types.SimpleNamespace()}
        calls: list[str] = []

        async def fake_call(module, method_name):
            calls.append(method_name)

        manager._call_lifecycle = fake_call  # type: ignore[method-assign]

        with (
            patch("core.hook_manager.hook_manager") as mock_hook,
            patch("managers.key_manager.key_manager") as mock_keys,
        ):
            mock_keys.delete_by_plugin = AsyncMock(return_value=0)
            result = await manager.unload_plugin("demo")

        assert result is True
        assert calls == ["on_unload"]
        mock_hook.unregister_by_module.assert_called_once_with("plugins.demo")

    @pytest.mark.asyncio
    async def test_unload_plugin_returns_false_when_not_loaded(self, manager):
        result = await manager.unload_plugin("ghost")

        assert result is False
