const db = require('../config/db');
const bcrypt = require('bcrypt');

class Student {
  // 根據學生ID查找學生
  static async findById(studentId) {
    console.log(`[StudentModel] 查找學生: ${studentId}`);
    
    try {
      const [rows] = await db.execute(
        'SELECT * FROM students WHERE student_id = ?',
        [studentId]
      );
      
      if (rows.length === 0) {
        console.log(`[StudentModel] 找不到學生: ${studentId}`);
        return null;
      }
      
      console.log(`[StudentModel] 找到學生: ${studentId}`);
      return rows[0];
    } catch (error) {
      console.error(`[StudentModel] 查找學生出錯: ${error.message}`);
      throw error;
    }
  }

  // 創建新學生
  static async create(studentData) {
    const { student_id, student_name, password, email } = studentData;
    
    // 檢查學生ID是否已存在
    const existingStudent = await this.findById(student_id);
    if (existingStudent) {
      throw new Error('學生ID已存在');
    }
    
    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 插入新學生
    await db.execute(
      'INSERT INTO students (student_id, student_name, password, email) VALUES (?, ?, ?, ?)',
      [student_id, student_name, hashedPassword, email || null]
    );
    
    return { student_id, student_name, email };
  }

  // 驗證密碼
  static async validatePassword(studentId, password) {
    console.log(`[StudentModel] 驗證密碼: ${studentId}`);
    
    try {
      const student = await this.findById(studentId);
      if (!student) {
        console.log(`[StudentModel] 驗證密碼失敗，找不到學生: ${studentId}`);
        return false;
      }
      
      const isMatch = await bcrypt.compare(password, student.password);
      console.log(`[StudentModel] 密碼驗證結果: ${isMatch ? '成功' : '失敗'}`);
      return isMatch;
    } catch (error) {
      console.error(`[StudentModel] 驗證密碼出錯: ${error.message}`);
      return false;
    }
  }

  // 更新密碼
  static async updatePassword(studentId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [result] = await db.execute(
      'UPDATE students SET password = ? WHERE student_id = ?',
      [hashedPassword, studentId]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Student;
