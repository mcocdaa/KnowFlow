# 后端与插件优化（第二轮）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-subagent-driven-development (recommended) or superpowers-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成四项保守优化：Motor → PyMongo Async 迁移、路由层 Depends 依赖注入、key_manager 重复模式抽取、plugin_manager 生命周期统一——保持全部现有行为与 150+ 测试全绿。

**Architecture:** 四个方向互不冲突、各自独立提交。方向 1 只动 `db_manager.py`（唯一 motor 使用点）+ 测试 + requirements；方向 2 新增 `api/deps.py` 承载依赖函数（返回现有全局单例，测试 patch 模式零破坏），6 个路由文件机械改造；方向 3 在 key_manager 内抽取私有 helper 并引入 `db_manager.delete_many`（先于方向 3 完成）；方向 4 抽取 `_call_lifecycle` 统一 on_load/on_unload 调用。

**Tech Stack:** Python 3.10+、FastAPI、pymongo 4.16.0（AsyncMongoClient，替换 motor 3.7.1）、pytest（`backend/` 下运行）、ruff。

---

## 通用约定（所有任务适用）

- 测试命令（在 `backend/` 目录下执行）：`python -m pytest -q`；单文件：`python -m pytest test/test_xxx.py -q`
- lint：`python -m ruff check`
- 提交前必须跑全量测试 + ruff；提交信息用仓库既有风格（`refactor:` / `feat:` / `docs:` 前缀）
- 测试风格：类组织 + `mock_db_manager` fixture（`test/conftest.py`）+ `patch("managers.xxx.db_manager", mock_db_manager)`；异步测试用 `@pytest.mark.asyncio`
- 分支：`refactor/backend-optimization-round2`（从 main 新建）

---

### Task 1: db_manager 新增 delete_many（方向 3 的前置） ✅

**Files:**
- Modify: `backend/managers/db_manager.py`（在 delete_one 方法后新增 delete_many）
- Modify: `backend/test/test_db_manager.py`（TestDBManager 类内追加测试）
- Modify: `backend/test/conftest.py`（mock_db_manager fixture 补 delete_many）

- [ ] **Step 1: 写失败测试**

在 `backend/test/test_db_manager.py` 的 `TestDBManager` 类内、`test_delete_one` 方法之后追加：

```python
    @pytest.mark.asyncio
    async def test_delete_many(self, db_manager):
        mock_collection = MagicMock()
        mock_collection.delete_many = AsyncMock(return_value=MagicMock(deleted_count=3))
        mock_db = MagicMock()
        mock_db.__getitem__.return_value = mock_collection

        db_manager.db = mock_db

        result = await db_manager.delete_many("test_collection", {"name": {"$in": ["a", "b"]}})

        assert result == 3
        mock_collection.delete_many.assert_called_once_with({"name": {"$in": ["a", "b"]}})
```

同时更新 `backend/test/conftest.py` 的 mock_db_manager fixture（在 `db_manager.delete_one = AsyncMock()` 之后加一行）：

```python
    db_manager.delete_many = AsyncMock()
```

- [ ] **Step 2: 运行确认失败**

Run: `cd backend && python -m pytest test/test_db_manager.py::TestDBManager::test_delete_many -q`
Expected: FAIL（`DBManager` 无 `delete_many` 属性）

- [ ] **Step 3: 最小实现**

在 `backend/managers/db_manager.py` 的 `delete_one` 方法之后（约 145 行后）追加：

```python
    @retry_on_connection_error
    async def delete_many(self, collection: str, query: dict[str, Any]) -> int:
        """
        批量删除多个文档
        """
        result = await self.db[collection].delete_many(query)
        return result.deleted_count
```

- [ ] **Step 4: 运行确认通过**

Run: `cd backend && python -m pytest test/test_db_manager.py -q`
Expected: PASS（全部 db_manager 测试）

- [ ] **Step 5: 全量回归 + 提交**

Run: `cd backend && python -m pytest -q && python -m ruff check`
Expected: 全量 PASS（151），ruff clean

```bash
git add backend/managers/db_manager.py backend/test/test_db_manager.py backend/test/conftest.py
git commit -m "feat: add db_manager.delete_many for batch deletes"
```

---

