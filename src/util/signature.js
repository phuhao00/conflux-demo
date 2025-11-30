const crypto = require('crypto')

function signPayload(secret, payload) {
  const str = JSON.stringify(payload)
  const h = crypto.createHmac('sha256', String(secret || ''))
  h.update(str)
  return h.digest('hex')
}

function verifyPayload(secret, payload, sig) {
  const s = signPayload(secret, payload)
  return s === String(sig || '')
}

module.exports = { signPayload, verifyPayload }