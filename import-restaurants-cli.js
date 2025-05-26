#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 命令行參數解析
const args = process.argv.slice(2);
const options = {
  file: null,
  baseUrl: 'http://localhost:3000/api',
  token: null,
  onlyRestaurants: false,
  onlyMenus: false,
  restaurantId: null
};

// 解析命令行參數
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--file' || arg === '-f') {
    options.file = args[++i];
  } else if (arg === '--url' || arg === '-u') {
    options.baseUrl = args[++i];
  } else if (arg === '--token' || arg === '-t') {
    options.token = args[++i];
  } else if (arg === '--restaurants-only') {
    options.onlyRestaurants = true;
  } else if (arg === '--menus-only') {
    options.onlyMenus = true;
  } else if (arg === '--restaurant-id' || arg === '-r') {
    options.restaurantId = args[++i];
  } else if (arg === '--help' || arg === '-h') {
    showHelp();
    process.exit(0);
  }
}

// 顯示幫助信息
function showHelp() {
  console.log(`
餐廳資料匯入工具

用法:
  node import-restaurants-cli.js [選項]

選項:
  --file, -f <檔案路徑>         指定包含餐廳和菜單資料的JSON檔案 (必須)
  --url, -u <API URL>           指定API的基礎URL (預設: http://localhost:3000/api)
  --token, -t <認證令牌>        指定用於認證的JWT令牌 (必須)
  --restaurants-only            僅匯入餐廳資料，不匯入菜單
  --menus-only                  僅匯入菜單資料，不匯入餐廳
  --restaurant-id, -r <餐廳ID>  僅匯入指定餐廳的菜單資料
  --help, -h                    顯示此幫助信息

範例:
  node import-restaurants-cli.js -f restaurant-data.json -t eyJhbGciOiJ...
  node import-restaurants-cli.js -f restaurant-data.json -t eyJhbGciOiJ... --restaurants-only
  node import-restaurants-cli.js -f restaurant-data.json -t eyJhbGciOiJ... --menus-only -r r001
  `);
}

// 檢查必要參數
if (!options.file) {
  console.error('錯誤: 必須提供資料檔案路徑。使用 --file 或 -f 選項。');
  showHelp();
  process.exit(1);
}

if (!options.token) {
  console.error('錯誤: 必須提供認證令牌。使用 --token 或 -t 選項。');
  showHelp();
  process.exit(1);
}

// 讀取JSON檔案
async function loadDataFile(filePath) {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    const data = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`讀取或解析檔案失敗: ${error.message}`);
    process.exit(1);
  }
}

// 匯入餐廳資料
async function importRestaurants(restaurants, baseUrl, token) {
  console.log('開始匯入餐廳資料...');
  
  try {
    const response = await axios.post(`${baseUrl}/restaurants/import`, { restaurants }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('餐廳資料匯入結果:', response.data);
    return response.data;
  } catch (error) {
    console.error('匯入餐廳資料錯誤:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// 匯入餐廳菜單
async function importMenuItems(restaurantId, menuItems, baseUrl, token) {
  console.log(`開始匯入餐廳 ${restaurantId} 的菜單資料...`);
  
  try {
    const response = await axios.post(`${baseUrl}/restaurants/${restaurantId}/menu/import`, { menuItems }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`餐廳 ${restaurantId} 菜單匯入結果:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`匯入餐廳 ${restaurantId} 菜單錯誤:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

// 主函數
async function main() {
  console.log('=== 餐廳資料匯入工具 ===');
  console.log(`使用API: ${options.baseUrl}`);
  console.log(`資料檔案: ${options.file}`);
  console.log('');
  
  // 設置API請求的認證頭
  axios.defaults.headers.common['Authorization'] = `Bearer ${options.token}`;
  
  try {
    // 載入資料檔案
    const data = await loadDataFile(options.file);
    
    // 檢查資料格式
    if (!data.restaurants && !options.onlyMenus) {
      console.error('錯誤: 資料檔案中不包含 restaurants 欄位');
      process.exit(1);
    }
    
    if (!data.menus && !options.onlyRestaurants) {
      console.error('錯誤: 資料檔案中不包含 menus 欄位');
      process.exit(1);
    }
    
    // 匯入餐廳資料
    if (!options.onlyMenus) {
      await importRestaurants(data.restaurants, options.baseUrl, options.token);
    }
    
    // 匯入菜單資料
    if (!options.onlyRestaurants) {
      // 如果指定了特定餐廳，則只匯入該餐廳的菜單
      if (options.restaurantId) {
        if (data.menus[options.restaurantId]) {
          await importMenuItems(options.restaurantId, data.menus[options.restaurantId], options.baseUrl, options.token);
        } else {
          console.error(`錯誤: 找不到餐廳 ${options.restaurantId} 的菜單資料`);
        }
      } else {
        // 匯入所有餐廳的菜單
        for (const restaurantId in data.menus) {
          // 延遲一下避免請求過快
          if (Object.keys(data.menus).indexOf(restaurantId) > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          await importMenuItems(restaurantId, data.menus[restaurantId], options.baseUrl, options.token);
        }
      }
    }
    
    console.log('');
    console.log('=== 資料匯入程序完成 ===');
  } catch (error) {
    console.error('匯入程序出錯:', error);
    process.exit(1);
  }
}

// 執行主函數
main(); 