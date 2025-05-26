const express = require('express');
const cors = require('cors');

// 初始化 Express 應用
const app = express();

// 基本中間件
app.use(cors());
app.use(express.json());

// 測試路由
app.get('/api/test', (req, res) => {
  res.json({ message: '伺服器正常運行' });
});

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`);
  console.log(`測試路徑可在 http://localhost:${PORT}/api/test 訪問`);
}); 