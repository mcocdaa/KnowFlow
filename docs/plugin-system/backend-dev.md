# 后端插件开发

---

## 后端入口文件

后端入口文件是一个 Python 模块，可以导出以下内容：

```python
# plugins/rating/backend.py

from fastapi import APIRouter

router = APIRouter()

@router.put("/rating/{item_id}")
async def update_rating(item_id: str, rating: int):
    # 更新评分逻辑
    return {"item_id": item_id, "rating": rating}

def on_load():
    print("Rating plugin loaded")

def on_unload():
    print("Rating plugin unloaded")
```

---

## 可导出的内容

| 导出名称 | 类型 | 说明 |
|---------|------|------|
| `router` | APIRouter | FastAPI 路由器，自动注册到 `/api/v1/plugins/{plugin_name}/` |
| `on_load` | function | 插件加载时调用的函数 |
| `on_unload` | function | 插件卸载时调用的函数 |
| `hooks.py` 中的 `@hook_manager.hook(...)` 回调 | 插件可选的钩子入口文件（`hooks_entry`），注册到系统钩子点（见 `backend/core/hooks.py`） |

---

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

---

## 生命周期函数

```python
# 同步函数
def on_load():
    print("Plugin loaded")

# 异步函数
async def on_load():
    await some_async_operation()
```

---

## 加载流程

```
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

---

## 相关文档

- [前端开发](./frontend-dev.md)
- [示例插件](./example.md)
