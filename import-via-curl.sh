#!/bin/bash

# 設置API基礎URL
BASE_URL="http://localhost:3000/api"

# 檢查是否提供了認證令牌
if [ -z "$1" ]; then
  echo "請提供認證令牌作為參數"
  echo "用法: ./import-via-curl.sh <auth_token>"
  exit 1
fi

# 設置認證令牌
AUTH_TOKEN="$1"

# 函數: 匯入餐廳資料
import_restaurants() {
  echo "開始匯入餐廳資料..."
  
  # 使用curl發送POST請求匯入餐廳資料
  curl -X POST "${BASE_URL}/restaurants/import" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -d '{
      "restaurants": [
        {
          "restaurant_id": "r001",
          "restaurant_name": "高句麗韓式料理",
          "restaurant_type": "韓式料理",
          "price_range": "中等",
          "address": "指南路二段64號",
          "opening_hours": "11:00-21:00",
          "description": "正宗韓式料理餐廳，提供各種韓國傳統美食，包括烤肉、拌飯、泡菜鍋等。",
          "image_url": "https://example.com/images/restaurant1.jpg",
          "phone": "02-29387654"
        },
        {
          "restaurant_id": "r002",
          "restaurant_name": "政大小吃部",
          "restaurant_type": "中式料理",
          "price_range": "便宜",
          "address": "指南路二段99號",
          "opening_hours": "07:00-20:00",
          "description": "提供多種平價中式小吃，包括滷肉飯、牛肉麵、水餃等，是學生最愛的用餐地點。",
          "image_url": "https://example.com/images/restaurant2.jpg",
          "phone": "02-29396789"
        },
        {
          "restaurant_id": "r003",
          "restaurant_name": "山下義大利麵",
          "restaurant_type": "義式料理",
          "price_range": "中等",
          "address": "萬壽路22號",
          "opening_hours": "11:30-21:30",
          "description": "提供道地義大利麵和披薩，使用進口食材，環境舒適，適合約會或朋友聚餐。",
          "image_url": "https://example.com/images/restaurant3.jpg",
          "phone": "02-22345678"
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
  
  # 構建適合該餐廳的菜單JSON
  if [ "$restaurant_id" == "r001" ]; then
    menu_json='{
      "menuItems": [
        {
          "item_name": "韓式烤肉套餐",
          "category": "主食",
          "price": 320,
          "description": "包含五花肉、牛五花、泡菜和各種小菜",
          "image_url": "https://example.com/images/menu1.jpg",
          "is_available": true
        },
        {
          "item_name": "石鍋拌飯",
          "category": "主食",
          "price": 180,
          "description": "韓國傳統拌飯，配有蔬菜、牛肉和蛋黃",
          "image_url": "https://example.com/images/menu2.jpg",
          "is_available": true
        },
        {
          "item_name": "海鮮泡菜鍋",
          "category": "鍋物",
          "price": 350,
          "description": "辣味泡菜湯底，配有豐富海鮮和豆腐",
          "image_url": "https://example.com/images/menu3.jpg",
          "is_available": true
        }
      ]
    }'
  elif [ "$restaurant_id" == "r002" ]; then
    menu_json='{
      "menuItems": [
        {
          "item_name": "招牌滷肉飯",
          "category": "主食",
          "price": 45,
          "description": "香Q米飯配上入味滷肉，灑上香菜提味",
          "image_url": "https://example.com/images/menu4.jpg",
          "is_available": true
        },
        {
          "item_name": "牛肉麵",
          "category": "麵食",
          "price": 120,
          "description": "紅燒湯底，大塊牛肉，手工麵條",
          "image_url": "https://example.com/images/menu5.jpg",
          "is_available": true
        },
        {
          "item_name": "鍋貼水餃",
          "category": "點心",
          "price": 60,
          "description": "手工水餃，外皮酥脆，內餡多汁",
          "image_url": "https://example.com/images/menu6.jpg",
          "is_available": true
        }
      ]
    }'
  elif [ "$restaurant_id" == "r003" ]; then
    menu_json='{
      "menuItems": [
        {
          "item_name": "經典番茄義大利麵",
          "category": "主食",
          "price": 180,
          "description": "選用義大利進口麵條，配以自製番茄醬汁",
          "image_url": "https://example.com/images/menu7.jpg",
          "is_available": true
        },
        {
          "item_name": "瑪格麗特披薩",
          "category": "主食",
          "price": 260,
          "description": "傳統義式薄餅，配有新鮮番茄、羅勒和莫札瑞拉起司",
          "image_url": "https://example.com/images/menu8.jpg",
          "is_available": true
        },
        {
          "item_name": "提拉米蘇",
          "category": "甜點",
          "price": 120,
          "description": "義大利經典甜點，口感綿密，濃郁咖啡香",
          "image_url": "https://example.com/images/menu9.jpg",
          "is_available": true
        }
      ]
    }'
  else
    echo "沒有找到餐廳 ${restaurant_id} 的菜單資料"
    return
  fi
  
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
  echo "=== 開始執行資料匯入程序 ==="
  echo
  
  # 匯入餐廳資料
  import_restaurants
  
  # 等待一秒
  sleep 1
  
  # 匯入每個餐廳的菜單
  import_menu_items "r001"
  sleep 1
  import_menu_items "r002"
  sleep 1
  import_menu_items "r003"
  
  echo "=== 資料匯入程序完成 ==="
}

# 執行主程序
main 