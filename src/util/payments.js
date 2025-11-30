const wx = require('./pay_providers/wechat')
const ali = require('./pay_providers/alipay')

async function createOrder(address, amountRmb, provider) {
  if (provider === 'wechat') return wx.createOrder(address, amountRmb)
  if (provider === 'alipay') return ali.createOrder(address, amountRmb)
  const id = `ORD-${Date.now()}`
  const payUrl = `https://payments.example/${id}`
  return { id, payUrl, address, amountRmb, provider: 'mock' }
}

async function verifyAndCredit(ledger, address, amountRmb) {
  const bal = await ledger.addBalance(address, amountRmb)
  return bal
}

module.exports = { createOrder, verifyAndCredit }