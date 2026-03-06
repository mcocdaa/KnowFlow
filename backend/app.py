from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import uuid
from datetime import datetime
import httpx

# 初始化应用
app = FastAPI(title="KnowFlow Python Backend")

# 跨域配置（解决前端请求问题）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== 配置 =====================
UPLOAD_DIR = "./uploads"
DB_FILE = "./db.json"
AI_CONFIG = {
    "doubao": {
        "api_key": "your-api-key-here",
        "base_url": "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
        "model": "ep-20260304151850-xqxr9"
    }
}

# 创建上传目录
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ===================== 数据管理 =====================
def load_db():
    """加载本地JSON数据库"""
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    # 默认初始化数据（和原Node代码一致）
    return {
        "knowledgeItems": [],
        "categories": [
            {"id": "1", "name": "内置 Key", "parentId": None, "isBuiltin": True},
            {"id": "2", "name": "基础属性", "parentId": "1", "isBuiltin": True},
            {"id": "3", "name": "统计属性", "parentId": "1", "isBuiltin": True},
            {"id": "4", "name": "评价属性", "parentId": "1", "isBuiltin": True},
            {"id": "5", "name": "时间属性", "parentId": "1", "isBuiltin": True},
            {"id": "6", "name": "媒体属性", "parentId": "1", "isBuiltin": True},
            {"id": "7", "name": "文献属性", "parentId": "1", "isBuiltin": True},
            {"id": "8", "name": "自定义 Key", "parentId": None, "isBuiltin": False},
        ],
        "keyDefinitions": [
            {"id": "1", "name": "file_path", "categoryId": "2", "isBuiltin": True, "dataType": "string", "script": "", "description": "文件路径"},
            {"id": "2", "name": "file_type", "categoryId": "2", "isBuiltin": True, "dataType": "string", "script": "", "description": "文件类型"},
            {"id": "3", "name": "click_count", "categoryId": "3", "isBuiltin": True, "dataType": "number", "script": "", "description": "点击次数"},
        ]
    }

def save_db(db_data):
    """保存数据到文件"""
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db_data, f, ensure_ascii=False, indent=2)

# 全局数据
db = load_db()

# ===================== 核心接口 =====================
# 1. 知识项接口
@app.get("/api/knowledge")
def get_knowledge():
    # 数据迁移：将旧数据的 starRating 和 clickCount 迁移到 keyValues
    migrated_items = []
    for item in db["knowledgeItems"]:
        # 创建一个新的项目对象
        migrated_item = {**item}
        
        # 确保 keyValues 存在
        if "keyValues" not in migrated_item:
            migrated_item["keyValues"] = []
        
        # 迁移 starRating 到 keyValues
        if "starRating" in migrated_item:
            # 检查 keyValues 中是否已有 star_rating
            has_star_rating = any(kv.get("keyId") == "10" for kv in migrated_item["keyValues"])
            if not has_star_rating:
                migrated_item["keyValues"].append({
                    "keyId": "10",
                    "value": migrated_item["starRating"]
                })
            # 删除根级别的 starRating
            del migrated_item["starRating"]
        
        # 迁移 clickCount 到 keyValues
        if "clickCount" in migrated_item:
            # 检查 keyValues 中是否已有 click_count
            has_click_count = any(kv.get("keyId") == "3" for kv in migrated_item["keyValues"])
            if not has_click_count:
                migrated_item["keyValues"].append({
                    "keyId": "3",
                    "value": migrated_item["clickCount"]
                })
            # 删除根级别的 clickCount
            del migrated_item["clickCount"]
        
        # 迁移 filePath 到 keyValues
        if "filePath" in migrated_item:
            # 检查 keyValues 中是否已有 file_path
            has_file_path = any(kv.get("keyId") == "1" for kv in migrated_item["keyValues"])
            if not has_file_path:
                migrated_item["keyValues"].append({
                    "keyId": "1",
                    "value": migrated_item["filePath"]
                })
        
        # 迁移 fileType 到 keyValues
        if "fileType" in migrated_item:
            # 检查 keyValues 中是否已有 file_type
            has_file_type = any(kv.get("keyId") == "2" for kv in migrated_item["keyValues"])
            if not has_file_type:
                migrated_item["keyValues"].append({
                    "keyId": "2",
                    "value": migrated_item["fileType"]
                })
        
        migrated_items.append(migrated_item)
    
    return migrated_items

@app.post("/api/knowledge")
def add_knowledge(item: dict):
    # 确保 keyValues 存在
    if "keyValues" not in item:
        item["keyValues"] = []
    
    # 检查并添加必要的 keyValues
    # 检查是否已有 click_count
    has_click_count = any(kv.get("keyId") == "3" for kv in item["keyValues"])
    if not has_click_count:
        item["keyValues"].append({
            "keyId": "3",
            "value": 0
        })
    
    # 检查是否已有 star_rating
    has_star_rating = any(kv.get("keyId") == "10" for kv in item["keyValues"])
    if not has_star_rating:
        item["keyValues"].append({
            "keyId": "10",
            "value": 0
        })
    
    new_item = {
        "id": str(len(db["knowledgeItems"]) + 1),
        **item,
        "createdAt": datetime.now().isoformat()
    }
    db["knowledgeItems"].append(new_item)
    save_db(db)
    return new_item

@app.put("/api/knowledge/{item_id}")
def update_knowledge(item_id: str, item: dict):
    # 查找要更新的项
    for i, existing_item in enumerate(db["knowledgeItems"]):
        if existing_item["id"] == item_id:
            # 更新项
            db["knowledgeItems"][i] = {
                **existing_item,
                **item
            }
            save_db(db)
            return db["knowledgeItems"][i]
    # 如果没有找到项
    raise HTTPException(status_code=404, detail="Item not found")

# 2. 文件上传
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}-{file.filename}")
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # 提取文件名
    file_name = file.filename
    
    new_item = {
        "id": str(len(db["knowledgeItems"]) + 1),
        "filePath": file_path,
        "fileType": file.content_type,
        "createdAt": datetime.now().isoformat(),
        "keyValues": [
            {"keyId": "1", "value": file_path},           # file_path
            {"keyId": "2", "value": file.content_type},  # file_type
            {"keyId": "3", "value": 0},                 # click_count
            {"keyId": "10", "value": 0},                # star_rating
            {"keyId": "11", "value": file_name}         # file_name
        ]
    }
    db["knowledgeItems"].append(new_item)
    save_db(db)
    return new_item

# 3. 分类 & Key 接口
@app.get("/api/categories")
def get_categories():
    return db["categories"]

@app.get("/api/keys")
def get_keys():
    return db["keyDefinitions"]

# 4. 豆包 AI 检索
@app.post("/api/ai/search")
async def ai_search(query: dict):
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                AI_CONFIG["doubao"]["base_url"],
                headers={
                    "Authorization": f"Bearer {AI_CONFIG['doubao']['api_key']}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": AI_CONFIG["doubao"]["model"],
                    "messages": [
                        {"role": "system", "content": "你是语义检索助手"},
                        {"role": "user", "content": f"查询：{query['query']} 数据：{json.dumps(db['knowledgeItems'])}"}
                    ]
                }
            )
        return resp.json()
    except:
        # 降级：本地关键词匹配
        return [item for item in db["knowledgeItems"] if query['query'].lower() in item.get("filePath", "").lower()]

# 5. 健康检查
@app.get("/api/health")
def health():
    return {"status": "ok"}

# ===================== 启动服务 =====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)