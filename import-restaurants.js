const axios = require('axios');

// 餐廳資料
const restaurants = [
  {
    restaurant_id: "r001",
    restaurant_name: "高句麗韓式料理",
    restaurant_type: "韓式料理",
    price_range: "中等",
    address: "指南路二段64號",
    opening_hours: "11:00-21:00",
    description: "正宗韓式料理餐廳，提供各種韓國傳統美食，包括烤肉、拌飯、泡菜鍋等。",
    image_url: "https://example.com/images/restaurant1.jpg",
    phone: "02-29387654"
  },
  {
    restaurant_id: "r002",
    restaurant_name: "政大小吃部",
    restaurant_type: "中式料理",
    price_range: "便宜",
    address: "指南路二段99號",
    opening_hours: "07:00-20:00",
    description: "提供多種平價中式小吃，包括滷肉飯、牛肉麵、水餃等，是學生最愛的用餐地點。",
    image_url: "https://example.com/images/restaurant2.jpg",
    phone: "02-29396789"
  },
  {
    restaurant_id: "r003",
    restaurant_name: "山下義大利麵",
    restaurant_type: "義式料理",
    price_range: "中等",
    address: "萬壽路22號",
    opening_hours: "11:30-21:30",
    description: "提供道地義大利麵和披薩，使用進口食材，環境舒適，適合約會或朋友聚餐。",
    image_url: "https://example.com/images/restaurant3.jpg",
    phone: "02-22345678"
  },
  {
    restaurant_id: "r004",
    restaurant_name: "貓咪咖啡廳",
    restaurant_type: "咖啡廳",
    price_range: "中等",
    address: "木柵路一段56號",
    opening_hours: "10:00-22:00",
    description: "結合咖啡廳和貓咪的特色餐廳，可以邊享用美食邊與貓咪互動，提供各種甜點和輕食。",
    image_url: "https://example.com/images/restaurant4.jpg",
    phone: "02-29123456"
  },
  {
    restaurant_id: "r005",
    restaurant_name: "台灣茶餐廳",
    restaurant_type: "茶餐廳",
    price_range: "便宜",
    address: "政大一街15號",
    opening_hours: "08:00-21:00",
    description: "提供各種台灣特色茶飲和小吃，包括珍珠奶茶、鹽酥雞、蚵仔煎等，是品嚐台灣美食的好去處。",
    image_url: "https://example.com/images/restaurant5.jpg",
    phone: "02-29387777"
  }
];

// 菜單資料範例（用於後續匯入）
const menuItems = {
  "r001": [
    {
      item_name: "韓式烤肉套餐",
      category: "主食",
      price: 320,
      description: "包含五花肉、牛五花、泡菜和各種小菜",
      image_url: "https://example.com/images/menu1.jpg",
      is_available: true
    },
    {
      item_name: "石鍋拌飯",
      category: "主食",
      price: 180,
      description: "韓國傳統拌飯，配有蔬菜、牛肉和蛋黃",
      image_url: "https://example.com/images/menu2.jpg",
      is_available: true
    },
    {
      item_name: "海鮮泡菜鍋",
      category: "鍋物",
      price: 350,
      description: "辣味泡菜湯底，配有豐富海鮮和豆腐",
      image_url: "https://example.com/images/menu3.jpg",
      is_available: true
    }
  ],
  "r002": [
    {
      item_name: "招牌滷肉飯",
      category: "主食",
      price: 45,
      description: "香Q米飯配上入味滷肉，灑上香菜提味",
      image_url: "https://example.com/images/menu4.jpg",
      is_available: true
    },
    {
      item_name: "牛肉麵",
      category: "麵食",
      price: 120,
      description: "紅燒湯底，大塊牛肉，手工麵條",
      image_url: "https://example.com/images/menu5.jpg",
      is_available: true
    },
    {
      item_name: "鍋貼水餃",
      category: "點心",
      price: 60,
      description: "手工水餃，外皮酥脆，內餡多汁",
      image_url: "https://example.com/images/menu6.jpg",
      is_available: true
    }
  ]
};

// API地址
const BASE_URL = 'http://localhost:3000/api';

// 匯入餐廳資料函數
async function importRestaurants() {
  try {
    console.log('開始匯入餐廳資料...');
    
    // 向API發送POST請求，匯入餐廳資料
    const response = await axios.post(`${BASE_URL}/restaurants/import`, {
      restaurants: restaurants
    });
    
    console.log('餐廳資料匯入結果:', response.data);
    return response.data;
  } catch (error) {
    console.error('匯入餐廳資料錯誤:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// 匯入餐廳菜單函數
async function importMenuItems(restaurantId) {
  try {
    if (!menuItems[restaurantId]) {
      console.log(`沒有找到餐廳 ${restaurantId} 的菜單資料`);
      return;
    }
    
    console.log(`開始匯入餐廳 ${restaurantId} 的菜單資料...`);
    
    // 向API發送POST請求，匯入餐廳菜單
    const response = await axios.post(`${BASE_URL}/restaurants/${restaurantId}/menu/import`, {
      menuItems: menuItems[restaurantId]
    });
    
    console.log(`餐廳 ${restaurantId} 菜單匯入結果:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`匯入餐廳 ${restaurantId} 菜單錯誤:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

// 執行匯入程序
async function runImport() {
  try {
    // 首先匯入餐廳資料
    const restaurantResult = await importRestaurants();
    
    // 匯入成功後，為每個餐廳匯入菜單
    for (const restaurant of restaurants) {
      // 延遲一下避免請求過快
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 匯入菜單
      await importMenuItems(restaurant.restaurant_id);
    }
    
    console.log('所有資料匯入完成!');
  } catch (error) {
    console.error('匯入程序出錯:', error);
  }
}

// 檢查是否有認證令牌（這裡需要管理員權限才能匯入餐廳資料）
// 實際使用時請設置正確的認證令牌
if (!process.env.AUTH_TOKEN) {
  console.log('警告: 未設置認證令牌，可能無法匯入資料。請設置環境變數 AUTH_TOKEN。');
  console.log('例如: AUTH_TOKEN=your_token node import-restaurants.js');
} else {
  // 設置API請求的認證頭
  axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.AUTH_TOKEN}`;
  // 執行匯入
  runImport();
}

// 允許直接執行此腳本：node import-restaurants.js
if (require.main === module) {
  // 如果直接運行此文件，則執行匯入
  runImport();
}

module.exports = {
  importRestaurants,
  importMenuItems,
  runImport
}; 