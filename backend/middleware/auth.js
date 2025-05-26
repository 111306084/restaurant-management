const jwt = require('jsonwebtoken');
require('dotenv').config();

// 驗證中間件
const auth = (req, res, next) => {
  // 檢查路徑是否為測試路由
  if (req.path.includes('/test/')) {
    // 測試路由跳過驗證
    console.log('測試路由跳過驗證:', req.path);
    return next();
  }

  // 從請求頭獲取令牌
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未提供認證令牌' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 驗證令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('令牌驗證錯誤:', error.message);
    return res.status(401).json({ message: '無效的認證令牌' });
  }
};

module.exports = auth; 