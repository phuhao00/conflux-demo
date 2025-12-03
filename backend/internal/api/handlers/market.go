package handlers

import (
	"net/http"
	"time"

	"conflux-demo/backend/internal/database"
	"conflux-demo/backend/internal/database/models"

	"github.com/gin-gonic/gin"
)

// GetMarketPrices returns current market prices
func GetMarketPrices(c *gin.Context) {
	var marketData []models.MarketData

	// Get the latest price for each product
	subQuery := database.GetDB().Model(&models.MarketData{}).
		Select("product_name, MAX(timestamp) as max_timestamp").
		Group("product_name")

	if err := database.GetDB().
		Joins("INNER JOIN (?) as latest ON market_data.product_name = latest.product_name AND market_data.timestamp = latest.max_timestamp", subQuery).
		Find(&marketData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch market data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": marketData})
}

// GetPriceHistory returns historical price data for a product
func GetPriceHistory(c *gin.Context) {
	product := c.Param("product")

	// Default to last 30 days
	days := 30
	if d := c.Query("days"); d != "" {
		// Parse days parameter
	}

	startTime := time.Now().AddDate(0, 0, -days)

	var history []models.MarketData
	if err := database.GetDB().
		Where("product_name = ? AND timestamp >= ?", product, startTime).
		Order("timestamp ASC").
		Find(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch price history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"product": product,
		"data":    history,
	})
}
