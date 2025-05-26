const jwt = require('jsonwebtoken');

// JWT 密鑰 (從 .env 文件中的密鑰)
const JWT_SECRET = 'your_jwt_secret_key';

// 創建一個具有管理員角色的 JWT token
const payload = {
  id: 'admin',
  name: 'System Admin',
  role: 'admin'
};

const token = jwt.sign(
  payload,
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('===== JWT 管理員令牌 =====');
console.log(token);
console.log('\n使用此令牌導入餐廳數據:');
console.log(`AUTH_TOKEN=${token} node import-restaurant-data.js`);
console.log('或直接使用此令牌在前端頁面操作。'); 