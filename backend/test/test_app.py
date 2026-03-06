import pytest
from fastapi.testclient import TestClient
import os
import json
import shutil
import sys

# 添加父目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app

# 创建测试客户端
client = TestClient(app)

# 测试前准备
@pytest.fixture
def setup_and_teardown():
    # 保存原始的db.json文件内容
    db_file = './db.json'
    original_db_content = None
    if os.path.exists(db_file):
        with open(db_file, 'r', encoding='utf-8') as f:
            original_db_content = f.read()
    
    # 清理测试环境
    if os.path.exists(db_file):
        os.remove(db_file)
    
    # 清理uploads目录
    upload_dir = './uploads'
    if os.path.exists(upload_dir):
        shutil.rmtree(upload_dir)
    
    yield
    
    # 测试后清理
    if os.path.exists(db_file):
        os.remove(db_file)
    
    if os.path.exists(upload_dir):
        shutil.rmtree(upload_dir)
    
    # 恢复原始的db.json文件内容
    if original_db_content:
        with open(db_file, 'w', encoding='utf-8') as f:
            f.write(original_db_content)

# 测试健康检查
def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

# 测试获取知识项
def test_get_knowledge():
    response = client.get("/api/knowledge")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# 测试添加知识项
def test_add_knowledge():
    new_item = {
        "title": "Test Knowledge Item",
        "content": "This is a test knowledge item"
    }
    
    response = client.post("/api/knowledge", json=new_item)
    assert response.status_code == 200
    assert "id" in response.json()
    assert response.json()["title"] == new_item["title"]
    assert response.json()["content"] == new_item["content"]

# 测试获取分类
def test_get_categories():
    response = client.get("/api/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

# 测试获取Key定义
def test_get_keys():
    response = client.get("/api/keys")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

# 测试AI搜索
def test_ai_search():
    search_query = {
        "query": "test"
    }
    
    response = client.post("/api/ai/search", json=search_query)
    assert response.status_code == 200

# 测试文件上传
def test_upload_file():
    # 创建一个测试文件
    test_content = b"This is a test file"
    
    response = client.post(
        "/api/upload",
        files={"file": ("test.txt", test_content, "text/plain")}
    )
    
    assert response.status_code == 200
    assert "id" in response.json()
    assert "filePath" in response.json()
    assert "fileType" in response.json()
    assert response.json()["fileType"] == "text/plain"

if __name__ == "__main__":
    pytest.main([__file__])