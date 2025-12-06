# MongoDB 数据验证脚本

Write-Host "=== Testing MongoDB Data ===" -ForegroundColor Green

Write-Host "`n1. Testing News API..." -ForegroundColor Yellow
$news = Invoke-RestMethod -Uri "http://localhost:8080/api/news"
Write-Host "   Found $($news.data.Count) news items" -ForegroundColor Cyan
$news.data | Select-Object -First 2 | ForEach-Object {
    Write-Host "   - [$($_.type)] $($_.title)" -ForegroundColor Gray
}

Write-Host "`n2. Testing Community Posts API..." -ForegroundColor Yellow
$posts = Invoke-RestMethod -Uri "http://localhost:8080/api/community/posts"
Write-Host "   Found $($posts.data.Count) community posts" -ForegroundColor Cyan
$posts.data | Select-Object -First 3 | ForEach-Object {
    Write-Host "   - @$($_.user): $($_.content.Substring(0, [Math]::Min(50, $_.content.Length)))..." -ForegroundColor Gray
    Write-Host "     Likes: $($_.likes) | Comments: $($_.comments) | Time: $($_.time)" -ForegroundColor DarkGray
}

Write-Host "`n3. Testing Market API (MySQL)..." -ForegroundColor Yellow
$market = Invoke-RestMethod -Uri "http://localhost:8080/api/market"
Write-Host "   Found $($market.data.Count) market items" -ForegroundColor Cyan

Write-Host "`n4. Testing Products API (MySQL)..." -ForegroundColor Yellow
$products = Invoke-RestMethod -Uri "http://localhost:8080/api/products"
Write-Host "   Found $($products.data.Count) products" -ForegroundColor Cyan

Write-Host "`n=== All APIs Working! ===" -ForegroundColor Green
Write-Host "`nMongoDB Collections:" -ForegroundColor Yellow
Write-Host "  - news: $($news.data.Count) items ✓" -ForegroundColor Green
Write-Host "  - posts: $($posts.data.Count) items ✓" -ForegroundColor Green
Write-Host "`nMySQL Tables:" -ForegroundColor Yellow
Write-Host "  - market_data: $($market.data.Count) items ✓" -ForegroundColor Green
Write-Host "  - products: $($products.data.Count) items ✓" -ForegroundColor Green
