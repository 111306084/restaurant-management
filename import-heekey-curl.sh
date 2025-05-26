#!/bin/bash

# 設置API基礎URL
BASE_URL="http://localhost:3000/api"

# 檢查是否提供了認證令牌
if [ -z "$1" ]; then
  echo "請提供認證令牌作為參數"
  echo "用法: ./import-heekey-curl.sh <auth_token>"
  exit 1
fi

# 設置認證令牌
AUTH_TOKEN="$1"

# 函數: 匯入餐廳資料
import_restaurants() {
  echo "開始匯入香港喜記燒臘資料..."
  
  # 使用curl發送POST請求匯入餐廳資料
  curl -X POST "${BASE_URL}/restaurants/import" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -d '{
      "restaurants": [
        {
          "restaurant_id": "h001",
          "restaurant_name": "喜記燒臘",
          "restaurant_type": "燒臘",
          "price_range": "便宜",
          "address": "香港深水埗北河街",
          "opening_hours": "10:30-21:00",
          "description": "傳統香港燒臘店，提供各種燒味，包括燒鵝、叉燒、燒肉等。平價美味，是當地街坊最愛的食肆。",
          "image_url": "https://example.com/images/heekey.jpg",
          "phone": "852-12345678"
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
  
  # 喜記燒臘菜單
  menu_json='{
    "menuItems": [
      {
        "item_name": "燒鵝飯",
        "category": "主食",
        "price": 45,
        "description": "香脆燒鵝配白飯，肉質鮮嫩多汁",
        "image_url": "https://example.com/images/roast-goose-rice.jpg",
        "is_available": true
      },
      {
        "item_name": "叉燒飯",
        "category": "主食",
        "price": 40,
        "description": "蜜汁叉燒配白飯，肥瘦適中",
        "image_url": "https://example.com/images/bbq-pork-rice.jpg",
        "is_available": true
      },
      {
        "item_name": "燒肉飯",
        "category": "主食",
        "price": 42,
        "description": "香脆可口的燒肉配白飯",
        "image_url": "https://example.com/images/roast-pork-rice.jpg",
        "is_available": true
      },
      {
        "item_name": "油雞飯",
        "category": "主食",
        "price": 38,
        "description": "皮爽肉嫩的白切雞配白飯",
        "image_url": "https://example.com/images/soy-chicken-rice.jpg",
        "is_available": true
      },
      {
        "item_name": "三寶飯",
        "category": "主食",
        "price": 48,
        "description": "叉燒、燒肉、油雞三種燒味拼盤配白飯",
        "image_url": "https://example.com/images/three-treasures-rice.jpg",
        "is_available": true
      },
      {
        "item_name": "兩餸飯",
        "category": "主食",
        "price": 30,
        "description": "可選兩種配菜搭配白飯，包括豆角、雞翼等",
        "image_url": "https://example.com/images/two-dish-rice.jpg",
        "is_available": true
      },
      {
        "item_name": "西洋菜湯",
        "category": "湯品",
        "price": 10,
        "description": "清甜可口的老火湯",
        "image_url": "https://example.com/images/watercress-soup.jpg",
        "is_available": true
      },
      {
        "item_name": "鵝翼",
        "category": "燒味",
        "price": 35,
        "description": "鹵水浸製的鵝翼，香而不膩",
        "image_url": "https://example.com/images/goose-wing.jpg",
        "is_available": true
      },
      {
        "item_name": "鵝腸",
        "category": "燒味",
        "price": 40,
        "description": "鹵水浸製的鵝腸，口感Q彈",
        "image_url": "https://example.com/images/goose-intestine.jpg",
        "is_available": true
      },
      {
        "item_name": "滷豆腐",
        "category": "燒味",
        "price": 30,
        "description": "入味的滷水豆腐，豆香濃郁",
        "image_url": "https://example.com/images/braised-tofu.jpg",
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
  echo "=== 開始執行喜記燒臘資料匯入程序 ==="
  echo
  
  # 匯入餐廳資料
  import_restaurants
  
  # 等待一秒
  sleep 1
  
  # 匯入餐廳的菜單
  import_menu_items "h001"
  
  echo "=== 資料匯入程序完成 ==="
}

# 執行主程序
main 