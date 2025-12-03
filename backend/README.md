# Conflux Agricultural Finance Backend

Golang backend server for the agricultural finance mobile application with Conflux blockchain integration and JWT authentication.

## Tech Stack

- **Framework**: Gin (Go web framework)
- **Database**: MySQL with GORM ORM
- **Blockchain**: Conflux Go SDK v1.5.11
- **Authentication**: JWT (JSON Web Tokens)
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
│   │   ├── handlers/    # HTTP request handlers (auth, news, market, etc.)
│   │   ├── middleware/  # Middleware (CORS, JWT auth)
│   │   └── routes/      # Route definitions
│   ├── blockchain/      # Conflux blockchain client
│   └── database/        # Database models and connection
└── pkg/
    └── utils/           # JWT and password utilities
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
# Server
SERVER_PORT=8080
GIN_MODE=debug

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=conflux_agri

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Conflux Blockchain
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

### Authentication (Public)

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/me` - Get current user info (requires auth)

### News & Policy (Public)

- `GET /api/v1/news` - Get news list
- `GET /api/v1/news/:id` - Get news detail
- `GET /api/v1/policies` - Get policies

### Market Data (Public)

- `GET /api/v1/market/prices` - Get current prices
- `GET /api/v1/market/history/:product` - Get price history

### Community (Protected - Requires Authentication)

- `GET /api/v1/community/posts` - Get posts
- `POST /api/v1/community/posts` - Create post
- `POST /api/v1/community/posts/:id/like` - Like post

### Products (Protected - Requires Authentication)

- `GET /api/v1/products` - Get products
- `GET /api/v1/products/:id` - Get product detail
- `POST /api/v1/products/:id/invest` - Invest in product

### User & Wallet (Protected - Requires Authentication)

- `GET /api/v1/user/profile` - Get user profile
- `GET /api/v1/user/balance` - Get wallet balance
- `GET /api/v1/user/transactions` - Get transactions
- `POST /api/v1/user/transfer` - Transfer funds
- `POST /api/v1/user/deposit` - Deposit funds

### Health Check (Public)

- `GET /health` - Server health status

## Authentication Usage

### Register a New User

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepass123",
    "wallet_address": "cfxtest:aak2rra2njvd77ezwjvx04kkds9fzagfe6ku8scz91"
  }'
```

Response:

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### Access Protected Routes

Include the JWT token in the Authorization header:

```bash
curl http://localhost:8080/api/v1/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes with middleware
- ✅ Token expiration (24 hours)
- ✅ CORS support for mobile app
- ✅ Email uniqueness validation
- ✅ Secure password requirements (min 6 characters)

## Development

### Build

```bash
go build -o server cmd/server/main.go
```

### Run Tests

```bash
go test ./...
```

## Dependencies

- **Conflux Go SDK** v1.5.11 - Blockchain integration
- **Gin** v1.9.1 - Web framework
- **GORM** v1.25.5 - ORM
- **MySQL Driver** v1.5.2 - Database driver
- **golang-jwt/jwt** v5 - JWT authentication
- **bcrypt** - Password hashing
- **CORS** v1.5.0 - Cross-origin support
- **godotenv** v1.5.1 - Environment variables

## Deployment

See main project DEPLOYMENT.md for deployment instructions.

## License

MIT
