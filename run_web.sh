#!/bin/bash
echo "🚀 Starting Web Frontend..."
cd web
nohup npm run dev > web.log 2>&1 &
echo "Web Frontend started in background. Check web/web.log for logs."
