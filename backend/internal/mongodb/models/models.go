package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Post represents a community post stored in MongoDB
type Post struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID        string             `bson:"user_id" json:"user_id"`
	Username      string             `bson:"username" json:"username"`
	WalletAddress string             `bson:"wallet_address" json:"wallet_address"`
	Content       string             `bson:"content" json:"content"`
	LikesCount    int                `bson:"likes_count" json:"likes_count"`
	CommentsCount int                `bson:"comments_count" json:"comments_count"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updated_at"`
}

// Comment represents a comment on a post
type Comment struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PostID    primitive.ObjectID `bson:"post_id" json:"post_id"`
	UserID    string             `bson:"user_id" json:"user_id"`
	Username  string             `bson:"username" json:"username"`
	Content   string             `bson:"content" json:"content"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

// News represents a news article stored in MongoDB
type News struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Type      string             `bson:"type" json:"type"` // "news" or "policy"
	Title     string             `bson:"title" json:"title"`
	Summary   string             `bson:"summary" json:"summary"`
	Content   string             `bson:"content" json:"content"`
	Icon      string             `bson:"icon" json:"icon"`
	Date      time.Time          `bson:"date" json:"date"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}
