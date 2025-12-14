#!/bin/bash

echo "🌾 Conflux Farm - 启动脚本"
echo "=========================="

# 检查 Go 是否安装
if ! command -v go &> /dev/null; then
    echo "❌ Go 未安装，请先安装 Go 1.21+"
    exit 1
fi

# 检查 MySQL 是否运行
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL 未安装，将使用 Docker 启动"
    
    # 检查 Docker 是否安装
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安装，请安装 Docker 或 MySQL"
        exit 1
    fi
    
    echo "🐳 启动 MySQL Docker 容器..."
    docker run -d \
        --name conflux-farm-mysql \
        -e MYSQL_ROOT_PASSWORD=password \
        -e MYSQL_DATABASE=conflux_farm \
        -p 3306:3306 \
        mysql:8.0
    
    echo "⏳ 等待 MySQL 启动..."
    sleep 10
fi

# 创建 .env 文件（如果不存在）
if [ ! -f .env ]; then
    echo "📝 创建 .env 配置文件..."
    cp .env.example .env
fi

# 下载依赖
echo "📦 下载 Go 依赖..."
go mod download

# 启动应用
echo "🚀 启动应用..."
echo "访问地址: http://localhost:8080"
echo "API 测试: http://localhost:8080/test_api.html"
echo ""

go run main.go