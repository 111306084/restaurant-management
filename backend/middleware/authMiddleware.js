const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.requireAuth = (req, res, next) => {
  try {
    // 檢查請求頭中是否有授權令牌
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: '未提供認證令牌' });
    }
    
    // 從授權頭中提取令牌
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: '令牌格式無效' });
    }
    
    // 驗證令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 將解碼後的用戶信息添加到請求對象中
    req.user = decoded;
    
    // 檢查用戶角色
    console.log('認證中間件 - 用戶信息:', decoded);
    
    // 確保用戶角色存在
    if (!decoded.role) {
      // 嘗試從其他字段推斷角色
      if (decoded.student_id) {
        req.user.role = 'student';
        req.user.id = decoded.student_id;
      } else if (decoded.restaurant_id) {
        req.user.role = 'restaurant';
        req.user.id = decoded.restaurant_id;
      }
    }
    
    console.log('認證中間件 - 處理後的用戶信息:', req.user);
    
    // 繼續處理請求
    next();
  } catch (error) {
    console.error('認證錯誤:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '令牌已過期，請重新登入' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '無效的令牌' });
    }
    
    res.status(401).json({ message: '認證失敗' });
  }
};

exports.checkRestaurantOwnership = (req, res, next) => {
  // 確保用戶是餐廳並且只能操作自己的資料
  if (req.user.role !== 'restaurant' || req.params.id !== req.user.id) {
    return res.status(403).json({ message: '無權限執行此操作' });
  }
  next();
};

// 保持舊的導出方式以保持兼容性
module.exports.authMiddleware = exports.requireAuth;
