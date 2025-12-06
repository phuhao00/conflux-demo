package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort string
	GinMode    string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	MongoURI      string
	MongoDatabase string

	JWTSecret string

	ConfluxRPCURL    string
	ConfluxNetworkID uint32
	PrivateKey       string

	RWATokenContract    string
	MarketplaceContract string
}

func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	return &Config{
		ServerPort: getEnv("SERVER_PORT", "8080"),
		GinMode:    getEnv("GIN_MODE", "debug"),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "conflux_agri"),

		MongoURI:      getEnv("MONGO_URI", "mongodb://localhost:27017"),
		MongoDatabase: getEnv("MONGO_DATABASE", "conflux_agri"),

		ConfluxRPCURL:    getEnv("CONFLUX_RPC_URL", "https://test.confluxrpc.com"),
		ConfluxNetworkID: 1,
		PrivateKey:       getEnv("PRIVATE_KEY", ""),

		RWATokenContract:    getEnv("RWA_TOKEN_CONTRACT", ""),
		MarketplaceContract: getEnv("MARKETPLACE_CONTRACT", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
