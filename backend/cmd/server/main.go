package main

import (
	"fmt"
	"log"

	"conflux-demo/backend/config"
	"conflux-demo/backend/internal/api/routes"
	"conflux-demo/backend/internal/blockchain"
	"conflux-demo/backend/internal/database"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Set Gin mode
	gin.SetMode(cfg.GinMode)

	// Initialize database
	if err := database.Initialize(cfg); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize Conflux client
	if err := blockchain.Initialize(cfg); err != nil {
		log.Fatalf("Failed to initialize Conflux client: %v", err)
	}

	// Create Gin router
	router := gin.Default()

	// Setup routes
	routes.SetupRoutes(router)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("Server starting on %s", addr)

	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
