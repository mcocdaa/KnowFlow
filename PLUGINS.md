# KnowFlow 插件开发指南

本文档介绍如何为 KnowFlow 开发自定义插件。

## 目录

- [插件系统概述](#插件系统概述)
- [插件目录结构](#插件目录结构)
- [创建新插件](#创建新插件)
  - [1. 创建插件目录](#1-创建插件目录)
  - [2. 编写 plugin.yaml](#2-编写-pluginyaml)
  - [3. 编写后端代码](#3-编写后端代码)
  - [4. 编写前端组件](#4-编写前端组件)
  - [5. 启用插件](#5-启用插件)
- [API 参考](#api-参考)
- [示例插件](#示例插件)

## 插件系统概述

KnowFlow 的插件系统允许开发者扩展应用功能，每个插件可以：

1. 注册自定义 Key（属性字段）
2. 提供后端 API 路由
3. 提供前端 UI 组件

插件采用"约定优于配置"的设计理念，只需按照规范创建文件，系统会自动加载。

## 插件目录结构

```
KnowFlow/
├── plugins/                    # 插件根目录
│   ├── plugins.yaml            # 插件启用配置
│   │
│   └── your_plugin/            # 你的插件目录
│       ├── plugin.yaml          # 插件元信息（必需）
│       ├── backend.py           # 后端代码（可选）
│       └── frontend.tsx         # 前端组件（可选）
```

## 创建新插件

### 1. 创建插件目录

在 `plugins/` 目录下创建一个新文件夹，文件夹名即为插件名：

```bash
mkdir plugins/my_plugin
```

### 2. 编写 plugin.yaml

创建 `plugin.yaml` 文件，定义插件元信息和要注册的 Keys：

```yaml
# plugins/my_plugin/plugin.yaml

name: my_plugin                    # 插件名称（必需）
version: 1.0.0                     # 版本号
description: 我的自定义插件          # 描述
author: Your Name                  # 作者

# 要注册的 Keys
keys:
  - name: my_field                 # Key 名称（唯一标识）
    title: 我的字段                  # 显示标题
    value_type: string              # 值类型: string | number | boolean | array | object
    default_value: ""               # 默认值
    description: 这是一个自定义字段    # 描述
    category_name: 基础信息          # 所属分类
    is_visible: true                # 是否在UI中显示
    is_required: false              # 是否必填

# 后端入口文件
backend_entry: backend.py

# 前端入口文件
frontend_entry: frontend.tsx
```

**Key 字段说明：**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `name` | string | 是 | Key 唯一标识 |
| `title` | string | 是 | 显示标题 |
| `value_type` | string | 是 | 值类型：`string`/`number`/`boolean`/`array`/`object` |
| `default_value` | any | 是 | 默认值 |
| `description` | string | 是 | 描述说明 |
| `category_name` | string | 是 | 所属分类名称 |
| `is_visible` | boolean | 否 | 是否可见，默认 true |
| `is_required` | boolean | 否 | 是否必填，默认 false |

### 3. 编写后端代码

创建 `backend.py` 文件，定义后端 API 路由：

```python
# plugins/my_plugin/backend.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

# 创建路由器（必需）
router = APIRouter()

# 定义请求模型
class MyDataUpdate(BaseModel):
    value: str

# 定义 API 端点
@router.put("/items/{item_id}/my_field")
async def update_my_field(item_id: str, data: MyDataUpdate) -> Dict[str, Any]:
    """更新字段值"""
    from managers.item_manager import ItemManager
    manager = ItemManager()

    try:
        await manager.update_item(item_id, {"my_field": data.value})
        return {"success": True, "value": data.value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/items/{item_id}/my_field")
async def get_my_field(item_id: str) -> Dict[str, Any]:
    """获取字段值"""
    from managers.item_manager import ItemManager
    manager = ItemManager()

    try:
        item = await manager.get_item(item_id)
        value = item.get("attributes", {}).get("my_field", "")
        return {"value": value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 生命周期钩子（可选）
async def on_load():
    """插件加载时调用"""
    print("[MyPlugin] 插件已加载")


async def on_unload():
    """插件卸载时调用"""
    print("[MyPlugin] 插件已卸载")
```

**后端代码规范：**

1. 必须创建名为 `router` 的 `APIRouter` 实例
2. 路由会自动注册到 `/plugins/{plugin_name}/` 前缀下
3. 可选定义 `on_load()` 和 `on_unload()` 生命周期钩子

### 4. 编写前端组件

创建 `frontend.tsx` 文件，定义前端 UI 组件：

```tsx
// plugins/my_plugin/frontend.tsx

import React, { useState, useEffect } from 'react';

// 定义组件 Props
interface MyPluginProps {
  value: unknown;
  itemId: string;
  onUpdate: (value: unknown) => void;
  readOnly?: boolean;
}

const MyPluginComponent: React.FC<MyPluginProps> = ({
  value,
  itemId,
  onUpdate,
  readOnly = false,
}) => {
  const [currentValue, setCurrentValue] = useState<string>(value as string || '');

  useEffect(() => {
    setCurrentValue(value as string || '');
  }, [value]);

  const handleChange = async (newValue: string) => {
    if (readOnly) return;

    setCurrentValue(newValue);
    onUpdate(newValue);

    try {
      await fetch(
        `/api/v1/plugins/my_plugin/items/${itemId}/my_field`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: newValue }),
        }
      );
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="text"
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        disabled={readOnly}
        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      {!readOnly && (
        <button onClick={() => handleChange('')}>清空</button>
      )}
    </div>
  );
};

export default MyPluginComponent;
```

**前端组件规范:**

1. 组件会接收以下 Props:
   - `value`: 当前值
   - `itemId`: 知识项 ID
   - `onUpdate`: 值更新回调
   - `readOnly`: 是否只读模式

2. 组件负责渲染 Key 的 UI 并处理用户交互

### 5. 启用插件

编辑 `plugins/plugins.yaml` 文件，启用插件：

```yaml
# plugins/plugins.yaml

plugins:
  my_plugin:
    enabled: true    # 设置为 true 启用插件
```

重启后端服务，插件会自动加载。

## API 参考

### 后端 API

插件加载后，会提供以下 API：

| 端点 | 说明 |
|------|------|
| `GET /api/v1/plugins/manifests` | 获取所有已加载插件的清单 |
| `GET /api/v1/plugins/{plugin_name}/frontend` | 获取插件的前端组件代码 |

### 插件自定义 API

插件定义的路由会注册到 `/plugins/{plugin_name}/` 前缀下。

例如，`my_plugin` 插件定义的路由：

```python
@router.put("/items/{item_id}/my_field")
```

会注册为：

```
PUT /api/v1/plugins/my_plugin/items/{item_id}/my_field
```

## 示例插件

查看 `plugins/rating/` 目录了解完整的星级评分插件实现。

### plugin.yaml

```yaml
name: rating
version: 1.0.0
description: 为知识项添加星级评分功能
author: KnowFlow

keys:
  - name: rating
    title: 星级
    value_type: number
    default_value: 0
    description: 知识项的星级评分(1-5)
    category_name: 基础信息

backend_entry: backend.py
frontend_entry: frontend.tsx
```

### backend.py

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

class RatingUpdate(BaseModel):
    rating: int

@router.put("/items/{item_id}/rating")
async def update_rating(item_id: str, data: RatingUpdate) -> Dict[str, Any]:
    if not 1 <= data.rating <= 5:
        raise HTTPException(status_code=400, detail="星级必须在1-5之间")

    from managers.item_manager import ItemManager
    manager = ItemManager()

    try:
        await manager.update_item(item_id, {"rating": data.rating})
        return {"success": True, "rating": data.rating}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def on_load():
    print("[RatingPlugin] 星级评分插件已加载")


async def on_unload():
    print("[RatingPlugin] 星级评分插件已卸载")
```

### frontend.tsx

```tsx
import React, { useState, useEffect } from 'react';

interface StarRatingProps {
  value: number;
  itemId: string;
  onUpdate: (value: number) => void;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  itemId,
  onUpdate,
  readOnly = false,
}) => {
  const [rating, setRating] = useState<number>(value || 0);
  const [hover, setHover] = useState<number>(0);

  useEffect(() => {
    setRating(value || 0);
  }, [value]);

  const handleClick = async (star: number) => {
    if (readOnly) return;

    setRating(star);
    onUpdate(star);

    try {
      await fetch(
        `/api/v1/plugins/rating/items/${itemId}/rating`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: star }),
        }
      );
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'row-reverse', cursor: readOnly ? 'default' : 'pointer' }}>
      {[5, 4, 3, 2, 1].map((star) => (
        <span
          key={star}
          style={{
            color: star <= (hover || rating) ? '#ffc107' : '#e4e5e9',
            fontSize: '24px',
          }}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
```

## 最佳实践

1. **命名规范**: 插件名使用小写字母和下划线，如 `my_plugin`
2. **错误处理**: 后端 API 应该正确处理异常并返回适当的 HTTP 状态码
3. **类型安全**: 使用 Pydantic 模型验证请求，使用 TypeScript 定义前端 Props
4. **文档注释**: 为 API 端点和添加文档字符串
5. **测试覆盖**: 为插件编写单元测试

## 调试技巧

1. 查看后端日志，确认插件是否正确加载
2. 访问 `/api/v1/plugins/manifests` 查看已加载插件
3. 检查 Key 是否正确注册：访问 `/api/v1/keys`