### Task 2: Motor → PyMongo Async 迁移 ✅

**Files:**
- Modify: `backend/managers/db_manager.py`
- Modify: `backend/test/test_db_manager.py`
- Modify: `backend/requirements.txt`（移除 motor）

- [ ] **Step 1: 先改测试（patch 路径切换）**

在 `backend/test/test_db_manager.py` 中，把 `test_initialize` 里的 patch 目标改为 pymongo：

```python
    @pytest.mark.asyncio
    async def test_initialize(self, db_manager):
        with patch("managers.db_manager.AsyncMongoClient") as mock_client:
            mock_db_instance = MagicMock()
            mock_client.return_value.__getitem__.return_value = mock_db_instance
            mock_db_instance["categories"].create_index = AsyncMock()
            mock_db_instance["keys"].create_index = AsyncMock()
            mock_db_instance["items"].create_index = AsyncMock()

            await db_manager.initialize()

            assert db_manager.client is not None
            assert db_manager.db is not None
            mock_client.assert_called_once()
```

（把 `patch("motor.motor_asyncio.AsyncIOMotorClient")` 改为 `patch("managers.db_manager.AsyncMongoClient")`——patch 必须指向 db_manager 模块命名空间中的绑定，`patch("pymongo.AsyncMongoClient")` 打不到模块内 `from ... import` 的本地名字。其余不动）

再追加一个锁定 async close 行为的测试（`test_close` 之后）：

```python
    @pytest.mark.asyncio
    async def test_reconnect_recreates_client(self, db_manager):
        mock_client = MagicMock()
        mock_client.close = AsyncMock()  # close() 迁移后为 async，必须可 await
        db_manager.client = mock_client
        db_manager.db = MagicMock()

        original_initialize = db_manager.initialize
        db_manager.initialize = AsyncMock()

        await db_manager.reconnect()

        mock_client.close.assert_called_once()
        db_manager.initialize.assert_awaited_once()
        db_manager.initialize = original_initialize
```

- [ ] **Step 2: 运行确认失败**

Run: `cd backend && python -m pytest test/test_db_manager.py::TestDBManager::test_initialize -q`
Expected: FAIL（迁移前 db_manager 仍用 motor，patch 目标 `managers.db_manager.AsyncMongoClient` 不存在于模块，真实 motor client 被构造后 `mock_client.assert_called_once()` 失败；注意此时会发起真实连接尝试，约 30s 超时后失败，属预期）

- [ ] **Step 3: 迁移 db_manager.py**

`backend/managers/db_manager.py` 共 6 处修改（第 6 处 aggregate 是审核发现的必改项）：

(a) 第 9 行 `import motor.motor_asyncio` → 替换为：

```python
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase
```

(b) 第 47-48 行类型注解：

```python
        self.client: AsyncMongoClient | None = None
        self.db: AsyncDatabase | None = None
```

(c) 第 55 行构造：

```python
            self.client = AsyncMongoClient(MONGODB_URL)
```

(d) 第 60-68 行 reconnect（**close 加 await**）：

```python
    async def reconnect(self):
        """
        重新连接数据库
        """
        if self.client:
            await self.client.close()
        self.client = None
        self.db = None
        await self.initialize()
```

(e) 第 70-77 行 close（**close 加 await**）：

```python
    async def close(self):
        """
        关闭数据库连接
        """
        if self.client:
            await self.client.close()
            self.client = None
            self.db = None
```

(f) 第 147-153 行 aggregate（**关键：AsyncCollection.aggregate 是协程**——motor 版为同步方法返回游标，迁移后不 await 会得到 coroutine 对象，`cursor.to_list` 必然 AttributeError。这是测试盲区（conftest 中 aggregate 被 mock 掉），必须显式迁移）：

```python
    @retry_on_connection_error
    async def aggregate(self, collection: str, pipeline: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """
        聚合查询
        """
        cursor = await self.db[collection].aggregate(pipeline)
        return await cursor.to_list(length=None)
```

(g) `test_aggregate` 追加（TestDBManager 类内、`test_count_documents` 之后，锁定 aggregate 迁移不被回归）：

