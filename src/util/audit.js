const path = require('path')
const fs = require('fs-extra')

const logPath = path.join(process.cwd(), 'data', 'audit.log')
const { init, exec } = require('./db')

async function record(event, payload) {
  await fs.ensureFile(logPath)
  const line = JSON.stringify({ ts: Date.now(), event, payload }) + '\n'
  await fs.appendFile(logPath, line)
  await init()
  await exec('INSERT INTO audit_logs (event, payload, ts) VALUES (?, ?, ?)', [event, JSON.stringify(payload), Date.now()])
}

module.exports = { record }