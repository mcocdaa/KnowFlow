# @file backend/api/errors.py
# @brief 统一响应 envelope 与全局异常处理
# @create 2026-08-09 10:00:00

import logging

from bson.errors import InvalidId
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pymongo.errors import DuplicateKeyError

logger = logging.getLogger(__name__)


def ok(data=None, message: str = "ok") -> dict:
    """成功响应 envelope"""
    return {"code": 0, "message": message, "data": data}


def fail(code: int, message: str) -> dict:
    """失败响应 envelope"""
    return {"code": code, "message": message, "data": None}


def register_exception_handlers(app: FastAPI) -> None:
    """注册全局异常处理器，统一错误响应结构"""

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(status_code=exc.status_code, content=fail(exc.status_code, str(exc.detail)))

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(status_code=400, content=fail(400, str(exc)))

    @app.exception_handler(InvalidId)
    async def invalid_id_handler(request: Request, exc: InvalidId):
        return JSONResponse(status_code=404, content=fail(404, "invalid id"))

    @app.exception_handler(DuplicateKeyError)
    async def duplicate_key_handler(request: Request, exc: DuplicateKeyError):
        return JSONResponse(status_code=400, content=fail(400, "resource already exists"))

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
        return JSONResponse(status_code=500, content=fail(500, "Internal server error"))
