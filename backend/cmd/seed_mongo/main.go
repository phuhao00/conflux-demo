package main

import (
	"context"
	"log"
	"time"

	"conflux-demo/backend/config"
	"conflux-demo/backend/internal/mongodb"
	mongoModels "conflux-demo/backend/internal/mongodb/models"

	"go.mongodb.org/mongo-driver/bson"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize MongoDB
	if err := mongodb.Initialize(cfg); err != nil {
		log.Fatalf("Failed to initialize MongoDB: %v", err)
	}

	log.Println("Starting MongoDB data seeding...")

	// Seed news data
	seedNews()

	// Seed community posts
	seedPosts()

	log.Println("MongoDB data seeding completed!")
}

func seedNews() {
	ctx := context.Background()
	collection := mongodb.GetCollection("news")

	// Clear existing news
	collection.DeleteMany(ctx, bson.M{})

	newsItems := []interface{}{
		mongoModels.News{
			Type:      "policy",
			Title:     "New Agricultural Subsidies Announced",
			Summary:   "Government announces new subsidies for irrigation systems and sustainable farming practices.",
			Content:   "The Ministry of Agriculture has announced a comprehensive package of subsidies aimed at promoting sustainable farming practices. Farmers can now apply for grants covering up to 50% of irrigation system costs.",
			Icon:      "document-text",
			Date:      time.Now().Add(-2 * time.Hour),
			CreatedAt: time.Now(),
		},
		mongoModels.News{
			Type:      "news",
			Title:     "Record Wheat Harvest This Season",
			Summary:   "Farmers across the region report record-breaking wheat yields thanks to favorable weather conditions.",
			Content:   "This year's wheat harvest has exceeded all expectations, with yields up 25% compared to last year. Experts attribute the success to optimal rainfall patterns and improved farming techniques.",
			Icon:      "newspaper",
			Date:      time.Now().Add(-5 * time.Hour),
			CreatedAt: time.Now(),
		},
		mongoModels.News{
			Type:      "policy",
			Title:     "Digital Agriculture Initiative Launched",
			Summary:   "New government program to provide digital tools and training for modern farming.",
			Content:   "The government has launched a comprehensive digital agriculture initiative, offering free training and subsidized access to modern farming technologies including drones, IoT sensors, and data analytics platforms.",
			Icon:      "laptop",
			Date:      time.Now().Add(-1 * 24 * time.Hour),
			CreatedAt: time.Now(),
		},
		mongoModels.News{
			Type:      "news",
			Title:     "Organic Farming Market Expands",
			Summary:   "Demand for organic produce continues to grow, creating new opportunities for farmers.",
			Content:   "The organic farming sector has seen a 40% growth in market demand over the past year. Consumers are increasingly willing to pay premium prices for certified organic products.",
			Icon:      "leaf",
			Date:      time.Now().Add(-2 * 24 * time.Hour),
			CreatedAt: time.Now(),
		},
		mongoModels.News{
			Type:      "news",
			Title:     "Commodity Prices Stabilize",
			Summary:   "After months of volatility, agricultural commodity prices show signs of stabilization.",
			Content:   "Market analysts report that agricultural commodity prices have stabilized following a period of significant volatility. This provides farmers with better planning certainty for the upcoming season.",
			Icon:      "trending-up",
			Date:      time.Now().Add(-3 * 24 * time.Hour),
			CreatedAt: time.Now(),
		},
	}

	result, err := collection.InsertMany(ctx, newsItems)
	if err != nil {
		log.Fatalf("Failed to seed news: %v", err)
	}

	log.Printf("Successfully seeded %d news items", len(result.InsertedIDs))
}

