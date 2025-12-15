#!/bin/bash
echo "Starting Mobile App (Expo)..."

# Kill port 8081
PORT=8081
PIDS=$(netstat -ano | grep ":$PORT " | awk '{print $5}' | sort | uniq)
if [ -n "$PIDS" ]; then
    for PID in $PIDS; do
        if [[ "$PID" =~ ^[0-9]+$ ]]; then
            echo "Killing existing process $PID on port $PORT..."
            taskkill //F //PID "$PID" 2>/dev/null
        fi
    done
fi

cd mobile
# Fix permission issues by clearing .expo cache
if [ -d ".expo" ]; then
    echo "Cleaning .expo cache..."
    rm -rf .expo
fi

nohup npm start > mobile.log 2>&1 &
echo "Mobile app started in background. Check mobile/mobile.log for logs."
