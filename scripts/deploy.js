const { ethers } = require('ethers')
const fs = require('fs')
const path = require('path')

// 生成测试钱包
function generateTestWallet() {
  const wallet = ethers.Wallet.createRandom()
  console.log('\n=== 生成测试钱包 ===')
  console.log('地址:', wallet.address)
  console.log('私钥:', wallet.privateKey)
  console.log('\n⚠️  请保存好私钥,并向该地址转入一些 CFX 用于部署合约!')
  console.log('Conflux eSpace 测试网水龙头: https://efaucet.confluxnetwork.org/')
  console.log('\n')

  return wallet
}

// 更新 .env 文件
function updateEnvFile(privateKey) {
  const envPath = path.join(__dirname, '..', '.env')
  let envContent = fs.readFileSync(envPath, 'utf-8')

  // 替换私钥
  envContent = envContent.replace(
    /RELAYER_PRIVATE_KEY=.*/,
    `RELAYER_PRIVATE_KEY=${privateKey}`
  )

  // 生成随机签名密钥
  const signKey = ethers.hexlify(ethers.randomBytes(32))
  envContent = envContent.replace(
    /SECRET_SIGN_KEY=.*/,
    `SECRET_SIGN_KEY=${signKey}`
  )

  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env 文件已更新')
}

async function main() {
  console.log('=== Conflux Farm 部署工具 ===\n')

  // 检查是否已有私钥
  require('dotenv').config()
  const existingKey = process.env.RELAYER_PRIVATE_KEY

  if (!existingKey || existingKey === '0xYOUR_RELAYER_PRIVATE_KEY') {
    console.log('未检测到有效私钥,正在生成新钱包...\n')
    const wallet = generateTestWallet()
    updateEnvFile(wallet.privateKey)

    console.log('⚠️  请先向上述地址转入 CFX,然后重新运行部署脚本:')
    console.log('   npm run deploy\n')
    return
  }

  // 连接到网络
  const provider = new ethers.JsonRpcProvider(
    process.env.ESPACE_RPC_URL || 'https://evm.confluxrpc.com'
  )
  const wallet = new ethers.Wallet(existingKey, provider)

  console.log('部署账户:', wallet.address)

  // 检查余额
  const balance = await provider.getBalance(wallet.address)
  console.log('账户余额:', ethers.formatEther(balance), 'CFX')

  if (balance === 0n) {
    console.log('\n❌ 账户余额为 0,请先充值!')
    console.log('Conflux eSpace 主网: 需要真实 CFX')
    console.log('Conflux eSpace 测试网水龙头: https://efaucet.confluxnetwork.org/')
    return
  }

  console.log('\n开始部署合约...')

  // 读取合约 ABI 和 Bytecode
  const contractPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'FarmBatchNFT.sol', 'FarmBatchNFT.json')

  if (!fs.existsSync(contractPath)) {
    console.log('❌ 合约未编译,请先运行: npm run compile')
    return
  }

  const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf-8'))

  // 部署合约
  const factory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, wallet)
  console.log('正在部署 FarmBatchNFT...')

  const contract = await factory.deploy()
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  console.log('\n✅ 合约部署成功!')
  console.log('合约地址:', address)

  // 保存合约地址
  const deploymentInfo = {
    network: 'espace',
    contractAddress: address,
    deployerAddress: wallet.address,
    timestamp: new Date().toISOString(),
    txHash: contract.deploymentTransaction().hash
  }

  const deploymentPath = path.join(__dirname, '..', 'data', 'deployment.json')
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true })
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2))

  console.log('\n部署信息已保存到:', deploymentPath)
  console.log('\n现在您可以使用以下地址测试应用:')
  console.log('NFT 合约地址:', address)
  console.log('访问 Web 界面: http://localhost:3001')
}

main().catch((error) => {
  console.error('\n❌ 部署失败:', error.message)
  process.exitCode = 1
})