package handlers

import (
	"net/http"
	"strconv"

	"conflux-demo/backend/internal/blockchain"
	"conflux-demo/backend/internal/database"
	"conflux-demo/backend/internal/database/models"

	"github.com/gin-gonic/gin"
)

// GetUserProfile returns user profile information
func GetUserProfile(c *gin.Context) {
	userID := c.Query("user_id")

	var user models.User
	if err := database.GetDB().First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

// GetBalance returns the wallet balance
func GetBalance(c *gin.Context) {
	address := c.Query("address")

	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Address is required"})
		return
	}

	client := blockchain.GetClient()
	balance, err := client.GetBalance(address)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get balance"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"address": address,
		"balance": balance.String(),
	})
}

// GetTransactions returns user transaction history
func GetTransactions(c *gin.Context) {
	userID := c.Query("user_id")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	var transactions []models.Transaction
	if err := database.GetDB().
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      transactions,
		"page":      page,
		"page_size": pageSize,
	})
}

// Transfer handles fund transfers
func Transfer(c *gin.Context) {
	var input struct {
		UserID uint   `json:"user_id" binding:"required"`
		To     string `json:"to" binding:"required"`
		Amount string `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement actual blockchain transfer
	// For now, just create a transaction record
	transaction := models.Transaction{
		UserID: input.UserID,
		Type:   "transfer",
		Amount: input.Amount,
		Status: "pending",
		TxHash: "",
	}

	if err := database.GetDB().Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Transfer initiated",
		"transaction": transaction,
	})
}

// Deposit handles fund deposits
func Deposit(c *gin.Context) {
	var input struct {
		UserID uint   `json:"user_id" binding:"required"`
		Amount string `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transaction := models.Transaction{
		UserID: input.UserID,
		Type:   "deposit",
		Amount: input.Amount,
		Status: "pending",
		TxHash: "",
	}

	if err := database.GetDB().Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Deposit initiated",
		"transaction": transaction,
	})
}
