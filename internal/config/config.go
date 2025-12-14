package config

import (
	"os"
)

type Config struct {
	DatabaseURL  string
	Environment  string
	JWTSecret    string
	Port         string
	AdminUser    string
	AdminPass    string
}

func Load() *Config {
	return &Config{
		DatabaseURL: getEnv("DATABASE_URL", "root:password@tcp(localhost:3306)/conflux_farm?charset=utf8mb4&parseTime=True&loc=Local"),
		Environment: getEnv("ENVIRONMENT", "development"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key"),
		Port:        getEnv("PORT", "8080"),
		AdminUser:   getEnv("ADMIN_USER", "admin"),
		AdminPass:   getEnv("ADMIN_PASS", "admin123"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}