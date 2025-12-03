# Backend Quick Start Guide

## Prerequisites

- Go 1.21 or higher ✅ (auto-upgraded to 1.23.0)
- MySQL 8.0 or higher
- Conflux testnet account (optional for blockchain features)

## Setup Steps

### 1. Install Dependencies (DONE ✅)

```bash
cd backend
go mod tidy
```

### 2. Set Up MySQL Database

```sql
CREATE DATABASE conflux_agri CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure Environment

Create a `.env` file in the `backend` directory:

```env
# Server
SERVER_PORT=8080
GIN_MODE=debug

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=conflux_agri

# Conflux (Optional - for blockchain features)
CONFLUX_RPC_URL=https://test.confluxrpc.com
CONFLUX_NETWORK_ID=1
PRIVATE_KEY=your_private_key_here
```

### 4. Run Database Migrations

The migrations will run automatically when you start the server for the first time.

### 5. Seed Initial Data (Optional)

```bash
go run cmd/seed/main.go
```

### 6. Start the Server

```bash
go run cmd/server/main.go
```

The server will start on `http://localhost:8080`

## API Endpoints

### Health Check

```bash
curl http://localhost:8080/health
```

### News

```bash
curl http://localhost:8080/api/v1/news
```

### Market Prices

```bash
curl http://localhost:8080/api/v1/market/prices
```

### Products

```bash
curl http://localhost:8080/api/v1/products
```

## Dependencies Installed

- ✅ Conflux Go SDK v1.5.11
- ✅ Gin Web Framework v1.9.1
- ✅ GORM v1.25.5
- ✅ MySQL Driver v1.5.2
- ✅ CORS Middleware v1.5.0
- ✅ godotenv v1.5.1

## Project Structure

```
backend/
├── cmd/
│   ├── server/main.go    # Main application
│   └── seed/main.go      # Database seeding
├── config/               # Configuration
├── internal/
│   ├── api/             # API handlers, routes, middleware
│   ├── blockchain/      # Conflux client
│   └── database/        # Models and DB connection
├── go.mod               # Dependencies ✅
└── go.sum               # Dependency checksums ✅
```
