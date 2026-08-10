# 后端与插件保守优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-subagent-driven-development (recommended) or superpowers-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 消除后端 core/managers 重复代码、拆分职责混杂方法、统一初始化策略，保持对外 API/manifest 格式/外部插件完全兼容，全部测试保持绿色。

**Architecture:** 保守重构——抽取公共方法（`_get_key_dict`/`_to_object_id`/hook 公共循环）、拆分 `plugin_manager._load_registry`、`category_manager.initialize` 改为幂等补齐（与 key_manager 一致）、rating 插件风格打磨、文档同步。不改变任何对外接口。

**Tech Stack:** Python 3.12, FastAPI, motor/MongoDB, pytest + pytest-asyncio, ruff

---

### Task 1: hook_manager 公共执行循环抽取 ✅

**Files:**
- Modify: `backend/core/hook_manager.py:24-60`（run / run_sync 方法）
- Test: `backend/test/test_hook_manager.py`（新建）

- [ ] **Step 1: 写失败测试**

创建 `backend/test/test_hook_manager.py`：

```python
# @file backend/test/test_hook_manager.py
# @brief Hook 管理器单元测试
# @create 2026-08-10 10:00:00

import pytest

from core.hook_manager import HookManager


class TestHookManager:
    @pytest.fixture
    def manager(self):
        return HookManager()

    def test_run_executes_sync_callback(self, manager):
        calls = []

        def cb(*args, **kwargs):
            calls.append(1)

        manager.register("test_hook", cb)
        errors = manager.run("test_hook")
        assert calls == [1]
        assert errors == []

    @pytest.mark.asyncio
    async def test_run_awaits_async_callback(self, manager):
        calls = []

        async def cb(*args, **kwargs):
            calls.append(1)

        manager.register("test_hook", cb)
        errors = await manager.run("test_hook")
        assert calls == [1]
        assert errors == []

    @pytest.mark.asyncio
    async def test_run_collects_errors_without_stopping(self, manager):
        calls = []

        def bad(*args, **kwargs):
            raise RuntimeError("boom")

        def good(*args, **kwargs):
            calls.append(1)

        manager.register("test_hook", bad, priority=1)
        manager.register("test_hook", good, priority=2)
        errors = await manager.run("test_hook")
        assert calls == [1]
        assert len(errors) == 1
        assert errors[0][0] == "bad"

    def test_run_sync_executes_sync_callback(self, manager):
        calls = []

        def cb(*args, **kwargs):
            calls.append(1)

        manager.register("test_hook", cb)
        errors = manager.run_sync("test_hook")
        assert calls == [1]
        assert errors == []

    def test_run_sync_skips_async_callback(self, manager):
        calls = []

        async def cb(*args, **kwargs):
            calls.append(1)

        manager.register("test_hook", cb)
        errors = manager.run_sync("test_hook")
        assert calls == []
        assert errors == []

    def test_run_sync_collects_errors(self, manager):
        def bad(*args, **kwargs):
            raise RuntimeError("boom")

        manager.register("test_hook", bad)
        errors = manager.run_sync("test_hook")
        assert len(errors) == 1
        assert errors[0][0] == "bad"

    def test_run_unknown_hook_returns_empty(self, manager):
        assert manager.run("unknown_hook") == []
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd backend && python -m pytest test/test_hook_manager.py -q`
Expected: 失败——`manager.run("test_hook")` 是 coroutine（run 是 async 函数），sync 调用报 `RuntimeWarning: coroutine 'HookManager.run' was never awaited` 或 TypeError。这是预期的：run 本就是 async，测试 1 需要在 async 环境跑。修正测试 1：把 `test_run_executes_sync_callback` 改为 `@pytest.mark.asyncio` 并用 `await manager.run(...)`。

修正后的测试 1：

```python
    @pytest.mark.asyncio
    async def test_run_executes_sync_callback(self, manager):
        calls = []

        def cb(*args, **kwargs):
            calls.append(1)

        manager.register("test_hook", cb)
        errors = await manager.run("test_hook")
        assert calls == [1]
        assert errors == []
```

