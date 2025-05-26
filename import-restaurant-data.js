const axios = require('axios');

// 餐廳資料
const restaurant = {
  restaurant_id: 'lazy001',
  restaurant_name: 'Lazy Pasta慵懶義式廚房',
  restaurant_type: '義式料理',
  price_range: '中等',
  address: '台北市信義區忠孝東路五段71巷30號1樓',
  opening_hours: '11:00-21:00',
  description: '一間充滿慵懶氛圍的義大利麵專賣店，提供正宗義式料理與美酒，讓您在忙碌的生活中找到放鬆的時光。',
  image_url: 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg',
  phone: '02-2345-6789'
};

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

// 導入餐廳資料
async function importRestaurant() {
  try {
    console.log('正在導入餐廳資料...');
    
    // 使用測試路由導入餐廳資料（不需要認證）
    const response = await axios.post(
      'http://localhost:3000/api/restaurants/test/import',
      { restaurants: [restaurant] },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('餐廳資料導入結果:', response.data);
    return true;
  } catch (error) {
    console.error('導入餐廳資料失敗:', error.response ? error.response.data : error.message);
    return false;
  }
}

// 導入菜單資料
async function importMenu() {
  try {
    console.log('正在導入菜單資料...');
    
    // 使用測試路由導入菜單資料（不需要認證）
    const response = await axios.post(
      `http://localhost:3000/api/restaurants/${restaurant.restaurant_id}/test/menu/import`,
      { menuItems },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('菜單資料導入結果:', response.data);
    console.log(`成功導入 ${response.data.imported} 個新菜單項目`);
    console.log(`成功更新 ${response.data.updated} 個現有菜單項目`);
    return true;
  } catch (error) {
    console.error('導入菜單資料失敗:', error.response ? error.response.data : error.message);
    return false;
  }
}

// 主程序
async function main() {
  try {
    // 確保後端伺服器運行中
    try {
      await axios.get('http://localhost:3000/api/test');
      console.log('後端伺服器運行中...');
    } catch (error) {
      console.error('無法連接到後端伺服器，請確保伺服器已啟動：');
      console.log('cd backend && node server.js');
      return;
    }
    
    // 導入餐廳資料
    const restaurantSuccess = await importRestaurant();
    
    // 導入菜單資料
    if (restaurantSuccess) {
      const menuSuccess = await importMenu();
      
      if (menuSuccess) {
        console.log('數據導入完成！');
        console.log('您現在可以訪問以下頁面查看餐廳資料:');
        console.log(`http://localhost:8093/restaurants/${restaurant.restaurant_id}`);
      }
    }
  } catch (error) {
    console.error('程序執行錯誤:', error);
  }
}

// 執行主程序
main(); 