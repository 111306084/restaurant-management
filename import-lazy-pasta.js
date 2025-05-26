const axios = require('axios');
const fs = require('fs');

// API地址
const BASE_URL = 'http://localhost:3000/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN; // 需要設置環境變數

// 讀取餐廳資料
async function loadRestaurantData() {
  try {
    const data = fs.readFileSync('./lazy-pasta-restaurant-data.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('讀取資料檔案錯誤:', error.message);
    throw error;
  }
}

// 匯入餐廳資料函數
async function importRestaurants(restaurants) {
  try {
    console.log('開始匯入餐廳資料...');
    
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
    
    console.log('所有資料匯入完成!');
  } catch (error) {
    console.error('匯入程序出錯:', error);
  }
}

// 檢查是否有認證令牌
if (!AUTH_TOKEN) {
  console.log('警告: 未設置認證令牌，可能無法匯入資料。請設置環境變數 AUTH_TOKEN。');
  console.log('例如: AUTH_TOKEN=your_jwt_secret_key node import-lazy-pasta.js');
} else {
  // 執行匯入
  runImport();
}

// 餐廳ID
const RESTAURANT_ID = 'lazy001';

// 菜單資料
const menuItems = [
  {
    item_name: '番茄起司義大利麵',
    category: '主餐',
    price: 280,
    description: '新鮮番茄熬煮的醬汁，配上莫札瑞拉起司與帕馬森起司，淋上特級初榨橄欖油',
    image_url: 'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg',
    is_available: true
  },
  {
    item_name: '奶油蘑菇義大利麵',
    category: '主餐',
    price: 300,
    description: '使用新鮮香菇、蘑菇與奶油調製而成的濃郁義大利麵，撒上帕馬森起司與黑胡椒',
    image_url: 'https://images.pexels.com/photos/1438672/pexels-photo-1438672.jpeg',
    is_available: true
  },
  {
    item_name: '青醬鮮蝦義大利麵',
    category: '主餐',
    price: 350,
    description: '新鮮羅勒葉打成的青醬，搭配肥美鮮蝦與義大利面，淋上冷壓橄欖油與松子',
    image_url: 'https://images.pexels.com/photos/1487511/pexels-photo-1487511.jpeg',
    is_available: true
  },
  {
    item_name: '海鮮燉飯',
    category: '主餐',
    price: 320,
    description: '使用義大利進口的米，搭配新鮮海鮮熬煮而成的濃郁燉飯，撒上香蒜與香草',
    image_url: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg',
    is_available: true
  },
  {
    item_name: '炙燒牛排',
    category: '主餐',
    price: 450,
    description: '頂級澳洲牛排，使用橄欖油、迷迭香與大蒜調味，搭配烤蔬菜與香草奶油',
    image_url: 'https://images.pexels.com/photos/1251208/pexels-photo-1251208.jpeg',
    is_available: true
  },
  {
    item_name: '烤雞沙拉',
    category: '輕食',
    price: 250,
    description: '使用新鮮生菜、烤雞肉、番茄、小黃瓜與酪梨，淋上柑橘油醋醬',
    image_url: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg',
    is_available: true
  },
  {
    item_name: '地中海沙拉',
    category: '輕食',
    price: 220,
    description: '使用新鮮蔬菜、橄欖、酸豆與菲達起司，淋上特級初榨橄欖油',
    image_url: 'https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg',
    is_available: true
  },
  {
    item_name: '蒜香麵包',
    category: '開胃菜',
    price: 150,
    description: '使用特級初榨橄欖油與新鮮大蒜烤製而成的香脆麵包，撒上香草與帕馬森起司',
    image_url: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg',
    is_available: true
  },
  {
    item_name: '蔬菜湯',
    category: '開胃菜',
    price: 180,
    description: '使用新鮮蔬菜與香草熬煮而成的湯品，搭配麵包',
    image_url: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg',
    is_available: true
  },
  {
    item_name: '提拉米蘇',
    category: '甜點',
    price: 200,
    description: '傳統義大利甜點，使用馬斯卡彭起司、咖啡與可可粉製作',
    image_url: 'https://images.pexels.com/photos/6205791/pexels-photo-6205791.jpeg',
    is_available: true
  },
  {
    item_name: '義式冰淇淋',
    category: '甜點',
    price: 180,
    description: '手工製作的香草與巧克力冰淇淋，搭配新鮮莓果',
    image_url: 'https://images.pexels.com/photos/1430714/pexels-photo-1430714.jpeg',
    is_available: true
  },
  {
    item_name: '美式咖啡',
    category: '飲料',
    price: 120,
    description: '使用精選咖啡豆烘焙而成的美式咖啡',
    image_url: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg',
    is_available: true
  },
  {
    item_name: '卡布奇諾',
    category: '飲料',
    price: 150,
    description: '使用精選咖啡豆與鮮奶製作的卡布奇諾，撒上肉桂粉',
    image_url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    is_available: true
  },
  {
    item_name: '紅酒',
    category: '飲料',
    price: 250,
    description: '精選義大利紅酒，單杯供應',
    image_url: 'https://images.pexels.com/photos/2702805/pexels-photo-2702805.jpeg',
    is_available: true
  },
  {
    item_name: '柳橙汁',
    category: '飲料',
    price: 120,
    description: '使用新鮮柳橙現榨而成的果汁',
    image_url: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    is_available: true
  }
];

// 導入菜單
async function importMenu() {
  try {
    // 從環境變數取得認證令牌
    const token = process.env.AUTH_TOKEN;
    
    if (!token) {
      console.error('錯誤: 未提供認證令牌');
      console.log('請使用以下格式運行此腳本:');
      console.log('AUTH_TOKEN=您的JWT令牌 node import-lazy-pasta.js');
      return;
    }
    
    console.log('正在導入菜單數據到餐廳:', RESTAURANT_ID);
    
    // 發送API請求導入菜單
    const response = await axios.post(
      `http://localhost:3000/api/restaurants/${RESTAURANT_ID}/menu/import`, 
      { menuItems },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('菜單導入結果:', response.data);
    console.log(`成功導入 ${response.data.imported} 個新菜單項目`);
    console.log(`成功更新 ${response.data.updated} 個現有菜單項目`);
    
  } catch (error) {
    console.error('導入菜單失敗:', error.response ? error.response.data : error.message);
    
    if (error.response && error.response.status === 401) {
      console.log('認證失敗，請確保您的認證令牌有效');
    }
  }
}

// 執行導入
importMenu(); 