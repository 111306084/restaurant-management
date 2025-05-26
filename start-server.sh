#!/bin/bash

# 確保在vue-project目錄下執行
cd "$(dirname "$0")"
PROJECT_PATH="$(pwd)"
echo "當前項目路徑: $PROJECT_PATH"

# 檢查是否有已經運行的伺服器
echo "檢查是否有運行中的伺服器..."
SERVER_PID=$(lsof -t -i:3000)
if [ ! -z "$SERVER_PID" ]; then
  echo "發現運行中的伺服器 (PID: $SERVER_PID)，正在關閉..."
  kill -9 $SERVER_PID
  sleep 1
fi

# 進入backend目錄
echo "進入backend目錄..."
cd "$PROJECT_PATH/backend"
if [ $? -ne 0 ]; then
  echo "錯誤: 無法進入backend目錄!"
  exit 1
fi

# 確認backend/server.js文件存在
if [ ! -f "server.js" ]; then
  echo "錯誤: 找不到server.js文件!"
  exit 1
fi

# 啟動後端伺服器
echo "啟動後端伺服器..."
node server.js 