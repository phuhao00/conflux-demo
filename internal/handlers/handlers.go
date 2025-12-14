package handlers

import (
	"conflux-farm/internal/config"
	"conflux-farm/internal/models"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewHandler(db *gorm.DB, cfg *config.Config) *Handler {
	return &Handler{
		db:  db,
		cfg: cfg,
	}
}

// 获取农产品列表
func (h *Handler) GetFarmProducts(c *gin.Context) {
	category := c.Query("category")
	
	var products []models.FarmProduct
	query := h.db.Model(&models.FarmProduct{})
	
	if category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}
	
	if err := query.Order("created_at DESC").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":    false,
			"error": "Failed to get products",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"ok":       true,
		"products": products,
	})
}

// 获取单个农产品
func (h *Handler) GetFarmProductByID(c *gin.Context) {
	id := c.Param("id")
	
	var product models.FarmProduct
	if err := h.db.First(&product, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"ok":    false,
				"error": "Product not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":    false,
			"error": "Failed to get product",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"ok":      true,
		"product": product,
	})
}

// 获取证书列表
func (h *Handler) GetCertificates(c *gin.Context) {
	certType := c.Query("type")
	
	var certificates []models.Certificate
	query := h.db.Model(&models.Certificate{})
	
	if certType != "" && certType != "all" {
		query = query.Where("type = ?", certType)
	}
	
	if err := query.Order("created_at DESC").Find(&certificates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":    false,
			"error": "Failed to get certificates",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"ok":           true,
		"certificates": certificates,
	})
}

// 获取单个证书
func (h *Handler) GetCertificateByID(c *gin.Context) {
	id := c.Param("id")
	
	var certificate models.Certificate
	if err := h.db.First(&certificate, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"ok":    false,
				"error": "Certificate not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":    false,
			"error": "Failed to get certificate",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"ok":          true,
		"certificate": certificate,
	})
}

// 获取溯源记录列表
func (h *Handler) GetTraceRecords(c *gin.Context) {
	keyword := c.Query("keyword")
	
	var records []models.TraceRecord
	query := h.db.Model(&models.TraceRecord{}).Preload("Timeline", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order ASC")
	})
	
	if keyword != "" {
		searchTerm := "%" + keyword + "%"
		query = query.Where("id LIKE ? OR product LIKE ? OR enterprise LIKE ? OR origin LIKE ?", 
			searchTerm, searchTerm, searchTerm, searchTerm)
	}
	
	if err := query.Order("created_at DESC").Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":    false,
			"error": "Failed to get trace records",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"ok":      true,
		"records": records,
	})
}

// 获取单个溯源记录
func (h *Handler) GetTraceRecordByID(c *gin.Context) {
	id := c.Param("id")
	
	var record models.TraceRecord
	if err := h.db.Preload("Timeline", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order ASC")
	}).First(&record, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"ok":    false,
				"error": "Trace record not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":    false,
			"error": "Failed to get trace record",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"ok":     true,
		"record": record,
	})
}

// 获取统计数据
func (h *Handler) GetStatistics(c *gin.Context) {
	var stats models.Statistics
	
	// 产品种类总数
	h.db.Model(&models.FarmProduct{}).Count(&stats.ProductTypes)
	
	// 溯源批次总数
	h.db.Model(&models.TraceRecord{}).Count(&stats.TraceBatches)
	
	// 有效证书数量
	h.db.Model(&models.Certificate{}).Where("status = ?", "有效").Count(&stats.Certificates)
	
	// 企业总数（从农产品表汇总）
	var enterpriseSum struct {
		Total int64
	}
	h.db.Model(&models.FarmProduct{}).Select("SUM(enterprises) as total").Scan(&enterpriseSum)
	stats.Enterprises = enterpriseSum.Total
	
	// 模拟其他统计数据
	stats.TodayQueries = 3245
	stats.SuccessRate = 98.5
	stats.InTransit = 156
	stats.AvgQueryTime = "2.3秒"
	
	c.JSON(http.StatusOK, gin.H{
		"ok":    true,
		"stats": stats,
	})
}

