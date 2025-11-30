async function createOrder(address, amountRmb) {
  const id = `ALI-${Date.now()}`
  const payUrl = `https://ali.pay.sandbox/${id}`
  return { id, address, amountRmb, provider: 'alipay', payUrl }
}

async function verifyCallback(payload, signature, cfg) {
  return !!signature
}

module.exports = { createOrder, verifyCallback }