- [ ] **Step 3: 运行测试确认仍失败**

Run: `cd backend && python -m pytest test/test_hook_manager.py -q`
Expected: 1 collected, 0 passed（test_run_unknown_hook_returns_empty 也会失败——run 返回 coroutine 而非 []）。当前 run/run_sync 行为正确，但测试断言 run 返回 coroutine 比较的对象不匹配。确认失败原因：`errors == []` 断言失败（errors 是 coroutine）。

- [ ] **Step 4: 实现 `_invoke` 公共循环**

修改 `backend/core/hook_manager.py`，把 run/run_sync 改为委托私有 `_invoke` / `_invoke_sync`：

```python
    async def _invoke(self, hook_name: str, *args, **kwargs) -> list[tuple[str, Exception]]:
        """公共执行循环（异步版）：同步回调直接调用，异步回调 await；异常收集并记录"""
        errors = []
        for _, cb in self._hooks.get(hook_name, []):
            try:
                if asyncio.iscoroutinefunction(cb):
                    await cb(*args, **kwargs)
                else:
                    cb(*args, **kwargs)
            except Exception as e:
                errors.append((cb.__name__, e))
                logger.error(f"钩子执行失败 [{hook_name}]: {cb.__name__} - {e}", exc_info=True)
        return errors

    def _invoke_sync(self, hook_name: str, *args, **kwargs) -> list[tuple[str, Exception]]:
        """公共执行循环（同步版）：仅执行同步回调，异步回调跳过并告警；异常收集并记录"""
        errors = []
        for _, cb in self._hooks.get(hook_name, []):
            if asyncio.iscoroutinefunction(cb):
                logger.warning(f"[{hook_name}]: {cb.__name__} - 异步钩子不能在同步环境中执行")
                continue
            try:
                cb(*args, **kwargs)
            except Exception as e:
                errors.append((cb.__name__, e))
                logger.error(f"钩子执行失败 [{hook_name}]: {cb.__name__} - {e}", exc_info=True)
        return errors

    async def run(self, hook_name: str, *args, **kwargs) -> list[tuple[str, Exception]]:
        """执行所有已注册的钩子（异步环境）"""
        return await self._invoke(hook_name, *args, **kwargs)

    def run_sync(self, hook_name: str, *args, **kwargs) -> list[tuple[str, Exception]]:
        """同步执行钩子（给同步包装器用）"""
        return self._invoke_sync(hook_name, *args, **kwargs)
```

- [ ] **Step 5: 运行测试确认通过**

Run: `cd backend && python -m pytest test/test_hook_manager.py -q`
Expected: 7 passed

Run: `cd backend && python -m pytest -q`
Expected: 132 passed（原测试全绿——item_manager 的 wrap_hooks 路径被覆盖）

- [ ] **Step 6: ruff 检查**

Run: `cd backend && python -m ruff check`
Expected: 无输出，exit 0

- [ ] **Step 7: 提交**

```bash
git add backend/core/hook_manager.py backend/test/test_hook_manager.py
git commit -m "refactor: unify hook execution loop via _invoke helpers"
```

---

### Task 2: item_manager `_to_object_id` 抽取 ✅

**Files:**
- Modify: `backend/managers/item_manager.py:144-160`（get_by_id）、`:190-205`（update）、`:226-237`（delete）
- Test: `backend/test/test_item_manager.py`

- [ ] **Step 1: 写失败测试**

在 `backend/test/test_item_manager.py` 的 `TestItemManager` 类内、`test_format_item_response` 之后追加：

