# @file backend/api/v1/ai.py
# @brief AI 能力接口：语义检索、自动打标签（基于豆包 Doubao）
# @create 2026-08-08 10:00:00

import json
import logging
import re
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from api.errors import ok
from config.settings import AI_CONFIG

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_ITEMS = 50
MAX_QUERY_LENGTH = 500
TIMEOUT_SECONDS = 60.0


class ItemBrief(BaseModel):
    id: str
    name: str = ""
    keyValues: dict[str, Any] = {}


class AISearchRequest(BaseModel):
    query: str
    items: list[ItemBrief] = []


class AITagRequest(BaseModel):
    items: list[ItemBrief] = []


def _doubao_config() -> dict[str, str]:
    config = AI_CONFIG["doubao"]
    if not config.get("api_key"):
        raise HTTPException(status_code=503, detail="AI 功能未启用，请配置 DOUBAO_API_KEY")
    return config


async def _chat_completion(messages: list[dict[str, str]]) -> str:
    """调用豆包 Chat Completions，返回模型回复文本"""
    config = _doubao_config()
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            response = await client.post(
                config["base_url"],
                headers={
                    "Authorization": f"Bearer {config['api_key']}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": config["model"],
                    "messages": messages,
                    "temperature": 0.2,
                },
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI 服务调用超时")
    except httpx.HTTPError as e:
        logger.error(f"Doubao API 请求失败: {e}")
        raise HTTPException(status_code=502, detail="AI 服务调用失败")

    if response.status_code != 200:
        logger.error(f"Doubao API 调用失败: {response.status_code} {response.text[:500]}")
        raise HTTPException(status_code=502, detail="AI 服务调用失败")

    try:
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except (ValueError, KeyError, TypeError, IndexError) as e:
        logger.error(f"Doubao API 响应格式错误: {e}")
        raise HTTPException(status_code=502, detail="AI 服务响应格式错误")


def _parse_json(text: str) -> Any:
    """从模型输出中提取 JSON（容忍代码块包裹与前后噪声）"""
    text = text.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
    if fenced:
        text = fenced.group(1)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


@router.post("/ai/search")
async def ai_search(payload: AISearchRequest):
    """语义检索：基于 LLM 从候选知识项中筛选与查询最相关的结果"""
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="query 不能为空")
    if len(query) > MAX_QUERY_LENGTH:
        raise HTTPException(status_code=400, detail=f"query 长度不能超过 {MAX_QUERY_LENGTH} 字符")

    items = payload.items[:MAX_ITEMS]
    if not items:
        return ok([])

    catalog = "\n".join(
        f"{i}. id: {item.id}, name: {item.name}, attributes: {json.dumps(item.keyValues, ensure_ascii=False)}"
        for i, item in enumerate(items, start=1)
    )

    messages = [
        {
            "role": "system",
            "content": (
                "你是知识库检索助手。根据查询从候选项中选出最相关的条目，"
                '只输出匹配条目的 id 的 JSON 数组，例如 ["id1", "id2"]。'
                "没有匹配时输出 []。不要输出其他内容。"
            ),
        },
        {"role": "user", "content": f"查询：{query}\n候选项：\n{catalog}"},
    ]

    content = await _chat_completion(messages)
    ids = _parse_json(content)
    if not isinstance(ids, list):
        logger.warning(f"AI 检索输出解析失败: {content[:200]}")
        return ok([])

    matched_ids = set(ids)
    return ok([item.model_dump() for item in items if item.id in matched_ids])


@router.post("/ai/auto-tag")
async def auto_tag(payload: AITagRequest):
    """自动打标签：为每个知识项生成简短标签"""
    items = payload.items[:MAX_ITEMS]
    if not items:
        return ok({"results": {}})

    catalog = "\n".join(f"{i}. id: {item.id}, name: {item.name}" for i, item in enumerate(items, start=1))

    messages = [
        {
            "role": "system",
            "content": (
                "你是知识管理助手。为每个知识项生成 2-5 个中文标签。"
                "只输出 JSON 对象，键为条目 id，值为标签字符串数组，"
                '例如 {"id1": ["标签A", "标签B"]}。不要输出其他内容。'
            ),
        },
        {"role": "user", "content": f"知识项列表：\n{catalog}"},
    ]

    content = await _chat_completion(messages)
    results = _parse_json(content)
    if not isinstance(results, dict):
        logger.warning(f"AI 打标签输出解析失败: {content[:200]}")
        return ok({"results": {}})

    return ok({"results": {item.id: results.get(item.id, []) for item in items}})
