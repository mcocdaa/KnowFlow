# @file backend/config/settings.py
# @brief 项目配置：端口、目录、AI密钥、跨域、MongoDB
# @create 2026-03-06 10:00:00

import os
import sys
from enum import Enum
from dotenv import load_dotenv

load_dotenv()


class Environment(Enum):
    DEVELOPMENT = "development"
    PRODUCTION = "production"


# Secrets 配置：定义每个 secret 的重要性级别
SECRETS_CONFIG = {
    "MONGODB_URL": {
        "required": True,
        "error_msg": "MongoDB 连接 URL 未配置",
        "warning_msg": "MongoDB 连接 URL 未配置"
    },
    "DOUBAO_API_KEY": {
        "required": False,
        "warning_msg": "AI 功能（语义搜索）将不可用。如需启用，请配置 DOUBAO_API_KEY"
    }
}


def read_secret(secret_name: str, default: str = "") -> str:
    """读取 secret 支持 _FILE 后缀从环境变量指定文件读取"""
    file_env_var = f"{secret_name}_FILE"
    if file_env_var in os.environ:
        file_path = os.environ[file_env_var]
        if os.path.exists(file_path):
            with open(file_path, "r") as f:
                return f.read().strip()

    secrets_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "secrets")
    secret_path = os.path.join(secrets_dir, secret_name)
    if os.path.exists(secret_path):
        with open(secret_path, "r") as f:
            return f.read().strip()

    if secret_name in os.environ:
        return os.environ[secret_name]

    return default


def validate_secrets():
    """
    分级验证 secrets（支持 Docker Secrets 和本地文件两种模式）
    - required=True: 缺失时报错，阻断启动
    - required=False: 缺失时警告，继续启动
    """
    warnings = []
    errors = []

    for secret_name, config in SECRETS_CONFIG.items():
        secret_value = read_secret(secret_name, "")
        is_missing = not secret_value.strip()

        if is_missing:
            if config.get("required", False):
                errors.append(f"  - {secret_name}: {config.get('error_msg', 'Required')}")
            else:
                warnings.append(f"  - {secret_name}: {config['warning_msg']}")

    # 打印警告（不阻断启动）
    if warnings:
        print("\n" + "=" * 60, file=sys.stderr)
        print("⚠️  Secrets 警告（部分功能受限）：", file=sys.stderr)
        for w in warnings:
            print(f"   {w}", file=sys.stderr)
        print("=" * 60 + "\n", file=sys.stderr)

    # 报错（阻断启动）
    if errors:
        raise RuntimeError(
            "\n" + "=" * 60 + "\n"
            "❌ 缺少必需的 Secrets 配置：\n" +
            "\n".join(errors) +
            "\n\n请通过以下方式之一配置：\n"
            "1. Docker: 设置 {SECRET_NAME}_FILE 环境变量指向 secret 文件\n"
            "2. 本地: 在 secrets/ 目录下创建对应文件\n"
            "3. 环境变量: 直接设置 {SECRET_NAME} 环境变量\n"
            "=" * 60
        )


# 运行验证
validate_secrets()


API_VERSION = os.getenv("API_VERSION", "v1")

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

DATA_DIR = os.getenv("DATA_DIR", "./data")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./data/uploads")

KEYS_PATH = os.getenv("KEYS_PATH", os.path.join(DATA_DIR, "keys.yaml"))
DEFAULT_KEYS_PATH = os.getenv("DEFAULT_KEYS_PATH", os.path.join(DATA_DIR, "default", "keys.yaml"))
CATEGORIES_PATH = os.getenv("CATEGORIES_PATH", os.path.join(DATA_DIR, "categories.yaml"))
DEFAULT_CATEGORIES_PATH = os.getenv("DEFAULT_CATEGORIES_PATH", os.path.join(DATA_DIR, "default", "categories.yaml"))

PLUGINS_DIR = os.getenv("PLUGINS_DIR", os.path.join(PROJECT_ROOT, "plugins"))

MONGODB_URL = read_secret("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "knowflow")
DB_RETRY_COUNT = int(os.getenv("DB_RETRY_COUNT", "3"))

AI_CONFIG = {
    "doubao": {
        "api_key": read_secret("DOUBAO_API_KEY", ""),
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