```python
    def test_to_object_id_valid(self, item_manager):
        oid = item_manager._to_object_id("507f1f77bcf86cd799439011")
        assert oid is not None
        assert str(oid) == "507f1f77bcf86cd799439011"

    def test_to_object_id_invalid(self, item_manager):
        assert item_manager._to_object_id("abc") is None
        assert item_manager._to_object_id("") is None
        assert item_manager._to_object_id(None) is None
        assert item_manager._to_object_id("zzzzzzzzzzzzzzzzzzzzzzzz") is None
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd backend && python -m pytest test/test_item_manager.py -q`
Expected: 2 failed —— `AttributeError: 'ItemManager' object has no attribute '_to_object_id'`

- [ ] **Step 3: 实现 `_to_object_id`**

在 `backend/managers/item_manager.py` 的 `__init__` 之后添加：

```python
    @staticmethod
    def _to_object_id(item_id: str) -> ObjectId | None:
        """将字符串 ID 解析为 ObjectId，非法输入返回 None"""
        try:
            return ObjectId(item_id)
        except (ValueError, TypeError, InvalidId):
            return None
```

- [ ] **Step 4: 替换三处重复解析逻辑**

`get_by_id`（原 `:144-152`）：

```python
        oid = self._to_object_id(item_id)
        if oid is None:
            return None
```

`update`（原 `:195-198`）：

```python
        oid = self._to_object_id(item_id)
        if oid is None:
            return None
```

`delete`（原 `:231-234`）：

```python
        oid = self._to_object_id(item_id)
        if oid is None:
            return False
```

- [ ] **Step 5: 运行测试确认通过**

Run: `cd backend && python -m pytest test/test_item_manager.py -q`
Expected: all passed

Run: `cd backend && python -m pytest -q`
Expected: 134 passed（132 + 新增 2）

- [ ] **Step 6: 提交**

```bash
git add backend/managers/item_manager.py backend/test/test_item_manager.py
git commit -m "refactor: extract item_manager._to_object_id helper"
```

---

### Task 3: item_manager `_get_key_dict` 抽取

**Files:**
- Modify: `backend/managers/item_manager.py`（get_all `:137-138`、get_by_id `:158-159`、create `:169-170`、update `:210-211`、search `:255-256`）

- [ ] **Step 1: 实现 `_get_key_dict`**

在 `backend/managers/item_manager.py` 的 `_format_item_response` 之前添加：

```python
    async def _get_key_dict(self) -> dict[str, dict[str, Any]]:
        """获取全部 Key 定义，构建 name -> key_def 映射"""
        all_keys = await key_manager.get_all()
        return {key["name"]: key for key in all_keys}
```

- [ ] **Step 2: 替换五处重复**

每处 `all_keys = await key_manager.get_all()` + `key_dict = {...}` 两行替换为一行 `key_dict = await self._get_key_dict()`：

- `get_all` 内（原 137-138 行）：
```python
        key_dict = await self._get_key_dict()
```
- `get_by_id` 内（原 158-159 行）：
```python
        key_dict = await self._get_key_dict()
```
- `create` 内（原 169-170 行）：
```python
        key_dict = await self._get_key_dict()
```
- `update` 内（原 210-211 行）：
```python
        key_dict = await self._get_key_dict()
```
- `search` 内（原 255-256 行）：
```python
        key_dict = await self._get_key_dict()
```

注意：替换后如果 `all_keys` 变量不再被使用，一并删除该行。

- [ ] **Step 3: 运行测试确认通过**

Run: `cd backend && python -m pytest test/test_item_manager.py test/test_ai_api.py -q`
Expected: all passed（纯抽取，现有测试覆盖全部路径）

Run: `cd backend && python -m pytest -q`
Expected: 134 passed

- [ ] **Step 4: ruff 检查**

Run: `cd backend && python -m ruff check`
Expected: 无输出，exit 0

- [ ] **Step 5: 提交**

```bash
git add backend/managers/item_manager.py
git commit -m "refactor: extract item_manager._get_key_dict helper"
```

---

### Task 4: plugin_manager 注册表解析拆分 ✅

**Files:**
- Modify: `backend/core/plugin_manager.py:132-210`（_load_registry）
- Test: `backend/test/test_plugin_manager.py`（新建）

