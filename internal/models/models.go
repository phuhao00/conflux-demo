package models

import (
	"time"
	"gorm.io/gorm"
)

// 农产品种类
type FarmProduct struct {
	ID           uint   `json:"id" gorm:"primaryKey"`
	Name         string `json:"name" gorm:"not null"`
	Category     string `json:"category" gorm:"not null;index"`
	CategoryName string `json:"categoryName" gorm:"column:category_name;not null"`
	Icon         string `json:"icon" gorm:"not null"`
	Description  string `json:"desc" gorm:"column:description;type:text"`
	Batches      int    `json:"batches" gorm:"default:0"`
	Enterprises  int    `json:"enterprises" gorm:"default:0"`
	Color        string `json:"color" gorm:"not null"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// 数字证书
type Certificate struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Type        string    `json:"type" gorm:"not null;index"`
	TypeName    string    `json:"typeName" gorm:"column:type_name;not null"`
	TypeClass   string    `json:"typeClass" gorm:"column:type_class;not null"`
	Icon        string    `json:"icon" gorm:"not null"`
	Title       string    `json:"title" gorm:"not null"`
	Product     string    `json:"product" gorm:"not null"`
	Enterprise  string    `json:"enterprise" gorm:"not null"`
	Issuer      string    `json:"issuer" gorm:"not null"`
	IssueDate   time.Time `json:"issueDate" gorm:"column:issue_date;type:date"`
	ExpiryDate  time.Time `json:"expiryDate" gorm:"column:expiry_date;type:date"`
	CertNumber  string    `json:"certNumber" gorm:"column:cert_number;not null"`
	Status      string    `json:"status" gorm:"not null;index"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// 溯源记录
type TraceRecord struct {
	ID         string    `json:"id" gorm:"primaryKey"`
	Product    string    `json:"product" gorm:"not null"`
	Icon       string    `json:"icon" gorm:"not null"`
	Status     string    `json:"status" gorm:"not null;index"`
	StatusText string    `json:"statusText" gorm:"column:status_text;not null"`
	Enterprise string    `json:"enterprise" gorm:"not null"`
	Origin     string    `json:"origin" gorm:"not null"`
	Timeline   []TraceTimeline `json:"timeline" gorm:"foreignKey:TraceID"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// 溯源时间线
type TraceTimeline struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	TraceID     string    `json:"traceId" gorm:"column:trace_id;not null;index"`
	Title       string    `json:"title" gorm:"not null"`
	Time        time.Time `json:"time" gorm:"not null"`
	Description string    `json:"desc" gorm:"column:description;type:text"`
	Location    string    `json:"location" gorm:"not null"`
	Operator    string    `json:"operator" gorm:"not null"`
	SortOrder   int       `json:"sortOrder" gorm:"column:sort_order;not null"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// 账户余额
type Account struct {
	Address   string  `json:"address" gorm:"primaryKey"`
	Balance   float64 `json:"balance" gorm:"type:decimal(10,2);default:0"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// 订单
type Order struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	Address   string    `json:"address" gorm:"not null"`
	AmountRMB float64   `json:"amountRmb" gorm:"column:amount_rmb;type:decimal(10,2);not null"`
	Status    string    `json:"status" gorm:"not null"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// 审计日志
type AuditLog struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Event     string    `json:"event" gorm:"not null"`
	Payload   string    `json:"payload" gorm:"type:text"`
	Timestamp int64     `json:"ts" gorm:"column:ts;not null"`
	CreatedAt time.Time `json:"createdAt"`
}

// 统计数据响应
type Statistics struct {
	ProductTypes  int64 `json:"productTypes"`
	TraceBatches  int64 `json:"traceBatches"`
	Enterprises   int64 `json:"enterprises"`
	Certificates  int64 `json:"certificates"`
	TodayQueries  int64 `json:"todayQueries"`
	SuccessRate   float64 `json:"successRate"`
	InTransit     int64 `json:"inTransit"`
	AvgQueryTime  string `json:"avgQueryTime"`
}