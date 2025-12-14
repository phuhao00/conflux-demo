# Conflux Farm - Windows PowerShell 启动脚本

Write-Host "🌾 Conflux Farm - 启动脚本" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

# 检查 Go 是否安装
try {
    $goVersion = go version
    Write-Host "✅ Go 已安装: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Go 未安装，请先安装 Go 1.21+" -ForegroundColor Red
    Write-Host "下载地址: https://golang.org/dl/" -ForegroundColor Yellow
    exit 1
}

# 检查 Docker 是否安装和运行
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker 已安装: $dockerVersion" -ForegroundColor Green
    
    # 检查 Docker 是否运行
    docker ps | Out-Null
    Write-Host "✅ Docker 服务正在运行" -ForegroundColor Green
    
    # 启动 MySQL 容器
    Write-Host "🐳 启动 MySQL Docker 容器..." -ForegroundColor Cyan
    
    # 检查容器是否已存在
    $existingContainer = docker ps -a --filter "name=conflux-farm-mysql" --format "{{.Names}}"
    if ($existingContainer -eq "conflux-farm-mysql") {
        Write-Host "📦 MySQL 容器已存在，正在启动..." -ForegroundColor Yellow
        docker start conflux-farm-mysql
    } else {
        Write-Host "📦 创建新的 MySQL 容器..." -ForegroundColor Yellow
        docker run -d `
            --name conflux-farm-mysql `
            -e MYSQL_ROOT_PASSWORD=password `
            -e MYSQL_DATABASE=conflux_farm `
            -p 3306:3306 `
            mysql:8.0
    }
    
    Write-Host "⏳ 等待 MySQL 启动..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
} catch {
    Write-Host "⚠️  Docker 未安装或未运行" -ForegroundColor Yellow
    Write-Host "请确保已安装 Docker Desktop 并且正在运行" -ForegroundColor Yellow
    Write-Host "或者手动安装 MySQL 8.0+" -ForegroundColor Yellow
}

# 创建 .env 文件（如果不存在）
if (-not (Test-Path ".env")) {
    Write-Host "📝 创建 .env 配置文件..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env 文件已创建，请根据需要修改配置" -ForegroundColor Green
}

# 设置 Go 代理（中国用户优化）
Write-Host "🌐 配置 Go 代理..." -ForegroundColor Cyan
go env -w GOPROXY=https://goproxy.cn,direct
go env -w GOSUMDB=sum.golang.google.cn

# 下载依赖
Write-Host "📦 下载 Go 依赖..." -ForegroundColor Cyan
go mod download

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖下载失败" -ForegroundColor Red
    exit 1
}

# 初始化数据库（首次运行）
Write-Host "🗄️  初始化数据库..." -ForegroundColor Cyan
go run cmd/seed/main.go

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  数据库初始化可能失败，但应用仍会尝试启动" -ForegroundColor Yellow
}

# 启动应用
Write-Host "" -ForegroundColor White
Write-Host "🚀 启动应用..." -ForegroundColor Green
Write-Host "访问地址: http://localhost:8080" -ForegroundColor Cyan
Write-Host "API 测试: http://localhost:8080/test_api.html" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "按 Ctrl+C 停止应用" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White

# 启动应用
go run main.go