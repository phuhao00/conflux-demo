const { init, exec, query } = require('./db')

async function create(address, amountRmb) {
  await init()
  const id = `ORD-${Date.now()}`
  await exec('INSERT INTO orders (id, address, amount_rmb, status, created_at) VALUES (?, ?, ?, ?, ?)', [id, address, Number(amountRmb), 'pending', Date.now()])
  return { id, address, amountRmb: Number(amountRmb), status: 'pending', createdAt: Date.now() }
}

async function setStatus(id, status) {
  await init()
  await exec('UPDATE orders SET status=?, updated_at=? WHERE id=?', [status, Date.now(), id])
  const rows = await query('SELECT id, address, amount_rmb AS amountRmb, status, created_at AS createdAt, updated_at AS updatedAt FROM orders WHERE id=?', [id])
  return rows[0] || null
}

async function get(id) {
  await init()
  const rows = await query('SELECT id, address, amount_rmb AS amountRmb, status, created_at AS createdAt, updated_at AS updatedAt FROM orders WHERE id=?', [id])
  return rows[0] || null
}

module.exports = { create, setStatus, get }