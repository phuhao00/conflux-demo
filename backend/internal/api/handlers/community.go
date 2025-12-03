package handlers

import (
	"net/http"
	"strconv"

	"conflux-demo/backend/internal/database"
	"conflux-demo/backend/internal/database/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetPosts returns a list of community posts
func GetPosts(c *gin.Context) {
	var posts []models.Post

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	if err := database.GetDB().
		Preload("User").
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      posts,
		"page":      page,
		"page_size": pageSize,
	})
}

// CreatePost creates a new community post
func CreatePost(c *gin.Context) {
	var input struct {
		UserID  uint   `json:"user_id" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post := models.Post{
		UserID:  input.UserID,
		Content: input.Content,
	}

	if err := database.GetDB().Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": post})
}

// LikePost increments the like count for a post
func LikePost(c *gin.Context) {
	id := c.Param("id")

	if err := database.GetDB().Model(&models.Post{}).
		Where("id = ?", id).
		UpdateColumn("likes_count", gorm.Expr("likes_count + ?", 1)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post liked successfully"})
}