- [ ] **Step 1: 写失败测试**

创建 `backend/test/test_plugin_manager.py`：

```python
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
        (tmp_path / "plugins.yaml").write_text(
            "plugins:\n  demo:\n    enabled: true\n", encoding="utf-8"
        )
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
        (tmp_path / "plugins.yaml").write_text(
            "plugins:\n  off:\n    enabled: false\n", encoding="utf-8"
        )

        assert manager._load_registry() == {}

    def test_load_registry_skips_missing_path(self, manager, tmp_path):
        (tmp_path / "plugins.yaml").write_text(
            "plugins:\n  ghost:\n    enabled: true\n", encoding="utf-8"
        )

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
```

- [ ] **Step 2: 运行测试确认通过（先测现有行为）**

Run: `cd backend && python -m pytest test/test_plugin_manager.py -q`
Expected: 5 passed（现有 `_load_registry` 行为已满足这些测试）

- [ ] **Step 3: 拆分 `_resolve_plugin_path` 与 `_load_manifest`**

在 `_load_registry` 之前添加两个新方法：

```python
    def _resolve_plugin_path(self, key: str, cfg: dict[str, Any]) -> Path | None:
        """解析插件路径：绝对路径原样，相对路径基于插件目录；路径不存在返回 None"""
        if "path" in cfg:
            path = Path(cfg["path"])
            path = path if path.is_absolute() else (self.plugins_dir / path).resolve()
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
```

- [ ] **Step 4: 重写 `_load_registry` 使用新方法**

```python
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

        return plugins
```

- [ ] **Step 5: 运行测试确认通过**

Run: `cd backend && python -m pytest test/test_plugin_manager.py -q`
Expected: 5 passed

Run: `cd backend && python -m pytest test/test_rating_plugin_api.py test/test_openclaw_plugin_api.py -q`
Expected: all passed（真实插件加载行为不变）

Run: `cd backend && python -m pytest -q`
Expected: 139 passed（134 + 5）

- [ ] **Step 6: ruff 检查**

Run: `cd backend && python -m ruff check`
Expected: 无输出，exit 0

- [ ] **Step 7: 提交**

```bash
git add backend/core/plugin_manager.py backend/test/test_plugin_manager.py
git commit -m "refactor: split plugin registry path resolution and manifest loading"
```

---

### Task 5: plugin_manager 路由前缀常量与模块清理抽取

**Files:**
- Modify: `backend/core/plugin_manager.py:100-101`（路由注册）、`:231-235`（路由移除）、`:243-252`（模块清理）

- [ ] **Step 1: 写失败测试**

在 `backend/test/test_plugin_manager.py` 追加：

```python
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd backend && python -m pytest test/test_plugin_manager.py -q`
Expected: 2 failed —— `AttributeError: type object 'PluginManager' has no attribute '_plugin_route_prefix'` / `_cleanup_modules`

- [ ] **Step 3: 实现两个方法**

在 `unload_plugin` 之前添加：

```python
    @staticmethod
    def _plugin_route_prefix(plugin_name: str) -> str:
        """插件路由前缀"""
        return f"/api/{API_VERSION}/plugins/{plugin_name}"

    def _cleanup_modules(self, plugin_name: str) -> None:
        """清理插件模块引用与 sys.modules 缓存"""
        if plugin_name in self.plugin_modules:
            del self.plugin_modules[plugin_name]
        hook_mod_name = f"plugins.{plugin_name}.hooks"
        if hook_mod_name in self.plugin_modules:
            del self.plugin_modules[hook_mod_name]
        for mod_name in list(sys.modules):
            if mod_name.startswith(f"plugins.{plugin_name}"):
                del sys.modules[mod_name]
```

- [ ] **Step 4: 替换调用点**

`_load_plugin_module` 内路由注册（原 101 行）：

```python
        if hasattr(module, "router") and self.app:
            prefix = self._plugin_route_prefix(key)
            self.app.include_router(module.router, prefix=prefix, tags=[f"plugin/{key}"])
            logger.info(f"[PluginManager] 注册路由: {prefix}")
```

