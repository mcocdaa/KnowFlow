#!/bin/bash

# 安装所有依赖

# 安装前端依赖
echo "Installing frontend dependencies..."
cd frontend && npm install

# 安装后端Node依赖（如果有）
echo "Installing backend Node dependencies..."
cd ../backend/node && npm install

# 安装Python依赖
echo "Installing Python dependencies..."
cd ../py && pip install -r requirements.txt

echo "All dependencies installed successfully!"