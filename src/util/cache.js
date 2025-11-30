const Redis = require('ioredis')

let client

function get() {
  if (client) return client
  const url = process.env.REDIS_URL || ''
  client = url ? new Redis(url) : null
  return client
}

module.exports = { get }