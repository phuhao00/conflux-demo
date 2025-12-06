package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID            uint           `gorm:"primarykey" json:"id"`
	WalletAddress string         `gorm:"uniqueIndex;size:42" json:"wallet_address"`
	Username      string         `gorm:"size:100" json:"username"`
	Email         string         `gorm:"uniqueIndex;size:100" json:"email"`
	Password      string         `gorm:"size:255" json:"-"` // Password hash, not returned in JSON
	Balance       float64        `gorm:"default:0" json:"balance"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// News represents news or policy articles
type News struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Type      string    `gorm:"size:20;index" json:"type"` // "news" or "policy"
	Title     string    `gorm:"size:255" json:"title"`
	Summary   string    `gorm:"type:text" json:"summary"`
	Content   string    `gorm:"type:text" json:"content"`
	Icon      string    `gorm:"size:50" json:"icon"`
	Date      time.Time `json:"date"`
	CreatedAt time.Time `json:"created_at"`
}

// MarketData represents commodity price data
type MarketData struct {
	ID            uint      `gorm:"primarykey" json:"id"`
	ProductName   string    `gorm:"size:100;index" json:"product_name"`
	Icon          string    `gorm:"size:50" json:"icon"`
	Price         float64   `json:"price"`
	Change        float64   `json:"change"`
	ChangePercent string    `gorm:"size:20" json:"change_percent"`
	Timestamp     time.Time `gorm:"index" json:"timestamp"`
}

// Post represents a community post
type Post struct {
	ID            uint      `gorm:"primarykey" json:"id"`
	UserID        uint      `gorm:"index" json:"user_id"`
	User          User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Content       string    `gorm:"type:text" json:"content"`
	LikesCount    int       `gorm:"default:0" json:"likes_count"`
	CommentsCount int       `gorm:"default:0" json:"comments_count"`
	CreatedAt     time.Time `json:"created_at"`
}

// Product represents an RWA investment product
type Product struct {
	ID              uint      `gorm:"primarykey" json:"id"`
	Name            string    `gorm:"size:255" json:"name"`
	Description     string    `gorm:"type:text" json:"description"`
	Icon            string    `gorm:"size:50" json:"icon"`
	YieldRate       string    `gorm:"size:20" json:"yield_rate"`
	Price           string    `gorm:"size:50" json:"price"`
	Duration        string    `gorm:"size:50" json:"duration"`
	RiskLevel       string    `gorm:"size:20" json:"risk_level"` // "low", "medium", "high"
	ContractAddress string    `gorm:"size:42" json:"contract_address"`
	CreatedAt       time.Time `json:"created_at"`
}

// Transaction represents a blockchain transaction
type Transaction struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	UserID    uint      `gorm:"index" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Type      string    `gorm:"size:50" json:"type"` // "deposit", "withdrawal", "investment", "yieldPayout"
	Amount    string    `gorm:"size:100" json:"amount"`
	Status    string    `gorm:"size:20;index" json:"status"` // "pending", "success", "failed"
	TxHash    string    `gorm:"size:66;uniqueIndex" json:"tx_hash"`
	CreatedAt time.Time `json:"created_at"`
}

// UserAsset represents a user's purchased product/asset
type UserAsset struct {
	ID               uint      `gorm:"primarykey" json:"id"`
	WalletAddress    string    `gorm:"size:42;index" json:"wallet_address"`
	ProductID        uint      `gorm:"index" json:"product_id"`
	Product          Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	TokenID          string    `gorm:"size:100" json:"token_id"`
	NFTAddress       string    `gorm:"size:42" json:"nft_address"`
	InvestmentAmount float64   `json:"investment_amount"`
	PurchaseDate     time.Time `json:"purchase_date"`
	Status           string    `gorm:"size:20;default:'active'" json:"status"` // "active", "sold", "matured"
	TxHash           string    `gorm:"size:66" json:"tx_hash"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
