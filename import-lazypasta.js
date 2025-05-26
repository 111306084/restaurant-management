const axios = require('axios');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// API地址
const BASE_URL = 'http://localhost:3000/api';

// 生成有效的JWT令牌
const generateToken = () => {
  // 使用與後端相同的SECRET
  const JWT_SECRET = 'your_jwt_secret_key';
  
  // 創建一個管理員用戶信息
  const adminUser = {
    id: 'admin',
    name: 'System Admin',
    role: 'admin'
  };
  
  // 生成令牌
  return jwt.sign(adminUser, JWT_SECRET, { expiresIn: '1h' });
};

// 設置認證令牌
const AUTH_TOKEN = generateToken();

// 讀取餐廳資料
async function loadRestaurantData() {
  try {
    const data = fs.readFileSync('./lazypasta-restaurant-data.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('讀取資料檔案錯誤:', error.message);
    throw error;
  }
}

// 匯入餐廳資料函數
async function importRestaurants(restaurants) {
  try {
    console.log('開始匯入Lazy Pasta餐廳資料...');
    
    // 向API發送POST請求，匯入餐廳資料
    const response = await axios.post(`${BASE_URL}/restaurants/import`, {
      restaurants: restaurants
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('餐廳資料匯入結果:', response.data);
    return response.data;
  } catch (error) {
    console.error('匯入餐廳資料錯誤:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// 匯入餐廳菜單函數
async function importMenuItems(restaurantId, menuItems) {
  try {
    console.log(`開始匯入餐廳 ${restaurantId} 的菜單資料...`);
    
    // 向API發送POST請求，匯入餐廳菜單
    const response = await axios.post(`${BASE_URL}/restaurants/${restaurantId}/menu/import`, {
      menuItems: menuItems
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
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
    // 載入餐廳資料
    const data = await loadRestaurantData();
    
    if (!data.restaurants || data.restaurants.length === 0) {
      console.error('錯誤: 沒有找到餐廳資料');
      return;
    }
    
    // 匯入餐廳資料
    await importRestaurants(data.restaurants);
    
    // 匯入菜單資料
    for (const restaurantId in data.menus) {
      if (data.menus[restaurantId] && data.menus[restaurantId].length > 0) {
        // 延遲一下避免請求過快
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 匯入菜單
        await importMenuItems(restaurantId, data.menus[restaurantId]);
      }
    }
    
    console.log('所有Lazy Pasta資料匯入完成!');
  } catch (error) {
    console.error('匯入程序出錯:', error);
  }
}

// 執行匯入
runImport(); 