```python
    @pytest.mark.asyncio
    async def test_aggregate(self, db_manager):
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=[{"total": 1}])
        mock_collection = MagicMock()
        mock_collection.aggregate = AsyncMock(return_value=mock_cursor)
        mock_db = MagicMock()
        mock_db.__getitem__.return_value = mock_collection

        db_manager.db = mock_db

        result = await db_manager.aggregate("test_collection", [{"$match": {"name": "x"}}])

        assert result == [{"total": 1}]
        mock_collection.aggregate.assert_called_once_with([{"$match": {"name": "x"}}])
```

- [ ] **Step 4: 移除 requirements 中的 motor**

`backend/requirements.txt`：删除 `motor` 行；同时把裸 `pymongo` 行改为 `pymongo>=4.16,<5`（AsyncMongoClient 需 4.9+，pin 下限保证可复现性）。

- [ ] **Step 5: 运行确认通过**

Run: `cd backend && python -m pytest test/test_db_manager.py -q`
Expected: PASS（全部 db_manager 测试，含新 reconnect 测试）

- [ ] **Step 6: 全量回归 + 提交**

Run: `cd backend && python -m pytest -q && python -m ruff check`
Expected: 全量 PASS（153），ruff clean

```bash
git add backend/managers/db_manager.py backend/test/test_db_manager.py backend/requirements.txt
git commit -m "refactor: migrate from motor to PyMongo AsyncMongoClient"
```

---

### Task 3: key_manager 重复模式抽取 ✅

**Files:**
- Modify: `backend/managers/key_manager.py`
- Modify: `backend/test/test_key_manager.py`

- [ ] **Step 1: 写失败测试**

在 `backend/test/test_key_manager.py` 末尾追加新测试类：

```python
class TestKeyManagerExtraction:
    @pytest.fixture
    def key_manager(self, mock_db_manager):
        manager = KeyManager()
        with patch("managers.key_manager.db_manager", mock_db_manager):
            yield manager

    @pytest.mark.asyncio
    async def test_ensure_category_ok(self, key_manager, mock_db_manager):
        mock_db_manager.find_one.return_value = {"name": "tech"}

        await key_manager._ensure_category("tech")

        mock_db_manager.find_one.assert_called_once_with("categories", {"name": "tech"})

    @pytest.mark.asyncio
    async def test_ensure_category_missing_raises(self, key_manager, mock_db_manager):
        mock_db_manager.find_one.return_value = None

        with pytest.raises(ValueError, match="category with name ghost does not exist"):
            await key_manager._ensure_category("ghost")

    def test_stamp_timestamps_create(self, key_manager):
        doc: dict = {"name": "k"}
        key_manager._stamp_timestamps(doc, created=True)

        assert "created_at" in doc
        assert "updated_at" in doc

    def test_stamp_timestamps_update_only_updated_at(self, key_manager):
        doc: dict = {"name": "k", "created_at": "2026-01-01T00:00:00"}
        key_manager._stamp_timestamps(doc)

        assert doc["created_at"] == "2026-01-01T00:00:00"
        assert "updated_at" in doc

    @pytest.mark.asyncio
    async def test_delete_by_plugin_uses_batch_delete(self, key_manager, mock_db_manager):
        key_manager._cache = [
            {"name": "a", "plugin_name": "p1", "delete_with_plugin": True},
            {"name": "b", "plugin_name": "p1", "delete_with_plugin": False},
            {"name": "c", "plugin_name": "p2", "delete_with_plugin": True},
        ]
        key_manager._cache_time = datetime.now()  # 必须：否则 _is_cache_valid 恒 False，_load_cache 会走 db_manager.find
        mock_db_manager.delete_many.return_value = 1

        result = await key_manager.delete_by_plugin("p1")

        assert result == 1
        mock_db_manager.delete_many.assert_called_once_with(
            "keys", {"name": {"$in": ["a"]}}
        )

    @pytest.mark.asyncio
    async def test_delete_by_plugin_no_match_skips_db(self, key_manager, mock_db_manager):
        key_manager._cache = [{"name": "c", "plugin_name": "p2", "delete_with_plugin": True}]
        key_manager._cache_time = datetime.now()  # 同上，必须设置

        result = await key_manager.delete_by_plugin("p1")

        assert result == 0
        mock_db_manager.delete_many.assert_not_called()
```

