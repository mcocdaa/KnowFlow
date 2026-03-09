#!/bin/bash

SECRETS_DIR="$(dirname "$0")/../backend/.secrets"

mkdir -p "$SECRETS_DIR"

echo "请输入密钥名称 (例如: doubao_api_key):"
read -r secret_name

if [ -z "$secret_name" ]; then
    echo "错误: 密钥名称不能为空"
    exit 1
fi

echo "请输入密钥值:"
read -r secret_value

if [ -z "$secret_value" ]; then
    echo "错误: 密钥值不能为空"
    exit 1
fi

SECRET_PATH="$SECRETS_DIR/$secret_name"
echo "$secret_value" > "$SECRET_PATH"

echo "密钥已保存到: $SECRET_PATH"
chmod 600 "$SECRET_PATH"
