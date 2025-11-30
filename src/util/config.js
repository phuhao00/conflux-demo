require('dotenv').config()
const fs = require('fs-extra')
const path = require('path')

function loadConfig() {
  return {
    rpcUrl: process.env.ESPACE_RPC_URL || '',
    relayerKey: process.env.RELAYER_PRIVATE_KEY || '',
    exchangeRate: Number(process.env.EXCHANGE_RATE_CFX_CNY || '5.5'),
    minRmbBalance: Number(process.env.MIN_RMB_BALANCE || '1'),
    port: Number(process.env.PORT || '3000'),
    maxRmbPerTx: Number(process.env.MAX_RMB_PER_TX || '0'),
    maxTxPerDay: Number(process.env.MAX_TX_PER_DAY || '0'),
    maxRmbPerDay: Number(process.env.MAX_RMB_PER_DAY || '0'),
    ipfsUrl: process.env.IPFS_API_URL || '',
    ipfsKey: process.env.IPFS_API_KEY || '',
    alertRmbThreshold: Number(process.env.ALERT_RMB_THRESHOLD || '0'),
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: Number(process.env.SMTP_PORT || '0'),
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpTo: process.env.SMTP_TO || '',
    webhookUrl: process.env.WEBHOOK_URL || '',
    signKey: process.env.SECRET_SIGN_KEY || '',
    adminUser: process.env.ADMIN_USER || '',
    adminPass: process.env.ADMIN_PASS || ''
  }
}

function tryOverrideFromAdmin(cfg) {
  try {
    const p = path.join(process.cwd(), 'data', 'admin.json')
    if (!fs.existsSync(p)) return cfg
    const j = fs.readJsonSync(p)
    const keys = ['maxRmbPerTx', 'maxTxPerDay', 'maxRmbPerDay', 'alertRmbThreshold']
    keys.forEach(k => { if (typeof j[k] !== 'undefined') cfg[k] = j[k] })
    return cfg
  } catch {
    return cfg
  }
}

module.exports = { loadConfig: () => tryOverrideFromAdmin(loadConfig()) }
