# 前端修改指南

本文档详细说明需要在前端代码中进行的修改，以适配新的后端数据结构。

## 数据结构变更

### 1. KeyDefinitions 从数组改为字典
**旧结构：**
```javascript
definitions: [
  { id: "1", name: "file_path", ... },
  { id: "2", name: "file_type", ... }
]
```

**新结构：**
```javascript
definitions: {
  "file_path": { id: "1", name: "file_path", ... },
  "file_type": { id: "2", name: "file_type", ... }
},
definitionList: [ /* 相同内容的数组，用于遍历 */ ]
```

### 2. KnowledgeItem.keyValues 从数组改为字典
**旧结构：**
```javascript
{
  id: "1",
  keyValues: [
    { keyId: "1", value: "./path/to/file" },
    { keyId: "10", value: 3 }
  ]
}
```

**新结构：**
```javascript
{
  id: "1",
  keyValues: {
    "file_path": "./path/to/file",
    "star_rating": 3
  }
}
```

## 主要修改点

### 1. 在 `Layout.tsx` 中修改数据加载（第 514-555 行）

**修改前：**
```javascript
const knowledgeResponse = await fetch('http://localhost:3000/api/knowledge');
if (knowledgeResponse.ok && isMounted) {
  const knowledgeData = await knowledgeResponse.json();
  knowledgeData.forEach((item: any) => {
    dispatch(addKnowledgeItem({
      id: item.id,
      createdAt: item.createdAt,
      keyValues: item.keyValues || [],
    }));
  });
}
```

**修改后：**
```javascript
const knowledgeResponse = await fetch('http://localhost:3000/api/knowledge');
if (knowledgeResponse.ok && isMounted) {
  const knowledgeData = await knowledgeResponse.json();
  knowledgeData.forEach((item: any) => {
    dispatch(addKnowledgeItem(item));
  });
}

// 加载key定义时，新的API返回的是对象
const keysResponse = await fetch('http://localhost:3000/api/keys');
if (keysResponse.ok && isMounted) {
  const keysData = await keysResponse.json();
  dispatch(setDefinitions(keysData));
}
```

### 2. 修改搜索逻辑（第 566-655 行）

**修改前：**
```javascript
const hasKey = item.keyValues?.some(kv => kv?.keyId === keyDef.id && kv?.value);
```

**修改后：**
```javascript
const hasKey = item.keyValues?.[keyDef.name];
```

**修改前：**
```javascript
const hasMatch = item.keyValues?.some(kv => {
  if (kv?.keyId === keyDef.id && kv?.value) {
    return kv.value.match(new RegExp(pattern, 'i'));
  }
  return false;
});
```

**修改后：**
```javascript
const value = item.keyValues?.[keyDef.name];
const hasMatch = value && value.toString().match(new RegExp(pattern, 'i'));
```

### 3. 修改点击次数更新（第 657-688 行）

**修改前：**
```javascript
const clickCountKv = item.keyValues?.find((kv: any) => kv.keyId === '3');
const currentClickCount = clickCountKv?.value || 0;
const newClickCount = currentClickCount + 1;

const updatedKeyValues = item.keyValues?.map((kv: any) => 
  kv.keyId === '3' ? { ...kv, value: newClickCount } : kv
) || [{ keyId: '3', value: newClickCount }];
```

**修改后：**
```javascript
const currentClickCount = item.keyValues?.click_count || 0;
const newClickCount = currentClickCount + 1;

const updatedKeyValues = {
  ...item.keyValues,
  click_count: newClickCount
};
```

### 4. 修改文件上传后处理（第 740-776 行）

**修改前：**
```javascript
const formValues: any = {};
newItem.keyValues?.forEach((kv: any) => {
  const keyDef = definitions.find(def => def.id === kv.keyId);
  if (keyDef) {
    formValues[keyDef.name] = kv.value;
  }
});
```

**修改后：**
```javascript
const formValues = newItem.keyValues || {};
```

### 5. 修改编辑表单处理（第 864-924 行）

**修改前：**
```javascript
const formValues = item.keyValues.reduce((acc: any, kv: any) => {
  const keyDef = definitions.find(def => def.id === kv.keyId);
  if (keyDef) {
    acc[keyDef.name] = kv.value;
  }
  return acc;
}, {});

// ...

const updatedKeyValues = definitions.map(def => {
  const value = values[def.name];
  if (value !== undefined) {
    return {
      keyId: def.id,
      value: value
    };
  }
  return null;
}).filter((kv: any) => kv !== null);
```

**修改后：**
```javascript
const formValues = item.keyValues || {};

// ...

const updatedKeyValues = {
  ...editingItem.keyValues,
  ...values
};
```

### 6. 修改拖拽上传（第 944-993 行）

**修改前：**
```javascript
dispatch(addKnowledgeItem({
  filePath: newItem.filePath,
  fileType: newItem.fileType,
  createdAt: newItem.createdAt,
  clickCount: newItem.clickCount,
  starRating: newItem.starRating,
  keyValues: newItem.keyValues,
}));
```

**修改后：**
```javascript
dispatch(addKnowledgeItem(newItem));
```

### 7. 修改文件卡片显示（多处）

**所有类似以下的代码：**
```javascript
item.keyValues?.find((kv: any) => kv.keyId === '11')?.value
```

**改为：**
```javascript
item.keyValues?.file_name
```

**其他常见修改：**
- `kv.keyId === '1'` → `item.keyValues?.file_path`
- `kv.keyId === '2'` → `item.keyValues?.file_type`
- `kv.keyId === '3'` → `item.keyValues?.click_count`
- `kv.keyId === '10'` → `item.keyValues?.star_rating`
- `kv.keyId === '11'` → `item.keyValues?.file_name`
- `kv.keyId === '12'` → `item.keyValues?.is_link_only`

### 8. 修改菜单构建中的 key 访问（第 778-862 行）

**修改前：**
```javascript
const directKeyItems = definitions
  .filter(def => def.categoryId === cat.id)
  .map(def => ({
    key: `key-${def.id}`,
    label: def.name,
    onClick: () => { /* ... */ }
  }));
```

**修改后：**
```javascript
const directKeyItems = definitionList
  .filter(def => def.categoryId === cat.id)
  .map(def => ({
    key: `key-${def.id}`,
    label: def.name,
    onClick: () => { /* ... */ }
  }));
```

### 9. 修改详情面板中的属性访问

**所有在详情面板中访问 keyValues 的地方，例如：**
```javascript
selectedItem.keyValues?.find((kv: any) => kv.keyId === '1')?.value
```
改为：
```javascript
selectedItem.keyValues?.file_path
```

## Redux Selector 更新

在使用 useSelector 时：
- 原来：`const { definitions } = useSelector((state: RootState) => state.key);`
- 现在：`const { definitionList } = useSelector((state: RootState) => state.key);`

如果需要按名称查找 key 定义：
```javascript
const { definitions } = useSelector((state: RootState) => state.key);
const keyDef = definitions['file_path']; // 直接通过名称访问
```

## 关键修改总结

1. **keyDefinitions** → 使用 `definitionList` 进行遍历，使用 `definitions` 对象进行名称查找
2. **keyValues** → 从数组改为对象，直接用 key 名称访问值
3. **API 响应** → 直接传递给 Redux action，不需要额外转换
4. **所有遍历 keyValues 的地方** → 改为直接对象属性访问

## 验证步骤

修改完成后，请验证：
1. 页面能正常加载数据
2. 搜索功能正常工作
3. 文件上传功能正常
4. 编辑功能正常
5. Key 管理功能正常
6. 分类管理功能正常
