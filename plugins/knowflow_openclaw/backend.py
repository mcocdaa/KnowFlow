# @file plugins/knowflow_openclaw/backend.py
# @brief KnowFlow OpenClaw桥接插件后端，提供OpenClaw属性的CRUD接口
# @create 2026-03-12 10:00:00

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional

router = APIRouter()


class OpenClawAttributes(BaseModel):
    openclaw_project_id: str
    openclaw_archive_type: Optional[str] = "document"
    openclaw_fold_level: Optional[int] = 3
    openclaw_agent_source: Optional[str] = ""
    openclaw_summary: Optional[str] = ""
    openclaw_flow_id: Optional[str] = ""


@router.put("/items/{item_id}/openclaw")
async def update_openclaw_attributes(item_id: str, data: OpenClawAttributes) -> Dict[str, Any]:
    if not data.openclaw_project_id.strip():
        raise HTTPException(status_code=400, detail="openclaw_project_id不能为空")

    if data.openclaw_archive_type not in ["requirement", "code", "test", "document", "flow_record"]:
        raise HTTPException(status_code=400, detail="归档类型必须是requirement / code / test / document / flow_record之一")

    if not 1 <= data.openclaw_fold_level <= 3:
        raise HTTPException(status_code=400, detail="折叠层级必须在1-3之间")

    from managers.item_manager import item_manager

    try:
        attributes = {
            "openclaw_project_id": data.openclaw_project_id,
            "openclaw_archive_type": data.openclaw_archive_type,
            "openclaw_fold_level": data.openclaw_fold_level,
            "openclaw_agent_source": data.openclaw_agent_source,
            "openclaw_summary": data.openclaw_summary,
            "openclaw_flow_id": data.openclaw_flow_id
        }

        await item_manager.update(item_id, {"attributes": attributes})
        return {"success": True, "data": attributes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/items/{item_id}/openclaw")
async def get_openclaw_attributes(item_id: str) -> Dict[str, Any]:
    from managers.item_manager import item_manager

    try:
        item = await item_manager.get_by_id(item_id)
        attributes = item.get("attributes", {})

        result = {
            "openclaw_project_id": attributes.get("openclaw_project_id", ""),
            "openclaw_archive_type": attributes.get("openclaw_archive_type", "document"),
            "openclaw_fold_level": attributes.get("openclaw_fold_level", 3),
            "openclaw_agent_source": attributes.get("openclaw_agent_source", ""),
            "openclaw_summary": attributes.get("openclaw_summary", ""),
            "openclaw_flow_id": attributes.get("openclaw_flow_id", "")
        }

        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/items/{item_id}/openclaw")
async def patch_openclaw_attributes(item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    if "openclaw_project_id" in data and not data["openclaw_project_id"].strip():
        raise HTTPException(status_code=400, detail="openclaw_project_id不能为空")

    if "openclaw_archive_type" in data and data["openclaw_archive_type"] not in ["requirement", "code", "test", "document", "flow_record"]:
        raise HTTPException(status_code=400, detail="归档类型必须是requirement / code / test / document / flow_record之一")

    if "openclaw_fold_level" in data and not 1 <= data["openclaw_fold_level"] <= 3:
        raise HTTPException(status_code=400, detail="折叠层级必须在1-3之间")

    from managers.item_manager import item_manager

    try:
        allowed_fields = [
            "openclaw_project_id",
            "openclaw_archive_type",
            "openclaw_fold_level",
            "openclaw_agent_source",
            "openclaw_summary",
            "openclaw_flow_id"
        ]

        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        if not update_data:
            raise HTTPException(status_code=400, detail="没有有效的更新字段")

        await item_manager.update(item_id, {"attributes": update_data})
        return {"success": True, "data": update_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def register_openclaw_category():
    """注册openclaw_category分类"""
    from managers.category_manager import category_manager

    # 检查分类是否已存在
    existing = await category_manager.get_by_name("openclaw_category")
    if existing:
        print("[KnowFlowOpenClawPlugin] openclaw_category分类已存在，跳过创建")
        return

    # 创建新分类（使用category_manager确保数据格式正确）
    category_data = {
        "name": "openclaw_category",
        "title": "OpenClaw集成",
        "parent_name": None,  # 根分类
        "is_builtin": False,
    }

    await category_manager.create(category_data)
    print("[KnowFlowOpenClawPlugin] 成功创建openclaw_category分类")


async def on_load():
    print("[KnowFlowOpenClawPlugin] KnowFlow OpenClaw桥接插件加载中...")
    await register_openclaw_category()
    print("[KnowFlowOpenClawPlugin] KnowFlow OpenClaw桥接插件已加载")


async def on_unload():
    print("[KnowFlowOpenClawPlugin] KnowFlow OpenClaw桥接插件已卸载")
