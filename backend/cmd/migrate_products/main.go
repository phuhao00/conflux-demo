package main

import (
	"log"

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

	// Auto-migrate Product model to add new fields
	log.Println("Migrating Product table...")
	if err := db.AutoMigrate(&models.Product{}); err != nil {
		log.Fatalf("Failed to migrate Product table: %v", err)
	}

	// Update existing products to have digital product fields
	log.Println("Updating existing products...")
	
	// Set default values for existing products
	db.Model(&models.Product{}).Where("product_type = '' OR product_type IS NULL").Updates(map[string]interface{}{
		"product_type": "digital",
		"category":     "Digital Asset",
		"stock":        0,
	})

	log.Println("Migration completed successfully!")
}
