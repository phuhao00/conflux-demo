const mysql = require('mysql2/promise')

function parseDsn(dsn) {
  const m = String(dsn || '').match(/^([^:]+):([^@]+)@tcp\(([^:]+):(\d+)\)\/([^?]+)(?:\?(.*))?$/)
  if (!m) return null
  return { user: m[1], password: m[2], host: m[3], port: Number(m[4]), database: m[5] }
}

let pool

async function init(cfg) {
  if (pool) return pool
  const url = process.env.MYSQL_URL || ''
  const dsn = process.env.MYSQL_DSN || ''
  if (url) pool = await mysql.createPool(url)
  else {
    const p = parseDsn(dsn)
    pool = await mysql.createPool(p || { host: 'localhost', user: 'root', password: 'root', database: 'creaibo', port: 3306 })
  }
  await ensureTables()
  return pool
}

async function ensureTables() {
  await exec(`CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    address VARCHAR(128) NOT NULL,
    amount_rmb DECIMAL(10,2) NOT NULL,
    status VARCHAR(16) NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NULL
  )`)
  await exec(`CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event VARCHAR(64) NOT NULL,
    payload TEXT NOT NULL,
    ts BIGINT NOT NULL
  )`)
  await exec(`CREATE TABLE IF NOT EXISTS alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    payload TEXT NOT NULL,
    ts BIGINT NOT NULL
  )`)
  await exec(`CREATE TABLE IF NOT EXISTS limits_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    max_tx_per_day INT DEFAULT 0,
    max_rmb_per_tx DECIMAL(10,2) DEFAULT 0,
    max_rmb_per_day DECIMAL(10,2) DEFAULT 0,
    alert_rmb_threshold DECIMAL(10,2) DEFAULT 0,
    updated_at BIGINT NOT NULL
  )`)
  await exec(`CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(32) NOT NULL,
    summary TEXT NOT NULL,
    icon VARCHAR(32) NOT NULL,
    created_at BIGINT NOT NULL
  )`)
  await exec(`CREATE TABLE IF NOT EXISTS market_prices (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    change_val VARCHAR(32) NOT NULL,
    change_percent VARCHAR(32) NOT NULL,
    icon VARCHAR(32) NOT NULL,
    updated_at BIGINT NOT NULL
  )`)
  await exec(`CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    yield_rate VARCHAR(32) NOT NULL,
    price VARCHAR(32) NOT NULL,
    duration VARCHAR(32) NOT NULL,
    risk VARCHAR(32) NOT NULL,
    icon VARCHAR(32) NOT NULL,
    created_at BIGINT NOT NULL
  )`)
  
  // 农产品种类表
  await exec(`CREATE TABLE IF NOT EXISTS farm_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    category_name VARCHAR(64) NOT NULL,
    icon VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    batches INT DEFAULT 0,
    enterprises INT DEFAULT 0,
    color VARCHAR(32) NOT NULL,
    created_at BIGINT NOT NULL,
    INDEX idx_category (category)
  )`)
  
  // 数字证书表
  await exec(`CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    type_name VARCHAR(64) NOT NULL,
    type_class VARCHAR(64) NOT NULL,
    icon VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    product VARCHAR(255) NOT NULL,
    enterprise VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    cert_number VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at BIGINT NOT NULL,
    INDEX idx_type (type),
    INDEX idx_status (status)
  )`)
  
  // 溯源记录表
  await exec(`CREATE TABLE IF NOT EXISTS trace_records (
    id VARCHAR(64) PRIMARY KEY,
    product VARCHAR(255) NOT NULL,
    icon VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    status_text VARCHAR(64) NOT NULL,
    enterprise VARCHAR(255) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL,
    INDEX idx_status (status)
  )`)
  
  // 溯源时间线表
  await exec(`CREATE TABLE IF NOT EXISTS trace_timeline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trace_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    time DATETIME NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    operator VARCHAR(128) NOT NULL,
    sort_order INT NOT NULL,
    created_at BIGINT NOT NULL,
    FOREIGN KEY (trace_id) REFERENCES trace_records(id) ON DELETE CASCADE,
    INDEX idx_trace_id (trace_id)
  )`)
  
  await seedData()
}

