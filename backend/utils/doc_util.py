# @file backend/utils/doc_util.py
# @brief MongoDB 文档转换共享工具
# @create 2026-08-08 10:00:00

from typing import Any


def convert_doc(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    """将 _id 转换为字符串 id 字段（返回新 dict，不修改入参）"""
    if not doc:
        return None
    converted = dict(doc)
    if "_id" in converted:
        converted["id"] = str(converted.pop("_id"))
    return converted


def convert_docs(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """批量转换文档"""
    return [convert_doc(doc) for doc in docs]
