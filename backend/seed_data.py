import asyncio
import os
from datetime import datetime

from pymongo import AsyncMongoClient

MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "knowflow"
UPLOADS_DIR = "/home/mcocdaa/AI_CODE/KnowFlow/backend/data/uploads"

os.makedirs(UPLOADS_DIR, exist_ok=True)

# Sample markdown file
md_content = """# KnowFlow 知识库架构设计方案 (v1.1)

## 1. 核心定位
**KnowFlow** 是一款现代化、高性能、轻量级的知识管理系统。
系统坚持**严格克制**的设计原则，砍掉虚浮复杂的图谱与重型 OCR，专注于扎实的**动态属性检索、分类树归档与快速预览**。

## 2. 核心架构特性
- **存储引擎**：基于 MongoDB 原生 BSON 数据模型，支持动态 KV 原生数字、布尔与数组存储。
- **复合索引**：构建 `(category_name, created_at)` 复合索引与 `name` + `content` 全文倒排索引，毫秒级响应。
- **离线语义检索**：嵌入式 `fastembed` (BAAI/bge-small-zh-v1.5) 引擎，零外部 API 依赖，CPU 本地高并发推理。
- **三栏式工作空间**：
  1. **左侧**：可折叠层级分类树，支持平滑拖拽重组与文件直接拖拽归档。
  2. **中央**：表格/卡片网格双视图切换，内置评分/文件类型快速筛选芯片。
  3. **右侧**：即时响应式多模态预览面板（PDF.js / marked Markdown / Monaco 编辑器）。

```python
# 示例：BSON 原生存储写入
item = {
    "name": "KnowFlow 架构白皮书",
    "category_name": "backend_core",
    "attributes": {
        "rating": 5,
        "tags": ["架构设计", "Python3.12", "FastAPI"],
        "file_type": "markdown",
        "is_public": True,
        "version": 1.2
    }
}
```

> 提示：本知识库已全面适配 Python 3.12 与现代前端规范。
"""

with open(os.path.join(UPLOADS_DIR, "architecture_design.md"), "w", encoding="utf-8") as f:
    f.write(md_content)

# Sample python file
py_content = """# fastembed_service.py
# KnowFlow 离线语义向量推理模块

import numpy as np
from fastembed import TextEmbedding

class SemanticEngine:
    def __init__(self, model_name: str = "BAAI/bge-small-zh-v1.5"):
        self.model = TextEmbedding(model_name=model_name)

    def encode(self, texts: list[str]) -> np.ndarray:
        embeddings = list(self.model.embed(texts))
        return np.array(embeddings)

    def similarity(self, query_emb: np.ndarray, doc_embs: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(doc_embs, axis=1, keepdims=True)
        q_norm = np.linalg.norm(query_emb)
        sims = np.dot(doc_embs, query_emb) / (norms.flatten() * q_norm + 1e-9)
        return sims
"""

with open(os.path.join(UPLOADS_DIR, "fastembed_service.py"), "w", encoding="utf-8") as f:
    f.write(py_content)

# Sample json file
json_content = """{
  "system": "KnowFlow",
  "version": "1.1.0",
  "storage": {
    "engine": "mongodb",
    "indexes": ["category_compound", "fulltext_inverted"]
  },
  "ai": {
    "embed_model": "BAAI/bge-small-zh-v1.5",
    "dimension": 512,
    "offline_cpu": true
  },
  "workspace": {
    "layout": "3-column",
    "default_view": "card"
  }
}
"""

with open(os.path.join(UPLOADS_DIR, "system_config.json"), "w", encoding="utf-8") as f:
    f.write(json_content)

# Sample dummy PDF
pdf_path = os.path.join(UPLOADS_DIR, "product_manual.pdf")
if not os.path.exists(pdf_path):
    # Minimal valid single-page PDF binary
    pdf_bytes = (
        b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
        b"xref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\n"
        b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
    )
    with open(pdf_path, "wb") as f:
        f.write(pdf_bytes)


async def seed():
    client = AsyncMongoClient(MONGODB_URL)
    db = client[DB_NAME]

    # Categories to insert
    categories = [
        {"name": "tech_arch", "title": "技术架构", "parent_name": None, "is_builtin": False},
        {"name": "backend_core", "title": "后端核心", "parent_name": "tech_arch", "is_builtin": False},
        {"name": "algo_models", "title": "算法模型", "parent_name": "tech_arch", "is_builtin": False},
        {"name": "product_spec", "title": "产品规划", "parent_name": None, "is_builtin": False},
    ]

    for cat in categories:
        await db["categories"].update_one(
            {"name": cat["name"]}, {"$set": {**cat, "updated_at": datetime.now().isoformat()}}, upsert=True
        )

    # Knowledge Items to insert
    items = [
        {
            "name": "KnowFlow 统一架构设计说明书.md",
            "category_name": "backend_core",
            "file_path": "/api/v1/uploads/architecture_design.md",
            "file_type": "markdown",
            "rating": 5,
            "tags": ["核心架构", "Python3.12", "BSON优化"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        {
            "name": "fastembed 离线语义推理实现.py",
            "category_name": "algo_models",
            "file_path": "/api/v1/uploads/fastembed_service.py",
            "file_type": "code",
            "rating": 5,
            "tags": ["向量模型", "fastembed", "CPU离线"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        {
            "name": "KnowFlow 生产配置规约.json",
            "category_name": "tech_arch",
            "file_path": "/api/v1/uploads/system_config.json",
            "file_type": "code",
            "rating": 4,
            "tags": ["配置管理", "MongoDB", "三栏布局"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        {
            "name": "KnowFlow 产品使用指南与规划白皮书.pdf",
            "category_name": "product_spec",
            "file_path": "/api/v1/uploads/product_manual.pdf",
            "file_type": "pdf",
            "rating": 5,
            "tags": ["产品白皮书", "规范指南", "P0特性"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        {
            "name": "动态属性 KV 查询优化报告",
            "category_name": "backend_core",
            "file_path": "",
            "file_type": "text",
            "rating": 4,
            "tags": ["BSON重构", "范围查询", "倒排索引"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
    ]

    for item in items:
        # Construct item doc with native BSON attributes
        doc = {
            "name": item["name"],
            "category_name": item["category_name"],
            "file_path": item["file_path"],
            "file_type": item["file_type"],
            "rating": item["rating"],
            "tags": item["tags"],
            "created_at": item["created_at"],
            "updated_at": item["updated_at"],
        }
        await db["items"].update_one({"name": item["name"]}, {"$set": doc}, upsert=True)

    print("✓ 数据库种子数据填充完成！")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
