const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 確保上傳目錄存在
const uploadsDir = path.join(__dirname, 'uploads');
const menuUploadsDir = path.join(__dirname, 'uploads/menu');

if (!fs.existsSync(uploadsDir)) {
  console.log('創建 uploads 目錄...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(menuUploadsDir)) {
  console.log('創建 uploads/menu 目錄...');
  fs.mkdirSync(menuUploadsDir, { recursive: true });
}

// 設置目錄權限
fs.chmodSync(uploadsDir, 0o755);
fs.chmodSync(menuUploadsDir, 0o755);

// 初始化 Express 應用
const app = express();

// 日誌中間件 - 確保它是第一個中間件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 基本中間件
app.use(cors());

// 設置靜態檔案服務
// 確保 uploads 及其子目錄可被訪問
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 為了清晰打印出靜態檔案目錄
console.log('靜態檔案目錄:');
console.log('- ' + path.join(__dirname, 'uploads'));
console.log('- ' + path.join(__dirname, 'uploads/menu'));
console.log('- ' + path.join(__dirname, 'uploads/comments'));

// 增加請求體大小限制，解決 'request entity too large' 錯誤
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 根路徑路由 - 必須在引入其他路由之前定義
app.get('/', (req, res) => {
  return res.status(200).json({ 
    message: '歡迎使用餐廳系統 API', 
    status: 'online', 
    timestamp: new Date().toISOString() 
  });
});

// 引入路由
const authRoutes = require('./routes/authRoutes');
const restaurantAuthRoutes = require('./routes/restaurantAuthRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const commentRoutes = require('./routes/commentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const couponRoutes = require('./routes/couponRoutes');

// 測試路由
app.get('/api/test', (req, res) => {
  res.json({ message: '伺服器正常運行' });
});

// 測試資料庫連接
app.get('/api/test-db', async (req, res) => {
  try {
    // 取得連接
    const connection = await pool.getConnection();
    
    try {
      // 執行簡單的查詢
      const [result] = await connection.query('SELECT 1 AS connected');
      
      // 取得資料庫版本資訊
      const [versionResult] = await connection.query('SELECT VERSION() AS version');
      
      // 取得資料庫狀態資訊
      const [statusResult] = await connection.query('SHOW STATUS LIKE \'Conn%\'');
      
      // 測試資料表存在
      const [tablesResult] = await connection.query(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = ?', 
        [process.env.DB_NAME]
      );
      
      const tables = tablesResult.map(row => row.table_name);
      
      res.json({
        success: true,
        message: '資料庫連接成功',
        data: {
          connected: result[0].connected === 1,
          version: versionResult[0].version,
          connectionStatus: statusResult,
          databaseName: process.env.DB_NAME,
          tables: tables,
          tablesCount: tables.length
        }
      });
    } finally {
      // 釋放連接
      connection.release();
    }
  } catch (error) {
    console.error('資料庫連接測試失敗:', error);
    res.status(500).json({
      success: false,
      message: '資料庫連接失敗',
      error: error.message
    });
  }
});

// 直接測試評分 API
app.get('/api/test-ratings/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM restaurant_ratings WHERE restaurant_id = ?',
      [restaurantId]
    );
    
    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        ratingSummary: {
          restaurant_id: restaurantId,
          avg_food_rating: 0,
          avg_service_rating: 0,
          avg_environment_rating: 0,
          avg_overall_rating: 0,
          total_ratings: 0
        }
      });
    }
    
    return res.status(200).json({
      success: true,
      ratingSummary: rows[0]
    });
  } catch (error) {
    console.error('測試評分 API 錯誤:', error);
    return res.status(500).json({ 
      success: false,
      message: '獲取評分數據時發生錯誤', 
      error: error.message 
    });
  }
});

// 路由 - 設置API路徑
app.use('/api', commentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/restaurant/auth', restaurantAuthRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);

// 捕捉 404 錯誤
app.use((req, res) => {
  res.status(404).json({
    message: '找不到請求的資源',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 全局錯誤處理
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Server Error:', err.stack);
  res.status(500).json({
    message: '伺服器錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`);
  console.log(`根路徑可在 http://localhost:${PORT}/ 訪問`);
  console.log(`測試路徑可在 http://localhost:${PORT}/api/test 訪問`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，請使用不同端口或關閉占用該端口的進程`);
    console.error('您可以使用 "lsof -i :3000" 命令查看占用端口的進程');
    console.error('然後使用 "kill <進程ID>" 命令終止該進程');
    process.exit(1);
  } else {
    console.error('啟動伺服器時發生錯誤:', err);
    process.exit(1);
  }
});

// 優雅關閉
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('接收到終止信號，正在關閉伺服器...');
  server.close(() => {
    console.log('伺服器已關閉');
    pool.end((err) => {
      console.log('數據庫連接已關閉');
      process.exit(err ? 1 : 0);
    });
  });
  
  // 設定超時強制關閉
  setTimeout(() => {
    console.error('無法正常關閉，強制終止');
    process.exit(1);
  }, 10000);
}
