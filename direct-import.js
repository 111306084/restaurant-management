// 直接導入數據到資料庫
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

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
    menu_id: 'lazymenu001',
    restaurant_id: 'lazy001',
    item_name: '番茄起司義大利麵',
    category: '主餐',
    price: 280,
    description: '新鮮番茄熬煮的醬汁，配上莫札瑞拉起司與帕馬森起司，淋上特級初榨橄欖油',
    image_url: 'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu002',
    restaurant_id: 'lazy001',
    item_name: '奶油蘑菇義大利麵',
    category: '主餐',
    price: 300,
    description: '使用新鮮香菇、蘑菇與奶油調製而成的濃郁義大利麵，撒上帕馬森起司與黑胡椒',
    image_url: 'https://images.pexels.com/photos/1438672/pexels-photo-1438672.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu003',
    restaurant_id: 'lazy001',
    item_name: '青醬鮮蝦義大利麵',
    category: '主餐',
    price: 350,
    description: '新鮮羅勒葉打成的青醬，搭配肥美鮮蝦與義大利面，淋上冷壓橄欖油與松子',
    image_url: 'https://images.pexels.com/photos/1487511/pexels-photo-1487511.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu004',
    restaurant_id: 'lazy001',
    item_name: '海鮮燉飯',
    category: '主餐',
    price: 320,
    description: '使用義大利進口的米，搭配新鮮海鮮熬煮而成的濃郁燉飯，撒上香蒜與香草',
    image_url: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu005',
    restaurant_id: 'lazy001',
    item_name: '炙燒牛排',
    category: '主餐',
    price: 450,
    description: '頂級澳洲牛排，使用橄欖油、迷迭香與大蒜調味，搭配烤蔬菜與香草奶油',
    image_url: 'https://images.pexels.com/photos/1251208/pexels-photo-1251208.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu006',
    restaurant_id: 'lazy001',
    item_name: '烤雞沙拉',
    category: '輕食',
    price: 250,
    description: '使用新鮮生菜、烤雞肉、番茄、小黃瓜與酪梨，淋上柑橘油醋醬',
    image_url: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu007',
    restaurant_id: 'lazy001',
    item_name: '地中海沙拉',
    category: '輕食',
    price: 220,
    description: '使用新鮮蔬菜、橄欖、酸豆與菲達起司，淋上特級初榨橄欖油',
    image_url: 'https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg',
    is_available: true
  },
  {
    menu_id: 'lazymenu008',
    restaurant_id: 'lazy001',
    item_name: '蒜香麵包',
    category: '開胃菜',
    price: 150,
    description: '使用特級初榨橄欖油與新鮮大蒜烤製而成的香脆麵包，撒上香草與帕馬森起司',
    image_url: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu009',
    restaurant_id: 'lazy001',
    item_name: '蔬菜湯',
    category: '開胃菜',
    price: 180,
    description: '使用新鮮蔬菜與香草熬煮而成的湯品，搭配麵包',
    image_url: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu010',
    restaurant_id: 'lazy001',
    item_name: '提拉米蘇',
    category: '甜點',
    price: 200,
    description: '傳統義大利甜點，使用馬斯卡彭起司、咖啡與可可粉製作',
    image_url: 'https://images.pexels.com/photos/6205791/pexels-photo-6205791.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu011',
    restaurant_id: 'lazy001',
    item_name: '義式冰淇淋',
    category: '甜點',
    price: 180,
    description: '手工製作的香草與巧克力冰淇淋，搭配新鮮莓果',
    image_url: 'https://images.pexels.com/photos/1430714/pexels-photo-1430714.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu012',
    restaurant_id: 'lazy001',
    item_name: '美式咖啡',
    category: '飲料',
    price: 120,
    description: '使用精選咖啡豆烘焙而成的美式咖啡',
    image_url: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu013',
    restaurant_id: 'lazy001',
    item_name: '卡布奇諾',
    category: '飲料',
    price: 150,
    description: '使用精選咖啡豆與鮮奶製作的卡布奇諾，撒上肉桂粉',
    image_url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu014',
    restaurant_id: 'lazy001',
    item_name: '紅酒',
    category: '飲料',
    price: 250,
    description: '精選義大利紅酒，單杯供應',
    image_url: 'https://images.pexels.com/photos/2702805/pexels-photo-2702805.jpeg',
    is_available: true
  },
  {
    menu_id: 'lazymenu015',
    restaurant_id: 'lazy001',
    item_name: '柳橙汁',
    category: '飲料',
    price: 120,
    description: '使用新鮮柳橙現榨而成的果汁',
    image_url: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    is_available: true
  }
];

