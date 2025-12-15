#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Checking Service Status..."
echo "=========================="

check_port() {
    PORT=$1
    NAME=$2
    PID=$(netstat -ano | grep ":$PORT " | awk '{print $5}' | sort | uniq | head -n 1)
    if [ -n "$PID" ]; then
        echo -e "${GREEN}✅ $NAME is RUNNING on port $PORT (PID: $PID)${NC}"
    else
        echo -e "${RED}❌ $NAME is NOT RUNNING on port $PORT${NC}"
    fi
}

check_port 8545 "Contracts (Hardhat)"
check_port 8080 "Backend (Go)"
check_port 3000 "Node Server (Relayer)"
check_port 5173 "Web Frontend (Vite)"
check_port 8081 "Mobile (Expo)"

echo "=========================="
echo "To stop all services, run: ./stop_all.sh"
