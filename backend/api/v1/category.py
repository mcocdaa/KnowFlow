# @file backend/api/v1/category.py
# @brief 分类管理接口
# @create 2026-03-06 10:00:00


from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from managers.category_manager import category_manager

router = APIRouter()


class CategoryCreate(BaseModel):
    name: str
    title: str
    parent_name: str | None = None
    is_builtin: bool = False


class CategoryUpdate(BaseModel):
    name: str | None = None
    title: str | None = None
    parent_name: str | None = None
    is_builtin: bool | None = None


@router.get("/categories")
async def get_categories():
    try:
        return await category_manager.get_all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories/{category_id}")
async def get_category(category_id: str):
    try:
        category = await category_manager.get_by_id(category_id)
        if category is None:
            raise HTTPException(status_code=404, detail=f"category with id {category_id} does not exist")
        return category
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/categories")
async def create_category(category: CategoryCreate):
    try:
        return await category_manager.create(category.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/categories/{category_name}")
async def update_category(category_name: str, updates: CategoryUpdate):
    try:
        return await category_manager.update(category_name, updates.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/categories/{category_name}")
async def delete_category(category_name: str):
    try:
        await category_manager.delete(category_name)
        return {"message": "Category deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
