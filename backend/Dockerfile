# backend/Dockerfile
# 官方 Python  slim 镜像（轻量、快速）
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 安装系统依赖（如果需要）
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 先复制 requirements.txt 并安装依赖（利用 Docker 缓存）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 再复制整个项目代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["python", "main.py"]