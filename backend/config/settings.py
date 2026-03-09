# @file backend/config/settings.py
# @brief 项目配置：端口、目录、AI密钥、跨域、MongoDB
# @create 2026-03-06 10:00:00

import os
from enum import Enum
from dotenv import load_dotenv

load_dotenv()


class Environment(Enum):
    DEVELOPMENT = "development"
    PRODUCTION = "production"


def read_secret(secret_name: str, default: str = "") -> str:
    secrets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".secrets")
    secret_path = os.path.join(secrets_dir, secret_name)
    if os.path.exists(secret_path):
        with open(secret_path, "r") as f:
            return f.read().strip()
    return default


API_VERSION = os.getenv("API_VERSION", "v1")

DATA_DIR = os.getenv("DATA_DIR", "./data")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./data/uploads")

KEYS_PATH = os.getenv("KEYS_PATH", os.path.join(DATA_DIR, "keys.yaml"))
DEFAULT_KEYS_PATH = os.getenv("DEFAULT_KEYS_PATH", os.path.join(DATA_DIR, "default", "keys.yaml"))
CATEGORIES_PATH = os.getenv("CATEGORIES_PATH", os.path.join(DATA_DIR, "categories.yaml"))
DEFAULT_CATEGORIES_PATH = os.getenv("DEFAULT_CATEGORIES_PATH", os.path.join(DATA_DIR, "default", "categories.yaml"))

PLUGINS_DIR = os.getenv("PLUGINS_DIR", "./plugins")

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "knowflow")
DB_RETRY_COUNT = int(os.getenv("DB_RETRY_COUNT", "3"))

AI_CONFIG = {
    "doubao": {
        "api_key": read_secret("doubao_api_key", ""),
        "base_url": os.getenv("DOUBAO_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3/chat/completions"),
        "model": os.getenv("DOUBAO_MODEL", "ep-20260304151850-xqxr9")
    }
}

CATEGORY_STYLE = {
    'property': ['name', 'title', 'parent_name', 'is_builtin'],
    'default': ['inner_category', 'basic_category', 'time_category', 'custom_category'],
}
KEY_STYLE = {
    'property': ['name', 'title', 'value_type', 'default_value', 'description', 'category_name', 'is_required', 'is_visible', 'plugin_name', 'delete_with_plugin', 'is_public', 'is_private', 'created_at', 'updated_at'],
    'default': ['name', 'file_path', 'file_type', 'created_at'],
}


CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

__all__ = [
    "API_VERSION",
    "DATA_DIR",
    "UPLOAD_DIR",
    "KEYS_PATH",
    "DEFAULT_KEYS_PATH",
    "CATEGORIES_PATH",
    "DEFAULT_CATEGORIES_PATH",
    "PLUGINS_DIR",
    "MONGODB_URL",
    "MONGODB_DB_NAME",
    "DB_RETRY_COUNT",
    "AI_CONFIG",
    "CORS_ORIGINS",
    "CATEGORY_STYLE",
    "KEY_STYLE",
]

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PLUGINS_DIR, exist_ok=True)
