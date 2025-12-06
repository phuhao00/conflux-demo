#!/bin/bash
PORTS="3000 8080 8545 8081"
echo "Stopping services on ports: $PORTS..."

for PORT in $PORTS; do
    # Find PIDs listening on the port
    # netstat -ano output format: Proto Local Address Foreign Address State PID
    # We look for ":PORT " to ensure exact match
    PIDS=$(netstat -ano | grep ":$PORT " | awk '{print $5}' | sort | uniq)
    
    if [ -n "$PIDS" ]; then
        for PID in $PIDS; do
            # Ensure PID is a number
            if [[ "$PID" =~ ^[0-9]+$ ]]; then
                echo "Killing process $PID on port $PORT..."
                # Use //F //PID for Git Bash compatibility with Windows taskkill
                taskkill //F //PID "$PID" 2>/dev/null || echo "Failed to kill $PID (might be already dead)"
            fi
        done
    else
        echo "No process found on port $PORT."
    fi
done

echo "All specified ports cleared."
