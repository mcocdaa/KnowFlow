# @file plugins/knowflow_openclaw/backend.py
# @brief KnowFlow OpenClaw桥接插件后端，提供OpenClaw属性的CRUD接口
# @create 2026-03-12 10:00:00

import logging
from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from api.errors import ok
from managers.item_manager import item_manager

logger = logging.getLogger(__name__)

router = APIRouter()

ARCHIVE_TYPES = ["requirement", "code", "test", "document", "flow_record"]
MIN_FOLD_LEVEL = 1
MAX_FOLD_LEVEL = 3

OPENCLAW_FIELDS = [
    "openclaw_project_id",
    "openclaw_archive_type",
    "openclaw_fold_level",
    "openclaw_agent_source",
    "openclaw_summary",
    "openclaw_flow_id",
]


class OpenClawAttributes(BaseModel):
    openclaw_project_id: str
    openclaw_archive_type: Optional[str] = "document"
    openclaw_fold_level: Optional[int] = 3
    openclaw_agent_source: Optional[str] = ""
    openclaw_summary: Optional[str] = ""
    openclaw_flow_id: Optional[str] = ""


def _validate_openclaw_fields(data: dict[str, Any]):
    """校验 OpenClaw 字段合法性"""
    if "openclaw_project_id" in data and not str(data["openclaw_project_id"]).strip():
        raise HTTPException(status_code=400, detail="openclaw_project_id不能为空")

    if "openclaw_archive_type" in data and data["openclaw_archive_type"] not in ARCHIVE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="归档类型必须是requirement / code / test / document / flow_record之一",
        )

    if "openclaw_fold_level" in data:
        fold_level = data["openclaw_fold_level"]
        if not isinstance(fold_level, int) or not MIN_FOLD_LEVEL <= fold_level <= MAX_FOLD_LEVEL:
            raise HTTPException(status_code=400, detail="折叠层级必须是1-3之间的整数")


@router.put("/items/{item_id}/openclaw")
async def update_openclaw_attributes(item_id: str, data: OpenClawAttributes) -> dict[str, Any]:
    _validate_openclaw_fields(data.model_dump())

    attributes = {field: getattr(data, field) for field in OPENCLAW_FIELDS}

    updated = await item_manager.update(item_id, {"attributes": attributes})
    if updated is None:
        raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
    return ok(attributes)


@router.get("/items/{item_id}/openclaw")
async def get_openclaw_attributes(item_id: str) -> dict[str, Any]:
    item = await item_manager.get_by_id(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
    attributes = item.get("attributes", {})

    result = {field: attributes.get(field, "") for field in OPENCLAW_FIELDS}
    result["openclaw_archive_type"] = attributes.get("openclaw_archive_type", "document")
    result["openclaw_fold_level"] = attributes.get("openclaw_fold_level", 3)

    return ok(result)


@router.patch("/items/{item_id}/openclaw")
async def patch_openclaw_attributes(item_id: str, data: dict[str, Any]) -> dict[str, Any]:
    _validate_openclaw_fields(data)

    update_data = {k: v for k, v in data.items() if k in OPENCLAW_FIELDS}

    if not update_data:
        raise HTTPException(status_code=400, detail="没有有效的更新字段")

    updated = await item_manager.update(item_id, {"attributes": update_data})
    if updated is None:
        raise HTTPException(status_code=404, detail=f"item with id {item_id} does not exist")
    return ok(update_data)


async def register_openclaw_category():
    """注册openclaw_category分类"""
    from managers.category_manager import category_manager

    existing = await category_manager.get_by_name("openclaw_category")
    if existing:
        logger.info("[KnowFlowOpenClawPlugin] openclaw_category分类已存在，跳过创建")
        return

    category_data = {
        "name": "openclaw_category",
        "title": "OpenClaw集成",
        "parent_name": None,
        "is_builtin": False,
    }

    await category_manager.create(category_data)
    logger.info("[KnowFlowOpenClawPlugin] 成功创建openclaw_category分类")


async def on_load():
    logger.info("[KnowFlowOpenClawPlugin] KnowFlow OpenClaw桥接插件加载中...")
    await register_openclaw_category()
    logger.info("[KnowFlowOpenClawPlugin] KnowFlow OpenClaw桥接插件已加载")


async def on_unload():
    logger.info("[KnowFlowOpenClawPlugin] KnowFlow OpenClaw桥接插件已卸载")
