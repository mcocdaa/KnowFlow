# @file backend/test/test_ai_api.py
# @brief AI 接口单元测试（语义检索 / 自动打标签）
# @create 2026-08-09 10:00:00

from unittest.mock import patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.errors import register_exception_handlers


@pytest.fixture
def app():
    app = FastAPI()
    register_exception_handlers(app)
    import api.v1.ai as ai_module

    app.include_router(ai_module.router)
    return app, ai_module


@pytest.fixture
def client(app):
    app_obj, _ = app
    return TestClient(app_obj, raise_server_exceptions=False)


class TestAISearch:
    def test_search_empty_query(self, client):
        response = client.post("/ai/search", json={"query": "  ", "items": []})

        assert response.status_code == 400
        assert "query" in response.json()["message"]

    def test_search_query_too_long(self, client):
        response = client.post("/ai/search", json={"query": "x" * 501, "items": []})

        assert response.status_code == 400
        assert "长度不能超过" in response.json()["message"]

    def test_search_no_items(self, client):
        response = client.post("/ai/search", json={"query": "hello", "items": []})

        assert response.status_code == 200
        assert response.json()["data"] == []

    def test_search_returns_matched_ids(self, app, client):
        _, ai_module = app

        class FakeResponse:
            status_code = 200

            def json(self):
                return {"choices": [{"message": {"content": '["id_1", "id_3"]'}}]}

        async def fake_post(*args, **kwargs):
            return FakeResponse()

        with (
            patch.object(
                ai_module, "_doubao_config", return_value={"api_key": "k", "base_url": "http://x", "model": "m"}
            ),
            patch("httpx.AsyncClient") as mock_client,
        ):
            mock_client.return_value.__aenter__.return_value.post = fake_post

            response = client.post(
                "/ai/search",
                json={
                    "query": "深度学习",
                    "items": [
                        {"id": "id_1", "name": "A", "keyValues": {}},
                        {"id": "id_2", "name": "B", "keyValues": {}},
                        {"id": "id_3", "name": "C", "keyValues": {}},
                    ],
                },
            )

            assert response.status_code == 200
            ids = [item["id"] for item in response.json()["data"]]
            assert ids == ["id_1", "id_3"]

    def test_search_unparseable_output_returns_empty(self, app, client):
        _, ai_module = app

        class FakeResponse:
            status_code = 200

            def json(self):
                return {"choices": [{"message": {"content": "not json at all"}}]}

        async def fake_post(*args, **kwargs):
            return FakeResponse()

        with (
            patch.object(
                ai_module, "_doubao_config", return_value={"api_key": "k", "base_url": "http://x", "model": "m"}
            ),
            patch("httpx.AsyncClient") as mock_client,
        ):
            mock_client.return_value.__aenter__.return_value.post = fake_post

            response = client.post(
                "/ai/search",
                json={"query": "q", "items": [{"id": "id_1", "name": "A", "keyValues": {}}]},
            )

            assert response.status_code == 200
            assert response.json()["data"] == []

    def test_search_timeout_maps_to_504(self, app, client):
        import httpx

        _, ai_module = app

        async def fake_post(*args, **kwargs):
            raise httpx.TimeoutException("timeout")

        with (
            patch.object(
                ai_module, "_doubao_config", return_value={"api_key": "k", "base_url": "http://x", "model": "m"}
            ),
            patch("httpx.AsyncClient") as mock_client,
        ):
            mock_client.return_value.__aenter__.return_value.post = fake_post

            response = client.post(
                "/ai/search",
                json={"query": "q", "items": [{"id": "id_1", "name": "A", "keyValues": {}}]},
            )

            assert response.status_code == 504

    def test_search_bad_upstream_status_maps_to_502(self, app, client):
        _, ai_module = app

        class FakeResponse:
            status_code = 500
            text = "upstream error"

        async def fake_post(*args, **kwargs):
            return FakeResponse()

        with (
            patch.object(
                ai_module, "_doubao_config", return_value={"api_key": "k", "base_url": "http://x", "model": "m"}
            ),
            patch("httpx.AsyncClient") as mock_client,
        ):
            mock_client.return_value.__aenter__.return_value.post = fake_post

            response = client.post(
                "/ai/search",
                json={"query": "q", "items": [{"id": "id_1", "name": "A", "keyValues": {}}]},
            )

            assert response.status_code == 502

    def test_search_malformed_upstream_json_maps_to_502(self, app, client):
        _, ai_module = app

        class FakeResponse:
            status_code = 200

            def json(self):
                raise ValueError("bad json")

        async def fake_post(*args, **kwargs):
            return FakeResponse()

        with (
            patch.object(
                ai_module, "_doubao_config", return_value={"api_key": "k", "base_url": "http://x", "model": "m"}
            ),
            patch("httpx.AsyncClient") as mock_client,
        ):
            mock_client.return_value.__aenter__.return_value.post = fake_post

            response = client.post(
                "/ai/search",
                json={"query": "q", "items": [{"id": "id_1", "name": "A", "keyValues": {}}]},
            )

            assert response.status_code == 502

    def test_search_missing_api_key_maps_to_503(self, app, client):
        _, ai_module = app

        with patch.object(ai_module, "_doubao_config", side_effect=__import__("fastapi").HTTPException(503)):
            response = client.post(
                "/ai/search",
                json={"query": "q", "items": [{"id": "id_1", "name": "A", "keyValues": {}}]},
            )

            assert response.status_code == 503


class TestAutoTag:
    def test_auto_tag_no_items(self, client):
        response = client.post("/ai/auto-tag", json={"items": []})

        assert response.status_code == 200
        assert response.json()["data"]["results"] == {}

    def test_auto_tag_returns_results(self, app, client):
        _, ai_module = app

        class FakeResponse:
            status_code = 200

            def json(self):
                return {"choices": [{"message": {"content": '{"id_1": ["标签A"]}'}}]}

        async def fake_post(*args, **kwargs):
            return FakeResponse()

        with (
            patch.object(
                ai_module, "_doubao_config", return_value={"api_key": "k", "base_url": "http://x", "model": "m"}
            ),
            patch("httpx.AsyncClient") as mock_client,
        ):
            mock_client.return_value.__aenter__.return_value.post = fake_post

            response = client.post(
                "/ai/auto-tag",
                json={"items": [{"id": "id_1", "name": "A", "keyValues": {}}]},
            )

            assert response.status_code == 200
            assert response.json()["data"]["results"] == {"id_1": ["标签A"]}
