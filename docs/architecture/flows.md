# 关键流程

本文档描述 KnowFlow 的核心业务流程。

---

## 文件导入流程

```
用户拖拽/选择文件
        │
        ▼
前端发送 POST /api/v1/upload
        │
        ▼
后端保存文件到 data/uploads/
        │
        ▼
自动提取文件元数据
(file_path, file_type)
        │
        ▼
创建知识项记录到 MongoDB
        │
        ▼
返回新创建的知识项信息
        │
        ▼
前端更新界面
```

---

## 检索流程

```
用户输入搜索关键词
        │
        ▼
前端过滤知识项列表
(匹配 name, file_path)
        │
        ▼
应用排序条件
        │
        ▼
更新搜索结果展示
```

---

## 插件加载流程

```
应用启动
    │
    ▼
PluginLoader.initialize(app)
    │
    ▼
读取 plugins.yaml 配置
    │
    ▼
扫描 plugins/ 目录
    │
    ├── 读取 plugin.yaml
    │
    ├── 注册 Key 定义
    │   │
    │   └── 调用 key_manager.create()
    │
    ├── 加载后端入口
    │   │
    │   ├── 导入模块
    │   │
    │   ├── 注册路由
    │   │
    │   └── 调用 on_load()
    │
    └── 插件加载完成
```

---

## 数据更新流程

```
用户编辑知识项
        │
        ▼
前端调用 PUT /api/v1/item/{id}
        │
        ▼
后端验证必填 Key
        │
        ▼
更新 MongoDB 文档
        │
        ├── 自动更新 updated_at
        │
        └── 类型转换（根据 value_type）
        │
        ▼
返回更新后的知识项
        │
        ▼
前端更新 Redux Store
```

---

## 相关文档

- [模块划分](./modules.md)
- [API 接口](../backend/api.md)
