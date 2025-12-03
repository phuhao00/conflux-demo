# Conflux Agricultural Finance Platform

A comprehensive agricultural finance platform built on Conflux blockchain, featuring a mobile application and backend API for RWA (Real World Asset) tokenization, market data, and community engagement.

## Project Overview

This platform enables farmers and investors to participate in agricultural finance through:

- **RWA Product Investment**: Tokenized agricultural assets (orchards, farms, greenhouses)
- **Real-time Market Data**: Commodity prices and trends
- **Community Engagement**: Farmer discussions and knowledge sharing
- **Blockchain Integration**: Conflux network for transparent transactions
- **Multi-language Support**: Chinese and English interface

## Project Structure

```
conflux-demo/
├── backend/              # Golang API server
│   ├── cmd/             # Application entry points
│   ├── internal/        # Internal packages (API, blockchain, database)
│   ├── pkg/             # Shared utilities (JWT, password)
│   └── config/          # Configuration management
├── mobile/              # React Native mobile app
│   ├── src/
│   │   ├── screens/     # App screens (Home, Market, Community, etc.)
│   │   ├── navigation/  # Navigation setup
│   │   └── i18n/        # Internationalization
│   └── App.js           # Main app component
├── contracts/           # Smart contracts
└── scripts/             # Deployment scripts
```

## Technology Stack

### Backend

- **Language**: Go 1.23
- **Framework**: Gin
- **Database**: MySQL with GORM
- **Blockchain**: Conflux Go SDK v1.5.11
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt password hashing

### Mobile App

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Bottom Tabs)
- **Internationalization**: i18next
- **Icons**: Expo Vector Icons (Ionicons, MaterialCommunityIcons)
- **Languages**: Chinese (default), English

### Blockchain

- **Network**: Conflux eSpace
- **Smart Contracts**: Solidity
- **SDK**: go-conflux-sdk

## Features

### Mobile Application

- ✅ **5 Main Screens**:

  - 首页 (Home): News and policy updates
  - 行情 (Market): Real-time commodity prices
  - 社区 (Community): User posts and discussions
  - 商品 (Product): RWA investment products
  - 我的 (Profile): Wallet and user management

- ✅ **Visual Enhancements**:

  - Agricultural product icons
  - Market trend indicators
  - Stats dashboards
  - Color-coded price changes (red=up, green=down)

- ✅ **Internationalization**:
  - Language switcher in Profile screen
  - Complete Chinese/English translations
  - Dynamic tab labels

### Backend API

- ✅ **Authentication**:

  - User registration and login
  - JWT token-based auth
  - Protected API routes

- ✅ **RESTful Endpoints**:

  - News and policy management
  - Market data and price history
  - Community posts and interactions
  - RWA product listings
  - User wallet and transactions

- ✅ **Blockchain Integration**:
  - Conflux network connectivity
  - Wallet balance queries
  - Transaction management
  - Smart contract interactions

## Quick Start

### Backend Setup

1. **Install Dependencies**:

```bash
cd backend
go mod download
```

2. **Configure Environment**:

```bash
cp env.example .env
# Edit .env with your MySQL and Conflux settings
```

3. **Create Database**:

```sql
CREATE DATABASE conflux_agri CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Run Server**:

```bash
go run cmd/server/main.go
```

Server starts on `http://localhost:8080`

### Mobile App Setup

1. **Install Dependencies**:

```bash
cd mobile
npm install
```

2. **Start Development Server**:

```bash
npx expo start --web
```

Access at `http://localhost:8081` (or assigned port)

## API Documentation

### Public Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/news` - Get news list
- `GET /api/v1/market/prices` - Get market prices

### Protected Endpoints (Requires JWT)

- `GET /api/v1/me` - Current user info
- `GET /api/v1/products` - RWA products
- `POST /api/v1/community/posts` - Create post
- `GET /api/v1/user/transactions` - Transaction history

See [backend/README.md](backend/README.md) for complete API documentation.

## Authentication Flow

1. **Register**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login` → Receive JWT token
3. **Access Protected Routes**: Include `Authorization: Bearer <token>` header

## Development

### Backend

```bash
cd backend
go run cmd/server/main.go
```

### Mobile App

```bash
cd mobile
npx expo start --web
```

### Database Seeding

```bash
cd backend
go run cmd/seed/main.go
```

## Environment Variables

### Backend (.env)

```env
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=conflux_agri
JWT_SECRET=your-secret-key
CONFLUX_RPC_URL=https://test.confluxrpc.com
PRIVATE_KEY=your_private_key
```

## Security Features

- 🔒 JWT token authentication (24-hour expiration)
- 🔒 bcrypt password hashing
- 🔒 Protected API routes
- 🔒 CORS enabled for mobile app
- 🔒 Email uniqueness validation
- 🔒 Secure environment configuration

## Roadmap

- [ ] Smart contract deployment
- [ ] Real blockchain transactions
- [ ] Mobile app API integration
- [ ] User authentication in mobile app
- [ ] Real-time market data updates
- [ ] Push notifications
- [ ] Payment gateway integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT

## Contact

For questions or support, please open an issue in the repository.