（注：以上代码块已直接并入 `_cache_time` 设置，勿删。另：`test_key_manager.py` 顶部需补 `from datetime import datetime`——当前文件头只有 `from unittest.mock import patch` / `import pytest` / `from managers.key_manager import KeyManager`。）

- [ ] **Step 2: 运行确认失败**

Run: `cd backend && python -m pytest test/test_key_manager.py::TestKeyManagerExtraction -q`
Expected: FAIL（`_ensure_category` / `_stamp_timestamps` 不存在；`delete_by_plugin` 仍逐条删除）

- [ ] **Step 3: 实现 key_manager 抽取**

`backend/managers/key_manager.py` 共 5 处修改：

(a) 新增私有方法（放在 `_load_cache` 之后、`initialize` 之前）：

```python
    async def _ensure_category(self, category_name: str) -> None:
        """校验分类存在，不存在抛 ValueError"""
        category = await db_manager.find_one("categories", {"name": category_name})
        if not category:
            raise ValueError(f"category with name {category_name} does not exist")

    def _stamp_timestamps(self, doc: dict[str, Any], created: bool = False) -> None:
        """写入时间戳：created=True 时按原 create 语义补齐 created_at/updated_at（不覆盖客户端已有值），
        created=False 时仅设置 updated_at（与原 update 语义一致）"""
        now = datetime.now().isoformat()
        if created:
            doc.setdefault("created_at", now)
            doc.setdefault("updated_at", now)
        else:
            doc["updated_at"] = now
```

(b) `create()` 中替换 category 检查（第 87-89 行）为：

```python
        await self._ensure_category(key_def["category_name"])
```

(c) `create()` 中替换时间戳设置（第 91-94 行）为：

```python
        self._stamp_timestamps(key_def, created=True)
```

(d) `update()` 中替换 category 检查（第 157-160 行）为：

```python
        if "category_name" in update_data:
            await self._ensure_category(update_data["category_name"])
```

(e) `update()` 中替换 updated_at 设置（第 162 行）为：

```python
        self._stamp_timestamps(update_data)
```

(f) `delete_by_plugin()`（第 190-202 行）整体替换为：

```python
    async def delete_by_plugin(self, plugin_name: str) -> int:
        """
        删除指定插件注册的 Key（仅删除 delete_with_plugin=True 的）
        """
        keys = await self.get_all()
        names = [
            key["name"]
            for key in keys
            if key.get("plugin_name") == plugin_name and key.get("delete_with_plugin", True)
        ]
        if not names:
            return 0

        deleted_count = await db_manager.delete_many(self.collection, {"name": {"$in": names}})
        self._invalidate_cache()
        return deleted_count
```

- [ ] **Step 4: 运行确认通过**

Run: `cd backend && python -m pytest test/test_key_manager.py -q`
Expected: PASS（含既有 key_manager 测试——既有 create/update 测试依赖 `mock_db_manager.find_one` 返回 category 的路径，`_ensure_category` 复用同一调用，行为一致）

- [ ] **Step 5: 全量回归 + 提交**

Run: `cd backend && python -m pytest -q && python -m ruff check`
Expected: 全量 PASS（158），ruff clean

```bash
git add backend/managers/key_manager.py backend/test/test_key_manager.py
git commit -m "refactor: extract key_manager category/timestamp helpers, batch delete_by_plugin"
```

---

### Task 4: api/deps.py + 路由层 Depends 注入 ✅

**Files:**
- Create: `backend/api/deps.py`
- Modify: `backend/api/v1/item.py`
- Modify: `backend/api/v1/category.py`
- Modify: `backend/api/v1/key.py`
- Modify: `backend/api/v1/upload.py`
- Modify: `backend/api/v1/ai.py`
- Modify: `backend/api/v1/plugins/manifests.py`
- Modify: `backend/test/test_deps.py`（新建）
- Modify: `backend/test/test_upload_api.py`（fixture 的 patch 目标需随 import 变更）

- [ ] **Step 1: 新建 api/deps.py**

创建 `backend/api/deps.py`：

