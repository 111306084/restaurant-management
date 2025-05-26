#!/bin/bash

# 設置顏色
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

echo -e "${YELLOW}正在重啟食堂點餐應用...${NC}"

# 確保在vue-project目錄下執行
cd "$(dirname "$0")"
PROJECT_PATH="$(pwd)"
echo -e "${GREEN}項目路徑: $PROJECT_PATH${NC}"

# 獲取作業系統類型 
OS_TYPE=$(uname)

# 1. 停止所有運行中的服務
echo -e "${YELLOW}停止運行中的服務...${NC}"

# 停止前端服務
if [ "$OS_TYPE" = "Darwin" ]; then  # macOS
  FRONTEND_PID=$(lsof -ti:8080)
else  # Linux
  FRONTEND_PID=$(netstat -nltp 2>/dev/null | grep ':8080' | awk '{print $7}' | cut -d'/' -f1)
fi

if [ ! -z "$FRONTEND_PID" ]; then
  echo -e "${GREEN}停止前端服務 (PID: $FRONTEND_PID)${NC}"
  kill -9 $FRONTEND_PID 2>/dev/null
  sleep 1
fi

# 停止後端服務
if [ "$OS_TYPE" = "Darwin" ]; then  # macOS
  BACKEND_PID=$(lsof -ti:3000)
else  # Linux
  BACKEND_PID=$(netstat -nltp 2>/dev/null | grep ':3000' | awk '{print $7}' | cut -d'/' -f1)
fi

if [ ! -z "$BACKEND_PID" ]; then
  echo -e "${GREEN}停止後端服務 (PID: $BACKEND_PID)${NC}"
  kill -9 $BACKEND_PID 2>/dev/null
  sleep 1
fi

# 2. 檢查MySQL服務
echo -e "${YELLOW}檢查MySQL服務...${NC}"
if [ "$OS_TYPE" = "Darwin" ]; then  # macOS
  MYSQL_RUNNING=$(ps aux | grep -v grep | grep mysql | wc -l)
else  # Linux
  MYSQL_RUNNING=$(systemctl is-active mysql 2>/dev/null || systemctl is-active mariadb 2>/dev/null || echo "dead")
fi

if [ "$MYSQL_RUNNING" = "0" ] || [ "$MYSQL_RUNNING" = "dead" ]; then
  echo -e "${RED}MySQL服務未運行，請手動啟動MySQL服務${NC}"
  exit 1
else
  echo -e "${GREEN}MySQL服務正在運行${NC}"
fi

# 3. 啟動後端服務
echo -e "${YELLOW}啟動後端服務...${NC}"
cd "$PROJECT_PATH/backend"
if [ ! -f "server.js" ]; then
  echo -e "${RED}錯誤: 找不到 server.js 文件!${NC}"
  exit 1
fi

node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}後端服務已啟動 (PID: $BACKEND_PID)${NC}"
sleep 2

# 4. 確認後端服務是否成功啟動
if [ "$OS_TYPE" = "Darwin" ]; then  # macOS
  BACKEND_RUNNING=$(lsof -ti:3000 | wc -l)
else  # Linux
  BACKEND_RUNNING=$(netstat -nltp 2>/dev/null | grep ':3000' | wc -l)
fi

if [ "$BACKEND_RUNNING" -eq 0 ]; then
  echo -e "${RED}錯誤: 後端服務啟動失敗!${NC}"
  echo -e "${YELLOW}請查看 backend.log 文件獲取更多信息${NC}"
  exit 1
fi

echo -e "${GREEN}後端服務已成功啟動，運行在 http://localhost:3000${NC}"

# 5. 啟動前端服務
echo -e "${YELLOW}啟動前端服務...${NC}"
cd "$PROJECT_PATH"
npm run serve > frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}前端服務已啟動 (PID: $FRONTEND_PID)${NC}"
sleep 5

# 6. 確認前端服務是否成功啟動
if [ "$OS_TYPE" = "Darwin" ]; then  # macOS
  FRONTEND_RUNNING=$(lsof -ti:8080 | wc -l)
else  # Linux
  FRONTEND_RUNNING=$(netstat -nltp 2>/dev/null | grep ':8080' | wc -l)
fi

if [ "$FRONTEND_RUNNING" -eq 0 ]; then
  echo -e "${RED}錯誤: 前端服務啟動失敗!${NC}"
  echo -e "${YELLOW}請查看 frontend.log 文件獲取更多信息${NC}"
  # 前端啟動失敗，也停止後端
  if [ ! -z "$BACKEND_PID" ]; then
    kill -9 $BACKEND_PID 2>/dev/null
  fi
  exit 1
fi

echo -e "${GREEN}前端服務已成功啟動，運行在 http://localhost:8080${NC}"

# 7. 所有服務已成功啟動
echo -e "${GREEN}=======================${NC}"
echo -e "${GREEN}所有服務已成功啟動!${NC}"
echo -e "${GREEN}前端: http://localhost:8080${NC}"
echo -e "${GREEN}後端: http://localhost:3000${NC}"
echo -e "${GREEN}=======================${NC}"
echo -e "${YELLOW}測試帳號: 101010101${NC}"
echo -e "${YELLOW}測試密碼: password123${NC}"
echo -e "${GREEN}=======================${NC}"
echo -e "${YELLOW}注意: 服務在後台運行，使用以下命令查看日誌:${NC}"
echo -e "${GREEN}前端日誌: tail -f frontend.log${NC}"
echo -e "${GREEN}後端日誌: tail -f backend.log${NC}" 