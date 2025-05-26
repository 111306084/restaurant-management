const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('開始測試資料庫連接...');
  console.log('資料庫配置:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
  });
  
  let connection;
  
  try {
    // 創建連接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('資料庫連接成功!');
    
    // 測試查詢 - 檢查表是否存在
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('資料庫表清單:');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${Object.values(row)[0]}`);
    });
    
    // 測試學生表
    const [studentRows] = await connection.execute('SELECT COUNT(*) as count FROM students');
    console.log(`學生表中共有 ${studentRows[0].count} 筆資料`);

    // 獲取所有學生
    const [allStudents] = await connection.execute('SELECT * FROM students');
    console.log('學生資料:');
    allStudents.forEach((student, index) => {
      console.log(`${index + 1}. ID: ${student.student_id}, 名稱: ${student.student_name}`);
    });
    
    console.log('資料庫測試完成!');
  } catch (error) {
    console.error('資料庫連接錯誤:', error.message);
    
    if (error.message.includes('Access denied')) {
      console.error('認證錯誤: 用戶名或密碼不正確');
    } else if (error.message.includes('Unknown database')) {
      console.error('資料庫不存在: 請先創建資料庫');
      console.log('可以使用以下命令創建資料庫:');
      console.log(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('連接被拒絕: MySQL 伺服器可能沒有運行');
    } else if (error.message.includes('Table') && error.message.includes('doesn\'t exist')) {
      console.error('資料表不存在: 請先執行 db_setup.sql');
      console.log('可以使用以下命令運行資料庫設定:');
      console.log('mysql -u root -p < db_setup.sql');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('資料庫連接已關閉');
    }
  }
}

// 執行測試
testDatabaseConnection(); 