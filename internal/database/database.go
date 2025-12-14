package database

import (
	"conflux-farm/internal/models"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func Initialize(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(mysql.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// 自动迁移数据库表
	err = db.AutoMigrate(
		&models.FarmProduct{},
		&models.Certificate{},
		&models.TraceRecord{},
		&models.TraceTimeline{},
		&models.Account{},
		&models.Order{},
		&models.AuditLog{},
	)
	if err != nil {
		return nil, err
	}

	// 种子数据
	if err := seedData(db); err != nil {
		return nil, err
	}

	return db, nil
}

func seedData(db *gorm.DB) error {
	return SeedData(db)
}

func SeedData(db *gorm.DB) error {
	// 检查是否已有农产品数据
	var count int64
	db.Model(&models.FarmProduct{}).Count(&count)
	if count > 0 {
		return nil // 数据已存在，跳过种子数据
	}

	// 农产品种子数据
	products := []models.FarmProduct{
		{Name: "有机大米", Category: "grain", CategoryName: "粮食作物", Icon: "🌾", Description: "来自黑龙江五常的优质有机大米，无农药无化肥，口感香甜软糯", Batches: 1250, Enterprises: 45, Color: "#FFD700"},
		{Name: "普洱茶", Category: "tea", CategoryName: "茶叶", Icon: "🍵", Description: "云南普洱古树茶，经过传统工艺发酵，茶香浓郁，回甘持久", Batches: 856, Enterprises: 32, Color: "#8B4513"},
		{Name: "新鲜蔬菜", Category: "vegetable", CategoryName: "蔬菜", Icon: "🥬", Description: "山东寿光大棚蔬菜，新鲜采摘，绿色健康，当日配送", Batches: 2340, Enterprises: 78, Color: "#32CD32"},
		{Name: "苹果", Category: "fruit", CategoryName: "水果", Icon: "🍎", Description: "陕西洛川红富士苹果，果形端正，色泽鲜艳，脆甜多汁", Batches: 1680, Enterprises: 56, Color: "#FF4500"},
		{Name: "小麦", Category: "grain", CategoryName: "粮食作物", Icon: "🌾", Description: "河南优质小麦，籽粒饱满，蛋白质含量高，适合制作面粉", Batches: 980, Enterprises: 38, Color: "#DAA520"},
		{Name: "龙井茶", Category: "tea", CategoryName: "茶叶", Icon: "🍃", Description: "杭州西湖龙井，明前采摘，色泽翠绿，香气清高，味道甘醇", Batches: 645, Enterprises: 28, Color: "#90EE90"},
		{Name: "西红柿", Category: "vegetable", CategoryName: "蔬菜", Icon: "🍅", Description: "新疆番茄，日照充足，糖分高，口感酸甜适中", Batches: 1420, Enterprises: 52, Color: "#FF6347"},
		{Name: "橙子", Category: "fruit", CategoryName: "水果", Icon: "🍊", Description: "江西赣南脐橙，果肉细嫩，汁多味甜，维生素C含量丰富", Batches: 1890, Enterprises: 64, Color: "#FFA500"},
		{Name: "玉米", Category: "grain", CategoryName: "粮食作物", Icon: "🌽", Description: "吉林甜玉米，颗粒饱满，口感香甜，营养价值高", Batches: 1120, Enterprises: 42, Color: "#FFD700"},
		{Name: "铁观音", Category: "tea", CategoryName: "茶叶", Icon: "🍵", Description: "福建安溪铁观音，兰花香浓郁，滋味醇厚，回甘明显", Batches: 720, Enterprises: 30, Color: "#556B2F"},
		{Name: "黄瓜", Category: "vegetable", CategoryName: "蔬菜", Icon: "🥒", Description: "有机黄瓜，清脆爽口，水分充足，适合生食或凉拌", Batches: 1560, Enterprises: 48, Color: "#228B22"},
		{Name: "草莓", Category: "fruit", CategoryName: "水果", Icon: "🍓", Description: "大棚草莓，果实鲜红，香气浓郁，甜度高，口感细腻", Batches: 980, Enterprises: 36, Color: "#DC143C"},
	}

	if err := db.Create(&products).Error; err != nil {
		return err
	}

	// 证书种子数据
	certificates := []models.Certificate{
		{ID: "CERT-ORG-2024-001", Type: "organic", TypeName: "有机认证", TypeClass: "cert-type-organic", Icon: "🌱", Title: "有机产品认证证书", Product: "有机大米", Enterprise: "黑龙江五常米业有限公司", Issuer: "中国有机产品认证中心", IssueDate: time.Date(2024, 1, 15, 0, 0, 0, 0, time.UTC), ExpiryDate: time.Date(2025, 1, 14, 0, 0, 0, 0, time.UTC), CertNumber: "ORG-2024-HLJ-001", Status: "有效"},
		{ID: "CERT-QLT-2024-002", Type: "quality", TypeName: "质量认证", TypeClass: "cert-type-quality", Icon: "⭐", Title: "优质农产品认证", Product: "云南普洱茶", Enterprise: "云南普洱茶业集团", Issuer: "国家质量监督检验检疫总局", IssueDate: time.Date(2024, 3, 20, 0, 0, 0, 0, time.UTC), ExpiryDate: time.Date(2025, 3, 19, 0, 0, 0, 0, time.UTC), CertNumber: "QLT-2024-YN-002", Status: "有效"},
		{ID: "CERT-ORI-2024-003", Type: "origin", TypeName: "原产地认证", TypeClass: "cert-type-origin", Icon: "📍", Title: "地理标志产品认证", Product: "陕西洛川苹果", Enterprise: "陕西洛川果业有限公司", Issuer: "国家知识产权局", IssueDate: time.Date(2024, 2, 10, 0, 0, 0, 0, time.UTC), ExpiryDate: time.Date(2027, 2, 9, 0, 0, 0, 0, time.UTC), CertNumber: "GEO-2024-SX-003", Status: "有效"},
		{ID: "CERT-SAF-2024-004", Type: "safety", TypeName: "食品安全", TypeClass: "cert-type-safety", Icon: "🛡️", Title: "食品安全管理体系认证", Product: "山东寿光蔬菜", Enterprise: "山东寿光农业科技有限公司", Issuer: "中国食品安全认证中心", IssueDate: time.Date(2024, 4, 5, 0, 0, 0, 0, time.UTC), ExpiryDate: time.Date(2025, 4, 4, 0, 0, 0, 0, time.UTC), CertNumber: "FSMS-2024-SD-004", Status: "有效"},
		{ID: "CERT-ORG-2024-005", Type: "organic", TypeName: "有机认证", TypeClass: "cert-type-organic", Icon: "🌱", Title: "有机茶叶认证证书", Product: "福建安溪铁观音", Enterprise: "福建安溪茶业有限公司", Issuer: "中国有机产品认证中心", IssueDate: time.Date(2024, 5, 12, 0, 0, 0, 0, time.UTC), ExpiryDate: time.Date(2025, 5, 11, 0, 0, 0, 0, time.UTC), CertNumber: "ORG-2024-FJ-005", Status: "有效"},
		{ID: "CERT-QLT-2024-006", Type: "quality", TypeName: "质量认证", TypeClass: "cert-type-quality", Icon: "⭐", Title: "ISO 9001质量管理体系", Product: "河南优质小麦", Enterprise: "河南粮食集团有限公司", Issuer: "中国质量认证中心", IssueDate: time.Date(2024, 6, 18, 0, 0, 0, 0, time.UTC), ExpiryDate: time.Date(2027, 6, 17, 0, 0, 0, 0, time.UTC), CertNumber: "ISO-2024-HN-006", Status: "有效"},
		{ID: "CERT-ORI-2024-007", Type: "origin", TypeName: "原产地认证", TypeClass: "cert-type-origin", Icon: "📍", Title: "地理标志保护产品", Product: "江西赣南脐橙", Enterprise: "江西赣南果业有限公司", Issuer: "国家市场监督管理总局", IssueDate: time.Date(2024, 7, 22, 0, 0, 0, 0, time.UTC), ExpiryDate: time.Date(2027, 7, 21, 0, 0, 0, 0, time.UTC), CertNumber: "GEO-2024-JX-007", Status: "有效"},
		{ID: "CERT-SAF-2024-008", Type: "safety", TypeName: "食品安全", TypeClass: "cert-type-safety", Icon: "🛡️", Title: "HACCP食品安全认证", Product: "吉林甜玉米", Enterprise: "吉林农业科技股份有限公司", Issuer: "中国食品安全认证中心", IssueDate: time.Date(2024, 8, 15, 0, 0, 0, 0, time.UTC), ExpiryDate: time.Date(2025, 8, 14, 0, 0, 0, 0, time.UTC), CertNumber: "HACCP-2024-JL-008", Status: "有效"},
		{ID: "CERT-ORG-2024-009", Type: "organic", TypeName: "有机认证", TypeClass: "cert-type-organic", Icon: "🌱", Title: "有机蔬菜认证证书", Product: "有机黄瓜", Enterprise: "北京有机农场有限公司", Issuer: "中国有机产品认证中心", IssueDate: time.Date(2024, 9, 10, 0, 0, 0, 0, time.UTC), ExpiryDate: time.Date(2025, 9, 9, 0, 0, 0, 0, time.UTC), CertNumber: "ORG-2024-BJ-009", Status: "有效"},
		{ID: "CERT-QLT-2024-010", Type: "quality", TypeName: "质量认证", TypeClass: "cert-type-quality", Icon: "⭐", Title: "绿色食品认证", Product: "大棚草莓", Enterprise: "浙江草莓种植基地", Issuer: "中国绿色食品发展中心", IssueDate: time.Date(2024, 10, 5, 0, 0, 0, 0, time.UTC), ExpiryDate: time.Date(2025, 10, 4, 0, 0, 0, 0, time.UTC), CertNumber: "GRN-2024-ZJ-010", Status: "有效"},
		{ID: "CERT-ORI-2024-011", Type: "origin", TypeName: "原产地认证", TypeClass: "cert-type-origin", Icon: "📍", Title: "农产品地理标志", Product: "新疆番茄", Enterprise: "新疆番茄产业集团", Issuer: "农业农村部", IssueDate: time.Date(2024, 11, 12, 0, 0, 0, 0, time.UTC), ExpiryDate: time.Date(2027, 11, 11, 0, 0, 0, 0, time.UTC), CertNumber: "AGI-2024-XJ-011", Status: "有效"},
		{ID: "CERT-SAF-2024-012", Type: "safety", TypeName: "食品安全", TypeClass: "cert-type-safety", Icon: "🛡️", Title: "食品生产许可证", Product: "杭州龙井茶", Enterprise: "杭州西湖龙井茶业", Issuer: "浙江省市场监督管理局", IssueDate: time.Date(2024, 12, 1, 0, 0, 0, 0, time.UTC), ExpiryDate: time.Date(2029, 11, 30, 0, 0, 0, 0, time.UTC), CertNumber: "FPL-2024-ZJ-012", Status: "有效"},
	}

	if err := db.Create(&certificates).Error; err != nil {
		return err
	}

	// 溯源记录种子数据
	traceRecords := []models.TraceRecord{
		{ID: "TB20241210001", Product: "有机大米", Icon: "🌾", Status: "verified", StatusText: "已完成", Enterprise: "黑龙江五常米业", Origin: "黑龙江五常"},
		{ID: "TB20241210002", Product: "云南普洱茶", Icon: "🍵", Status: "transit", StatusText: "运输中", Enterprise: "云南普洱茶业", Origin: "云南普洱"},
		{ID: "TB20241210003", Product: "山东寿光蔬菜", Icon: "🥬", Status: "pending", StatusText: "质检中", Enterprise: "山东寿光农业", Origin: "山东寿光"},
		{ID: "TB20241209001", Product: "陕西洛川苹果", Icon: "🍎", Status: "verified", StatusText: "已完成", Enterprise: "陕西洛川果业", Origin: "陕西洛川"},
		{ID: "TB20241208001", Product: "福建安溪铁观音", Icon: "🍃", Status: "verified", StatusText: "已完成", Enterprise: "福建安溪茶业", Origin: "福建安溪"},
	}

	if err := db.Create(&traceRecords).Error; err != nil {
		return err
	}

	// 时间线种子数据
	timelines := []models.TraceTimeline{
		// 有机大米的完整时间线
		{TraceID: "TB20241210001", Title: "种植阶段", Time: time.Date(2024, 5, 15, 8, 0, 0, 0, time.UTC), Description: "在黑龙江五常有机种植基地开始播种，使用有机肥料，无农药种植", Location: "黑龙江五常", Operator: "张师傅", SortOrder: 1},
		{TraceID: "TB20241210001", Title: "生长管理", Time: time.Date(2024, 7, 20, 10, 30, 0, 0, time.UTC), Description: "进行田间管理，定期检测土壤和水质，确保有机标准", Location: "黑龙江五常", Operator: "李经理", SortOrder: 2},
		{TraceID: "TB20241210001", Title: "收割加工", Time: time.Date(2024, 10, 10, 14, 0, 0, 0, time.UTC), Description: "机械收割，经过清洗、烘干、去壳等工序，包装入库", Location: "五常加工厂", Operator: "王主管", SortOrder: 3},
		{TraceID: "TB20241210001", Title: "质检认证", Time: time.Date(2024, 10, 12, 9, 0, 0, 0, time.UTC), Description: "通过国家有机产品认证检测，各项指标符合标准", Location: "质检中心", Operator: "质检员", SortOrder: 4},
		{TraceID: "TB20241210001", Title: "仓储物流", Time: time.Date(2024, 10, 15, 16, 0, 0, 0, time.UTC), Description: "入库存储，温湿度控制良好，准备发往各地经销商", Location: "中央仓库", Operator: "仓管员", SortOrder: 5},
		{TraceID: "TB20241210001", Title: "配送完成", Time: time.Date(2024, 12, 10, 11, 20, 0, 0, time.UTC), Description: "已配送至北京、上海、广州等地的超市和电商平台", Location: "全国各地", Operator: "物流部", SortOrder: 6},
		
		// 普洱茶的时间线
		{TraceID: "TB20241210002", Title: "茶园采摘", Time: time.Date(2024, 3, 20, 6, 0, 0, 0, time.UTC), Description: "在云南普洱古茶园进行春茶采摘，选用一芽二叶标准", Location: "云南普洱", Operator: "采茶工", SortOrder: 1},
		{TraceID: "TB20241210002", Title: "初制加工", Time: time.Date(2024, 3, 20, 18, 0, 0, 0, time.UTC), Description: "经过杀青、揉捻、晒青等传统工艺制作", Location: "普洱茶厂", Operator: "制茶师", SortOrder: 2},
		{TraceID: "TB20241210002", Title: "发酵陈化", Time: time.Date(2024, 4, 1, 10, 0, 0, 0, time.UTC), Description: "进入发酵仓库，控制温湿度进行自然发酵", Location: "发酵仓库", Operator: "技术员", SortOrder: 3},
		{TraceID: "TB20241210002", Title: "压制包装", Time: time.Date(2024, 11, 15, 14, 0, 0, 0, time.UTC), Description: "压制成饼茶，真空包装，贴上溯源二维码", Location: "包装车间", Operator: "包装工", SortOrder: 4},
		{TraceID: "TB20241210002", Title: "发货运输", Time: time.Date(2024, 12, 8, 9, 0, 0, 0, time.UTC), Description: "通过冷链物流发往全国各地茶叶专卖店", Location: "物流中心", Operator: "物流员", SortOrder: 5},
		
		// 蔬菜的时间线
		{TraceID: "TB20241210003", Title: "大棚种植", Time: time.Date(2024, 11, 1, 7, 0, 0, 0, time.UTC), Description: "在智能温控大棚中种植，使用滴灌技术和有机肥", Location: "山东寿光", Operator: "种植户", SortOrder: 1},
		{TraceID: "TB20241210003", Title: "生长监测", Time: time.Date(2024, 11, 20, 10, 0, 0, 0, time.UTC), Description: "定期检测蔬菜生长情况，记录温度、湿度、光照数据", Location: "山东寿光", Operator: "农技员", SortOrder: 2},
		{TraceID: "TB20241210003", Title: "采收包装", Time: time.Date(2024, 12, 9, 5, 0, 0, 0, time.UTC), Description: "清晨采收新鲜蔬菜，立即进行清洗、分拣、包装", Location: "包装车间", Operator: "采收工", SortOrder: 3},
		{TraceID: "TB20241210003", Title: "质量检测", Time: time.Date(2024, 12, 10, 8, 0, 0, 0, time.UTC), Description: "正在进行农药残留检测和营养成分分析", Location: "检测中心", Operator: "检测员", SortOrder: 4},
	}

	if err := db.Create(&timelines).Error; err != nil {
		return err
	}

	return nil
}