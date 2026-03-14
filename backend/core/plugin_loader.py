# @file backend/core/plugin_loader.py
# @brief 插件加载器：扫描、加载、管理插件
# @create 2026-03-09 10:00:00

import yaml
import importlib.util
import asyncio
from pathlib import Path
from typing import Dict, List, Any, Optional
from fastapi import FastAPI
from config import PLUGINS_DIR, API_VERSION


class PluginLoader:
    def __init__(self):
        self.loaded_plugins: Dict[str, Dict[str, Any]] = {}
        self._plugin_modules: Dict[str, Any] = {}

    def initialize(self, app: FastAPI, plugins_dir: str = None):
        self.app = app
        self.plugins_dir = Path(plugins_dir or PLUGINS_DIR)

    def load_config(self) -> Dict:
        config_path = self.plugins_dir / "plugins.yaml"
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f) or {}
        return {"plugins": {}}

    async def load_all_plugins(self):
        config = self.load_config()

        for plugin_folder in self.plugins_dir.iterdir():
            if not plugin_folder.is_dir():
                continue
            if plugin_folder.name.startswith('.') or plugin_folder.name.startswith('_'):
                continue

            plugin_name = plugin_folder.name
            plugin_config = config.get("plugins", {}).get(plugin_name, {})

            if plugin_config.get("enabled", False):
                await self.load_plugin(plugin_folder)

    async def load_plugin(self, plugin_dir: Path):
        plugin_yaml = plugin_dir / "plugin.yaml"

        if not plugin_yaml.exists():
            print(f"[PluginLoader] 警告: 插件 {plugin_dir.name} 缺少 plugin.yaml")
            return

        with open(plugin_yaml, 'r', encoding='utf-8') as f:
            plugin_config = yaml.safe_load(f)

        plugin_name = plugin_config.get("name", plugin_dir.name)
        print(f"[PluginLoader] 加载插件: {plugin_name}")

        backend_entry = plugin_config.get("backend_entry")
        if backend_entry:
            await self._load_backend(plugin_dir / backend_entry, plugin_name)

        await self._register_keys(plugin_config.get("keys", []), plugin_name)

        self.loaded_plugins[plugin_name] = {
            "config": plugin_config,
            "path": str(plugin_dir),
        }

        print(f"[PluginLoader] 插件 {plugin_name} 加载完成")

    async def _register_keys(self, keys: List[Dict], plugin_name: str):
        from managers.key_manager import key_manager

        for key_def in keys:
            key_def["plugin_name"] = plugin_name
            key_def["delete_with_plugin"] = key_def.get("delete_with_plugin", True)

            try:
                existing = await key_manager.get_by_name(key_def["name"])
                if existing:
                    print(f"[PluginLoader] Key {key_def['name']} 已存在，跳过创建")
                    continue

                await key_manager.create(key_def)
                print(f"[PluginLoader] 注册 Key: {key_def['name']}")
            except Exception as e:
                print(f"[PluginLoader] 注册 Key {key_def['name']} 失败: {e}")

    async def _load_backend(self, backend_path: Path, plugin_name: str):
        if not backend_path.exists():
            print(f"[PluginLoader] 后端文件不存在: {backend_path}")
            return

        spec = importlib.util.spec_from_file_location(
            f"plugin_{plugin_name}",
            backend_path
        )
        module = importlib.util.module_from_spec(spec)
        self._plugin_modules[plugin_name] = module
        spec.loader.exec_module(module)

        if hasattr(module, 'router'):
            self.app.include_router(
                module.router,
                prefix=f"/api/{API_VERSION}/plugins/{plugin_name}",
                tags=[f"plugin/{plugin_name}"]
            )
            print(f"[PluginLoader] 注册路由: /api/{API_VERSION}/plugins/{plugin_name}")

        if hasattr(module, 'on_load'):
            if asyncio.iscoroutinefunction(module.on_load):
                await module.on_load()
            else:
                module.on_load()

    async def unload_plugin(self, plugin_name: str) -> bool:
        if plugin_name not in self.loaded_plugins:
            return False

        plugin_data = self.loaded_plugins[plugin_name]

        module = self._plugin_modules.get(plugin_name)
        if module and hasattr(module, 'on_unload'):
            if asyncio.iscoroutinefunction(module.on_unload):
                await module.on_unload()
            else:
                module.on_unload()

        from managers.key_manager import key_manager
        deleted_count = await key_manager.delete_by_plugin(plugin_name)
        print(f"[PluginLoader] 删除了 {deleted_count} 个 Key")

        del self.loaded_plugins[plugin_name]
        if plugin_name in self._plugin_modules:
            del self._plugin_modules[plugin_name]

        print(f"[PluginLoader] 插件 {plugin_name} 已卸载")
        return True

    def get_plugin_manifests(self) -> List[Dict]:
        manifests = []
        for plugin_name, plugin_data in self.loaded_plugins.items():
            config = plugin_data["config"]
            manifests.append({
                "name": config.get("name", plugin_name),
                "version": config.get("version", "1.0.0"),
                "description": config.get("description", ""),
                "author": config.get("author", ""),
                "frontend_entry": config.get("frontend_entry"),
                "path": plugin_data["path"],
            })
        return manifests

    def get_plugin_config(self, plugin_name: str) -> Optional[Dict]:
        if plugin_name in self.loaded_plugins:
            return self.loaded_plugins[plugin_name]["config"]
        return None

    def get_plugin_frontend_code(self, plugin_name: str) -> Optional[str]:
        plugin_data = self.loaded_plugins.get(plugin_name)
        if not plugin_data:
            return None

        config = plugin_data["config"]
        frontend_entry = config.get("frontend_entry")
        if not frontend_entry:
            return None

        frontend_path = Path(plugin_data["path"]) / frontend_entry
        if not frontend_path.exists():
            return None

        with open(frontend_path, 'r', encoding='utf-8') as f:
            return f.read()


plugin_loader = PluginLoader()