async function seedData() {
  try {
    // 种子农产品数据
    const [farmProducts] = await pool.query('SELECT count(*) as c FROM farm_products')
    if (farmProducts[0].c === 0) {
      const products = [
        { name: '有机大米', category: 'grain', category_name: '粮食作物', icon: '🌾', description: '来自黑龙江五常的优质有机大米，无农药无化肥，口感香甜软糯', batches: 1250, enterprises: 45, color: '#FFD700' },
        { name: '普洱茶', category: 'tea', category_name: '茶叶', icon: '🍵', description: '云南普洱古树茶，经过传统工艺发酵，茶香浓郁，回甘持久', batches: 856, enterprises: 32, color: '#8B4513' },
        { name: '新鲜蔬菜', category: 'vegetable', category_name: '蔬菜', icon: '🥬', description: '山东寿光大棚蔬菜，新鲜采摘，绿色健康，当日配送', batches: 2340, enterprises: 78, color: '#32CD32' },
        { name: '苹果', category: 'fruit', category_name: '水果', icon: '🍎', description: '陕西洛川红富士苹果，果形端正，色泽鲜艳，脆甜多汁', batches: 1680, enterprises: 56, color: '#FF4500' },
        { name: '小麦', category: 'grain', category_name: '粮食作物', icon: '🌾', description: '河南优质小麦，籽粒饱满，蛋白质含量高，适合制作面粉', batches: 980, enterprises: 38, color: '#DAA520' },
        { name: '龙井茶', category: 'tea', category_name: '茶叶', icon: '🍃', description: '杭州西湖龙井，明前采摘，色泽翠绿，香气清高，味道甘醇', batches: 645, enterprises: 28, color: '#90EE90' },
        { name: '西红柿', category: 'vegetable', category_name: '蔬菜', icon: '🍅', description: '新疆番茄，日照充足，糖分高，口感酸甜适中', batches: 1420, enterprises: 52, color: '#FF6347' },
        { name: '橙子', category: 'fruit', category_name: '水果', icon: '🍊', description: '江西赣南脐橙，果肉细嫩，汁多味甜，维生素C含量丰富', batches: 1890, enterprises: 64, color: '#FFA500' },
        { name: '玉米', category: 'grain', category_name: '粮食作物', icon: '🌽', description: '吉林甜玉米，颗粒饱满，口感香甜，营养价值高', batches: 1120, enterprises: 42, color: '#FFD700' },
        { name: '铁观音', category: 'tea', category_name: '茶叶', icon: '🍵', description: '福建安溪铁观音，兰花香浓郁，滋味醇厚，回甘明显', batches: 720, enterprises: 30, color: '#556B2F' },
        { name: '黄瓜', category: 'vegetable', category_name: '蔬菜', icon: '🥒', description: '有机黄瓜，清脆爽口，水分充足，适合生食或凉拌', batches: 1560, enterprises: 48, color: '#228B22' },
        { name: '草莓', category: 'fruit', category_name: '水果', icon: '🍓', description: '大棚草莓，果实鲜红，香气浓郁，甜度高，口感细腻', batches: 980, enterprises: 36, color: '#DC143C' }
      ]
      for (const p of products) {
        await exec('INSERT INTO farm_products (name, category, category_name, icon, description, batches, enterprises, color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [p.name, p.category, p.category_name, p.icon, p.description, p.batches, p.enterprises, p.color, Date.now()])
      }
    }
    
    // 种子证书数据
    const [certs] = await pool.query('SELECT count(*) as c FROM certificates')
    if (certs[0].c === 0) {
      const certificates = [
        { id: 'CERT-ORG-2024-001', type: 'organic', type_name: '有机认证', type_class: 'cert-type-organic', icon: '🌱', title: '有机产品认证证书', product: '有机大米', enterprise: '黑龙江五常米业有限公司', issuer: '中国有机产品认证中心', issue_date: '2024-01-15', expiry_date: '2025-01-14', cert_number: 'ORG-2024-HLJ-001', status: '有效' },
        { id: 'CERT-QLT-2024-002', type: 'quality', type_name: '质量认证', type_class: 'cert-type-quality', icon: '⭐', title: '优质农产品认证', product: '云南普洱茶', enterprise: '云南普洱茶业集团', issuer: '国家质量监督检验检疫总局', issue_date: '2024-03-20', expiry_date: '2025-03-19', cert_number: 'QLT-2024-YN-002', status: '有效' },
        { id: 'CERT-ORI-2024-003', type: 'origin', type_name: '原产地认证', type_class: 'cert-type-origin', icon: '📍', title: '地理标志产品认证', product: '陕西洛川苹果', enterprise: '陕西洛川果业有限公司', issuer: '国家知识产权局', issue_date: '2024-02-10', expiry_date: '2027-02-09', cert_number: 'GEO-2024-SX-003', status: '有效' },
        { id: 'CERT-SAF-2024-004', type: 'safety', type_name: '食品安全', type_class: 'cert-type-safety', icon: '🛡️', title: '食品安全管理体系认证', product: '山东寿光蔬菜', enterprise: '山东寿光农业科技有限公司', issuer: '中国食品安全认证中心', issue_date: '2024-04-05', expiry_date: '2025-04-04', cert_number: 'FSMS-2024-SD-004', status: '有效' },
        { id: 'CERT-ORG-2024-005', type: 'organic', type_name: '有机认证', type_class: 'cert-type-organic', icon: '🌱', title: '有机茶叶认证证书', product: '福建安溪铁观音', enterprise: '福建安溪茶业有限公司', issuer: '中国有机产品认证中心', issue_date: '2024-05-12', expiry_date: '2025-05-11', cert_number: 'ORG-2024-FJ-005', status: '有效' }
      ]
      for (const c of certificates) {
        await exec('INSERT INTO certificates (id, type, type_name, type_class, icon, title, product, enterprise, issuer, issue_date, expiry_date, cert_number, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [c.id, c.type, c.type_name, c.type_class, c.icon, c.title, c.product, c.enterprise, c.issuer, c.issue_date, c.expiry_date, c.cert_number, c.status, Date.now()])
      }
    }
    
    // 种子溯源记录数据
    const [traces] = await pool.query('SELECT count(*) as c FROM trace_records')
    if (traces[0].c === 0) {
      const records = [
        { id: 'TB20241210001', product: '有机大米', icon: '🌾', status: 'verified', status_text: '已完成', enterprise: '黑龙江五常米业', origin: '黑龙江五常' },
        { id: 'TB20241210002', product: '云南普洱茶', icon: '🍵', status: 'transit', status_text: '运输中', enterprise: '云南普洱茶业', origin: '云南普洱' },
        { id: 'TB20241210003', product: '山东寿光蔬菜', icon: '🥬', status: 'pending', status_text: '质检中', enterprise: '山东寿光农业', origin: '山东寿光' }
      ]
      for (const r of records) {
        await exec('INSERT INTO trace_records (id, product, icon, status, status_text, enterprise, origin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [r.id, r.product, r.icon, r.status, r.status_text, r.enterprise, r.origin, Date.now()])
      }
      
      // 添加时间线数据
      const timelines = [
        { trace_id: 'TB20241210001', title: '种植阶段', time: '2024-05-15 08:00:00', description: '在黑龙江五常有机种植基地开始播种，使用有机肥料，无农药种植', location: '黑龙江五常', operator: '张师傅', sort_order: 1 },
        { trace_id: 'TB20241210001', title: '生长管理', time: '2024-07-20 10:30:00', description: '进行田间管理，定期检测土壤和水质，确保有机标准', location: '黑龙江五常', operator: '李经理', sort_order: 2 },
        { trace_id: 'TB20241210001', title: '收割加工', time: '2024-10-10 14:00:00', description: '机械收割，经过清洗、烘干、去壳等工序，包装入库', location: '五常加工厂', operator: '王主管', sort_order: 3 }
      ]
      for (const t of timelines) {
        await exec('INSERT INTO trace_timeline (trace_id, title, time, description, location, operator, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [t.trace_id, t.title, t.time, t.description, t.location, t.operator, t.sort_order, Date.now()])
      }
    }
    
    const [news] = await pool.query('SELECT count(*) as c FROM news')
    if (news[0].c === 0) {
      const items = [
        { id: '1', type: 'policy', title: '2025 Agricultural Subsidy Policy Released', date: '2025-12-01', summary: 'New subsidies for sustainable farming practices have been announced...', icon: 'document-text' },
        { id: '2', type: 'news', title: 'Global Wheat Prices Surge', date: '2025-12-02', summary: 'Due to unexpected weather patterns, wheat prices have hit a 5-year high.', icon: 'trending-up' },
        { id: '3', type: 'policy', title: 'Digital Agriculture Infrastructure Plan', date: '2025-11-30', summary: 'Government invests 50B in rural 5G and IoT networks.', icon: 'wifi' },
        { id: '4', type: 'news', title: 'Smart Farming Tech Expo 2025', date: '2025-11-28', summary: 'The latest innovations in autonomous tractors and drone monitoring.', icon: 'hardware-chip' },
        { id: '5', type: 'news', title: 'Organic Certification Process Simplified', date: '2025-11-25', summary: 'New streamlined process for farmers to get organic certification.', icon: 'leaf' }
      ]
      for (const item of items) {
        await exec('INSERT INTO news (id, type, title, date, summary, icon, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [item.id, item.type, item.title, item.date, item.summary, item.icon, Date.now()])
      }
    }

    const [market] = await pool.query('SELECT count(*) as c FROM market_prices')
    if (market[0].c === 0) {
      const items = [
        { id: '1', name: 'Wheat (Soft Red)', price: 235.50, change_val: '+2.45', change_percent: '+1.05%', icon: 'barley' },
        { id: '2', name: 'Corn (Yellow)', price: 188.20, change_val: '-1.10', change_percent: '-0.58%', icon: 'corn' },
        { id: '3', name: 'Soybeans', price: 450.00, change_val: '+5.75', change_percent: '+1.29%', icon: 'soy-sauce' },
        { id: '4', name: 'Rice (Rough)', price: 16.40, change_val: '+0.05', change_percent: '+0.31%', icon: 'rice' },
        { id: '5', name: 'Cotton', price: 82.15, change_val: '-0.45', change_percent: '-0.54%', icon: 'flower' },
        { id: '6', name: 'Coffee (Arabica)', price: 195.30, change_val: '+3.20', change_percent: '+1.67%', icon: 'coffee' },
        { id: '7', name: 'Sugar (Raw)', price: 22.40, change_val: '-0.15', change_percent: '-0.67%', icon: 'cube-outline' }
      ]
      for (const item of items) {
        await exec('INSERT INTO market_prices (id, name, price, change_val, change_percent, icon, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [item.id, item.name, item.price, item.change_val, item.change_percent, item.icon, Date.now()])
      }
    }

    const [products] = await pool.query('SELECT count(*) as c FROM products')
    if (products[0].c === 0) {
      const items = [
        { id: '1', name: 'Organic Apple Orchard Share', yield_rate: '8.5%', price: '$500', duration: '12 Months', risk: 'low', icon: 'nutrition' },
        { id: '2', name: 'Sustainable Wheat Farm Bond', yield_rate: '6.2%', price: '$100', duration: '6 Months', risk: 'low', icon: 'barley' },
        { id: '3', name: 'High-Tech Greenhouse Fund', yield_rate: '12.4%', price: '$1000', duration: '24 Months', risk: 'medium', icon: 'greenhouse' },
        { id: '4', name: 'Dairy Farm Expansion Token', yield_rate: '9.1%', price: '$250', duration: '18 Months', risk: 'low', icon: 'cow' },
        { id: '5', name: 'Vertical Farming Venture', yield_rate: '15.0%', price: '$2000', duration: '36 Months', risk: 'high', icon: 'sprout' }
      ]
      for (const item of items) {
        await exec('INSERT INTO products (id, name, yield_rate, price, duration, risk, icon, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [item.id, item.name, item.yield_rate, item.price, item.duration, item.risk, item.icon, Date.now()])
      }
    }
  } catch (e) {
    console.error('Seed Data Error:', e)
  }
}

async function query(sql, params) {
  const [rows] = await pool.query(sql, params)
  return rows
}

async function exec(sql, params) {
  const [res] = await pool.execute(sql, params)
  return res
}

module.exports = { init, query, exec }