`unload_plugin` 内（原 231-235 行路由移除 + 243-252 行模块清理）：

```python
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
        self._cleanup_modules(plugin_name)
```

- [ ] **Step 5: 运行测试确认通过**

Run: `cd backend && python -m pytest test/test_plugin_manager.py -q`
Expected: 7 passed

Run: `cd backend && python -m pytest -q`
Expected: 141 passed

- [ ] **Step 6: ruff 检查**

Run: `cd backend && python -m ruff check`
Expected: 无输出，exit 0

- [ ] **Step 7: 提交**

```bash
git add backend/core/plugin_manager.py backend/test/test_plugin_manager.py
git commit -m "refactor: extract plugin route prefix helper and module cleanup"
```

---

### Task 6: category_manager 幂等补齐初始化

**Files:**
- Modify: `backend/managers/category_manager.py:19-42`（initialize）
- Test: `backend/test/test_category_manager.py:169-186`（两个 initialize 测试）

- [ ] **Step 1: 写失败测试（新行为）**

替换 `test_category_manager.py` 中 `test_initialize_empty_db` 与 `test_initialize_non_empty_db` 两个测试：

```python
    @pytest.mark.asyncio
    async def test_initialize_backfills_all_when_empty(self, category_manager, mock_db_manager):
        mock_yaml_data = [
            {"name": "parent1", "title": "Parent", "parent_name": None, "is_builtin": True},
            {"name": "child1", "title": "Child", "parent_name": "parent1", "is_builtin": True},
        ]
        mock_db_manager.find_one.return_value = None

        with patch("builtins.open", mock_open(read_data="")):
            with patch("yaml.safe_load", return_value=mock_yaml_data):
                with patch("managers.category_manager.CategoryManager.create", new_callable=AsyncMock) as mock_create:
                    await category_manager.initialize()

        assert mock_create.call_count == 2
        names = [c.args[0]["name"] for c in mock_create.call_args_list]
        assert names == ["parent1", "child1"]  # 父分类先于子分类

    @pytest.mark.asyncio
    async def test_initialize_backfills_missing_only(self, category_manager, mock_db_manager):
        mock_yaml_data = [
            {"name": "parent1", "title": "Parent", "parent_name": None, "is_builtin": True},
            {"name": "child1", "title": "Child", "parent_name": "parent1", "is_builtin": True},
        ]
        # parent1 已存在，child1 缺失
        mock_db_manager.find_one.side_effect = [{"name": "parent1"}, None]

        with patch("builtins.open", mock_open(read_data="")):
            with patch("yaml.safe_load", return_value=mock_yaml_data):
                with patch("managers.category_manager.CategoryManager.create", new_callable=AsyncMock) as mock_create:
                    await category_manager.initialize()

        mock_create.assert_called_once()
        assert mock_create.call_args.args[0]["name"] == "child1"

    @pytest.mark.asyncio
    async def test_initialize_no_duplicates_when_all_exist(self, category_manager, mock_db_manager):
        mock_yaml_data = [
            {"name": "parent1", "title": "Parent", "parent_name": None, "is_builtin": True},
            {"name": "child1", "title": "Child", "parent_name": "parent1", "is_builtin": True},
        ]
        mock_db_manager.find_one.return_value = {"name": "parent1"}

        with patch("builtins.open", mock_open(read_data="")):
            with patch("yaml.safe_load", return_value=mock_yaml_data):
                with patch("managers.category_manager.CategoryManager.create", new_callable=AsyncMock) as mock_create:
                    await category_manager.initialize()

        mock_create.assert_not_called()
```

注意：需要确认 `AsyncMock` 已导入。`test_category_manager.py` 顶部当前导入为 `from unittest.mock import mock_open, patch`——需改为：

