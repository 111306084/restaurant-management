const axios = require('axios');

// API地址
const BASE_URL = 'http://localhost:3000/api';

// 餐廳信息
const restaurant = {
  account_id: 'lazy001',
  restaurant_name: 'Lazy Pasta慵懶義式廚房',
  password: 'lazypasta123',
  restaurant_type: '義式料理',
  price_range: '中等',
  address: '台北市信義區忠孝東路五段71巷30號1樓',
  opening_hours: '11:00-21:00'
};

// 註冊餐廳
async function registerRestaurant() {
  try {
    console.log('註冊餐廳...');
    const response = await axios.post(`${BASE_URL}/restaurants/auth/register`, restaurant);
    console.log('註冊結果:', response.data);
    return response.data;
  } catch (error) {
    console.error('註冊錯誤:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 409) {
      console.log('餐廳已存在，嘗試登入...');
      return null;
    }
    throw error;
  }
}

// 登入餐廳
async function loginRestaurant() {
  try {
    console.log('登入餐廳...');
    const response = await axios.post(`${BASE_URL}/restaurants/auth/login`, {
      restaurant_id: restaurant.account_id,
      password: restaurant.password
    });
    console.log('登入結果:', response.data);
    return response.data;
  } catch (error) {
    console.error('登入錯誤:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// 執行主程序
async function main() {
  try {
    // 先嘗試註冊
    let result = await registerRestaurant();
    
    // 如果餐廳已存在，則嘗試登入
    if (!result) {
      result = await loginRestaurant();
    }
    
    // 顯示認證令牌
    if (result && result.token) {
      console.log('\n===== JWT 認證令牌 =====');
      console.log(result.token);
      console.log('\n使用此令牌導入餐廳數據:');
      console.log(`AUTH_TOKEN=${result.token} node import-lazy-pasta.js`);
      console.log(`或`);
      console.log(`./import-lazy-pasta-curl.sh ${result.token}`);
    }
  } catch (error) {
    console.error('程序出錯:', error);
  }
}

// 執行主程序
main(); 