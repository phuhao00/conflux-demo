const path = require('path')
const fs = require('fs-extra')
const cache = require('./cache')

const dbPath = path.join(process.cwd(), 'data', 'limits.json')

async function ensure() {
  await fs.ensureFile(dbPath)
  const text = await fs.readFile(dbPath, 'utf-8').catch(() => '')
  if (!text) await fs.writeFile(dbPath, JSON.stringify({ daily: {} }, null, 2))
}

function todayKey() {
  const d = new Date()
  return `${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`
}

async function getAll() {
  await ensure()
  return fs.readJSON(dbPath)
}

async function saveAll(all) {
  await fs.writeJSON(dbPath, all, { spaces: 2 })
}

async function checkAndConsume(action, address, cfg, amountRmb) {
  const cli = cache.get()
  const key = todayKey()
  if (!cli) {
    const all = await getAll()
    all.daily[key] = all.daily[key] || {}
    const rec = all.daily[key][address] || { tx: 0, spent: 0 }
    if (cfg.maxRmbPerTx && Number(amountRmb) > Number(cfg.maxRmbPerTx)) return false
    const nextTx = rec.tx + 1
    const nextSpent = rec.spent + Number(amountRmb)
    if (cfg.maxTxPerDay && nextTx > Number(cfg.maxTxPerDay)) return false
    if (cfg.maxRmbPerDay && nextSpent > Number(cfg.maxRmbPerDay)) return false
    rec.tx = nextTx
    rec.spent = nextSpent
    all.daily[key][address] = rec
    await saveAll(all)
    return true
  } else {
    const ttl = (() => {
      const d = new Date()
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1)
      return Math.max(1, Math.floor((end.getTime()-d.getTime())/1000))
    })()
    const ktx = `lim:${key}:${address}:tx`
    const kspent = `lim:${key}:${address}:spent`
    const curTx = Number(await cli.get(ktx) || 0)
    const curSpent = Number(await cli.get(kspent) || 0)
    if (cfg.maxRmbPerTx && Number(amountRmb) > Number(cfg.maxRmbPerTx)) return false
    const nextTx = curTx + 1
    const nextSpent = curSpent + Number(amountRmb)
    if (cfg.maxTxPerDay && nextTx > Number(cfg.maxTxPerDay)) return false
    if (cfg.maxRmbPerDay && nextSpent > Number(cfg.maxRmbPerDay)) return false
    await cli.set(ktx, String(nextTx), 'EX', ttl)
    await cli.set(kspent, String(nextSpent), 'EX', ttl)
    return true
  }
}

module.exports = { checkAndConsume }