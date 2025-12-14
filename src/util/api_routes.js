const db = require('./db')

// 获取农产品列表
async function getFarmProducts(req, res) {
  try {
    const { category } = req.query
    let sql = 'SELECT * FROM farm_products'
    let params = []
    
    if (category && category !== 'all') {
      sql += ' WHERE category = ?'
      params.push(category)
    }
    
    sql += ' ORDER BY created_at DESC'
    const products = await db.query(sql, params)
    
    res.json({
      ok: true,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        categoryName: p.category_name,
        icon: p.icon,
        desc: p.description,
        batches: p.batches,
        enterprises: p.enterprises,
        color: p.color
      }))
    })
  } catch (error) {
    console.error('Get farm products error:', error)
    res.status(500).json({ ok: false, error: 'Failed to get products' })
  }
}

// 获取数字证书列表
async function getCertificates(req, res) {
  try {
    const { type } = req.query
    let sql = 'SELECT * FROM certificates'
    let params = []
    
    if (type && type !== 'all') {
      sql += ' WHERE type = ?'
      params.push(type)
    }
    
    sql += ' ORDER BY created_at DESC'
    const certificates = await db.query(sql, params)
    
    res.json({
      ok: true,
      certificates: certificates.map(c => ({
        id: c.id,
        type: c.type,
        typeName: c.type_name,
        typeClass: c.type_class,
        icon: c.icon,
        title: c.title,
        product: c.product,
        enterprise: c.enterprise,
        issuer: c.issuer,
        issueDate: c.issue_date,
        expiryDate: c.expiry_date,
        certNumber: c.cert_number,
        status: c.status
      }))
    })
  } catch (error) {
    console.error('Get certificates error:', error)
    res.status(500).json({ ok: false, error: 'Failed to get certificates' })
  }
}

// 获取溯源记录列表
async function getTraceRecords(req, res) {
  try {
    const { keyword } = req.query
    let sql = 'SELECT * FROM trace_records'
    let params = []
    
    if (keyword) {
      sql += ' WHERE id LIKE ? OR product LIKE ? OR enterprise LIKE ? OR origin LIKE ?'
      const searchTerm = `%${keyword}%`
      params = [searchTerm, searchTerm, searchTerm, searchTerm]
    }
    
    sql += ' ORDER BY created_at DESC'
    const records = await db.query(sql, params)
    
    // 获取每个记录的时间线
    const recordsWithTimeline = await Promise.all(records.map(async (record) => {
      const timeline = await db.query(
        'SELECT * FROM trace_timeline WHERE trace_id = ? ORDER BY sort_order ASC',
        [record.id]
      )
      
      return {
        id: record.id,
        product: record.product,
        icon: record.icon,
        status: record.status,
        statusText: record.status_text,
        enterprise: record.enterprise,
        origin: record.origin,
        timeline: timeline.map(t => ({
          title: t.title,
          time: t.time,
          desc: t.description,
          location: t.location,
          operator: t.operator
        }))
      }
    }))
    
    res.json({
      ok: true,
      records: recordsWithTimeline
    })
  } catch (error) {
    console.error('Get trace records error:', error)
    res.status(500).json({ ok: false, error: 'Failed to get trace records' })
  }
}

// 获取单个溯源记录详情
async function getTraceRecordDetail(req, res) {
  try {
    const { id } = req.params
    
    const records = await db.query('SELECT * FROM trace_records WHERE id = ?', [id])
    if (records.length === 0) {
      return res.status(404).json({ ok: false, error: 'Trace record not found' })
    }
    
    const record = records[0]
    const timeline = await db.query(
      'SELECT * FROM trace_timeline WHERE trace_id = ? ORDER BY sort_order ASC',
      [id]
    )
    
    res.json({
      ok: true,
      record: {
        id: record.id,
        product: record.product,
        icon: record.icon,
        status: record.status,
        statusText: record.status_text,
        enterprise: record.enterprise,
        origin: record.origin,
        timeline: timeline.map(t => ({
          title: t.title,
          time: t.time,
          desc: t.description,
          location: t.location,
          operator: t.operator
        }))
      }
    })
  } catch (error) {
    console.error('Get trace record detail error:', error)
    res.status(500).json({ ok: false, error: 'Failed to get trace record detail' })
  }
}

// 获取统计数据
async function getStatistics(req, res) {
  try {
    const [productCount] = await db.query('SELECT COUNT(*) as count FROM farm_products')
    const [certCount] = await db.query('SELECT COUNT(*) as count FROM certificates WHERE status = "有效"')
    const [traceCount] = await db.query('SELECT COUNT(*) as count FROM trace_records')
    const [enterpriseCount] = await db.query('SELECT SUM(enterprises) as total FROM farm_products')
    
    res.json({
      ok: true,
      stats: {
        productTypes: productCount[0].count || 0,
        traceBatches: traceCount[0].count || 0,
        enterprises: enterpriseCount[0].total || 0,
        certificates: certCount[0].count || 0
      }
    })
  } catch (error) {
    console.error('Get statistics error:', error)
    res.status(500).json({ ok: false, error: 'Failed to get statistics' })
  }
}

module.exports = {
  getFarmProducts,
  getCertificates,
  getTraceRecords,
  getTraceRecordDetail,
  getStatistics
}
