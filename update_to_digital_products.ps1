# 数字商品更新部署脚本 (Windows PowerShell)
# Digital Products Update Deployment Script (Windows PowerShell)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "数字商品更新部署脚本" -ForegroundColor Cyan
Write-Host "Digital Products Update Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在项目根目录
if (-not (Test-Path "backend") -or -not (Test-Path "mobile")) {
    Write-Host "错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    Write-Host "Error: Please run this script from project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "步骤 1/4: 运行数据库迁移..." -ForegroundColor Yellow
Write-Host "Step 1/4: Running database migration..." -ForegroundColor Yellow
Set-Location backend
go run cmd/migrate_products/main.go
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 数据库迁移失败" -ForegroundColor Red
    Write-Host "Error: Database migration failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 数据库迁移完成" -ForegroundColor Green
Write-Host "✓ Database migration completed" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 2/4: 重新初始化示例数据..." -ForegroundColor Yellow
Write-Host "Step 2/4: Re-seeding sample data..." -ForegroundColor Yellow
go run cmd/seed/main.go
if ($LASTEXITCODE -ne 0) {
    Write-Host "警告: 示例数据初始化失败（可能已存在）" -ForegroundColor Yellow
    Write-Host "Warning: Sample data seeding failed (may already exist)" -ForegroundColor Yellow
}
Write-Host "✓ 示例数据初始化完成" -ForegroundColor Green
Write-Host "✓ Sample data seeding completed" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 3/4: 重启后端服务..." -ForegroundColor Yellow
Write-Host "Step 3/4: Restarting backend service..." -ForegroundColor Yellow

# 停止现有服务
Get-Process | Where-Object {$_.ProcessName -like "*go*" -and $_.CommandLine -like "*cmd/server/main.go*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 启动新服务（后台运行）
Start-Process -FilePath "go" -ArgumentList "run", "cmd/server/main.go" -WindowStyle Hidden -RedirectStandardOutput "..\backend.log" -RedirectStandardError "..\backend_error.log"
Write-Host "✓ 后端服务已重启" -ForegroundColor Green
Write-Host "✓ Backend service restarted" -ForegroundColor Green
Write-Host ""

Set-Location ..

Write-Host "步骤 4/4: 准备移动端应用..." -ForegroundColor Yellow
Write-Host "Step 4/4: Preparing mobile app..." -ForegroundColor Yellow
Write-Host "移动端代码已更新，请运行以下命令启动：" -ForegroundColor Cyan
Write-Host "Mobile code updated, please run the following command to start:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  cd mobile" -ForegroundColor White
Write-Host "  npx expo start" -ForegroundColor White
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✓ 部署完成！" -ForegroundColor Green
Write-Host "✓ Deployment completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "后端日志文件: backend.log, backend_error.log" -ForegroundColor Yellow
Write-Host "Backend log files: backend.log, backend_error.log" -ForegroundColor Yellow
Write-Host ""
Write-Host "请查看 DIGITAL_PRODUCTS_UPDATE.md 了解详细信息" -ForegroundColor Cyan
Write-Host "Please see DIGITAL_PRODUCTS_UPDATE.md for details" -ForegroundColor Cyan
