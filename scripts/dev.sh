#!/bin/bash

# 启动开发环境

# 启动前端开发服务器
echo "Starting frontend development server..."
cd frontend && npm run dev &

# 启动后端服务
echo "Starting backend server..."
cd ../backend/py && python app.py &

echo "Development environment started!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"