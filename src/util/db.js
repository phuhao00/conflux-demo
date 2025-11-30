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