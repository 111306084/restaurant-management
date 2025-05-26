const axios = require('axios');

async function testLoginApi() {
  console.log('開始測試學生登入API...');
  
  try {
    console.log('嘗試使用測試帳號登入...');
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      student_id: '101010101', 
      password: 'password123'
    });
    
    console.log('登入成功! 響應狀態碼:', response.status);
    console.log('響應數據:', {
      message: response.data.message,
      token: response.data.token ? `${response.data.token.substring(0, 10)}...` : 'No token',
      student: response.data.student
    });
    
    return response.data;
  } catch (error) {
    console.error('登入失敗!');
    
    if (error.response) {
      // 伺服器回應了請求，但回應狀態碼不是2xx
      console.error('響應狀態碼:', error.response.status);
      console.error('響應數據:', error.response.data);
    } else if (error.request) {
      // 請求已發送，但沒有收到回應
      console.error('無法連接到伺服器，請確保伺服器正在運行!');
      console.error('請求數據:', error.request);
    } else {
      // 請求設置時發生問題
      console.error('請求錯誤:', error.message);
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('連接被拒絕: 後端伺服器可能沒有運行');
      console.log('請先執行 node server.js 啟動後端伺服器');
    }
    
    return null;
  }
}

// 執行測試
testLoginApi().then(data => {
  if (data && data.token) {
    console.log('=== 登入API測試成功! ===');
  } else {
    console.log('=== 登入API測試失敗! ===');
  }
}); 