```python
# @file backend/api/deps.py
# @brief FastAPI 依赖注入：向路由提供 manager 单例（官方推荐的依赖声明方式）
# @create 2026-08-11 10:00:00

from core.plugin_manager import PluginManager, plugin_manager
from managers.category_manager import CategoryManager, category_manager
from managers.db_manager import DBManager, db_manager
from managers.item_manager import ItemManager, item_manager
from managers.key_manager import KeyManager, key_manager


def get_db() -> DBManager:
    """提供全局数据库管理器实例"""
    return db_manager


def get_item_manager() -> ItemManager:
    """提供全局知识项管理器实例"""
    return item_manager


def get_key_manager() -> KeyManager:
    """提供全局 Key 管理器实例"""
    return key_manager


def get_category_manager() -> CategoryManager:
    """提供全局分类管理器实例"""
    return category_manager


def get_plugin_manager() -> PluginManager:
    """提供全局插件管理器实例"""
    return plugin_manager
```

先确认各 manager 模块的类名存在：`ItemManager`（item_manager.py）、`CategoryManager`（category_manager.py）、`KeyManager`（key_manager.py）、`PluginManager`（plugin_manager.py）、`DBManager`（db_manager.py）。

- [ ] **Step 2: 新建 test_deps.py（失败测试）**

创建 `backend/test/test_deps.py`：

```python
# @file backend/test/test_deps.py
# @brief 依赖注入函数单元测试
# @create 2026-08-11 10:00:00

from api.deps import (
    get_category_manager,
    get_db,
    get_item_manager,
    get_key_manager,
    get_plugin_manager,
)
from core.plugin_manager import plugin_manager as pm_singleton
from managers.category_manager import category_manager as cm_singleton
from managers.db_manager import db_manager as db_singleton
from managers.item_manager import item_manager as im_singleton
from managers.key_manager import key_manager as km_singleton


class TestDeps:
    def test_get_db_returns_singleton(self):
        assert get_db() is db_singleton

    def test_get_item_manager_returns_singleton(self):
        assert get_item_manager() is im_singleton

    def test_get_key_manager_returns_singleton(self):
        assert get_key_manager() is km_singleton

    def test_get_category_manager_returns_singleton(self):
        assert get_category_manager() is cm_singleton

    def test_get_plugin_manager_returns_singleton(self):
        assert get_plugin_manager() is pm_singleton
```

- [ ] **Step 3: 运行确认失败**

Run: `cd backend && python -m pytest test/test_deps.py -q`
Expected: FAIL（`api.deps` 模块不存在）

- [ ] **Step 4: 改造路由文件（item.py 完整示例）**

`backend/api/v1/item.py` 整体替换为：

```python
# @file backend/api/v1/item.py
# @brief 知识项 CRUD 接口（异步版）
# @create 2026-03-07 10:00:00

from fastapi import APIRouter, Depends, HTTPException, Query

from api.deps import get_item_manager
from api.errors import ok
from managers.item_manager import ItemManager, validate_required

router = APIRouter()


@router.get("/item")
async def list_items(manager: ItemManager = Depends(get_item_manager)):
    return ok(await manager.get_all())


@router.get("/item/search")
async def search_items(
    manager: ItemManager = Depends(get_item_manager),
    q: str = Query("", max_length=100),
    key: str | None = None,
    key_value: str | None = None,
    sort: str = Query("recent", pattern="^(recent|rating|name)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    return ok(await manager.search(q=q, key=key, key_value=key_value, sort=sort, page=page, page_size=page_size))


@router.get("/item/{item_id}")
async def get_item(item_id: str, manager: ItemManager = Depends(get_item_manager)):
    item = await manager.get_by_id(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
    return ok(item)


@router.post("/item")
async def add_item(item: dict, manager: ItemManager = Depends(get_item_manager)):
    required_keys = await manager.get_required_key_defs()
    missing = validate_required(item, required_keys)
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required keys: {', '.join(missing)}")
    return ok(await manager.create(item))


@router.put("/item/{item_id}")
async def update_item(item_id: str, item: dict, manager: ItemManager = Depends(get_item_manager)):
    updated = await manager.update(item_id, item)
    if updated is None:
        raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
    return ok(updated)


@router.delete("/item/{item_id}")
async def delete_item(item_id: str, manager: ItemManager = Depends(get_item_manager)):
    deleted = await manager.delete(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
    return ok(None, "Item deleted successfully")
```

