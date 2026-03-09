# @file backend/api/v1/category.py
# @brief 分类管理接口
# @create 2026-03-06 10:00:00

from fastapi import APIRouter, HTTPException
from managers.category_manager import category_manager

router = APIRouter()

@router.get("/categories")
async def get_categories():
    try:
        return await category_manager.get_all()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/categories/{category_id}")
async def get_category(category_id: int):
    try:
        category = await category_manager.get_by_id(category_id)
        if category is None:
            raise HTTPException(status_code=404, detail=f"category with id {category_id} does not exist")
        return category
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/categories")
async def create_category(category: dict):
    try:
        return await category_manager.create(category)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/categories/{category_id}")
async def update_category(category_id: int, updates: dict):
    try:
        return await category_manager.update(category_id, updates)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/categories/{category_id}")
async def delete_category(category_id: int):
    try:
        await category_manager.delete(category_id)
        return {"message": "Category deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