// 充值余额
func (h *Handler) Topup(c *gin.Context) {
	var req struct {
		Address string  `json:"address" binding:"required"`
		RMB     float64 `json:"rmb" binding:"required,gt=0"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":    false,
			"error": "Invalid input",
		})
		return
	}
	
	// 查找或创建账户
	var account models.Account
	if err := h.db.FirstOrCreate(&account, models.Account{Address: req.Address}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":    false,
			"error": "Failed to get account",
		})
		return
	}
	
	// 增加余额
	account.Balance += req.RMB
	if err := h.db.Save(&account).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":    false,
			"error": "Failed to update balance",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"ok":      true,
		"balance": account.Balance,
	})
}

// 查询余额
func (h *Handler) GetBalance(c *gin.Context) {
	address := c.Param("address")
	
	var account models.Account
	if err := h.db.First(&account, "address = ?", address).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusOK, gin.H{
				"address": address,
				"balance": 0.0,
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"ok":    false,
			"error": "Failed to get balance",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"address": address,
		"balance": account.Balance,
	})
}

// NFT 铸造（简化版本）
func (h *Handler) MintNFT(c *gin.Context) {
	var req struct {
		From         string `json:"from" binding:"required"`
		To           string `json:"to" binding:"required"`
		TokenID      int    `json:"tokenId" binding:"required"`
		NFTAddress   string `json:"nftAddress" binding:"required"`
		Origin       string `json:"origin" binding:"required"`
		HarvestTime  int64  `json:"harvestTime" binding:"required"`
		InspectionID string `json:"inspectionId" binding:"required"`
		URI          string `json:"uri"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":    false,
			"error": "Invalid input",
		})
		return
	}
	
	// 这里应该调用区块链相关的铸造逻辑
	// 为了演示，我们返回成功响应
	c.JSON(http.StatusOK, gin.H{
		"ok":         true,
		"txHash":     "0x" + strings.Repeat("a", 64), // 模拟交易哈希
		"chargedRMB": 0.5,                            // 模拟费用
	})
}

// NFT 转移（简化版本）
func (h *Handler) TransferNFT(c *gin.Context) {
	var req struct {
		From       string `json:"from" binding:"required"`
		To         string `json:"to" binding:"required"`
		TokenID    int    `json:"tokenId" binding:"required"`
		NFTAddress string `json:"nftAddress" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":    false,
			"error": "Invalid input",
		})
		return
	}
	
	// 这里应该调用区块链相关的转移逻辑
	// 为了演示，我们返回成功响应
	c.JSON(http.StatusOK, gin.H{
		"ok":         true,
		"txHash":     "0x" + strings.Repeat("b", 64), // 模拟交易哈希
		"chargedRMB": 0.3,                            // 模拟费用
	})
}

// 获取 NFT 详情（简化版本）
func (h *Handler) GetNFTDetails(c *gin.Context) {
	nftAddress := c.Param("nftAddress")
	tokenIDStr := c.Param("tokenId")
	
	tokenID, err := strconv.Atoi(tokenIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"ok":    false,
			"error": "Invalid token ID",
		})
		return
	}
	
	// 这里应该调用区块链查询逻辑
	// 为了演示，我们返回模拟数据
	c.JSON(http.StatusOK, gin.H{
		"ok":         true,
		"tokenId":    tokenID,
		"nftAddress": nftAddress,
		"uri":        "https://example.com/metadata/" + tokenIDStr,
		"onchain": gin.H{
			"origin":       "云南普洱",
			"harvestTime":  1699200000,
			"inspectionId": "QC20240101",
			"contentHash":  "0x" + strings.Repeat("c", 64),
		},
		"offchain": gin.H{
			"name":        "有机农产品 #" + tokenIDStr,
			"description": "这是一个有机认证的农产品NFT",
			"image":       "https://example.com/images/" + tokenIDStr + ".jpg",
		},
	})
}