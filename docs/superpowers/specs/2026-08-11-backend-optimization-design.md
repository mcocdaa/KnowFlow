# 后端与插件优化设计（第二轮）

- 日期：2026-08-11
- 状态：已批准（用户确认）
- 关联：基于 2026-08-10 首轮重构（backend-plugin-refactor）后的延续优化

## 背景与动机

首轮重构（统一钩子循环、ObjectId/key_dict 抽取、插件注册表拆分、幂等初始化、文档同步）完成后，本轮针对四个方向继续优化。前两项由网络调研驱动，后两项延续首轮的重复消除模式。

### 调研结论（2026-08-11 网络调研）

1. **Motor 已官方弃用**：Motor 将于 2026-05-14 起弃用（已过弃用日），2027-05-14 停止关键修复。官方强烈建议迁移至 PyMongo Async API（`AsyncMongoClient`）。官方基准显示 PyMongo Async 在大多数操作上性能更优（find 并发 112 vs 37 MB/s、大文档插入 102 vs 83 MB/s），且原生 asyncio 无线程池开销。
2. **`AsyncMongoClient.close()` 是 async 方法**：与 Motor 的同步 `close()` 不同，迁移后必须 `await`，否则连接不会真正关闭。当前 `db_manager.close()`/`reconnect()` 为同步调用。
3. **FastAPI 官方结构**：官方推荐独立 `dependencies.py` 模块承载依赖函数（`Depends` 注入），路由层显式声明依赖。本项目路由目前直接 import 全局单例。
4. **FastAPI 官方警告**：不建议在 include 后直接修改 `router.routes`。当前 `unload_plugin` 用此法卸载插件路由。FastAPI 无官方路由卸载 API，社区通行做法即此——**本轮保持现状**，作为已知限制记录。

### 当前代码基线

- 150 tests passing（backend pytest 全量）
- ruff clean
- 技术栈：FastAPI + motor 3.7.1 + pymongo 4.16.0（已支持 AsyncMongoClient）

## 设计总览

四个方向合并为一个保守重构 spec，互不冲突，可独立实现与验证：

