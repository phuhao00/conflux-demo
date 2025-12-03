# Conflux Agricultural Finance Backend

Golang backend server for the agricultural finance mobile application with Conflux blockchain integration.

## Tech Stack

- **Framework**: Gin (Go web framework)
- **Database**: MySQL with GORM ORM
- **Blockchain**: Conflux Go SDK
- **API**: RESTful JSON API

## Project Structure

```
backend/
├── cmd/
│   ├── server/          # Main application
│   └── seed/            # Database seeding
├── config/              # Configuration management
├── internal/
│   ├── api/
│   │   ├── handlers/    # HTTP request handlers
│   │   ├── middleware/  # Middleware (CORS, etc.)
│   │   └── routes/      # Route definitions
│   ├── blockchain/      # Conflux blockchain client
│   └── database/        # Database models and connection
└── pkg/                 # Shared utilities
```

## Setup

### Prerequisites

- Go 1.21 or higher
- MySQL 8.0 or higher
- Conflux testnet account (for blockchain features)

### Installation

1. Install dependencies:

```bash
cd backend
go mod download
```

2. Create `.env` file:

```bash
cp env.example .env
```

3. Configure `.env` with your settings:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=conflux_agri

CONFLUX_RPC_URL=https://test.confluxrpc.com
PRIVATE_KEY=your_private_key
```

4. Create MySQL database:

```sql
CREATE DATABASE conflux_agri CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. Run database migrations (automatic on first run):

```bash
go run cmd/server/main.go
```

6. Seed initial data:

```bash
go run cmd/seed/main.go
```

## Running the Server

```bash
go run cmd/server/main.go
```

Server will start on `http://localhost:8080`

## API Endpoints

### News & Policy

- `GET /api/v1/news` - Get news list
- `GET /api/v1/news/:id` - Get news detail
- `GET /api/v1/policies` - Get policies

### Market Data

- `GET /api/v1/market/prices` - Get current prices
- `GET /api/v1/market/history/:product` - Get price history

### Community

- `GET /api/v1/community/posts` - Get posts
- `POST /api/v1/community/posts` - Create post
- `POST /api/v1/community/posts/:id/like` - Like post

### Products

- `GET /api/v1/products` - Get products
- `GET /api/v1/products/:id` - Get product detail
- `POST /api/v1/products/:id/invest` - Invest in product

### User & Wallet

- `GET /api/v1/user/profile?user_id=1` - Get user profile
- `GET /api/v1/user/balance?address=cfxtest:...` - Get wallet balance
- `GET /api/v1/user/transactions?user_id=1` - Get transactions
- `POST /api/v1/user/transfer` - Transfer funds
- `POST /api/v1/user/deposit` - Deposit funds

### Health Check

- `GET /health` - Server health status

## Development

### Build

```bash
go build -o server cmd/server/main.go
```

### Run Tests

```bash
go test ./...
```

## Deployment

See main project DEPLOYMENT.md for deployment instructions.
