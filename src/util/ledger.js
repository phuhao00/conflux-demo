const path = require('path')
const fs = require('fs-extra')

const dbPath = path.join(process.cwd(), 'data', 'ledger.json')

async function ensure() {
  await fs.ensureFile(dbPath)
  const text = await fs.readFile(dbPath, 'utf-8').catch(() => '')
  if (!text) await fs.writeFile(dbPath, JSON.stringify({ balances: {} }, null, 2))
}

async function getAll() {
  await ensure()
  const json = await fs.readJSON(dbPath)
  return json
}

async function saveAll(all) {
  await fs.writeJSON(dbPath, all, { spaces: 2 })
}

async function addBalance(address, rmb) {
  const all = await getAll()
  const cur = Number(all.balances[address] || 0)
  all.balances[address] = cur + Number(rmb)
  await saveAll(all)
  return all.balances[address]
}

async function getBalance(address) {
  const all = await getAll()
  return Number(all.balances[address] || 0)
}

async function reserveAndCharge(address, rmb, minRmbBalance) {
  const all = await getAll()
  const cur = Number(all.balances[address] || 0)
  if (cur < Number(rmb) + Number(minRmbBalance)) return false
  all.balances[address] = cur - Number(rmb)
  await saveAll(all)
  return true
}

module.exports = { addBalance, getBalance, reserveAndCharge }