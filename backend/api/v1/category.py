# @file backend/api/v1/category.py
# @brief 分类管理接口
# @create 2026-03-06 10:00:00


from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.deps import get_category_manager
from api.errors import ok
from managers.category_manager import CategoryManager

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


@router.get("/categories")
async def get_categories(manager: CategoryManager = Depends(get_category_manager)):
    return ok(await manager.get_all())


@router.get("/categories/{category_id}")
async def get_category(category_id: str, manager: CategoryManager = Depends(get_category_manager)):
    category = await manager.get_by_id(category_id)
    if category is None:
        raise HTTPException(status_code=404, detail=f"category with id {category_id} does not exist")
    return ok(category)


@router.post("/categories")
async def create_category(category: CategoryCreate, manager: CategoryManager = Depends(get_category_manager)):
    return ok(await manager.create(category.model_dump()))


@router.put("/categories/{category_name}")
async def update_category(
    category_name: str,
    updates: CategoryUpdate,
    manager: CategoryManager = Depends(get_category_manager),
):
    return ok(await manager.update(category_name, updates.model_dump(exclude_none=True)))


@router.delete("/categories/{category_name}")
async def delete_category(category_name: str, manager: CategoryManager = Depends(get_category_manager)):
    await manager.delete(category_name)
    return ok(None, "Category deleted successfully")
