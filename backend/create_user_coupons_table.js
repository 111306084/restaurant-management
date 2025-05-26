const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function createUserCouponsTable() {
  try {
    console.log('開始創建 user_coupons 資料表...');
    
    // 讀取 SQL 腳本
    const sqlFilePath = path.join(__dirname, 'db_create_user_coupons.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // 分割多個 SQL 語句
    const statements = sqlScript
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // 依次執行每個 SQL 語句
    for (const statement of statements) {
      console.log(`執行 SQL: ${statement.trim().substring(0, 100)}...`);
      await pool.query(statement);
    }
    
    console.log('user_coupons 資料表創建成功！');
  } catch (error) {
    console.error('創建 user_coupons 資料表失敗:', error);
    
    // 如果錯誤是因為外鍵約束問題，提供更詳細的指導
    if (error.message.includes('foreign key constraint')) {
      console.log('\n可能的解決方案:');
      console.log('1. 確保 students、coupons 和 orders 表已經存在');
      console.log('2. 嘗試移除外鍵約束後再創建表');
      
      // 創建一個簡化版本的表，沒有外鍵約束
      console.log('\n嘗試創建簡化版的表（無外鍵約束）...');
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS user_coupons (
            user_coupon_id INT AUTO_INCREMENT PRIMARY KEY,
            student_id VARCHAR(50) NOT NULL,
            coupon_id INT NOT NULL,
            claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_used BOOLEAN DEFAULT FALSE,
            used_at DATETIME NULL,
            order_id INT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('簡化版 user_coupons 資料表創建成功！');
      } catch (err) {
        console.error('創建簡化版表失敗:', err);
      }
    }
  } finally {
    // 關閉連接池
    process.exit();
  }
}

// 執行主函數
createUserCouponsTable();
