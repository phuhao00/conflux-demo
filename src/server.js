const express = require('express')
const bodyParser = require('body-parser')
const { ethers } = require('ethers')
const { loadConfig } = require('./util/config')
const ledger = require('./util/ledger')
const relayer = require('./util/relayer')
const audit = require('./util/audit')
const limits = require('./util/limits')
const meta = require('./util/metadata')
const alerts = require('./util/alerts')
const payments = require('./util/payments')
const orders = require('./util/orders')
const sig = require('./util/signature')
const notify = require('./util/notify')
const path = require('path')
const fs = require('fs-extra')
const { query, init } = require('./util/db')
const limitsCfg = require('./util/limits_config')

const app = express()
app.use(bodyParser.json())
app.use(express.static(path.join(process.cwd(), 'public')))

const cfg = loadConfig()
const provider = new ethers.JsonRpcProvider(cfg.rpcUrl)
init(cfg).then(() => { }).catch(() => { })

function adminAuth(req, res, next) {
  if (!req.path.startsWith('/admin')) return next()
  const hdr = req.headers.authorization || ''
  if (!cfg.adminUser || !cfg.adminPass) return res.status(403).json({ error: 'admin_not_configured' })
  if (!hdr.startsWith('Basic ')) return res.status(401).set('WWW-Authenticate', 'Basic').json({ error: 'unauthorized' })
  const decoded = Buffer.from(hdr.replace('Basic ', ''), 'base64').toString('utf-8')
  const [u, p] = decoded.split(':')
  if (u === cfg.adminUser && p === cfg.adminPass) return next()
  return res.status(401).json({ error: 'unauthorized' })
}
app.use(adminAuth)

