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
  await seedData()
}

async function seedData() {
  try {
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