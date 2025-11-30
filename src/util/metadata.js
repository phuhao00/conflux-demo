const { ethers } = require('ethers')

async function getClient(cfg) {
  const mod = await import('ipfs-http-client')
  const create = mod.create || mod.default?.create || mod.default || mod
  return create({ url: cfg.ipfsUrl, headers: { Authorization: `Bearer ${cfg.ipfsKey}` } })
}

function build(origin, harvestTime, inspectionId, extra) {
  const base = {
    schema: 'conflux-farm-batch-v1',
    origin,
    harvestTime,
    inspectionId,
    createdAt: Date.now(),
  }
  const ext = (extra && typeof extra === 'object') ? extra : {}
  const merged = { ...base, ...ext }
  if (ext.batchId) merged.batchId = String(ext.batchId)
  if (ext.lat && ext.lng) merged.location = { lat: Number(ext.lat), lng: Number(ext.lng) }
  if (Array.isArray(ext.photos)) merged.photos = ext.photos.map(String)
  if (ext.inspectionAuthority) merged.inspectionAuthority = String(ext.inspectionAuthority)
  if (ext.certificateId) merged.certificateId = String(ext.certificateId)
  return merged
}

async function upload(cfg, json) {
  if (!cfg.ipfsUrl || !cfg.ipfsKey) return null
  const client = await getClient(cfg)
  const { cid } = await client.add(JSON.stringify(json))
  return `ipfs://${cid.toString()}`
}

async function uploadFile(cfg, buffer) {
  if (!cfg.ipfsUrl || !cfg.ipfsKey) return null
  const client = await getClient(cfg)
  const { cid } = await client.add(buffer)
  return `ipfs://${cid.toString()}`
}

function toHttp(uri) {
  if (!uri) return ''
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '')
    return `https://ipfs.io/ipfs/${cid}`
  }
  return uri
}

async function fetchUri(cfg, uri) {
  if (!uri) return null
  if (uri.startsWith('ipfs://') && cfg.ipfsUrl && cfg.ipfsKey) {
    const client = await getClient(cfg)
    const cid = uri.replace('ipfs://', '')
    let data = ''
    for await (const chunk of client.cat(cid)) {
      data += Buffer.from(chunk).toString('utf-8')
    }
    try { return JSON.parse(data) } catch { return null }
  }
  const http = toHttp(uri)
  try {
    const r = await fetch(http)
    const j = await r.json()
    return j
  } catch {
    return null
  }
}

function hashString(s) {
  return ethers.keccak256(ethers.toUtf8Bytes(String(s || '')))
}

function hashJson(json) {
  return hashString(JSON.stringify(json))
}

module.exports = { build, upload, uploadFile, toHttp, fetchUri, hashString, hashJson }