const path = require('path')
const fs = require('fs-extra')

const alertPath = path.join(process.cwd(), 'data', 'alerts.log')
const { init, exec } = require('./db')

async function record(type, payload) {
  await fs.ensureFile(alertPath)
  const line = JSON.stringify({ ts: Date.now(), type, payload }) + '\n'
  await fs.appendFile(alertPath, line)
  await init()
  await exec('INSERT INTO alerts (type, payload, ts) VALUES (?, ?, ?)', [type, JSON.stringify(payload), Date.now()])
}

module.exports = { record }