```python
from unittest.mock import AsyncMock, mock_open, patch
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd backend && python -m pytest test/test_category_manager.py -q`
Expected: 3 failed——旧实现仅在 `count == 0` 时加载，新测试要求幂等补齐（find_one 预检查不被调用）

- [ ] **Step 3: 重写 `initialize`**

`backend/managers/category_manager.py` 顶部添加 `import logging`，并在模块级单例之前定义 `logger = logging.getLogger(__name__)`。重写 initialize：

```python
    async def initialize(self):
        """
        初始化分类定义：幂等补齐缺失的内置分类（存量库也能获得新增内置分类）
        """
        with open(DEFAULT_CATEGORIES_PATH, encoding="utf-8") as f:
            default_categories = yaml.safe_load(f)

        parent_categories = []
        child_categories = []

        for category in default_categories:
            if category.get("parent_name") in (None, "None"):
                category["parent_name"] = None
                parent_categories.append(category)
            else:
                child_categories.append(category)

        for category in parent_categories + child_categories:
            existing = await db_manager.find_one(self.collection, {"name": category["name"]})
            if existing:
                continue
            try:
                await self.create(category)
            except ValueError as e:
                logger.warning(f"初始化分类 {category['name']} 跳过: {e}")
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd backend && python -m pytest test/test_category_manager.py -q`
Expected: all passed

Run: `cd backend && python -m pytest -q`
Expected: 144 passed（141 + 3）

- [ ] **Step 5: ruff 检查**

Run: `cd backend && python -m ruff check`
Expected: 无输出，exit 0

- [ ] **Step 6: 提交**

```bash
git add backend/managers/category_manager.py backend/test/test_category_manager.py
git commit -m "refactor: category initialize idempotent backfill"
```

---

### Task 7: category_manager bson 导入风格统一

**Files:**
- Modify: `backend/managers/category_manager.py:5-12`（模块顶部）、`:78-90`（get_by_id）

- [ ] **Step 1: 移动导入到模块级**

模块顶部（`from utils.doc_util import ...` 之后）添加：

```python
from bson import ObjectId
from bson.errors import InvalidId
```

`get_by_id` 重写：

```python
    async def get_by_id(self, category_id: str) -> dict[str, Any] | None:
        """
        根据数据库 ID 获取分类
        """
        try:
            oid = ObjectId(category_id)
            doc = await db_manager.find_one(self.collection, {"_id": oid})
            return convert_doc(doc)
        except (ValueError, TypeError, InvalidId):
            return None
```

- [ ] **Step 2: 运行测试确认通过**

Run: `cd backend && python -m pytest test/test_category_manager.py -q`
Expected: all passed（test_get_by_id_success 覆盖该路径）

Run: `cd backend && python -m ruff check`
Expected: 无输出，exit 0

- [ ] **Step 3: 提交**

```bash
git add backend/managers/category_manager.py
git commit -m "refactor: move bson imports to module level in category_manager"
```

---

### Task 8: rating 插件打磨 ✅

**Files:**
- Modify: `plugins/rating/hooks.py:1-36`（延迟导入移至模块级）
- Modify: `plugins/rating/plugin.yaml`（清理冗余字段）

- [ ] **Step 1: hooks.py 延迟导入移至模块级**

重写 `plugins/rating/hooks.py`：

```python
# @file plugins/rating/hooks.py
# @brief 星级评分插件 Hooks
# @create 2026-03-27

import logging

from core import hook_manager
from core.hooks import ITEM_CREATE_AFTER, ITEM_UPDATE_AFTER
from managers.item_manager import item_manager
from managers.key_manager import key_manager

logger = logging.getLogger(__name__)


@hook_manager.hook(ITEM_CREATE_AFTER)
async def on_item_create(result, *args, **kwargs):
    """知识项创建后自动写入默认评分"""
    if not result or not isinstance(result, dict):
        return

    item = result.get("item", {})
    attributes = result.get("attributes", {})
    item_id = item.get("id")
    if not item_id or "rating" in attributes:
        return

    key_def = await key_manager.get_by_name("rating")
    if not key_def:
        return

    default_rating = key_def.get("default_value", 0)
    if not default_rating:  # skip when default is 0 / None / ""
        return

    await item_manager.update(item_id, {"attributes": {"rating": default_rating}})
    logger.info(f"[RatingHook] 知识项 {item_id} 已设置默认评分: {default_rating}")


@hook_manager.hook(ITEM_UPDATE_AFTER)
async def on_item_update(result, *args, **kwargs):
    """知识项更新后检查评分变化"""
    if result and isinstance(result, dict):
        rating = result.get("attributes", {}).get("rating")
        if rating is not None:
            logger.info(f"[RatingHook] 知识项评分已更新: {rating}")
```

