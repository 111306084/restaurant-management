const Student = require('./models/studentModel');
require('dotenv').config();

async function createTestStudent() {
  try {
    console.log('開始創建測試學生帳號...');
    
    const testStudent = await Student.findById('101010101');
    if (!testStudent) {
      console.log('找不到測試學生帳號，正在創建...');
      
      await Student.create({
        student_id: '101010101',
        student_name: '測試學生',
        password: 'password123',
        email: 'test@example.com'
      });
      
      console.log('測試學生帳號創建成功!');
      console.log('學生ID: 101010101');
      console.log('密碼: password123');
    } else {
      console.log('測試學生帳號已存在:');
      console.log('學生ID: 101010101');
      console.log('密碼: password123 (密碼已加密儲存)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('創建測試學生帳號時出錯:', error);
    process.exit(1);
  }
}

// 執行函數
createTestStudent(); 