# @file backend/test/test_upload_api.py
# @brief 文件上传接口单元测试
# @create 2026-08-09 10:00:00

import io
import json
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.errors import register_exception_handlers


@pytest.fixture
def app():
    app = FastAPI()
    register_exception_handlers(app)
    with patch("api.deps.item_manager") as mock_item_manager:
        mock_item_manager.create = AsyncMock()
        mock_item_manager.get_required_key_defs = AsyncMock(return_value=[])
        app.include_router(__import__("api.v1.upload", fromlist=["router"]).router)
        yield app, mock_item_manager


@pytest.fixture
def client(app):
    app_obj, _ = app
    return TestClient(app_obj, raise_server_exceptions=False)


def make_upload(data: bytes, filename: str = "test.txt", content_type: str = "text/plain"):
    return {
        "files": {"file": (filename, io.BytesIO(data), content_type)},
        "data": {"data": json.dumps({"keyValues": {"name": filename}})},
    }


class TestUpload:
    def test_upload_success(self, app, client):
        _, mock_item_manager = app
        mock_item_manager.create.return_value = {"item": {"id": "item_1", "name": "test.txt"}, "attributes": {}}

        response = client.post("/upload", **make_upload(b"hello"))

        assert response.status_code == 200
        assert response.json()["code"] == 0
        mock_item_manager.create.assert_called_once()

    def test_upload_invalid_json(self, client):
        response = client.post(
            "/upload",
            files={"file": ("a.txt", io.BytesIO(b"x"), "text/plain")},
            data={"data": "not-json"},
        )

        assert response.status_code == 400
        assert "Invalid JSON" in response.json()["message"]

    def test_upload_missing_required_key(self, app, client):
        _, mock_item_manager = app
        mock_item_manager.get_required_key_defs = AsyncMock(return_value=[{"name": "rating"}])

        response = client.post("/upload", **make_upload(b"hello"))

        assert response.status_code == 400
        assert "Missing required key" in response.json()["message"]

    def test_upload_file_too_large(self, app, client):
        _, mock_item_manager = app
        from config.settings import MAX_UPLOAD_SIZE

        response = client.post("/upload", **make_upload(b"x" * (MAX_UPLOAD_SIZE + 1)))

        assert response.status_code == 413
        assert "超过上限" in response.json()["message"]

    def test_upload_create_error_cleans_file(self, app, client):
        _, mock_item_manager = app
        mock_item_manager.create.side_effect = ValueError("boom")

        from api.v1 import upload

        with patch.object(upload, "_cleanup_file") as mock_cleanup:
            response = client.post("/upload", **make_upload(b"hello"))

        assert response.status_code == 400
        mock_cleanup.assert_called_once()
