package mongodb

import (
	"context"
	"fmt"
	"log"
	"time"

	"conflux-demo/backend/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var mongoClient *mongo.Client
var mongoDB *mongo.Database

// Initialize sets up the MongoDB connection
func Initialize(cfg *config.Config) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(cfg.MongoURI)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// Ping to verify connection
	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	mongoClient = client
	mongoDB = client.Database(cfg.MongoDatabase)

	log.Println("MongoDB connected successfully")
	return nil
}

// GetDB returns the MongoDB database instance
func GetDB() *mongo.Database {
	return mongoDB
}

// GetCollection returns a MongoDB collection
func GetCollection(name string) *mongo.Collection {
	return mongoDB.Collection(name)
}

// Close closes the MongoDB connection
func Close() error {
	if mongoClient == nil {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return mongoClient.Disconnect(ctx)
}
