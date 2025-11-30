async function createOrder(address, amountRmb) {
  const id = `WX-${Date.now()}`
  const payUrl = `https://wx.pay.sandbox/${id}`
  return { id, address, amountRmb, provider: 'wechat', payUrl }
}

async function verifyCallback(payload, signature, cfg) {
  return !!signature
}

module.exports = { createOrder, verifyCallback }