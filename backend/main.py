# @file backend/main.py
# @brief 项目入口（替代原app.py）
# @create 2026-03-06 10:00:00

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config.settings import CORS_ORIGINS, API_VERSION
from api import register_routers
from managers.db_manager import db_manager
from managers.category_manager import category_manager
from managers.key_manager import key_manager
from core.plugin_loader import PluginLoader, plugin_loader


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db_manager.initialize()
    await category_manager.initialize()
    await key_manager.initialize()
    
    plugin_loader.initialize(app)
    await plugin_loader.load_all_plugins()
    
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

register_routers(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