// 建立資料庫連接
async function createConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurant_system'
  });
  
  console.log('成功連接資料庫');
  return connection;
}

// 導入餐廳資料
async function importRestaurant(connection) {
  try {
    console.log('正在導入餐廳資料...');
    
    // 餐廳資料SQL
    const sql = `
      INSERT INTO restaurants 
      (restaurant_id, restaurant_name, restaurant_type, price_range, address, opening_hours, description, image_url, phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      restaurant_name = VALUES(restaurant_name),
      restaurant_type = VALUES(restaurant_type),
      price_range = VALUES(price_range),
      address = VALUES(address),
      opening_hours = VALUES(opening_hours),
      description = VALUES(description),
      image_url = VALUES(image_url),
      phone = VALUES(phone)
    `;
    
    const [result] = await connection.execute(sql, [
      restaurant.restaurant_id,
      restaurant.restaurant_name,
      restaurant.restaurant_type,
      restaurant.price_range,
      restaurant.address,
      restaurant.opening_hours,
      restaurant.description,
      restaurant.image_url,
      restaurant.phone
    ]);
    
    if (result.affectedRows > 0) {
      if (result.insertId > 0) {
        console.log('餐廳資料新增成功');
      } else {
        console.log('餐廳資料更新成功');
      }
    }
    
    return true;
  } catch (error) {
    console.error('導入餐廳資料失敗:', error);
    return false;
  }
}

// 導入菜單資料
async function importMenuItems(connection) {
  try {
    console.log('正在導入菜單資料...');
    
    // 菜單資料SQL
    const sql = `
      INSERT INTO menus 
      (menu_id, restaurant_id, item_name, category, price, description, image_url, is_available) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      item_name = VALUES(item_name),
      category = VALUES(category),
      price = VALUES(price),
      description = VALUES(description),
      image_url = VALUES(image_url),
      is_available = VALUES(is_available)
    `;
    
    let importCount = 0;
    let updateCount = 0;
    
    // 逐一導入菜單項目
    for (const item of menuItems) {
      const [result] = await connection.execute(sql, [
        item.menu_id,
        item.restaurant_id,
        item.item_name,
        item.category,
        item.price,
        item.description,
        item.image_url,
        item.is_available
      ]);
      
      if (result.affectedRows > 0) {
        if (result.insertId > 0) {
          importCount++;
        } else {
          updateCount++;
        }
      }
    }
    
    console.log(`成功導入 ${importCount} 個新菜單項目`);
    console.log(`成功更新 ${updateCount} 個現有菜單項目`);
    
    return true;
  } catch (error) {
    console.error('導入菜單資料失敗:', error);
    return false;
  }
}

// 主程序
async function main() {
  let connection;
  try {
    // 建立資料庫連接
    connection = await createConnection();
    
    // 導入餐廳資料
    const restaurantSuccess = await importRestaurant(connection);
    
    // 導入菜單資料
    if (restaurantSuccess) {
      const menuSuccess = await importMenuItems(connection);
      
      if (menuSuccess) {
        console.log('=== 數據導入完成 ===');
        console.log('您現在可以訪問以下頁面查看餐廳資料:');
        console.log(`http://localhost:8093/restaurants/${restaurant.restaurant_id}`);
      }
    }
  } catch (error) {
    console.error('程序執行錯誤:', error);
  } finally {
    // 關閉資料庫連接
    if (connection) {
      await connection.end();
      console.log('資料庫連接已關閉');
    }
  }
}

// 執行主程序
main(); 