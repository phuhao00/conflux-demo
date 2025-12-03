package main

import (
	"log"
	"time"

	"conflux-demo/backend/config"
	"conflux-demo/backend/internal/database"
	"conflux-demo/backend/internal/database/models"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	if err := database.Initialize(cfg); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	db := database.GetDB()

	// Seed users
	users := []models.User{
		{WalletAddress: "cfxtest:aak2rra2njvd77ezwjvx04kkds9fzagfe6ku8scz91", Username: "FarmerJohn", Email: "john@example.com"},
		{WalletAddress: "cfxtest:aarc9abycue0hhzgyrr53m6cxedgccrmmyybjgh4xg", Username: "AgriTech_Sarah", Email: "sarah@example.com"},
	}
	for _, user := range users {
		db.FirstOrCreate(&user, models.User{WalletAddress: user.WalletAddress})
	}

	// Seed news
	news := []models.News{
		{Type: "policy", Title: "2025 Agricultural Subsidy Policy Released", Summary: "New subsidies for sustainable farming practices have been announced...", Icon: "document-text", Date: time.Now().AddDate(0, 0, -2)},
		{Type: "news", Title: "Global Wheat Prices Surge", Summary: "Due to unexpected weather patterns, wheat prices have hit a 5-year high.", Icon: "trending-up", Date: time.Now().AddDate(0, 0, -1)},
		{Type: "policy", Title: "Digital Agriculture Infrastructure Plan", Summary: "Government invests 50B in rural 5G and IoT networks.", Icon: "wifi", Date: time.Now().AddDate(0, 0, -3)},
	}
	for _, n := range news {
		db.FirstOrCreate(&n, models.News{Title: n.Title})
	}

	// Seed market data
	marketData := []models.MarketData{
		{ProductName: "Wheat (Soft Red)", Icon: "barley", Price: 235.50, Change: 2.45, ChangePercent: "+1.05%", Timestamp: time.Now()},
		{ProductName: "Corn (Yellow)", Icon: "corn", Price: 188.20, Change: -1.10, ChangePercent: "-0.58%", Timestamp: time.Now()},
		{ProductName: "Soybeans", Icon: "soy-sauce", Price: 450.00, Change: 5.75, ChangePercent: "+1.29%", Timestamp: time.Now()},
	}
	for _, md := range marketData {
		db.Create(&md)
	}

	// Seed products
	products := []models.Product{
		{Name: "Organic Apple Orchard Share", Icon: "nutrition", YieldRate: "8.5%", Price: "$500", Duration: "12 Months", RiskLevel: "low"},
		{Name: "Sustainable Wheat Farm Bond", Icon: "barley", YieldRate: "6.2%", Price: "$100", Duration: "6 Months", RiskLevel: "low"},
		{Name: "High-Tech Greenhouse Fund", Icon: "greenhouse", YieldRate: "12.4%", Price: "$1000", Duration: "24 Months", RiskLevel: "medium"},
	}
	for _, p := range products {
		db.FirstOrCreate(&p, models.Product{Name: p.Name})
	}

	log.Println("Database seeded successfully!")
}
