#!/bin/bash
echo "Starting Frontend (Node Server)..."

# Kill port 3000
PORT=3000
PIDS=$(netstat -ano | grep ":$PORT " | awk '{print $5}' | sort | uniq)
if [ -n "$PIDS" ]; then
    for PID in $PIDS; do
        if [[ "$PID" =~ ^[0-9]+$ ]]; then
            echo "Killing existing process $PID on port $PORT..."
            taskkill //F //PID "$PID" 2>/dev/null
        fi
    done
fi

nohup npm run dev > node_server.log 2>&1 &
echo "Node server started in background. Check node_server.log for logs."