app.post('/topup', async (req, res) => {
  try {
    const { address, rmb } = req.body || {}
    if (!address || typeof rmb !== 'number' || rmb <= 0) {
      return res.status(400).json({ error: 'invalid_input' })
    }
    const bal = await ledger.addBalance(address, rmb)
    await audit.record('topup', { address, rmb })
    return res.json({ ok: true, balance: bal })
  } catch (e) {
    console.error('Topup Error:', e)
    return res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.get('/balance/:address', async (req, res) => {
  try {
    const addr = req.params.address
    const bal = await ledger.getBalance(addr)
    return res.json({ address: addr, balance: bal })
  } catch (e) {
    console.error('Balance Error:', e)
    return res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.post('/relay/nft/transfer', async (req, res) => {
  try {
    const { from, to, tokenId, nftAddress } = req.body || {}
    if (!from || !to || !tokenId || !nftAddress) {
      return res.status(400).json({ error: 'invalid_input' })
    }
    const feeData = await provider.getFeeData()
    const gasPrice = feeData.gasPrice
    const estimate = await relayer.estimateNFTTransferGas(provider, cfg.relayerKey, nftAddress, from, to, tokenId)
    const costCFX = gasPrice * BigInt(estimate)
    const costRMB = relayer.costCNY(costCFX, cfg.exchangeRate)
    if (cfg.alertRmbThreshold && Number(costRMB) >= Number(cfg.alertRmbThreshold)) await alerts.record('high_cost', { action: 'nft_transfer', from, costRMB })
    const dyn = await limitsCfg.getCurrent(cfg)
    const allowed = await limits.checkAndConsume('nft_transfer', from, dyn, costRMB)
    if (!allowed) return res.status(429).json({ error: 'limit_exceeded' })
    const ok = await ledger.reserveAndCharge(from, costRMB, cfg.minRmbBalance)
    if (!ok) {
      return res.status(402).json({ error: 'insufficient_rmb_balance', needed: costRMB })
    }
    const tx = await relayer.transferNFT(provider, cfg.relayerKey, nftAddress, from, to, tokenId)
    await audit.record('nft_transfer', { from, to, tokenId, nftAddress, chargedRMB: costRMB, txHash: tx.hash })
    return res.json({ ok: true, txHash: tx.hash, chargedRMB: costRMB })
  } catch (e) {
    console.error('Transfer Error:', e)
    const msg = String(e.message || '')
    if (msg.startsWith('onchain:')) {
      const name = msg.replace('onchain:', '')
      if (name === 'ERC721InsufficientApproval') return res.status(403).json({ error: 'transfer_not_approved' })
      if (name === 'ERC721IncorrectOwner' || name === 'ERC721NonexistentToken') return res.status(404).json({ error: 'token_not_transferable' })
      if (name === 'ERC721InvalidReceiver') return res.status(400).json({ error: 'invalid_receiver' })
    }
    return res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.post('/relay/nft/mint', async (req, res) => {
  try {
    const { from, to, tokenId, nftAddress, uri, origin, harvestTime, inspectionId } = req.body || {}
    if (!from || !to || !tokenId || !nftAddress || !origin || !inspectionId || typeof harvestTime === 'undefined') {
      return res.status(400).json({ error: 'invalid_input' })
    }
    let finalUri = uri
    if (!finalUri) {
      const built = meta.build(origin, harvestTime, inspectionId, {})
      const uploaded = await meta.upload(cfg, built)
      finalUri = uploaded || ''
    }
    let contentHash = '0x'
    if (!uri) {
      const built = meta.build(origin, harvestTime, inspectionId, {})
      contentHash = meta.hashJson(built)
    } else {
      contentHash = meta.hashString(finalUri)
    }
    const feeData = await provider.getFeeData()
    const gasPrice = feeData.gasPrice
    const estimate = await relayer.estimateNFTMintGas(provider, cfg.relayerKey, nftAddress, to, tokenId, finalUri, origin, BigInt(harvestTime), inspectionId, contentHash)
    const costCFX = gasPrice * BigInt(estimate)
    const costRMB = relayer.costCNY(costCFX, cfg.exchangeRate)
    if (cfg.alertRmbThreshold && Number(costRMB) >= Number(cfg.alertRmbThreshold)) await alerts.record('high_cost', { action: 'nft_mint', from, costRMB })
    const dyn = await limitsCfg.getCurrent(cfg)
    const allowed = await limits.checkAndConsume('nft_mint', from, dyn, costRMB)
    if (!allowed) return res.status(429).json({ error: 'limit_exceeded' })
    const ok = await ledger.reserveAndCharge(from, costRMB, cfg.minRmbBalance)
    if (!ok) {
      return res.status(402).json({ error: 'insufficient_rmb_balance', needed: costRMB })
    }
    const tx = await relayer.mintNFTWithInfo(provider, cfg.relayerKey, nftAddress, to, tokenId, finalUri, origin, BigInt(harvestTime), inspectionId, contentHash)
    await audit.record('nft_mint', { from, to, tokenId, nftAddress, chargedRMB: costRMB, txHash: tx.hash, uri: finalUri, origin, harvestTime, inspectionId, contentHash })
    return res.json({ ok: true, txHash: tx.hash, chargedRMB: costRMB, uri: finalUri, contentHash })
  } catch (e) {
    console.error('Mint Error:', e)
    const msg = String(e.message || '')
    if (msg.startsWith('onchain:')) {
      const name = msg.replace('onchain:', '')
      if (name === 'OwnableUnauthorizedAccount') return res.status(403).json({ error: 'contract_owner_required' })
      if (name === 'ERC721InvalidReceiver') return res.status(400).json({ error: 'invalid_receiver' })
    }
    return res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.post('/metadata/upload-file', async (req, res) => {
  try {
    const { data } = req.body || {}
    if (!data) return res.status(400).json({ error: 'invalid_input' })
    const base64 = data.replace(/^data:.*;base64,/, '')
    const buf = Buffer.from(base64, 'base64')
    const uri = await meta.uploadFile(cfg, buf)
    if (!uri) return res.status(503).json({ error: 'ipfs_unavailable' })
    return res.json({ ok: true, uri })
  } catch (e) {
    console.error('Upload File Error:', e)
    return res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.post('/metadata/upload', async (req, res) => {
  try {
    const { origin, harvestTime, inspectionId, extra } = req.body || {}
    if (!origin || !inspectionId || typeof harvestTime === 'undefined') return res.status(400).json({ error: 'invalid_input' })
    const built = meta.build(origin, harvestTime, inspectionId, extra || {})
    const uploaded = await meta.upload(cfg, built)
    if (!uploaded) return res.status(503).json({ error: 'ipfs_unavailable' })
    return res.json({ ok: true, uri: uploaded })
  } catch (e) {
    console.error('Upload Error:', e)
    return res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.get('/nft/batch/:nftAddress/:tokenId/details', async (req, res) => {
  try {
    const nftAddress = req.params.nftAddress
    const tokenId = Number(req.params.tokenId)
    if (!ethers.isAddress(nftAddress)) return res.status(400).json({ error: 'invalid_input' })
    const code = await provider.getCode(nftAddress)
    if (!code || code === '0x' || code === '0x0') return res.status(404).json({ error: 'contract_not_found' })
    const abi = [
      'function tokenURI(uint256 tokenId) view returns (string)',
      'function getBatchInfo(uint256 tokenId) view returns (tuple(string origin,uint64 harvestTime,string inspectionId,bytes32 contentHash))'
    ]
    const c = new ethers.Contract(nftAddress, abi, provider)
    let uri, info
    try {
      uri = await c.tokenURI(tokenId)
    } catch (e) {
      const data = e.data || e.error?.data
      try {
        const errIf = new ethers.Interface(['error ERC721NonexistentToken(uint256 tokenId)'])
        const parsed = errIf.parseError(data)
        if (parsed?.name === 'ERC721NonexistentToken') return res.status(404).json({ error: 'token_not_found' })
      } catch {}
      if ((e && String(e.message || '').includes('nonexistent token'))) return res.status(404).json({ error: 'token_not_found' })
      throw e
    }
    try {
      info = await c.getBatchInfo(tokenId)
    } catch (e) {
      if ((e && String(e.message || '').includes('nonexistent token'))) return res.status(404).json({ error: 'token_not_found' })
      throw e
    }
    const safeInfo = {
      origin: info.origin,
      harvestTime: Number(info.harvestTime || 0),
      inspectionId: info.inspectionId,
      contentHash: info.contentHash
    }
    const metaJson = await meta.fetchUri(cfg, uri)
    return res.json({ ok: true, tokenId, nftAddress, uri, onchain: safeInfo, offchain: metaJson })
  } catch (e) {
    console.error('Details Error:', e)
    return res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.post('/payments/create-order', async (req, res) => {
  try {
    const { address, rmb, provider } = req.body || {}
    if (!address || !rmb) return res.status(400).json({ error: 'invalid_input' })
    const order = await orders.create(address, Number(rmb))
    const pay = await require('./util/payments').createOrder(address, Number(rmb), provider)
    await audit.record('payment_order', order)
    return res.json({ ok: true, order, pay })
  } catch (e) {
    console.error('Create Order Error:', e)
    return res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.post('/payments/callback', async (req, res) => {
  try {
    const { id, address, rmb, payload, signature, provider } = req.body || {}
    if (!id || !address || !rmb) return res.status(400).json({ error: 'invalid_input' })
    let valid = false
    if (provider === 'wechat') valid = await require('./util/pay_providers/wechat').verifyCallback(payload, signature, cfg)
    else if (provider === 'alipay') valid = await require('./util/pay_providers/alipay').verifyCallback(payload, signature, cfg)
    else valid = sig.verifyPayload(cfg.signKey, payload || { id, address, rmb }, signature)
    if (!valid) return res.status(401).json({ error: 'invalid_signature' })
    const ord = await orders.setStatus(id, 'paid')
    const bal = await ledger.addBalance(address, Number(rmb))
    await audit.record('payment_settled', { id, address, rmb })
    return res.json({ ok: true, balance: bal })
  } catch (e) {
    console.error('Callback Error:', e)
    return res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.get('/admin/audit', async (req, res) => {
  try {
    const page = Number(req.query.page || 1)
    const size = Math.min(200, Math.max(1, Number(req.query.size || 50)))
    const offset = (page - 1) * size
    const event = req.query.event || ''
    const fromTs = Number(req.query.fromTs || 0)
    const toTs = Number(req.query.toTs || 0)
    let sql = 'SELECT id,event,payload,ts FROM audit_logs'
    const wh = []
    const params = []
    if (event) { wh.push('event=?'); params.push(event) }
    if (fromTs) { wh.push('ts>=?'); params.push(fromTs) }
    if (toTs) { wh.push('ts<=?'); params.push(toTs) }
    if (wh.length) sql += ' WHERE ' + wh.join(' AND ')
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?'
    params.push(size, offset)
    const rows = await query(sql, params)
    return res.json({ page, size, rows })
  } catch (e) {
    console.error('Audit Error:', e)
    res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.get('/admin/alerts', async (req, res) => {
  try {
    const page = Number(req.query.page || 1)
    const size = Math.min(200, Math.max(1, Number(req.query.size || 50)))
    const offset = (page - 1) * size
    const type = req.query.type || ''
    const fromTs = Number(req.query.fromTs || 0)
    const toTs = Number(req.query.toTs || 0)
    let sql = 'SELECT id,type,payload,ts FROM alerts'
    const wh = []
    const params = []
    if (type) { wh.push('type=?'); params.push(type) }
    if (fromTs) { wh.push('ts>=?'); params.push(fromTs) }
    if (toTs) { wh.push('ts<=?'); params.push(toTs) }
    if (wh.length) sql += ' WHERE ' + wh.join(' AND ')
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?'
    params.push(size, offset)
    const rows = await query(sql, params)
    return res.json({ page, size, rows })
  } catch (e) {
    console.error('Alerts Error:', e)
    res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.get('/admin/limits', async (req, res) => {
  try {
    const dyn = await limitsCfg.getCurrent(cfg)
    return res.json({ maxTxPerDay: dyn.maxTxPerDay, maxRmbPerTx: dyn.maxRmbPerTx, maxRmbPerDay: dyn.maxRmbPerDay, alertRmbThreshold: dyn.alertRmbThreshold })
  } catch (e) {
    console.error('Limits Error:', e)
    res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.post('/admin/set-limits', async (req, res) => {
  try {
    const { maxTxPerDay, maxRmbPerTx, maxRmbPerDay, alertRmbThreshold } = req.body || {}
    await limitsCfg.setLimits({ maxTxPerDay, maxRmbPerTx, maxRmbPerDay, alertRmbThreshold })
    return res.json({ ok: true, updatedAt: Date.now() })
  } catch (e) {
    console.error('Set Limits Error:', e)
    res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.post('/admin/notify-test', async (req, res) => {
  try {
    await notify.sendWebhook(cfg, { test: true })
    await notify.sendEmail(cfg, 'Test', 'Test Notification')
    return res.json({ ok: true })
  } catch (e) {
    console.error('Notify Test Error:', e)
    res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.post('/nft/qrcode-payload', async (req, res) => {
  try {
    const { nftAddress, tokenId, uri } = req.body || {}
    if (!nftAddress || typeof tokenId === 'undefined' || !uri) return res.status(400).json({ error: 'invalid_input' })
    const payload = { nftAddress, tokenId, uri }
    const signature = sig.signPayload(cfg.signKey, payload)
    return res.json({ ok: true, payload, signature })
  } catch (e) {
    console.error('QR Payload Error:', e)
    res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.post('/nft/qrcode-verify', async (req, res) => {
  try {
    const { payload, signature } = req.body || {}
    if (!payload || !signature) return res.status(400).json({ error: 'invalid_input' })
    const okSig = sig.verifyPayload(cfg.signKey, payload, signature)
    if (!okSig) return res.status(401).json({ error: 'invalid_signature' })
    const { nftAddress, tokenId, uri } = payload
    const abi = [
      'function tokenURI(uint256 tokenId) view returns (string)',
      'function getBatchInfo(uint256 tokenId) view returns (tuple(string origin,uint64 harvestTime,string inspectionId,bytes32 contentHash))'
    ]
    const c = new ethers.Contract(nftAddress, abi, provider)
    const [onUri, info] = await Promise.all([c.tokenURI(tokenId), c.getBatchInfo(tokenId)])
    const off = await meta.fetchUri(cfg, uri)
    const calcHash = off ? meta.hashJson(off) : meta.hashString(uri)
    const matches = (onUri === uri) && (String(info.contentHash).toLowerCase() === String(calcHash).toLowerCase())
    return res.json({ ok: matches, onchain: { uri: onUri, contentHash: info.contentHash }, calcHash })
  } catch (e) {
    console.error('QR Verify Error:', e)
    return res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.get('/nft/default-address', async (req, res) => {
  try {
    const p = path.join(process.cwd(), 'data', 'deployment.json')
    if (!fs.existsSync(p)) return res.json({ ok: false })
    const j = await fs.readJson(p)
    return res.json({ ok: true, address: j.contractAddress })
  } catch (e) {
    console.error('Default Address Error:', e)
    return res.status(500).json({ error: 'server_error', details: e.message })
  }
})

app.listen(cfg.port, () => {
  console.log(`Server listening on http://localhost:${cfg.port}/`)
})