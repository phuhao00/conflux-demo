package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"conflux-demo/backend/internal/mongodb"
	mongoModels "conflux-demo/backend/internal/mongodb/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetPosts returns a list of community posts from MongoDB
func GetPosts(c *gin.Context) {
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	skip := int64((page - 1) * pageSize)
	limit := int64(pageSize)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := mongodb.GetCollection("posts")

	// Sort by created_at descending
	opts := options.Find().
		SetSkip(skip).
		SetLimit(limit).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}
	defer cursor.Close(ctx)

	var posts []mongoModels.Post
	if err := cursor.All(ctx, &posts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode posts"})
		return
	}

	// Format response for mobile app
	var mobilePosts []gin.H
	for _, post := range posts {
		mobilePosts = append(mobilePosts, gin.H{
			"id":             post.ID.Hex(),
			"user":           post.Username,
			"wallet_address": post.WalletAddress,
			"content":        post.Content,
			"time":           formatTimeAgo(post.CreatedAt),
			"likes":          post.LikesCount,
			"comments":       post.CommentsCount,
			"created_at":     post.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":        true,
		"data":      mobilePosts,
		"page":      page,
		"page_size": pageSize,
	})
}

// CreatePost creates a new community post in MongoDB
func CreatePost(c *gin.Context) {
	var input struct {
		WalletAddress string `json:"wallet_address" binding:"required"`
		Username      string `json:"username"`
		Content       string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Default username if not provided
	username := input.Username
	if username == "" {
		username = input.WalletAddress[:8] + "..."
	}

	post := mongoModels.Post{
		UserID:        input.WalletAddress,
		Username:      username,
		WalletAddress: input.WalletAddress,
		Content:       input.Content,
		LikesCount:    0,
		CommentsCount: 0,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := mongodb.GetCollection("posts")
	result, err := collection.InsertOne(ctx, post)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	post.ID = result.InsertedID.(primitive.ObjectID)

	c.JSON(http.StatusCreated, gin.H{
		"ok":   true,
		"data": post,
	})
}

// LikePost increments the like count for a post
func LikePost(c *gin.Context) {
	idStr := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := mongodb.GetCollection("posts")

	update := bson.M{
		"$inc": bson.M{"likes_count": 1},
		"$set": bson.M{"updated_at": time.Now()},
	}

	result, err := collection.UpdateByID(ctx, objectID, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like post"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":      true,
		"message": "Post liked successfully",
	})
}

// UnlikePost decrements the like count for a post
func UnlikePost(c *gin.Context) {
	idStr := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := mongodb.GetCollection("posts")

	// Ensure likes_count doesn't go below 0
	update := bson.M{
		"$inc": bson.M{"likes_count": -1},
		"$set": bson.M{"updated_at": time.Now()},
	}

	filter := bson.M{
		"_id":         objectID,
		"likes_count": bson.M{"$gt": 0},
	}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike post"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found or already at 0 likes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":      true,
		"message": "Post unliked successfully",
	})
}

// GetComments returns comments for a specific post
func GetComments(c *gin.Context) {
	postIDStr := c.Param("id")

	postID, err := primitive.ObjectIDFromHex(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := mongodb.GetCollection("comments")

	// Sort by created_at ascending (oldest first)
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: 1}})

	cursor, err := collection.Find(ctx, bson.M{"post_id": postID}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}
	defer cursor.Close(ctx)

	var comments []mongoModels.Comment
	if err := cursor.All(ctx, &comments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode comments"})
		return
	}

	// Format response for mobile app
	var mobileComments []gin.H
	for _, comment := range comments {
		mobileComments = append(mobileComments, gin.H{
			"id":         comment.ID.Hex(),
			"post_id":    comment.PostID.Hex(),
			"user":       comment.Username,
			"user_id":    comment.UserID,
			"content":    comment.Content,
			"created_at": comment.CreatedAt,
			"time":       formatTimeAgo(comment.CreatedAt),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":   true,
		"data": mobileComments,
	})
}

// CreateComment creates a new comment on a post
func CreateComment(c *gin.Context) {
	postIDStr := c.Param("id")

	postID, err := primitive.ObjectIDFromHex(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var input struct {
		WalletAddress string `json:"wallet_address" binding:"required"`
		Username      string `json:"username"`
		Content       string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Default username if not provided
	username := input.Username
	if username == "" {
		username = input.WalletAddress[:8] + "..."
	}

	comment := mongoModels.Comment{
		PostID:    postID,
		UserID:    input.WalletAddress,
		Username:  username,
		Content:   input.Content,
		CreatedAt: time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Insert comment
	collection := mongodb.GetCollection("comments")
	result, err := collection.InsertOne(ctx, comment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		return
	}

	comment.ID = result.InsertedID.(primitive.ObjectID)

	// Increment comments count on the post
	postsCollection := mongodb.GetCollection("posts")
	update := bson.M{
		"$inc": bson.M{"comments_count": 1},
		"$set": bson.M{"updated_at": time.Now()},
	}

	_, err = postsCollection.UpdateByID(ctx, postID, update)
	if err != nil {
		// Log error but don't fail the request
		// The comment was created successfully
		c.JSON(http.StatusCreated, gin.H{
			"ok":      true,
			"data":    comment,
			"warning": "Comment created but post count may not be updated",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"ok":   true,
		"data": comment,
	})
}

// Helper function to format time ago
func formatTimeAgo(t time.Time) string {
	duration := time.Since(t)

	if duration.Hours() < 1 {
		return strconv.Itoa(int(duration.Minutes())) + "m"
	} else if duration.Hours() < 24 {
		return strconv.Itoa(int(duration.Hours())) + "h"
	} else {
		days := int(duration.Hours() / 24)
		return strconv.Itoa(days) + "d"
	}
}
