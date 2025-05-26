const axios = require('axios');

async function testRatingsAPI() {
  try {
    console.log('測試評分 API...');
    const response = await axios.get('http://localhost:3000/api/test-ratings/123456');
    console.log('響應狀態:', response.status);
    console.log('響應數據:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('API 錯誤:', error.message);
    if (error.response) {
      console.error('錯誤狀態碼:', error.response.status);
      console.error('錯誤數據:', error.response.data);
    }
  }
}

testRatingsAPI(); 