#!/bin/bash

# 設置API基礎URL
BASE_URL="http://localhost:3000/api"

# 檢查是否提供了認證令牌
if [ -z "$1" ]; then
  echo "請提供認證令牌作為參數"
  echo "用法: ./import-lazy-pasta-curl.sh <auth_token>"
  exit 1
fi

# 設置認證令牌
AUTH_TOKEN="$1"

# 函數: 匯入餐廳資料
import_restaurants() {
  echo "開始匯入Lazy Pasta餐廳資料..."
  
  # 使用curl發送POST請求匯入餐廳資料
  curl -X POST "${BASE_URL}/restaurants/import" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -d '{
      "restaurants": [
        {
          "restaurant_id": "lazy001",
          "restaurant_name": "Lazy Pasta慵懶義式廚房",
          "restaurant_type": "義式料理",
          "price_range": "中等",
          "address": "台北市信義區忠孝東路五段71巷30號1樓",
          "opening_hours": "11:00-21:00",
          "description": "提供平價美味的義大利麵和燉飯，環境明亮舒適，是約會或朋友聚餐的好去處。多種口味選擇，主打明太子鮮蝦干貝義大利麵和松露鮮蝦燉飯。",
          "image_url": "https://example.com/images/lazy-pasta.jpg",
          "phone": "02-2756-8077"
        }
      ]
    }'
  
  # 檢查curl命令的結果
  if [ $? -eq 0 ]; then
    echo "餐廳資料匯入成功"
  else
    echo "餐廳資料匯入失敗"
    exit 1
  fi
  
  echo
}

# 函數: 匯入餐廳菜單
import_menu_items() {
  local restaurant_id="$1"
  echo "開始匯入餐廳 ${restaurant_id} 的菜單資料..."
  
  # Lazy Pasta菜單
  menu_json='{
    "menuItems": [
      {
        "item_name": "明太子鮮蝦干貝義大利麵",
        "category": "義大利麵",
        "price": 350,
        "description": "豐富的明太子醬加上兩顆干貝和多隻鮮蝦，口感濃郁，熱銷第一名",
        "image_url": "https://example.com/images/mentaiko-pasta.jpg",
        "is_available": true
      },
      {
        "item_name": "法式松露鮮蝦燉飯",
        "category": "燉飯",
        "price": 325,
        "description": "松露搭配野菇的組合，香氣十足，米心軟Q，配料豐富",
        "image_url": "https://example.com/images/truffle-risotto.jpg",
        "is_available": true
      },
      {
        "item_name": "青麻奶雞肉菌菇燉飯",
        "category": "燉飯",
        "price": 248,
        "description": "奶油菌菇燉飯配上青麻辣椒粉，濃郁麻奶香氣，食慾大開",
        "image_url": "https://example.com/images/chicken-risotto.jpg",
        "is_available": true
      },
      {
        "item_name": "煙燻鮭魚沙拉",
        "category": "沙拉",
        "price": 248,
        "description": "新鮮美生菜搭配小黃瓜、甜薯、番茄、水煮蛋、玉米粒，配色療癒，提供四種醬料選擇",
        "image_url": "https://example.com/images/salmon-salad.jpg",
        "is_available": true
      },
      {
        "item_name": "愛牽絲起士條",
        "category": "開胃菜",
        "price": 88,
        "description": "外酥內軟的起司條，濃郁的起司味讓人一口接一口",
        "image_url": "https://example.com/images/cheese-sticks.jpg",
        "is_available": true
      },
      {
        "item_name": "酥炸嫩雞翅",
        "category": "開胃菜",
        "price": 118,
        "description": "雞翅炸得超酥脆，外酥內嫩，香氣四溢",
        "image_url": "https://example.com/images/fried-chicken-wings.jpg",
        "is_available": true
      },
      {
        "item_name": "主廚例湯",
        "category": "湯品",
        "price": 58,
        "description": "每日不同口味的例湯，平日多為蘑菇濃湯，搭配慵懶麵包",
        "image_url": "https://example.com/images/soup.jpg",
        "is_available": true
      },
      {
        "item_name": "宇治抹茶歐蕾",
        "category": "飲品",
        "price": 80,
        "description": "甜度適中，尾韻帶有濃郁抹茶香氣",
        "image_url": "https://example.com/images/matcha-latte.jpg",
        "is_available": true
      },
      {
        "item_name": "西西里檸檬咖啡",
        "category": "飲品",
        "price": 70,
        "description": "帶有檸檬清香的特調咖啡，口感微酸順口",
        "image_url": "https://example.com/images/lemon-coffee.jpg",
        "is_available": true
      },
      {
        "item_name": "手工焦糖烤布蕾",
        "category": "甜點",
        "price": 58,
        "description": "綿密滑順的布丁質地，表面的焦糖脆脆的",
        "image_url": "https://example.com/images/creme-brulee.jpg",
        "is_available": true
      },
      {
        "item_name": "人氣布朗尼",
        "category": "甜點",
        "price": 68,
        "description": "香濃巧克力布朗尼，巧克力味十足",
        "image_url": "https://example.com/images/brownie.jpg",
        "is_available": true
      },
      {
        "item_name": "泰式酸辣雞",
        "category": "開胃菜",
        "price": 128,
        "description": "外酥內嫩的雞肉配上泰式醬汁，口感層次豐富",
        "image_url": "https://example.com/images/thai-chicken.jpg",
        "is_available": true
      }
    ]
  }'
  
  # 使用curl發送POST請求匯入餐廳菜單
  curl -X POST "${BASE_URL}/restaurants/${restaurant_id}/menu/import" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -d "$menu_json"
  
  # 檢查curl命令的結果
  if [ $? -eq 0 ]; then
    echo "餐廳 ${restaurant_id} 菜單匯入成功"
  else
    echo "餐廳 ${restaurant_id} 菜單匯入失敗"
  fi
  
  echo
}

# 主程序
main() {
  echo "=== 開始執行Lazy Pasta餐廳資料匯入程序 ==="
  echo
  
  # 匯入餐廳資料
  import_restaurants
  
  # 等待一秒
  sleep 1
  
  # 匯入餐廳的菜單
  import_menu_items "lazy001"
  
  echo "=== 資料匯入程序完成 ==="
}

# 執行主程序
main 