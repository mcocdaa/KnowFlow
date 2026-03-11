# 示例：星级评分插件

完整的星级评分插件实现示例。

---

## 目录结构

```
plugins/rating/
├── plugin.yaml      # 插件配置
├── backend.py       # 后端入口
└── frontend.tsx     # 前端组件
```

---

## plugin.yaml

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
    category_name: basic_category
    is_required: false
    is_visible: true
    plugin_name: "rating"
    delete_with_plugin: false
    is_public: true
    is_private: false
    created_at: "2026-01-01"
    updated_at: "2026-01-01"

backend_entry: backend.py
frontend_entry: frontend.tsx
```

---

## backend.py

```python
from fastapi import APIRouter
from managers.item_manager import item_manager

router = APIRouter()

@router.put("/rating/{item_id}")
async def update_rating(item_id: str, rating: int):
    if rating < 1 or rating > 5:
        return {"error": "Rating must be between 1 and 5"}

    await item_manager.update(item_id, {"rating": str(rating)})
    return {"item_id": item_id, "rating": rating}

def on_load():
    print("[RatingPlugin] 插件已加载")

def on_unload():
    print("[RatingPlugin] 插件已卸载")
```

---

## frontend.tsx

```typescript
import React from 'react';

interface StarRatingProps {
  value: number;
  onUpdate: (value: number) => void;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  onUpdate,
  readOnly = false
}) => {
  const [rating, setRating] = React.useState(value || 0);

  const handleClick = (star: number) => {
    if (readOnly) return;
    setRating(star);
    onUpdate(star);
  };

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleClick(star)}
          style={{
            cursor: readOnly ? 'default' : 'pointer',
            color: star <= rating ? '#fadb14' : '#d9d9d9',
            fontSize: '20px',
            transition: 'color 0.2s'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
```

---

## 相关文档

- [后端开发](./backend-dev.md)
- [前端开发](./frontend-dev.md)