| # | 方向 | 影响面 | 行为变更 |
|---|------|--------|----------|
| 1 | Motor → PyMongo Async 迁移 | db_manager.py、test_db_manager.py、requirements.txt | 无（close 语义修正为正确关闭） |
| 2 | 路由层 Depends 依赖注入 | api/deps.py（新建）、api/v1/* 6 文件 | 无 |
| 3 | key_manager 重复模式抽取 | key_manager.py、db_manager.py（+delete_many）、测试 | 无（批量删除等价） |
| 4 | plugin_manager 生命周期抽取 | plugin_manager.py | 无 |

---

## 方向 1：Motor → PyMongo Async 迁移

### 现状

`managers/db_manager.py` 唯一使用 `motor.motor_asyncio`（`AsyncIOMotorClient` / `AsyncIOMotorDatabase` 类型注解与构造），`test/test_db_manager.py` 引用一次。requirements.txt 含 `motor`。

### 改动

**managers/db_manager.py**
- 删除 `import motor.motor_asyncio`
- 新增 `from pymongo import AsyncMongoClient` 与 `from pymongo.asynchronous.database import AsyncDatabase`
- 类型注解：`AsyncIOMotorClient` → `AsyncMongoClient`，`AsyncIOMotorDatabase` → `AsyncDatabase`
- 构造：`motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)` → `AsyncMongoClient(MONGODB_URL)`
- **`close()` 与 `reconnect()` 中的 `self.client.close()` 改为 `await self.client.close()`**
  - `reconnect()`：先 `await self.client.close()`，再置 None 并重新 `initialize()`
  - `close()`：`await self.client.close()` 后置 None
- 其余 API 不变（`find`/`find_one`/`insert_one`/`update_one`/`delete_one`/`aggregate`/`count_documents`/`create_index` 签名与返回值在 Async API 中一致；`to_list(length=...)` 写法官方兼容）

**requirements.txt**
- 移除 `motor` 行

**test/test_db_manager.py**
- motor 相关引用改为 pymongo async
- 新增测试：`close()` 后 client 置 None（锁定 async close 行为）

### 验证

- 新增/更新测试后全量 pytest
- 真实启动冒烟：健康检查 + 数据读写（依赖 MongoDB 容器）

---

## 方向 2：路由层 Depends 依赖注入

### 现状

6 个路由文件直接 `from managers.x import x_manager` 使用模块级单例。

### 改动

**api/deps.py（新建）**
- 依赖函数返回**现有全局单例**——测试中 `patch("managers.x.db_manager", mock)` 模式继续有效，零测试破坏：
  - `get_db() -> DBManager`：返回 `db_manager`
  - `get_item_manager() -> ItemManager`：返回 `item_manager`
  - `get_key_manager() -> KeyManager`：返回 `key_manager`
  - `get_category_manager() -> CategoryManager`：返回 `category_manager`

**路由文件（item/category/key/upload/ai/plugins/manifests）**
- 函数签名改为 `manager: ItemManager = Depends(get_item_manager)` 形式
- 函数体改用注入的 manager 参数
- 纯机械改造，无行为变化

### 验证

- 全量 pytest（现有 API 测试直接覆盖）
- 新增 deps 测试：验证 Depends 函数返回单例

---

## 方向 3：key_manager 重复模式抽取

### 现状重复点

- `create()`/`update()` 中 category 存在性检查各 1 处（相同 4 行模式）
- `create()` 中 created_at/updated_at 设置
- `delete_by_plugin()` 循环单删（N 次 DB 往返）

### 改动

**managers/key_manager.py**
- 抽取 `_ensure_category(category_name)`：校验 category 存在，不存在抛 ValueError（create/update 复用）
- 抽取 `_stamp_timestamps(doc, created: bool = False)`：`doc` 为待写入文档；`created=True` 时设置 created_at 与 updated_at，否则仅设置 updated_at（create 传 True，update 传 False）
- `delete_by_plugin()`：改为 `db_manager.delete_many(self.collection, {"name": {"$in": [要删的 name 列表]}})`，返回 deleted_count；无候选时跳过调用

**managers/db_manager.py**
- 新增 `delete_many(collection, query) -> int`（`@retry_on_connection_error`，返回 deleted_count）——与既有 delete_one 同风格

### 测试（TDD）

- `_ensure_category`：存在 → 通过；不存在 → ValueError
- `_stamp_timestamps`：created 时两个字段都设置；update 时仅 updated_at
- `delete_by_plugin`：批量删除返回正确计数；仅删除 `delete_with_plugin=True` 且 plugin_name 匹配的 key
- `db_manager.delete_many`：返回 deleted_count

### 注意

- `delete_by_plugin` 从"逐条删"改为"批量删"：行为等价（无钩子/级联逻辑依赖逐条删除），计数一致

---

## 方向 4：plugin_manager 生命周期抽取

### 现状重复点

`_load_plugin_module()` 的 `on_load` 调用与 `unload_plugin()` 的 `on_unload` 调用是完全相同的 await 模式：
```python
if asyncio.iscoroutinefunction(module.on_load):
    await module.on_load()
else:
    module.on_load()
```

### 改动

**core/plugin_manager.py**
- 抽取 `async def _call_lifecycle(self, module, method_name: str) -> None`：
  - 获取 `method = getattr(module, method_name, None)`，无则直接返回
  - `asyncio.iscoroutinefunction(method)` 则 `await method()`，否则 `method()`
- `_load_plugin_module()`：`await self._call_lifecycle(module, "on_load")`（外层 try/except 保留）
- `unload_plugin()`：`await self._call_lifecycle(module, "on_unload")`（去掉内联判断）

### 测试（TDD）

- sync on_load / async on_load 均被调用
- sync on_unload / async on_unload 均被调用
- 无 on_load/on_unload 时安全跳过
- 生命周期方法抛异常：on_load 被捕获记录（现有行为保持），on_unload 异常传播（现有行为保持）

---

## 验证与验收标准

- 每任务 TDD：失败测试 → 实现 → 全量回归 → 提交
- 全量 pytest ≥ 150 且新增测试全绿
- `ruff check` clean
- 冒烟：`./scripts/start.sh dev backend` 启动后健康检查、/manifests、rating 路由可用
- 分支流程：refactor/backend-optimization-round2 → PR

## 范围外（明确不做）

- 不迁移到同步 pymongo（保持异步栈）
- 不重构 `unload_plugin` 的路由卸载机制（FastAPI 无官方 API，行为变更风险大于收益）
- 不引入构造注入彻底移除全局单例（测试破坏面大，收益有限）
- 不新增业务功能
