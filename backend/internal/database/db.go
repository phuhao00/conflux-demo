package database

import (
	"fmt"
	"log"

	"conflux-demo/backend/config"
	"conflux-demo/backend/internal/database/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Initialize sets up the database connection
func Initialize(cfg *config.Config) error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connected successfully")

	// Auto-migrate models
	if err := autoMigrate(); err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database migration completed")
	return nil
}

// autoMigrate runs database migrations
func autoMigrate() error {
	return DB.AutoMigrate(
		&models.User{},
		&models.News{},
		&models.MarketData{},
		&models.Post{},
		&models.Product{},
		&models.Transaction{},
		&models.UserAsset{},
	)
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}
