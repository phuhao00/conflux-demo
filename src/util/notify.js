const nodemailer = require('nodemailer')

async function sendEmail(cfg, subject, text) {
  if (!cfg.smtpHost) return false
  const transporter = nodemailer.createTransport({
    host: cfg.smtpHost,
    port: Number(cfg.smtpPort || 465),
    secure: true,
    auth: cfg.smtpUser && cfg.smtpPass ? { user: cfg.smtpUser, pass: cfg.smtpPass } : undefined
  })
  const to = cfg.smtpTo || cfg.smtpUser
  if (!to) return false
  await transporter.sendMail({ from: cfg.smtpUser, to, subject, text })
  return true
}

async function sendWebhook(cfg, body) {
  if (!cfg.webhookUrl) return false
  try {
    const r = await fetch(cfg.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    return r.ok
  } catch {
    return false
  }
}

module.exports = { sendEmail, sendWebhook }