func seedPosts() {
	ctx := context.Background()
	collection := mongodb.GetCollection("posts")

	// Clear existing posts
	collection.DeleteMany(ctx, bson.M{})

	posts := []interface{}{
		mongoModels.Post{
			UserID:        "0xfB11f0cFE930B10696208d52e4AF121507B57B00",
			Username:      "FarmerJohn",
			WalletAddress: "0xfB11f0cFE930B10696208d52e4AF121507B57B00",
			Content:       "Just harvested my first batch of organic corn! The yield is looking great this year. Very excited about the results! 🌽 #harvest #organic",
			LikesCount:    24,
			CommentsCount: 5,
			CreatedAt:     time.Now().Add(-2 * time.Hour),
			UpdatedAt:     time.Now().Add(-2 * time.Hour),
		},
		mongoModels.Post{
			UserID:        "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
			Username:      "AgriTech_Sarah",
			WalletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
			Content:       "Has anyone tried the new drone spraying system? Thinking of investing in one for my orchard. Would love to hear your experiences!",
			LikesCount:    12,
			CommentsCount: 8,
			CreatedAt:     time.Now().Add(-4 * time.Hour),
			UpdatedAt:     time.Now().Add(-4 * time.Hour),
		},
		mongoModels.Post{
			UserID:        "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
			Username:      "GreenThumb",
			WalletAddress: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
			Content:       "Wheat prices are rallying! 📈 Good time to sell if you have stock. The market conditions are favorable right now.",
			LikesCount:    45,
			CommentsCount: 12,
			CreatedAt:     time.Now().Add(-6 * time.Hour),
			UpdatedAt:     time.Now().Add(-6 * time.Hour),
		},
		mongoModels.Post{
			UserID:        "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
			Username:      "RuralLife",
			WalletAddress: "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
			Content:       "Beautiful sunset over the fields today. 🌅 Reminds me why I love farming. There's nothing quite like working the land.",
			LikesCount:    89,
			CommentsCount: 3,
			CreatedAt:     time.Now().Add(-1 * 24 * time.Hour),
			UpdatedAt:     time.Now().Add(-1 * 24 * time.Hour),
		},
		mongoModels.Post{
			UserID:        "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
			Username:      "MarketWatcher",
			WalletAddress: "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
			Content:       "Policy update: New subsidies available for irrigation systems. Check the news tab! This is a great opportunity for farmers to upgrade their equipment. 💧",
			LikesCount:    56,
			CommentsCount: 15,
			CreatedAt:     time.Now().Add(-1 * 24 * time.Hour),
			UpdatedAt:     time.Now().Add(-1 * 24 * time.Hour),
		},
		mongoModels.Post{
			UserID:        "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
			Username:      "TechFarmer",
			WalletAddress: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
			Content:       "Implementing blockchain technology for supply chain tracking. The transparency is amazing! Customers can now see exactly where their food comes from. 🔗",
			LikesCount:    67,
			CommentsCount: 18,
			CreatedAt:     time.Now().Add(-2 * 24 * time.Hour),
			UpdatedAt:     time.Now().Add(-2 * 24 * time.Hour),
		},
		mongoModels.Post{
			UserID:        "0xdD870fA1b7C4700F2BD7f44238821C26f7392148",
			Username:      "OrganicMary",
			WalletAddress: "0xdD870fA1b7C4700F2BD7f44238821C26f7392148",
			Content:       "My tomatoes are thriving this season! 🍅 Using natural pest control methods and the results are incredible. Happy to share tips if anyone is interested!",
			LikesCount:    34,
			CommentsCount: 9,
			CreatedAt:     time.Now().Add(-3 * 24 * time.Hour),
			UpdatedAt:     time.Now().Add(-3 * 24 * time.Hour),
		},
		mongoModels.Post{
			UserID:        "0x583031D1113aD414F02576BD6afaBfb302140225",
			Username:      "CropScience",
			WalletAddress: "0x583031D1113aD414F02576BD6afaBfb302140225",
			Content:       "Soil testing results came back excellent! pH levels are perfect for the next planting season. Proper soil management really pays off. 🌱",
			LikesCount:    28,
			CommentsCount: 6,
			CreatedAt:     time.Now().Add(-4 * 24 * time.Hour),
			UpdatedAt:     time.Now().Add(-4 * 24 * time.Hour),
		},
	}

	result, err := collection.InsertMany(ctx, posts)
	if err != nil {
		log.Fatalf("Failed to seed posts: %v", err)
	}

	log.Printf("Successfully seeded %d community posts", len(result.InsertedIDs))
}