- [ ] **Step 5: 改造 category.py**

`backend/api/v1/category.py` 的 import 区（第 9 行后）与函数签名替换：

import 区：

```python
from api.deps import get_category_manager
from api.errors import ok
from managers.category_manager import CategoryManager, category_manager  # 删除本行
```

改为：

```python
from api.deps import get_category_manager
from api.errors import ok
from managers.category_manager import CategoryManager
```

5 个函数签名与函数体（`category_manager` → `manager`，全部改为注入）：

```python
@router.get("/categories")
async def get_categories(manager: CategoryManager = Depends(get_category_manager)):
    return ok(await manager.get_all())


@router.get("/categories/{category_id}")
async def get_category(category_id: str, manager: CategoryManager = Depends(get_category_manager)):
    category = await manager.get_by_id(category_id)
    if category is None:
        raise HTTPException(status_code=404, detail=f"category with id {category_id} does not exist")
    return ok(category)


@router.post("/categories")
async def create_category(category: CategoryCreate, manager: CategoryManager = Depends(get_category_manager)):
    return ok(await manager.create(category.model_dump()))


@router.put("/categories/{category_name}")
async def update_category(
    category_name: str,
    updates: CategoryUpdate,
    manager: CategoryManager = Depends(get_category_manager),
):
    return ok(await manager.update(category_name, updates.model_dump(exclude_none=True)))


@router.delete("/categories/{category_name}")
async def delete_category(category_name: str, manager: CategoryManager = Depends(get_category_manager)):
    await manager.delete(category_name)
    return ok(None, "Category deleted successfully")
```

同时在顶部补 `from fastapi import APIRouter, Depends, HTTPException`。

- [ ] **Step 6: 改造 key.py**

`backend/api/v1/key.py`：

import 区：

```python
from fastapi import APIRouter, Depends, HTTPException

from api.deps import get_key_manager
from api.errors import ok
from datetime import datetime

from managers.key_manager import KeyManager
```

函数（5 个，`key_manager` → 注入的 `manager`）：

```python
@router.get("/keys")
async def get_keys(manager: KeyManager = Depends(get_key_manager)):
    return ok(await manager.get_all())


@router.get("/keys/{key_name}")
async def get_key(key_name: str, manager: KeyManager = Depends(get_key_manager)):
    key = await manager.get_by_name(key_name)
    if key is None:
        raise HTTPException(status_code=404, detail=f"key with name {key_name} does not exist")
    return ok(key)


@router.post("/keys")
async def create_key(key: dict, manager: KeyManager = Depends(get_key_manager)):
    return ok(await manager.create(key))


@router.put("/keys/{key_name}")
async def update_key(key_name: str, updates: dict, manager: KeyManager = Depends(get_key_manager)):
    return ok(await manager.update(key_name, updates))


@router.delete("/keys/{key_name}")
async def delete_key(key_name: str, manager: KeyManager = Depends(get_key_manager)):
    await manager.delete(key_name)
    return ok(None, "Key deleted successfully")
```

- [ ] **Step 7: 改造 upload.py**

`backend/api/v1/upload.py`：

import 区（第 8-12 行）：

```python
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from api.deps import get_item_manager
from api.errors import ok
from config.settings import MAX_UPLOAD_SIZE
from managers.item_manager import ItemManager, extract_key_values, validate_required
from utils.file_util import generate_file_path
```

函数签名与两处调用：

```python
@router.post("/upload")
async def upload_file(
    manager: ItemManager = Depends(get_item_manager),
    file: UploadFile = File(...),
    data: str = Form(...),
):
```

（注意：`file: UploadFile = File(...)` 与 `data: str = Form(...)` 是位置无关的默认参数，`manager` 依赖参数放前面即可，FastAPI 不依赖声明顺序。）

函数体内第 37 行与第 59 行：

```python
    required_keys = await manager.get_required_key_defs()
```

```python
        return ok(await manager.create(new_item))
```

- [ ] **Step 8: 改造 ai.py（auto_tag 的 db 注入）**

`backend/api/v1/ai.py`：

import 区（第 10-14 行附近）：

