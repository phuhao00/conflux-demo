# 🚀 部署指南

## 当前状态

✅ 后端服务器运行中: http://localhost:3001
✅ 合约已编译
✅ 测试钱包已生成

## 生成的测试钱包信息

**地址**: `0xfB11f0cFE930B10696208d52e4AF121507B57B00`
**私钥**: 已保存到 `.env` 文件

## 部署选项

### 选项 1: 使用 Conflux eSpace 测试网 (推荐用于测试)

1. **获取测试 CFX**
   - 访问测试网水龙头: https://efaucet.confluxnetwork.org/
   - 输入地址: `0xfB11f0cFE930B10696208d52e4AF121507B57B00`
   - 领取测试 CFX

2. **部署合约**
   ```bash
   node scripts/deploy.js
   ```

3. **使用部署的合约地址**
   - 部署成功后,合约地址会保存在 `data/deployment.json`
   - 在 Web 界面中使用该地址进行测试

### 选项 2: 使用 Conflux eSpace 主网 (需要真实 CFX)

1. **购买 CFX**
   - 从交易所购买 CFX
   - 转账到地址: `0xfB11f0cFE930B10696208d52e4AF121507B57B00`

2. **部署合约**
   ```bash
   node scripts/deploy.js
   ```

### 选项 3: 本地测试 (无需部署)

如果您只想测试后端功能(充值、查询余额等),可以:

1. **使用模拟合约地址**
   - 在 Web 界面中使用任意合约地址进行测试
   - 例如: `0x1234567890123456789012345678901234567890`

2. **测试可用功能**
   - ✅ 充值人民币
   - ✅ 查询余额
   - ❌ 铸造 NFT (需要真实合约)
   - ❌ 转移 NFT (需要真实合约)
   - ❌ 查询批次详情 (需要真实合约)

## 快速测试流程

### 1. 测试充值和余额查询

```bash
# 在 Web 界面 http://localhost:3001 中:

# 1. 充值人民币
地址: 0xfB11f0cFE930B10696208d52e4AF121507B57B00
金额: 100

# 2. 查询余额
地址: 0xfB11f0cFE930B10696208d52e4AF121507B57B00
```

### 2. 测试 NFT 功能 (需要先部署合约)

```bash
# 1. 获取测试 CFX
访问: https://efaucet.confluxnetwork.org/

# 2. 部署合约
node scripts/deploy.js

# 3. 在 Web 界面中使用部署的合约地址
```

## 使用 curl 测试 API

### 充值
```bash
curl -X POST http://localhost:3001/topup \
  -H "Content-Type: application/json" \
  -d '{"address":"0xfB11f0cFE930B10696208d52e4AF121507B57B00","rmb":100}'
```

### 查询余额
```bash
curl http://localhost:3001/balance/0xfB11f0cFE930B10696208d52e4AF121507B57B00
```

## 管理后台

访问: http://localhost:3001/admin/
- 用户名: `admin`
- 密码: `admin`

可用接口:
- `/admin/audit` - 审计日志
- `/admin/alerts` - 告警信息
- `/admin/limits` - 限额配置

## 故障排查

### 问题: 部署失败 "insufficient funds"
**解决**: 确保钱包地址有足够的 CFX

### 问题: 合约调用失败
**解决**: 
1. 检查合约地址是否正确
2. 确保钱包有足够的人民币余额
3. 检查 `.env` 中的 `RELAYER_PRIVATE_KEY` 是否正确

### 问题: 数据库连接失败
**解决**: 确保 MySQL 和 Redis 服务正在运行

## 下一步

1. ✅ 后端服务已运行
2. ⏳ 获取测试 CFX 并部署合约
3. ⏳ 在 Web 界面测试所有功能
4. ⏳ 根据需要配置 IPFS、邮件通知等

## 重要提示

⚠️ **生产环境部署前**:
- 更换为安全的私钥
- 配置真实的数据库
- 设置强密码
- 配置 HTTPS
- 启用防火墙
- 定期备份数据

## 联系支持

如有问题,请查看项目 README.md 或提交 Issue。
