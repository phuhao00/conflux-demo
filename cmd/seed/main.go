package main

import (
	"fmt"
	"log"
	"os"

	"conflux-farm/internal/config"
	"conflux-farm/internal/database"
	"conflux-farm/internal/models"

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func main() {
	// 加载环境变量
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// 初始化配置
	cfg := config.Load()

	// 初始化数据库
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// 检查命令行参数
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "reset":
			resetDatabase(db)
		case "check":
			checkDatabase(db)
		case "seed":
			seedDatabase(db)
		default:
			fmt.Println("用法: go run cmd/seed/main.go [reset|check|seed]")
			fmt.Println("  reset - 重置数据库（删除所有数据）")
			fmt.Println("  check - 检查数据库状态")
			fmt.Println("  seed  - 重新插入种子数据")
		}
	} else {
		checkDatabase(db)
	}
}

func resetDatabase(db *gorm.DB) {
	fmt.Println("🗑️  重置数据库...")
	
	// 删除所有表数据
	db.Exec("DELETE FROM trace_timeline")
	db.Exec("DELETE FROM trace_records")
	db.Exec("DELETE FROM certificates")
	db.Exec("DELETE FROM farm_products")
	db.Exec("DELETE FROM accounts")
	db.Exec("DELETE FROM orders")
	db.Exec("DELETE FROM audit_logs")
	
	fmt.Println("✅ 数据库已重置")
	
	// 重新插入种子数据
	seedDatabase(db)
}

func checkDatabase(db *gorm.DB) {
	fmt.Println("🔍 检查数据库状态...")
	
	var productCount, certCount, traceCount int64
	
	db.Model(&models.FarmProduct{}).Count(&productCount)
	db.Model(&models.Certificate{}).Count(&certCount)
	db.Model(&models.TraceRecord{}).Count(&traceCount)
	
	fmt.Printf("📊 数据统计:\n")
	fmt.Printf("  - 农产品种类: %d\n", productCount)
	fmt.Printf("  - 数字证书: %d\n", certCount)
	fmt.Printf("  - 溯源记录: %d\n", traceCount)
	
	if productCount == 0 {
		fmt.Println("⚠️  没有农产品数据，运行 'seed' 命令插入数据")
	}
	
	// 显示前几个产品
	if productCount > 0 {
		var products []models.FarmProduct
		db.Limit(3).Find(&products)
		fmt.Println("\n📦 前3个产品:")
		for _, p := range products {
			fmt.Printf("  - %s %s (%s) - %d批次, %d企业\n", 
				p.Icon, p.Name, p.CategoryName, p.Batches, p.Enterprises)
		}
	}
}

func seedDatabase(db *gorm.DB) {
	fmt.Println("🌱 插入种子数据...")
	
	// 先删除现有数据
	db.Exec("DELETE FROM farm_products")
	db.Exec("DELETE FROM certificates") 
	db.Exec("DELETE FROM trace_records")
	db.Exec("DELETE FROM trace_timeline")
	
	// 调用数据库包的种子数据函数
	if err := database.SeedData(db); err != nil {
		log.Fatal("插入种子数据失败:", err)
	}
	
	fmt.Println("✅ 种子数据插入完成")
	checkDatabase(db)
}