```python
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.deps import get_db
from api.errors import ok
from config.settings import AI_CONFIG
from managers.db_manager import DBManager
```

`auto_tag` 签名（第 135-136 行）：

```python
@router.post("/ai/auto-tag")
async def auto_tag(payload: AITagRequest, db: DBManager = Depends(get_db)):
```

函数体内删除第 166 行 `from managers.db_manager import db_manager`，并把第 177 行 `await db_manager.update_one(` 改为 `await db.update_one(`。（第 163-164 行的 `from bson import ObjectId` / `from bson.errors import InvalidId` 保持不变。）

- [ ] **Step 9: 改造 plugins/manifests.py**

`backend/api/v1/plugins/manifests.py` 整体替换为：

```python
# @file backend/api/v1/plugins/manifests.py
# @brief 插件清单子路由
# @create 2026-03-06 10:00:00

from fastapi import APIRouter, Depends

from api.deps import get_plugin_manager
from api.errors import ok
from core.plugin_manager import PluginManager

# 定义【子路由】：仅处理 /manifests 接口
router = APIRouter()


@router.get("/manifests")
async def get_plugin_manifests(manager: PluginManager = Depends(get_plugin_manager)):
    """获取所有插件清单"""
    return ok(manager.get_plugin_manifests())
```

- [ ] **Step 9b: 修复 test_upload_api.py 的 fixture**

审核发现：`test/test_upload_api.py` 第 20 行 `with patch("api.v1.upload.item_manager")` 在模块级 `item_manager` import 删除后抛 `AttributeError`（mock.patch 对缺失属性解析失败），5 个 upload 测试全挂。将该 fixture 的 patch 目标改为 deps 模块：

```python
    with patch("api.deps.item_manager") as mock_item_manager:
```

（`get_item_manager()` 返回的正是 `api.deps.item_manager` 绑定的单例对象，patch 后 Depends 解析返回 mock，断言语义不变。若 patch 目标改为 `patch("managers.item_manager.item_manager")` 同样生效——选其一即可。）

- [ ] **Step 10: 运行确认通过**

Run: `cd backend && python -m pytest test/test_deps.py test/test_item_manager.py test/test_category_manager.py test/test_key_manager.py test/test_upload_api.py test/test_ai_api.py test/test_rating_plugin_api.py test/test_openclaw_plugin_api.py -q`
Expected: PASS（deps 测试 + 全部 API 相关测试——现有 API 测试走 TestClient，Depends 注入自动解析，行为不变）

- [ ] **Step 11: 全量回归 + 提交**

Run: `cd backend && python -m pytest -q && python -m ruff check`
Expected: 全量 PASS（163），ruff clean

```bash
git add backend/api/deps.py backend/api/v1/ backend/test/test_deps.py
git commit -m "refactor: inject managers via FastAPI Depends in api routes"
```

---

### Task 5: plugin_manager _call_lifecycle 抽取

**Files:**
- Modify: `backend/core/plugin_manager.py`
- Modify: `backend/test/test_plugin_manager.py`

- [ ] **Step 1: 写失败测试**

`backend/test/test_plugin_manager.py` 末尾追加（顶部补 `import types` 与 `from unittest.mock import AsyncMock, patch`——若文件顶部已有则复用）：

```python
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
```

- [ ] **Step 2: 运行确认失败**

Run: `cd backend && python -m pytest test/test_plugin_manager.py::TestLifecycle -q`
Expected: FAIL（`_call_lifecycle` 不存在；on_load/on_unload 未走该方法）

- [ ] **Step 3: 实现抽取**

`backend/core/plugin_manager.py` 共 3 处修改：

(a) 新增私有方法（放在 `_load_plugin_module` 之后、`_register_keys` 之前）：

```python
    async def _call_lifecycle(self, module: Any, method_name: str) -> None:
        """调用插件生命周期方法（兼容同步与异步实现）；方法不存在时跳过"""
        method = getattr(module, method_name, None)
        if method is None:
            return
        if asyncio.iscoroutinefunction(method):
            await method()
        else:
            method()
```

(b) `_load_plugin_module()` 中替换 on_load 调用块（第 105-112 行）：

