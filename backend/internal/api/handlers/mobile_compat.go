package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"conflux-demo/backend/internal/database"
	"conflux-demo/backend/internal/database/models"
	"conflux-demo/backend/internal/mongodb"
	mongoModels "conflux-demo/backend/internal/mongodb/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Mobile Response Wrappers

func GetMobileNews(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := mongodb.GetCollection("news")

	// Sort by date descending
	opts := options.Find().SetSort(bson.D{{Key: "date", Value: -1}})

	cursor, err := collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch news"})
		return
	}
	defer cursor.Close(ctx)

	var newsItems []mongoModels.News
	if err := cursor.All(ctx, &newsItems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode news"})
		return
	}

	// Format response for mobile app
	var mobileNews []gin.H
	for _, item := range newsItems {
		mobileNews = append(mobileNews, gin.H{
			"id":      item.ID.Hex(),
			"type":    item.Type,
			"title":   item.Title,
			"summary": item.Summary,
			"content": item.Content,
			"icon":    item.Icon,
			"date":    item.Date.Format("2006-01-02"),
		})
	}

	c.JSON(http.StatusOK, gin.H{"ok": true, "data": mobileNews})
}

func GetMobileMarket(c *gin.Context) {
	var marketData []models.MarketData
	if err := database.GetDB().Order("timestamp DESC").Find(&marketData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch market data"})
		return
	}

	// Map to mobile expected format
	var mobileData []gin.H
	for _, item := range marketData {
		changeVal := fmt.Sprintf("%+.2f", item.Change)
		mobileData = append(mobileData, gin.H{
			"id":             item.ID,
			"name":           item.ProductName,
			"price":          fmt.Sprintf("%.2f", item.Price),
			"change_val":     changeVal,
			"change_percent": item.ChangePercent,
			"icon":           item.Icon,
		})
	}

	c.JSON(http.StatusOK, gin.H{"ok": true, "data": mobileData})
}

func GetMobileProducts(c *gin.Context) {
	var products []models.Product
	if err := database.GetDB().Order("created_at DESC").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	// Map to mobile expected format
	var mobileData []gin.H
	for _, item := range products {
		mobileData = append(mobileData, gin.H{
			"id":         item.ID,
			"name":       item.Name,
			"yield_rate": item.YieldRate,
			"price":      item.Price,
			"duration":   item.Duration,
			"risk":       item.RiskLevel, // Mobile expects "risk", Go has "RiskLevel"
			"icon":       item.Icon,
		})
	}

	c.JSON(http.StatusOK, gin.H{"ok": true, "data": mobileData})
}

func MobileBalance(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Address is required"})
		return
	}

	// Find or create user by wallet address
	var user models.User
	result := database.GetDB().Where("wallet_address = ?", address).First(&user)

	if result.Error != nil {
		// User not found, create new user with 0 balance
		user = models.User{
			WalletAddress: address,
			Balance:       0.00,
		}
		if err := database.GetDB().Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"balance": fmt.Sprintf("%.2f", user.Balance)})
}

func MobileTopUp(c *gin.Context) {
	var input struct {
		Address       string  `json:"address"`
		RMB           float64 `json:"rmb"`
		PaymentMethod string  `json:"payment_method"` // "alipay", "wechat"
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if input.RMB <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount must be positive"})
		return
	}

	// Default payment method if not provided
	paymentMethod := input.PaymentMethod
	if paymentMethod == "" {
		paymentMethod = "alipay"
	}

	// Find or create user
	var user models.User
	result := database.GetDB().Where("wallet_address = ?", input.Address).First(&user)

	if result.Error != nil {
		// Create new user
		user = models.User{
			WalletAddress: input.Address,
			Balance:       input.RMB,
		}
		if err := database.GetDB().Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	} else {
		// Update existing user balance
		user.Balance += input.RMB
		if err := database.GetDB().Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update balance"})
			return
		}
	}

	// Create transaction record
	transaction := models.Transaction{
		UserID:        user.ID,
		Type:          "deposit",
		Amount:        fmt.Sprintf("%.2f", input.RMB),
		Status:        "success",
		PaymentMethod: paymentMethod,
		TxHash:        fmt.Sprintf("0x%x", time.Now().UnixNano()), // Mock tx hash
		CreatedAt:     time.Now(),
	}

	if err := database.GetDB().Create(&transaction).Error; err != nil {
		// Log error but don't fail the request
		c.JSON(http.StatusOK, gin.H{
			"ok":      true,
			"balance": fmt.Sprintf("%.2f", user.Balance),
			"warning": "Balance updated but transaction record may not be saved",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":             true,
		"balance":        fmt.Sprintf("%.2f", user.Balance),
		"payment_method": paymentMethod,
		"transaction_id": transaction.ID,
	})
}

func MobileDefaultAddress(c *gin.Context) {
	// Return a mock address or read from config
	// For now, use the one from deployment.json if we could read it, or hardcode
	c.JSON(http.StatusOK, gin.H{
		"ok":      true,
		"address": "cfxtest:acdrf82165000000000000000000000000000000", // Example address
	})
}

// NFT Handlers (Mock for now)

func MobileMintNFT(c *gin.Context) {
	// POST { from, to, tokenId, nftAddress, origin, harvestTime, inspectionId }
	c.JSON(http.StatusOK, gin.H{"ok": true, "txHash": "0xmockhash..."})
}

func MobileTransferNFT(c *gin.Context) {
	// POST { from, to, tokenId, nftAddress }
	c.JSON(http.StatusOK, gin.H{"ok": true, "txHash": "0xmockhash..."})
}
