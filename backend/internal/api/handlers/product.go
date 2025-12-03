package handlers

import (
	"net/http"

	"conflux-demo/backend/internal/database"
	"conflux-demo/backend/internal/database/models"

	"github.com/gin-gonic/gin"
)

// GetProducts returns a list of RWA products
func GetProducts(c *gin.Context) {
	var products []models.Product

	if err := database.GetDB().Order("created_at DESC").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": products})
}

// GetProductDetail returns a single product
func GetProductDetail(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	if err := database.GetDB().First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": product})
}

// InvestInProduct handles investment in a product
func InvestInProduct(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		UserID uint   `json:"user_id" binding:"required"`
		Amount string `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get product
	var product models.Product
	if err := database.GetDB().First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// TODO: Implement blockchain transaction for investment
	// For now, just create a transaction record
	transaction := models.Transaction{
		UserID: input.UserID,
		Type:   "investment",
		Amount: input.Amount,
		Status: "pending",
		TxHash: "", // Will be filled after blockchain transaction
	}

	if err := database.GetDB().Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Investment initiated",
		"transaction": transaction,
	})
}
