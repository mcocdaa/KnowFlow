# KnowFlow 内置 Key 系统设计

## 1. 内置 Key 体系

### 1.1 核心内置 Key

| Key 名称 | 数据类型 | 描述 | 分类 |
|---------|---------|------|------|
| `file_path` | 字符串 | 文件路径 | 基础属性 |
| `click_count` | 整数 | 点击次数 | 统计属性 |
| `star_rating` | 整数 | 星级 (1-5) | 评价属性 |
| `created_at` | 时间戳 | 创建时间 | 时间属性 |
| `file_type` | 字符串 | 文件类型 | 基础属性 |

### 1.2 多媒体文件专属 Key

| Key 名称 | 数据类型 | 描述 | 分类 |
|---------|---------|------|------|
| `image_resolution` | 字符串 | 图片分辨率 | 媒体属性 |
| `video_duration` | 整数 | 视频时长 (秒) | 媒体属性 |
| `camera_model` | 字符串 | 相机型号 | 媒体属性 |
| `location` | 字符串 | 拍摄地点 | 媒体属性 |
| `video_codec` | 字符串 | 视频编码 | 媒体属性 |

### 1.3 文献专属 Key

| Key 名称 | 数据类型 | 描述 | 分类 |
|---------|---------|------|------|
| `author` | 字符串 | 作者 | 文献属性 |
| `publication_date` | 日期 | 发表日期 | 文献属性 |
| `journal` | 字符串 | 期刊名称 | 文献属性 |
| `doi` | 字符串 | DOI 编号 | 文献属性 |
| `abstract` | 文本 | 摘要 | 文献属性 |

## 2. Key 分类管理

### 2.1 分类结构

```
├── 内置 Key
│   ├── 基础属性
│   │   ├── file_path
│   │   ├── file_type
│   ├── 统计属性
│   │   ├── click_count
│   ├── 评价属性
│   │   ├── star_rating
│   ├── 时间属性
│   │   ├── created_at
│   ├── 媒体属性
│   │   ├── image_resolution
│   │   ├── video_duration
│   │   ├── camera_model
│   │   ├── location
│   │   ├── video_codec
│   ├── 文献属性
│       ├── author
│       ├── publication_date
│       ├── journal
│       ├── doi
│       ├── abstract
├── 自定义 Key
    ├── 用户自定义分类 1
    ├── 用户自定义分类 2
```

### 2.2 分类管理功能
- 用户可以创建新的分类文件夹
- 用户可以修改分类名称
- 用户可以删除自定义分类（内置分类不可删除）
- 用户可以将自定义 Key 移动到不同分类

## 3. Key-Value 存储结构

### 3.1 数据库存储

#### 3.1.1 `key_categories` 表
| 字段名 | 数据类型 | 描述 |
|-------|---------|------|
| `id` | INTEGER | 分类ID (主键) |
| `name` | TEXT | 分类名称 |
| `parent_id` | INTEGER | 父分类ID |
| `is_builtin` | BOOLEAN | 是否内置 |

#### 3.1.2 `key_definitions` 表
| 字段名 | 数据类型 | 描述 |
|-------|---------|------|
| `id` | INTEGER | Key定义ID (主键) |
| `name` | TEXT | Key名称 |
| `category_id` | INTEGER | 所属分类ID |
| `is_builtin` | BOOLEAN | 是否内置 |
| `data_type` | TEXT | 数据类型 |
| `script` | TEXT | 小脚本代码 |
| `description` | TEXT | 描述 |

#### 3.1.3 `key_values` 表
| 字段名 | 数据类型 | 描述 |
|-------|---------|------|
| `id` | INTEGER | 记录ID (主键) |
| `item_id` | INTEGER | 知识项ID |
| `key_id` | INTEGER | Key定义ID |
| `value` | TEXT | Value值 |

### 3.2 内存缓存
- 常用 Key 定义缓存在内存中，提高访问速度
- 热点知识项的 Key-Value 对缓存在内存中

### 3.3 存储优化
- 对于频繁更新的 Key（如 `click_count`），使用增量更新
- 对于大型 Value（如 `abstract`），考虑使用外部存储
- 建立合适的索引，提高检索性能

## 4. Key 小脚本功能

### 4.1 脚本类型
- **自动提取脚本**：从文件中自动提取值（如文件名、文件大小）
- **计算脚本**：基于其他 Key 计算值（如文件大小单位转换）
- **条件脚本**：根据条件设置值（如根据文件类型设置默认分类）

### 4.2 脚本示例

#### 4.2.1 自动提取文件名
```javascript
// 从文件路径提取文件名
function extractFileName(filePath) {
  return filePath.split('/').pop();
}
```

#### 4.2.2 根据文件类型自动分类
```javascript
// 根据文件扩展名设置文件类型
function setFileType(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  const typeMap = {
    'pdf': 'document',
    'doc': 'document',
    'docx': 'document',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'mp4': 'video',
    'avi': 'video'
  };
  return typeMap[ext] || 'other';
}
```

## 5. 内置 Key 自动更新机制

### 5.1 点击次数更新
- 当用户打开文件时，`click_count` 自动 +1
- 数据库操作使用原子递增，避免并发问题

### 5.2 星级更新
- 用户通过界面设置星级后，`star_rating` 自动更新
- 支持批量更新星级

### 5.3 创建时间更新
- 文件导入时自动设置 `created_at` 为当前时间
- 不可手动修改

## 6. 扩展性设计

### 6.1 自定义 Key 扩展
- 用户可以创建新的自定义 Key
- 支持设置 Key 的数据类型（字符串、数字、布尔值、日期）
- 支持设置 Key 的默认值

### 6.2 分类扩展
- 用户可以创建任意层级的分类结构
- 支持拖拽调整分类顺序

### 6.3 存储扩展
- 支持未来添加新的存储后端（如 PostgreSQL、MongoDB）
- 支持数据导出/导入，便于迁移

## 7. 性能考虑

### 7.1 检索优化
- 为常用 Key 创建索引
- 支持 Key 组合检索
- 支持正则表达式匹配

### 7.2 存储优化
- 批量操作减少数据库交互
- 延迟写入非关键数据
- 定期清理无效数据

## 8. 安全性

### 8.1 数据验证
- 内置 Key 的值进行类型验证
- 自定义 Key 支持设置验证规则

### 8.2 权限控制
- 内置 Key 不可删除或修改
- 自定义 Key 可以由用户管理

## 9. 未来扩展

### 9.1 AI 增强
- AI 自动生成 Key-Value 建议
- 基于内容的自动分类

### 9.2 多语言支持
- Key 名称支持多语言
- Value 支持多语言版本

### 9.3 协作功能
- 支持团队共享 Key 定义
- 支持 Key 权限管理