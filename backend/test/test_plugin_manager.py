# @file backend/test/test_plugin_manager.py
# @brief 插件管理器单元测试
# @create 2026-08-10 10:00:00

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
