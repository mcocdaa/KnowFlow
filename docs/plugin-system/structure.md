# 插件目录结构

---

## 整体结构

```
plugins/
├── plugins.yaml           # 插件启用配置
├── rating/                # 星级评分插件
│   ├── plugin.yaml        # 插件元数据
│   ├── backend.py         # 后端入口
│   └── frontend.tsx       # 前端入口
└── other-plugin/
    └── ...
```

---

## plugins.yaml 配置

控制哪些插件被启用：

```yaml
plugins:
  rating:
    enabled: true
  other-plugin:
    enabled: false
```

---

## plugin.yaml 结构

```yaml
name: rating                    # 插件名称（必需）
version: 1.0.0                  # 版本号
description: 为知识项添加星级评分功能  # 描述
author: KnowFlow                # 作者

keys:                           # 插件注册的 Key 定义
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

backend_entry: backend.py       # 后端入口文件（可选）
frontend_entry: frontend.tsx    # 前端入口文件（可选）
```

---

## 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 插件唯一标识名称 |
| `version` | string | 否 | 版本号 |
| `description` | string | 否 | 插件描述 |
| `author` | string | 否 | 作者 |
| `keys` | array | 否 | 要注册的 Key 定义列表 |
| `backend_entry` | string | 否 | 后端入口文件路径 |
| `frontend_entry` | string | 否 | 前端入口文件路径 |

---

## 相关文档

- [后端开发](./backend-dev.md)
- [前端开发](./frontend-dev.md)