```python
        if hasattr(module, "on_load"):
            try:
                await self._call_lifecycle(module, "on_load")
            except Exception as e:
                logger.error(f"插件 {key} on_load 执行失败: {e}", exc_info=True)
```

(c) `unload_plugin()` 中替换 on_unload 调用块（第 244-249 行）：

```python
        module = self.plugin_modules.get(plugin_name)
        if module:
            await self._call_lifecycle(module, "on_unload")
```

- [ ] **Step 4: 运行确认通过**

Run: `cd backend && python -m pytest test/test_plugin_manager.py -q`
Expected: PASS（新 6 个测试 + 既有 plugin_manager 测试）

- [ ] **Step 5: 全量回归 + 提交**

Run: `cd backend && python -m pytest -q && python -m ruff check`
Expected: 全量 PASS（169），ruff clean

```bash
git add backend/core/plugin_manager.py backend/test/test_plugin_manager.py
git commit -m "refactor: unify plugin lifecycle calls via _call_lifecycle helper"
```

---

### Task 6: 文档同步 + 全量验证 + 冒烟

**Files:**
- Modify: `docs/backend/overview.md`、`docs/backend/database.md`、`docs/backend/deployment.md`、`docs/backend/README.md`、`docs/architecture.md`、`docs/architecture/modules.md`、`docs/architecture/tech-stack.md`、`docs/summary.md`、根 `README.md`（均含 motor 引用；`.progress` 与 `openspec/config.yaml` 属历史记录，豁免）

- [ ] **Step 1: 更新文档中的 motor 引用**

对上述 9 个文件：把描述性文本中的 `motor` / `AsyncIOMotorClient` 替换为 PyMongo Async 表述。替换规则（保持各文件原有行文风格）：
- `motor`（异步 MongoDB 驱动）→ `pymongo`（AsyncMongoClient）
- `AsyncIOMotorClient` → `AsyncMongoClient`
- 若文档提到 `motor.motor_asyncio` → `pymongo`

执行：

```bash
cd /home/mcocdaa/AI_CODE/KnowFlow
rg -n "motor|AsyncIOMotor" docs/backend/overview.md docs/backend/database.md docs/backend/deployment.md docs/backend/README.md docs/architecture.md docs/architecture/modules.md docs/architecture/tech-stack.md docs/summary.md README.md
```

逐文件人工确认每处替换后的句子通顺（如"基于 Motor 的异步驱动"→"基于 PyMongo AsyncMongoClient 的异步驱动"），用编辑器完成替换。

- [ ] **Step 2: 文档补充依赖注入说明**

在 `docs/backend/overview.md`（或路由相关章节所在文件）补充一句路由层依赖注入说明：

```markdown
- 路由层通过 `api/deps.py` 的 `Depends` 依赖函数获取 manager 单例（FastAPI 官方推荐模式），不直接 import 全局实例。
```

- [ ] **Step 3: 全量验证**

Run: `cd backend && python -m pytest -q && python -m ruff check`
Expected: 全量 PASS（169），ruff clean

- [ ] **Step 4: 冒烟测试**

Run: `./scripts/start.sh dev backend`
Expected: 容器启动成功，`✓ 启动完成`

随后验证：

```bash
sleep 6
curl -s http://localhost:3002/api/v1/health
curl -s http://localhost:3002/api/v1/plugins/manifests
curl -s -X PUT http://localhost:3002/api/v1/plugins/rating/items/000000000000000000000000/rating -H "Content-Type: application/json" -d '{"rating": 5}'
```

Expected: health 返回 `{"code":0,...,"data":{"status":"ok"}}`；manifests 含 rating 插件；rating PUT 返回 404（id 不存在，证明路由注册正常）。同时确认后端日志无 `motor` 相关报错。

- [ ] **Step 5: 提交**

```bash
cd /home/mcocdaa/AI_CODE/KnowFlow
git add docs/
git commit -m "docs: sync pymongo async migration and deps injection in docs"
```

---

## 最终验收

- 全部 6 个任务完成，提交历史包含 6 个功能提交
- `cd backend && python -m pytest -q`：169 passed
- `python -m ruff check`：clean
- 冒烟：health / manifests / rating 路由可用，日志无 motor 报错
- 推送 `refactor/backend-optimization-round2` 分支并创建 PR（main 有 PR 保护）
