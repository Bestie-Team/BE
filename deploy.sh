#!/bin/bash

echo "Build Project"
npm run build

echo "Kill Server Process"
pkill -f "node dist/main.js"

echo "Start New Server"
NODE_ENV=production nohup node dist/main.js &
disown

echo "Success Restart"