- [ ] **Step 2: plugin.yaml 清理冗余字段**

`plugins/rating/plugin.yaml` 的 keys 段从：

```yaml
keys:
  - name: rating
    title: 星级
    value_type: number
    default_value: 0
    description: 知识项的星级评分(1-5)
    category_name: basic_category
    is_required: false
    is_visible: true
    plugin_name: "rating"
    delete_with_plugin: false
    is_public: true
    is_private: false
    created_at: "2026-01-01"
    updated_at: "2026-01-01"
```

改为：

```yaml
keys:
  - name: rating
    title: 星级
    value_type: number
    default_value: 0
    description: 知识项的星级评分(1-5)
    category_name: basic_category
    is_required: false
    is_visible: true
    delete_with_plugin: false
    is_public: true
    is_private: false
```

（`plugin_name` 由 `_register_keys` 强制写入，`created_at`/`updated_at` 由 `key_manager.create` 自动补齐）

- [ ] **Step 3: 运行测试确认通过**

Run: `cd backend && python -m pytest test/test_rating_plugin_api.py -q`
Expected: all passed

Run: `cd backend && python -m pytest test/test_openclaw_plugin_api.py -q`
Expected: all passed

Run: `cd backend && python -m pytest -q`
Expected: 144 passed

- [ ] **Step 4: ruff 检查**

Run: `cd backend && python -m ruff check`
Expected: 无输出，exit 0（hooks.py 虽在 plugins/ 下，ruff 配置如覆盖则通过；若未覆盖 plugins/ 则无检查对象）

- [ ] **Step 5: 提交**

```bash
git add plugins/rating/hooks.py plugins/rating/plugin.yaml
git commit -m "refactor: polish rating plugin imports and manifest"
```

---

### Task 9: 文档同步 ✅

**Files:**
- Modify: `docs/plugin-system/structure.md`
- Modify: `docs/plugin-system/backend-dev.md`
- Modify: `docs/plugin-system/api.md`
- Modify: `docs/architecture/modules.md`

- [ ] **Step 1: structure.md 更新 plugin.yaml 示例**

`docs/plugin-system/structure.md` 的 plugin.yaml 示例 keys 段中删除 `plugin_name`、`created_at`、`updated_at` 三行（与 Task 8 的 plugin.yaml 实际内容一致），并在 keys 段后加注释：

```yaml
keys:                           # 插件注册的 Key 定义
  - name: rating
    title: 星级
    value_type: number
    default_value: 0
    description: 知识项的星级评分(1-5)
    category_name: basic_category
    is_required: false
    is_visible: true
    delete_with_plugin: false
    is_public: true
    is_private: false
    # plugin_name / created_at / updated_at 由系统自动写入，无需声明
```

- [ ] **Step 2: backend-dev.md 更新加载机制描述**

