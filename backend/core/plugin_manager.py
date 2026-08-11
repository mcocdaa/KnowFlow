# @file backend/core/plugin_manager.py
# @brief 插件管理器 - 负责插件注册和加载
# @create 2026-03-27

import asyncio
import importlib.util
import logging
import os
import sys
from pathlib import Path
from typing import Any

import yaml
from fastapi import FastAPI

from config.settings import API_VERSION, PLUGINS_DIR

logger = logging.getLogger(__name__)


class PluginManager:
    """插件管理器

    职责：
    1. 扫描并注册插件
    2. 加载插件后端代码
    3. 管理插件生命周期
    4. 集成钩子系统
    """

    def __init__(self):
        self.plugins_dir: Path | None = Path(PLUGINS_DIR)
        self.plugins: dict[str, Any] = {}
        self.loaded_plugins: dict[str, Any] = {}
        self.plugin_modules: dict[str, Any] = {}
        self.app: FastAPI | None = None

    def initialize(self, app: FastAPI):
        """初始化插件管理器"""
        self.app = app
        self.plugins = self._load_registry()
        logger.info(f"[PluginManager] 发现 {len(self.plugins)} 个插件:")
        for key, info in self.plugins.items():
            logger.info(f"  - {key} ({info['type']})")

    async def load_all_plugins(self):
        """加载所有启用的插件"""
        if not self.plugins_dir:
            logger.warning("插件目录未设置，跳过插件加载")
            return

        for key, info in self.plugins.items():
            try:
                await self._load_plugin(key, info)
            except Exception as e:
                logger.error(f"加载插件 {key} 失败: {e}", exc_info=True)

    async def _load_plugin(self, key: str, info: dict[str, Any]):
        """加载单个插件"""
        plugin_path = Path(info["path"])
        manifest = info["manifest"]

        logger.info(f"[PluginManager] 正在加载插件: {info['name']} ({key})")

        backend_entry = manifest.get("backend_entry", "backend.py")
        hooks_entry = manifest.get("hooks_entry", "hooks.py")

        if plugin_path.is_dir():
            backend_file = plugin_path / backend_entry
            hooks_file = plugin_path / hooks_entry

            if backend_file.exists():
                await self._load_plugin_module(key, backend_file, manifest)

            if hooks_file.exists():
                await self._load_plugin_module(f"{key}.hooks", hooks_file, manifest)
        elif plugin_path.is_file() and plugin_path.suffix == ".py":
            await self._load_plugin_module(key, plugin_path, manifest)

        await self._register_keys(manifest.get("keys", []), key)

        self.loaded_plugins[key] = info
        logger.info(f"[PluginManager] 成功加载插件: {info['name']} ({key})")

    async def _load_plugin_module(self, key: str, module_file: Path, manifest: dict[str, Any]):
        """加载插件模块"""
        module_name = f"plugins.{key.replace(os.sep, '.').replace('/', '.')}"
        logger.debug(f"正在从文件加载插件: {module_file}")

        spec = importlib.util.spec_from_file_location(module_name, module_file)
        if spec is None or spec.loader is None:
            logger.error(f"无法为插件创建模块规范: {key}")
            return

        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)
        self.plugin_modules[key] = module

        if hasattr(module, "router") and self.app:
            prefix = self._plugin_route_prefix(key)
            self.app.include_router(module.router, prefix=prefix, tags=[f"plugin/{key}"])
            logger.info(f"[PluginManager] 注册路由: {prefix}")

        if hasattr(module, "on_load"):
            try:
                if asyncio.iscoroutinefunction(module.on_load):
                    await module.on_load()
                else:
                    module.on_load()
            except Exception as e:
                logger.error(f"插件 {key} on_load 执行失败: {e}", exc_info=True)

    async def _register_keys(self, keys: list[dict], plugin_name: str):
        """注册插件定义的 Key"""
        from managers.key_manager import key_manager

        for key_def in keys:
            key_def["plugin_name"] = plugin_name
            key_def["delete_with_plugin"] = key_def.get("delete_with_plugin", True)

            try:
                existing = await key_manager.get_by_name(key_def["name"])
                if existing:
                    logger.debug(f"[PluginManager] Key {key_def['name']} 已存在，跳过创建")
                    continue

                await key_manager.create(key_def)
                logger.info(f"[PluginManager] 注册 Key: {key_def['name']}")
            except Exception as e:
                logger.error(f"[PluginManager] 注册 Key {key_def['name']} 失败: {e}")

    def _resolve_plugin_path(self, key: str, cfg: dict[str, Any]) -> Path | None:
        """解析插件路径：绝对路径原样归一化，相对路径基于插件目录解析；路径不存在返回 None"""
        if "path" in cfg:
            path = Path(cfg["path"])
            path = path.resolve() if path.is_absolute() else (self.plugins_dir / path).resolve()
        else:
            path = (self.plugins_dir / key).resolve()

        if not path.exists():
            logger.warning(f"插件路径不存在: {path}，跳过插件 {key}")
            return None
        return path

    def _load_manifest(self, path: Path, key: str) -> dict[str, Any] | None:
        """加载插件清单：目录读取 plugin.yaml，单 .py 文件生成默认清单；失败返回 None"""
        if path.is_dir():
            plugin_yaml = path / "plugin.yaml"
            if not plugin_yaml.exists():
                logger.warning(f"插件清单文件不存在: {plugin_yaml}，跳过插件 {key}")
                return None
            try:
                with open(plugin_yaml, encoding="utf-8") as f:
                    return yaml.safe_load(f) or {}
            except Exception as e:
                logger.error(f"读取插件清单失败 ({key}): {e}", exc_info=True)
                return None
        if path.suffix == ".py":
            return {"name": path.stem, "type": "unknown", "backend_entry": path.name}
        logger.warning(f"插件路径既不是目录也不是 .py 文件: {path}，跳过插件 {key}")
        return None

    def _load_registry(self) -> dict[str, Any]:
        """加载插件注册表

        Returns:
            {plugin_key: {enabled, path, name, type, manifest}}
        """
        if not self.plugins_dir or not self.plugins_dir.exists():
            logger.warning("插件目录不存在或未设置，跳过加载插件注册表")
            return {}

        registry_path = self.plugins_dir / "plugins.yaml"

        if not registry_path.exists():
            logger.debug(f"插件注册表文件不存在: {registry_path}")
            return {}

        try:
            with open(registry_path, encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}
        except Exception as e:
            logger.error(f"读取插件注册表失败: {e}", exc_info=True)
            return {}

        plugins = {}
        for key, cfg in data.get("plugins", {}).items():
            try:
                if cfg is None:
                    continue
                if not cfg.get("enabled", True):
                    logger.debug(f"插件 {key} 已禁用，跳过")
                    continue

                path = self._resolve_plugin_path(key, cfg)
                if path is None:
                    continue

                manifest = self._load_manifest(path, key)
                if manifest is None:
                    continue

                plugin_type = manifest.get("type", "unknown")

                plugins[key] = {
                    "enabled": True,
                    "path": str(path),
                    "name": manifest.get("name", key.split("/")[-1] if "/" in key else key),
                    "type": plugin_type,
                    "manifest": manifest,
                }
                logger.debug(f"成功加载插件注册表项: {key} ({path})")

            except Exception as e:
                logger.error(f"处理插件 {key} 时发生错误: {e}", exc_info=True)
                continue

        return plugins

    @staticmethod
    def _plugin_route_prefix(plugin_name: str) -> str:
        """插件路由前缀"""
        return f"/api/{API_VERSION}/plugins/{plugin_name}"

    def _cleanup_modules(self, plugin_name: str) -> None:
        """清理插件模块引用与 sys.modules 缓存"""
        if plugin_name in self.plugin_modules:
            del self.plugin_modules[plugin_name]
        # hooks 模块以 "{plugin_name}.hooks" 为 key 注册（见 _load_plugin）
        hook_mod_name = f"{plugin_name}.hooks"
        if hook_mod_name in self.plugin_modules:
            del self.plugin_modules[hook_mod_name]
        for mod_name in list(sys.modules):
            if mod_name.startswith(f"plugins.{plugin_name}"):
                del sys.modules[mod_name]

    async def unload_plugin(self, plugin_name: str) -> bool:
        """卸载插件"""
        if plugin_name not in self.loaded_plugins:
            return False

        # 1. 调用 on_unload
        module = self.plugin_modules.get(plugin_name)
        if module and hasattr(module, "on_unload"):
            if asyncio.iscoroutinefunction(module.on_unload):
                await module.on_unload()
            else:
                module.on_unload()

        # 2. 注销插件注册的钩子
        from core.hook_manager import hook_manager

        hook_manager.unregister_by_module(f"plugins.{plugin_name}")

        # 3. 从 app 移除插件路由
        if self.app:
            prefix = self._plugin_route_prefix(plugin_name)
            self.app.router.routes = [
                r for r in self.app.router.routes if not getattr(r, "path", "").startswith(prefix)
            ]

        # 4. 清理插件注册的 key
        from managers.key_manager import key_manager

        deleted_count = await key_manager.delete_by_plugin(plugin_name)
        logger.info(f"[PluginManager] 删除了 {deleted_count} 个 Key")

        # 5. 清理模块引用
        del self.loaded_plugins[plugin_name]
        self._cleanup_modules(plugin_name)

        logger.info(f"[PluginManager] 插件 {plugin_name} 已卸载（含路由、钩子、模块）")
        return True

    def get_plugin_manifests(self) -> list[dict]:
        """获取所有已加载插件的清单"""
        manifests = []
        for plugin_name, plugin_data in self.loaded_plugins.items():
            manifest = plugin_data["manifest"]
            manifests.append(
                {
                    "name": manifest.get("name", plugin_name),
                    "version": manifest.get("version", "1.0.0"),
                    "description": manifest.get("description", ""),
                    "author": manifest.get("author", ""),
                    "frontend_entry": manifest.get("frontend_entry"),
                }
            )
        return manifests


plugin_manager = PluginManager()
