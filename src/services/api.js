import axios from 'axios';

// 配置API基礎URL
const getApiBaseUrl = () => {
  // 使用確定的URL，避免跨域問題
  return 'http://localhost:3000/api';
};

const API_URL = getApiBaseUrl();
console.log('使用API基礎URL:', API_URL);

// 創建 axios 實例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // 增加超時設置，調整為 30 秒
  timeout: 30000,
  // 允許跨域請求攜帶憑證
  withCredentials: false
});

// 調試函數 - 記錄請求和響應
const logApiCall = (type, url, data = null, response = null) => {
  const timestamp = new Date().toISOString();
  if (type === 'request') {
    console.log(`[${timestamp}] API 請求: ${url}`, data || '');
  } else if (type === 'response') {
    console.log(`[${timestamp}] API 響應: ${url}`, response || '');
  } else if (type === 'error') {
    console.error(`[${timestamp}] API 錯誤: ${url}`, data || '');
  }
};

// 請求攔截器 - 添加認證令牌
api.interceptors.request.use(
  config => {
    logApiCall('request', config.url, config.data);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    logApiCall('error', error.config?.url, error);
    return Promise.reject(error);
  }
);

// 響應攔截器 - 處理常見錯誤
api.interceptors.response.use(
  response => {
    logApiCall('response', response.config.url, null, response.data);
    return response.data;
  },
  error => {
    // 詳細記錄錯誤信息
    console.error('API 調用錯誤:', error);
    
    if (error.code === 'ECONNABORTED') {
      console.error('API 請求超時');
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('網絡連接錯誤，後端服務器可能未啟動');
    }
    
    logApiCall('error', error.config?.url, error.response?.data || error.message);
    
    // 如果是認證錯誤，清除本地存儲並重定向到登入頁面
    if (error.response && error.response.status === 401) {
      console.log('認證錯誤，清除Token...');
      localStorage.removeItem('token');
      localStorage.removeItem('student');
      // 如果當前不在登入頁面，則重定向到登入頁面
      if (!window.location.href.includes('/student-login')) {
        window.location.href = '/student-login';
      }
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

// 認證相關 API
export const authAPI = {
  // 學生登入
  async login(credentials) {
    console.log('調用學生登入API:', {...credentials, password: '******'});
    try {
      // 直接使用 axios 而非 api 實例，避開放應攝取器的影響
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('原始學生登入響應:', response);
      return response.data; // 直接返回原始響應的 data
    } catch (error) {
      console.error('學生登入API調用失敗:', error);
      throw error;
    }
  },
  
  // 學生註冊
  register(userData) {
    console.log('調用學生註冊API:', {...userData, password: '******'});
    return api.post('/auth/register', userData);
  }
};

// 訂單相關 API
export const orderAPI = {
  // 創建訂單
  createOrder(orderData) {
    return api.post('/orders', orderData);
  },
  
  // 獲取學生的訂單列表
  getStudentOrders(page = 1, limit = 10) {
    return api.get(`/orders/student?page=${page}&limit=${limit}`);
  },
  
  // 獲取餐廳的訂單列表
  getRestaurantOrders(status = null, page = 1, limit = 10) {
    let url = `/orders/restaurant?page=${page}&limit=${limit}`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    return api.get(url);
  },
  
  // 獲取訂單詳情
  getOrderById(orderId) {
    return api.get(`/orders/${orderId}`);
  },
  
  // 更新訂單狀態
  updateOrderStatus(orderId, status) {
    return api.put(`/orders/${orderId}/status`, { status });
  },
  
  // 取消訂單
  cancelOrder(orderId) {
    return api.put(`/orders/${orderId}/cancel`);
  }
};

// 購物車相關 API
export const cartAPI = {
  // 獲取購物車
  getCart() {
    return api.get('/cart');
  },
  
  // 添加商品到購物車
  addToCart(menuItem) {
    return api.post('/cart/items', menuItem);
  },
  
  // 更新購物車商品數量
  updateCartItem(cartItemId, quantity) {
    return api.put(`/cart/items/${cartItemId}`, { quantity });
  },
  
  // 刪除購物車商品
  removeCartItem(cartItemId) {
    return api.delete(`/cart/items/${cartItemId}`);
  },
  
  // 清空購物車
  clearCart() {
    return api.delete('/cart');
  }
};

// 學生相關 API
export const studentAPI = {
  // 獲取學生資料
  getProfile(studentId) {
    return api.get(`/students/${studentId}`);
  },
  
  // 更新密碼
  updatePassword(studentId, passwordData) {
    return api.put(`/students/${studentId}/password`, passwordData);
  }
};

// 用於測試API連接的方法
export const testApiConnection = async () => {
  try {
    // 設置超時時間為 3 秒，避免長時間等待
    const response = await axios.get(`${API_URL}/test`, {
      timeout: 3000,
      // 如果連接失敗，最多重試 2 次
      retry: 2,
      retryDelay: 500
    });
    console.log('API連接測試成功:', response.data);
    return true;
  } catch (error) {
    console.error('API連接測試失敗:', error);
    // 如果是超時錯誤，提供更明確的錯誤信息
    if (error.code === 'ECONNABORTED') {
      console.error('API連接超時');
    }
    return false;
  }
};

export default api;