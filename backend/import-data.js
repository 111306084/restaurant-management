// 直接導入數據到資料庫
const mysql = require('mysql2/promise');
require('dotenv').config();

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
  phone: '02-2345-6789',
  password: 'lazypasta123'  // 添加密碼欄位
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
    
    // 餐廳資料SQL - 添加密碼欄位
    const sql = `
      INSERT INTO restaurants 
      (restaurant_id, restaurant_name, password, restaurant_type, price_range, address, opening_hours, description, image_url, phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      restaurant.password,
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

// 導入菜單資料 (修改後版本 - 適應自增ID)
async function importMenuItems(connection) {
  try {
    console.log('正在導入菜單資料...');
    
    // 首先清除現有菜單項目
    console.log('清除現有菜單項目...');
    await connection.execute(`DELETE FROM menus WHERE restaurant_id = ?`, [restaurant.restaurant_id]);
    
    // 菜單資料SQL (使用自增ID)
    const sql = `
      INSERT INTO menus 
      (restaurant_id, item_name, description, price, category, image_url, is_available) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    let importCount = 0;
    
    // 逐一導入菜單項目
    for (const item of menuItems) {
      const [result] = await connection.execute(sql, [
        restaurant.restaurant_id,
        item.item_name,
        item.description,
        item.price,
        item.category,
        item.image_url,
        item.is_available
      ]);
      
      if (result.affectedRows > 0) {
        importCount++;
      }
    }
    
    console.log(`成功導入 ${importCount} 個菜單項目`);
    
    return true;
  } catch (error) {
    console.error('導入菜單資料失敗:', error);
    return false;
  }
}

// 添加評分資料
async function addRatingData(connection) {
  try {
    console.log('正在添加評分資料...');
    
    // 首先檢查評分表是否存在
    const [tables] = await connection.query(`SHOW TABLES LIKE 'restaurant_ratings'`);
    if (tables.length === 0) {
      console.log('創建 restaurant_ratings 表...');
      await connection.execute(`
        CREATE TABLE restaurant_ratings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          restaurant_id VARCHAR(100) NOT NULL,
          avg_food_rating DECIMAL(3,2) DEFAULT 0,
          avg_service_rating DECIMAL(3,2) DEFAULT 0,
          avg_environment_rating DECIMAL(3,2) DEFAULT 0,
          avg_overall_rating DECIMAL(3,2) DEFAULT 0,
          total_ratings INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY (restaurant_id)
        )
      `);
    }
    
    // 添加示例評分
    const [ratingResult] = await connection.execute(`
      INSERT INTO restaurant_ratings 
      (restaurant_id, avg_food_rating, avg_service_rating, avg_environment_rating, avg_overall_rating, total_ratings)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      avg_food_rating = VALUES(avg_food_rating),
      avg_service_rating = VALUES(avg_service_rating),
      avg_environment_rating = VALUES(avg_environment_rating),
      avg_overall_rating = VALUES(avg_overall_rating),
      total_ratings = VALUES(total_ratings)
    `, [
      restaurant.restaurant_id,
      4.5,  // 食物評分
      4.2,  // 服務評分
      4.3,  // 環境評分
      4.3,  // 整體評分
      25    // 評分數量
    ]);
    
    console.log('評分資料添加成功');
    return true;
  } catch (error) {
    console.error('添加評分資料失敗:', error);
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
      
      // 添加評分資料
      if (menuSuccess) {
        await addRatingData(connection);
        
        console.log('=== 所有數據導入完成 ===');
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