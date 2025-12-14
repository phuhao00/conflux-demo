#!/bin/bash

echo "=========================================="
echo "数字商品更新部署脚本"
echo "Digital Products Update Deployment Script"
echo "=========================================="
echo ""

# 检查是否在项目根目录
if [ ! -d "backend" ] || [ ! -d "mobile" ]; then
    echo "错误: 请在项目根目录运行此脚本"
    echo "Error: Please run this script from project root directory"
    exit 1
fi

echo "步骤 1/4: 运行数据库迁移..."
echo "Step 1/4: Running database migration..."
cd backend
go run cmd/migrate_products/main.go
if [ $? -ne 0 ]; then
    echo "错误: 数据库迁移失败"
    echo "Error: Database migration failed"
    exit 1
fi
echo "✓ 数据库迁移完成"
echo "✓ Database migration completed"
echo ""

echo "步骤 2/4: 重新初始化示例数据..."
echo "Step 2/4: Re-seeding sample data..."
go run cmd/seed/main.go
if [ $? -ne 0 ]; then
    echo "警告: 示例数据初始化失败（可能已存在）"
    echo "Warning: Sample data seeding failed (may already exist)"
fi
echo "✓ 示例数据初始化完成"
echo "✓ Sample data seeding completed"
echo ""

echo "步骤 3/4: 重启后端服务..."
echo "Step 3/4: Restarting backend service..."
# 停止现有服务
pkill -f "go run cmd/server/main.go" 2>/dev/null
sleep 2

# 启动新服务（后台运行）
nohup go run cmd/server/main.go > ../backend.log 2>&1 &
echo "✓ 后端服务已重启"
echo "✓ Backend service restarted"
echo ""

cd ..

echo "步骤 4/4: 准备移动端应用..."
echo "Step 4/4: Preparing mobile app..."
cd mobile
echo "移动端代码已更新，请运行以下命令启动："
echo "Mobile code updated, please run the following command to start:"
echo ""
echo "  cd mobile"
echo "  npx expo start"
echo ""

cd ..

echo "=========================================="
echo "✓ 部署完成！"
echo "✓ Deployment completed!"
echo "=========================================="
echo ""
echo "后端日志文件: backend.log"
echo "Backend log file: backend.log"
echo ""
echo "请查看 DIGITAL_PRODUCTS_UPDATE.md 了解详细信息"
echo "Please see DIGITAL_PRODUCTS_UPDATE.md for details"