`docs/plugin-system/backend-dev.md` 做以下修改：
1. "可导出的内容"表格后补充 hooks 入口说明：
```markdown
| `hooks.py` 中的 `@hook_manager.hook(...)` 回调 | 插件可选的钩子入口文件（`hooks_entry`），注册到系统钩子点（见 `backend/core/hooks.py`） |
```
2. "路由注册"章节改为实际前缀与示例：
```markdown
## 路由注册

插件路由自动注册到以下路径：

```
/api/v1/plugins/{plugin_name}/*
```

例如，`rating` 插件实际注册的路由：

```
PUT /api/v1/plugins/rating/items/{item_id}/rating
GET /api/v1/plugins/rating/items/{item_id}/rating
```
```
3. "加载流程"章节中 `PluginLoader.initialize(app)` 改为 `PluginManager.initialize(app)`，并补充 hooks 模块加载分支：

```markdown
读取 plugins.yaml 配置
    │
    ▼
扫描 plugins/ 目录
    │
    ├── 读取 plugin.yaml（plugin_manager._load_registry）
    │
    ├── 注册 Key 定义（_register_keys，重复 key 自动跳过）
    │
    ├── 加载后端入口 backend_entry（默认 backend.py）
    │   │
    │   ├── 导入模块
    │   │
    │   ├── 注册路由到 /api/v1/plugins/{plugin_name}/*
    │   │
    │   └── 调用 on_load()
    │
    ├── 加载钩子入口 hooks_entry（默认 hooks.py，可选）
    │
    └── 插件加载完成
```

- [ ] **Step 3: api.md 保持现状（核对无误）**

阅读 `docs/plugin-system/api.md`，确认内容与实现一致（`GET /api/v1/plugins/manifests`、路由挂载模式均为实际实现）。如一致无需改动，仅运行后续验证。

- [ ] **Step 4: modules.md 更新后端模块表**

`docs/architecture/modules.md` 后端模块表更新为：

```markdown
## 后端模块

| 模块 | 位置 | 功能 |
|------|------|------|
| API 路由层 | `api/v1/` | RESTful API 接口（自动路由加载） |
| 业务逻辑层 | `managers/` | 核心业务逻辑（item/category/key/db） |
| 插件系统 | `core/plugin_manager.py` | 插件注册表解析、加载、生命周期管理 |
| 钩子系统 | `core/hook_manager.py` | 动作钩子模式：before/after 钩子、插件钩子注册 |
| 数据存储 | `managers/db_manager.py` | MongoDB 操作封装（重试机制） |
| 配置管理 | `config/` | 环境变量、secrets、应用配置 |
```

并将"插件加载器 plugin_manager"与"Key 缓存 300s TTL"说明保留（图中文字不变）。

- [ ] **Step 5: 提交**

```bash
git add docs/plugin-system/structure.md docs/plugin-system/backend-dev.md docs/plugin-system/api.md docs/architecture/modules.md
git commit -m "docs: sync plugin-system and modules docs with refactored code"
```

---

### Task 10: 全量验证

**Files:** 无（验证任务）

- [ ] **Step 1: ruff 全量检查**

Run: `cd backend && python -m ruff check`
Expected: 无输出，exit 0

- [ ] **Step 2: 全量测试**

Run: `cd backend && python -m pytest -q`
Expected: 144 passed

- [ ] **Step 3: 冒烟验证（Docker 环境）**

Run: `cd /home/mcocdaa/AI_CODE/KnowFlow && ./scripts/start.sh dev backend`
Expected: 后端容器启动成功，日志无插件加载错误（rating 加载成功）

Run: `curl -s http://localhost:3000/api/v1/health`
Expected: `{"code":0,"message":"ok","data":{"status":"ok"}}`

Run: `curl -s http://localhost:3000/api/v1/plugins/manifests`
Expected: 返回含 `rating` 插件的清单数组

Run: `curl -s -X PUT http://localhost:3000/api/v1/plugins/rating/items/000000000000000000000000/rating -H "Content-Type: application/json" -d '{"rating": 5}'`
Expected: 404（id 不存在但路由可达，验证插件路由注册正常）

注：若本机无 Docker/MongoDB 环境，跳过冒烟，记录原因，以 144 全绿为准。

- [ ] **Step 4: 提交（如有验证修正）**

若冒烟发现回归，修复后：

```bash
git add -A && git commit -m "fix: regression found in smoke test"
```
