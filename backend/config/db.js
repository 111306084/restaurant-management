const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,  // 增加連接數量
  queueLimit: 0,
  connectTimeout: 10000,  // 連接超時 10 秒
  acquireTimeout: 10000,  // 獲取連接超時 10 秒
  timeout: 10000  // 查詢超時 10 秒
});

// 測試連接
pool.getConnection()
  .then(connection => {
    console.log('資料庫連接成功');
    connection.release();
  })
  .catch(err => {
    console.error('資料庫連接失敗:', err);
  });

module.exports = pool;
