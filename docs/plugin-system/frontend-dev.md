# 前端插件开发

---

## 前端入口文件

前端入口文件是一个 React 组件：

```typescript
// plugins/rating/frontend.tsx

import React from 'react';

interface StarRatingProps {
  value: number;
  itemId: string;
  keyDefinition: {
    name: string;
    title: string;
    value_type: string;
  };
  onUpdate: (value: number) => void;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
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
            fontSize: '20px'
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

## 组件 Props

```typescript
interface PluginComponentProps {
  value: unknown;              // 当前值
  itemId: string;              // 知识项 ID
  keyDefinition: {             // Key 定义
    name: string;
    title: string;
    value_type: string;
  };
  onUpdate: (value: unknown) => void;  // 更新回调
  readOnly?: boolean;          // 是否只读
}
```

---

## 插件组件注册

前端在应用启动时注册插件组件：

```typescript
// frontend/src/plugins/index.tsx

import { registerPluginComponent } from './loader';
import StarRating from './components/StarRating';

export const initializePlugins = () => {
  registerPluginComponent('rating', StarRating);
};
```

---

## PluginRenderer 组件

用于渲染插件组件的包装器：

```tsx
<PluginRenderer
  pluginName="rating"
  value={value}
  itemId={itemId}
  keyDefinition={keyDefinition}
  onUpdate={onUpdate}
  readOnly={readOnly}
/>
```

### 渲染逻辑

1. 检查插件组件是否已注册
2. 如果已注册，渲染插件组件
3. 如果未注册，显示原始值文本
4. 加载中显示加载提示

---

## 相关文档

- [后端开发](./backend-dev.md)
- [示例插件](./example.md)
