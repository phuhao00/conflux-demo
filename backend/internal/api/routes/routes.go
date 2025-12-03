package routes

import (
	"conflux-demo/backend/internal/api/handlers"
	"conflux-demo/backend/internal/api/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(router *gin.Engine) {
	// Apply CORS middleware
	router.Use(middleware.CORS())

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Public routes (no authentication required)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
		}

		// News & Policy routes (public)
		news := v1.Group("/news")
		{
			news.GET("", handlers.GetNews)
			news.GET("/:id", handlers.GetNewsDetail)
		}

		v1.GET("/policies", handlers.GetPolicies)

		// Market routes (public)
		market := v1.Group("/market")
		{
			market.GET("/prices", handlers.GetMarketPrices)
			market.GET("/history/:product", handlers.GetPriceHistory)
		}

		// Protected routes (authentication required)
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// Current user
			protected.GET("/me", handlers.GetCurrentUser)

			// Community routes
			community := protected.Group("/community")
			{
				community.GET("/posts", handlers.GetPosts)
				community.POST("/posts", handlers.CreatePost)
				community.POST("/posts/:id/like", handlers.LikePost)
			}

			// Product routes
			products := protected.Group("/products")
			{
				products.GET("", handlers.GetProducts)
				products.GET("/:id", handlers.GetProductDetail)
				products.POST("/:id/invest", handlers.InvestInProduct)
			}

			// User routes
			user := protected.Group("/user")
			{
				user.GET("/profile", handlers.GetUserProfile)
				user.GET("/balance", handlers.GetBalance)
				user.GET("/transactions", handlers.GetTransactions)
				user.POST("/transfer", handlers.Transfer)
				user.POST("/deposit", handlers.Deposit)
			}
		}
	}

	// Health check (public)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}
