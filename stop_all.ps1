$ports = @(3000, 8080, 8081, 8545)
Write-Host "Stopping services on ports: $ports..."

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pid_to_kill = $conn.OwningProcess
            # Skip if PID is 0 (System Idle Process) or 4 (System) just in case, though unlikely for these ports
            if ($pid_to_kill -gt 4) {
                Write-Host "Killing process $pid_to_kill on port $port..."
                Stop-Process -Id $pid_to_kill -Force -ErrorAction SilentlyContinue
            }
        }
    } else {
        Write-Host "No process found on port $port."
    }
}

Write-Host "All specified ports cleared."
