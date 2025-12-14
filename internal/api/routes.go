package api

import (
	"conflux-farm/internal/config"
	"conflux-farm/internal/handlers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// 创建处理器
	h := handlers.NewHandler(db, cfg)

	// API 路由组
	api := router.Group("/api")
	{
		// 农产品相关
		api.GET("/products", h.GetFarmProducts)
		api.GET("/products/:id", h.GetFarmProductByID)

		// 证书相关
		api.GET("/certificates", h.GetCertificates)
		api.GET("/certificates/:id", h.GetCertificateByID)

		// 溯源相关
		api.GET("/trace", h.GetTraceRecords)
		api.GET("/trace/:id", h.GetTraceRecordByID)

		// 统计数据
		api.GET("/statistics", h.GetStatistics)
	}

	// 原有的业务路由（保持兼容）
	router.POST("/topup", h.Topup)
	router.GET("/balance/:address", h.GetBalance)
	router.POST("/relay/nft/mint", h.MintNFT)
	router.POST("/relay/nft/transfer", h.TransferNFT)
	router.GET("/nft/batch/:nftAddress/:tokenId/details", h.GetNFTDetails)

	// 健康检查
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}