#!/bin/bash
echo "Starting Backend (Go)..."

# Kill port 8080
PORT=8080
PIDS=$(netstat -ano | grep ":$PORT " | awk '{print $5}' | sort | uniq)
if [ -n "$PIDS" ]; then
    for PID in $PIDS; do
        if [[ "$PID" =~ ^[0-9]+$ ]]; then
            echo "Killing existing process $PID on port $PORT..."
            taskkill //F //PID "$PID" 2>/dev/null
        fi
    done
fi

cd backend
go run cmd/server/main.go
