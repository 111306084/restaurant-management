const express = require('express');
const cors = require('cors');

// 初始化 Express 應用
const app = express();

// 中間件
app.use(cors());
app.use(express.json());

// 日誌中間件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 根路徑路由
app.get('/', (req, res) => {
  return res.status(200).json({ 
    message: '測試伺服器正常運行', 
    status: 'online', 
    timestamp: new Date().toISOString() 
  });
});

// 測試路由
app.get('/api/test', (req, res) => {
  return res.status(200).json({ message: '測試路由正常運行' });
});

// 啟動伺服器
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`測試伺服器運行在 http://localhost:${PORT}`);
});
