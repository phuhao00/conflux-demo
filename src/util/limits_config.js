const { init, query, exec } = require('./db')
const path = require('path')
const fs = require('fs-extra')

async function getCurrent(cfg) {
  await init()
  const rows = await query('SELECT max_tx_per_day AS maxTxPerDay, max_rmb_per_tx AS maxRmbPerTx, max_rmb_per_day AS maxRmbPerDay, alert_rmb_threshold AS alertRmbThreshold, updated_at AS updatedAt FROM limits_config ORDER BY id DESC LIMIT 1')
  if (rows && rows[0]) {
    const r = rows[0]
    return {
      ...cfg,
      maxTxPerDay: Number(r.maxTxPerDay || cfg.maxTxPerDay || 0),
      maxRmbPerTx: Number(r.maxRmbPerTx || cfg.maxRmbPerTx || 0),
      maxRmbPerDay: Number(r.maxRmbPerDay || cfg.maxRmbPerDay || 0),
      alertRmbThreshold: Number(r.alertRmbThreshold || cfg.alertRmbThreshold || 0)
    }
  }
  try {
    const p = path.join(process.cwd(), 'data', 'admin.json')
    if (fs.existsSync(p)) {
      const j = await fs.readJson(p)
      return { ...cfg, ...j }
    }
  } catch {}
  return cfg
}

async function setLimits(body) {
  await init()
  const { maxTxPerDay = 0, maxRmbPerTx = 0, maxRmbPerDay = 0, alertRmbThreshold = 0 } = body || {}
  await exec('INSERT INTO limits_config (max_tx_per_day, max_rmb_per_tx, max_rmb_per_day, alert_rmb_threshold, updated_at) VALUES (?, ?, ?, ?, ?)', [Number(maxTxPerDay), Number(maxRmbPerTx), Number(maxRmbPerDay), Number(alertRmbThreshold), Date.now()])
}

module.exports = { getCurrent, setLimits }