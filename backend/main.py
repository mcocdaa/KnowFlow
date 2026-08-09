# @file backend/main.py
# @brief 项目入口（替代原app.py）
# @create 2026-03-06 10:00:00

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api import register_routers
from config.settings import API_VERSION, CORS_ORIGINS, UPLOAD_DIR
from core import plugin_manager
from managers.category_manager import category_manager
from managers.db_manager import db_manager
from managers.key_manager import key_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db_manager.initialize()
    await category_manager.initialize()
    await key_manager.initialize()

    plugin_manager.initialize(app)
    await plugin_manager.load_all_plugins()

    yield

    await db_manager.close()


app = FastAPI(title="KnowFlow Python Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(f"/api/{API_VERSION}/health")
async def health_check():
    return {"status": "ok"}


register_routers(app)

app.mount(f"/api/{API_VERSION}/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=3000)
