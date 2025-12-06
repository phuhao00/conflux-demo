package handlers

import (
	"fmt"
	"net/http"
	"time"

	"conflux-demo/backend/internal/database"
	"conflux-demo/backend/internal/database/models"

	"github.com/gin-gonic/gin"
)

// GetUserAssets returns all assets owned by a user
func GetUserAssets(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Address is required"})
		return
	}

	var assets []models.UserAsset
	if err := database.GetDB().
		Preload("Product").
		Where("wallet_address = ? AND status = ?", address, "active").
		Order("purchase_date DESC").
		Find(&assets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assets"})
		return
	}

	// Format response for mobile app
	var mobileAssets []gin.H
	for _, asset := range assets {
		mobileAssets = append(mobileAssets, gin.H{
			"id":                asset.ID,
			"product_id":        asset.ProductID,
			"product_name":      asset.Product.Name,
			"product_icon":      asset.Product.Icon,
			"yield_rate":        asset.Product.YieldRate,
			"token_id":          asset.TokenID,
			"nft_address":       asset.NFTAddress,
			"investment_amount": fmt.Sprintf("%.2f", asset.InvestmentAmount),
			"purchase_date":     asset.PurchaseDate.Format("2006-01-02"),
			"status":            asset.Status,
			"tx_hash":           asset.TxHash,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":   true,
		"data": mobileAssets,
	})
}

// GetUserTransactions returns transaction history for a user
func GetUserTransactions(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Address is required"})
		return
	}

	// Find user by wallet address
	var user models.User
	if err := database.GetDB().Where("wallet_address = ?", address).First(&user).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"ok":   true,
			"data": []gin.H{},
		})
		return
	}

	var transactions []models.Transaction
	if err := database.GetDB().
		Where("user_id = ?", user.ID).
		Order("created_at DESC").
		Limit(50).
		Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	// Format response for mobile app
	var mobileTxs []gin.H
	for _, tx := range transactions {
		mobileTxs = append(mobileTxs, gin.H{
			"id":         tx.ID,
			"type":       tx.Type,
			"amount":     tx.Amount,
			"status":     tx.Status,
			"tx_hash":    tx.TxHash,
			"created_at": tx.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":   true,
		"data": mobileTxs,
	})
}

// RecordInvestment records a new investment/purchase
func RecordInvestment(c *gin.Context) {
	var input struct {
		WalletAddress    string  `json:"wallet_address" binding:"required"`
		ProductID        uint    `json:"product_id" binding:"required"`
		InvestmentAmount float64 `json:"investment_amount" binding:"required"`
		TokenID          string  `json:"token_id"`
		NFTAddress       string  `json:"nft_address"`
		TxHash           string  `json:"tx_hash"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find or create user
	var user models.User
	result := database.GetDB().Where("wallet_address = ?", input.WalletAddress).First(&user)
	if result.Error != nil {
		user = models.User{
			WalletAddress: input.WalletAddress,
			Balance:       0,
		}
		if err := database.GetDB().Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	}

	// Generate token ID if not provided
	tokenID := input.TokenID
	if tokenID == "" {
		tokenID = fmt.Sprintf("TOKEN-%d-%d", input.ProductID, time.Now().Unix())
	}

	// Create user asset
	asset := models.UserAsset{
		WalletAddress:    input.WalletAddress,
		ProductID:        input.ProductID,
		TokenID:          tokenID,
		NFTAddress:       input.NFTAddress,
		InvestmentAmount: input.InvestmentAmount,
		PurchaseDate:     time.Now(),
		Status:           "active",
		TxHash:           input.TxHash,
	}

	if err := database.GetDB().Create(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record investment"})
		return
	}

	// Create transaction record
	transaction := models.Transaction{
		UserID:    user.ID,
		Type:      "investment",
		Amount:    fmt.Sprintf("%.2f", input.InvestmentAmount),
		Status:    "success",
		TxHash:    input.TxHash,
		CreatedAt: time.Now(),
	}

	if err := database.GetDB().Create(&transaction).Error; err != nil {
		// Log error but don't fail the request
		c.JSON(http.StatusCreated, gin.H{
			"ok":      true,
			"data":    asset,
			"warning": "Asset created but transaction record may not be saved",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"ok":   true,
		"data": asset,
	})
}
