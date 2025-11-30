const API_BASE = 'http://localhost:3001'

// 测试地址
const TEST_ADDRESS = '0xfB11f0cFE930B10696208d52e4AF121507B57B00'

async function test(name, fn) {
    try {
        console.log(`\n🧪 测试: ${name}`)
        await fn()
        console.log(`✅ ${name} - 通过`)
    } catch (error) {
        console.log(`❌ ${name} - 失败:`, error.message)
    }
}

async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    }
    if (body) options.body = JSON.stringify(body)

    const response = await fetch(API_BASE + endpoint, options)
    const data = await response.json()

    if (!response.ok) {
        throw new Error(JSON.stringify(data))
    }

    return data
}

async function runTests() {
    console.log('=== Conflux Farm API 测试 ===')
    console.log('API 地址:', API_BASE)
    console.log('测试地址:', TEST_ADDRESS)

    // 测试 1: 充值
    await test('充值 100 RMB', async () => {
        const result = await apiCall('/topup', 'POST', {
            address: TEST_ADDRESS,
            rmb: 100
        })
        console.log('   余额:', result.balance, 'RMB')
    })

    // 测试 2: 查询余额
    await test('查询余额', async () => {
        const result = await apiCall(`/balance/${TEST_ADDRESS}`)
        console.log('   地址:', result.address)
        console.log('   余额:', result.balance, 'RMB')
    })

    // 测试 3: 再次充值
    await test('充值 50 RMB', async () => {
        const result = await apiCall('/topup', 'POST', {
            address: TEST_ADDRESS,
            rmb: 50
        })
        console.log('   新余额:', result.balance, 'RMB')
    })

    // 测试 4: 验证余额增加
    await test('验证余额为 150 RMB', async () => {
        const result = await apiCall(`/balance/${TEST_ADDRESS}`)
        if (result.balance !== 150) {
            throw new Error(`期望余额 150, 实际 ${result.balance}`)
        }
        console.log('   余额正确:', result.balance, 'RMB')
    })

    // 测试 5: 查询管理限额 (需要认证)
    await test('查询管理限额', async () => {
        const auth = Buffer.from('admin:admin').toString('base64')
        const response = await fetch(API_BASE + '/admin/limits', {
            headers: { 'Authorization': `Basic ${auth}` }
        })
        const result = await response.json()
        console.log('   限额配置:', JSON.stringify(result, null, 2))
    })

    console.log('\n=== 测试完成 ===')
    console.log('\n💡 提示:')
    console.log('- NFT 相关功能需要先部署合约')
    console.log('- 访问 Web 界面: http://localhost:3001')
    console.log('- 查看部署指南: DEPLOYMENT.md')
}

runTests().catch(error => {
    console.error('\n❌ 测试失败:', error)
    process.exit(1)
})
