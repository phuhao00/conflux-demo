# Conflux Farm - 农产品链上资产与人民币Gas代付示例

这是一个基于 Conflux eSpace 的农产品链上资产管理系统,支持人民币 Gas 代付功能。

## 🎯 项目功能

- ✅ **人民币余额管理**: 充值和查询用户的人民币余额
- ✅ **NFT 铸造**: 铸造农产品批次 NFT,记录产地、采收时间、质检编号等信息
- ✅ **NFT 转移**: 转移农产品批次 NFT
- ✅ **Gas 代付**: 使用人民币余额自动代付交易 Gas 费
- ✅ **批次详情查询**: 查询 NFT 的链上和链下信息
- ✅ **管理后台**: 查看审计日志、告警信息、配置限额等

## 📦 项目结构

```
confulx_farm/
├── src/                    # 后端源代码
│   ├── server.js          # 主服务器文件
│   └── util/              # 工具函数
├── contracts/             # 智能合约
├── public/                # Web 前端
│   └── index.html        # 主页面
├── mobile/                # React Native 移动端 (可选)
├── .env                   # 环境配置
└── package.json          # 项目依赖
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

项目已经创建了 `.env` 文件,主要配置如下:

```env
# Conflux eSpace RPC
ESPACE_RPC_URL=https://evm.confluxrpc.com

# 中继器私钥 (需要替换为您的私钥)
RELAYER_PRIVATE_KEY=0xYOUR_RELAYER_PRIVATE_KEY

# CFX/CNY 汇率
EXCHANGE_RATE_CFX_CNY=5.5

# 服务端口
PORT=3001

# 数据库配置
MYSQL_DSN=root:root@tcp(localhost:3306)/conflux?charset=utf8mb4&parseTime=true&loc=Asia%2FShanghai
REDIS_URL=redis://localhost:6379

# 管理员账号
ADMIN_USER=admin
ADMIN_PASS=admin
```

**重要**: 请将 `RELAYER_PRIVATE_KEY` 替换为您自己的私钥!

### 3. 启动数据库

确保您的 MySQL 和 Redis 服务正在运行。如果没有,可以使用 Docker:

```bash
# 如果您想使用 Docker (可选)
docker-compose up -d
```

或者使用本地已安装的 MySQL 和 Redis 服务。

### 4. 启动后端服务

```bash
npm run dev
```

服务将在 `http://localhost:3001` 启动。

### 5. 访问 Web 界面

在浏览器中打开:
```
http://localhost:3001
```

您将看到一个功能完整的 Web 界面,可以测试所有功能!

## 🎨 Web 界面功能

Web 界面提供了以下功能模块:

1. **💰 充值人民币**: 为指定地址充值人民币余额
2. **💳 查询余额**: 查询地址的人民币余额
3. **🎨 铸造批次 NFT**: 铸造农产品 NFT,包含产地、采收时间、质检编号等信息
4. **🔄 转移批次 NFT**: 转移 NFT 所有权
5. **🔍 查询批次详情**: 查询 NFT 的完整信息

## 📱 移动端 (可选)

项目包含一个 React Native 移动端应用,位于 `mobile/` 目录。

```bash
cd mobile
npm install
npm start
```

注意: 移动端需要 Expo 环境,如果遇到问题,建议使用 Web 界面。

## 🔧 API 接口

### 充值人民币
```
POST /topup
Body: { "address": "0x...", "rmb": 100 }
```

### 查询余额
```
GET /balance/:address
```

### 铸造 NFT
```
POST /relay/nft/mint
Body: {
  "from": "0x...",
  "to": "0x...",
  "tokenId": 1,
  "nftAddress": "0x...",
  "origin": "云南普洱",
  "harvestTime": 1234567890,
  "inspectionId": "QC20240101",
  "uri": ""
}
```

### 转移 NFT
```
POST /relay/nft/transfer
Body: {
  "from": "0x...",
  "to": "0x...",
  "tokenId": 1,
  "nftAddress": "0x..."
}
```

### 查询批次详情
```
GET /nft/batch/:nftAddress/:tokenId/details
```

## 🔐 管理后台

访问管理后台需要 Basic Auth 认证:
- 用户名: `admin`
- 密码: `admin`

管理接口:
- `GET /admin/audit` - 查看审计日志
- `GET /admin/alerts` - 查看告警信息
- `GET /admin/limits` - 查看当前限额配置
- `POST /admin/set-limits` - 设置限额
- `POST /admin/notify-test` - 测试通知

## 📝 开发说明

### 部署智能合约

```bash
npm run compile
npm run deploy
```

### 项目特点

1. **Gas 代付**: 用户无需持有 CFX,使用人民币余额即可完成交易
2. **限额控制**: 支持每日交易次数、单笔金额、每日总额限制
3. **审计日志**: 记录所有关键操作
4. **告警系统**: 高额交易自动告警
5. **元数据管理**: 支持 IPFS 存储 NFT 元数据

## 🛠️ 技术栈

- **后端**: Node.js + Express
- **区块链**: Conflux eSpace (兼容 EVM)
- **数据库**: MySQL + Redis
- **前端**: HTML + CSS + JavaScript (原生)
- **移动端**: React Native + Expo

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📞 联系方式

如有问题,请提交 Issue。