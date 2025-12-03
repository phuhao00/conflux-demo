package handlers

import (
	"net/http"
	"strconv"

	"conflux-demo/backend/internal/database"
	"conflux-demo/backend/internal/database/models"

	"github.com/gin-gonic/gin"
)

// GetNews returns a list of news articles
func GetNews(c *gin.Context) {
	var news []models.News

	query := database.GetDB().Order("date DESC")

	// Filter by type if provided
	if newsType := c.Query("type"); newsType != "" {
		query = query.Where("type = ?", newsType)
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	if err := query.Limit(pageSize).Offset(offset).Find(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch news"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      news,
		"page":      page,
		"page_size": pageSize,
	})
}

// GetNewsDetail returns a single news article
func GetNewsDetail(c *gin.Context) {
	id := c.Param("id")

	var news models.News
	if err := database.GetDB().First(&news, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "News not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": news})
}

// GetPolicies returns a list of policy articles
func GetPolicies(c *gin.Context) {
	var policies []models.News

	query := database.GetDB().Where("type = ?", "policy").Order("date DESC")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	if err := query.Limit(pageSize).Offset(offset).Find(&policies).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch policies"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      policies,
		"page":      page,
		"page_size": pageSize,
	})
}
