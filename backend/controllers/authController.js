const jwt = require('jsonwebtoken');
const Student = require('../models/studentModel');
require('dotenv').config();

// 學生登入
exports.login = async (req, res) => {
  try {
    console.log('收到登入請求:', req.body);
    
    const { student_id, password } = req.body;
    
    // 驗證請求體
    if (!student_id || !password) {
      console.log('登入失敗: 缺少學生ID或密碼');
      return res.status(400).json({ message: '請提供學生ID和密碼' });
    }
    
    console.log(`嘗試查找學生: ${student_id}`);
    
    // 查找學生
    const student = await Student.findById(student_id);
    if (!student) {
      console.log(`找不到學生: ${student_id}`);
      return res.status(401).json({ message: '學生ID或密碼錯誤' });
    }
    
    console.log(`找到學生: ${student_id}, 驗證密碼中...`);
    
    // 驗證密碼
    const isPasswordValid = await Student.validatePassword(student_id, password);
    if (!isPasswordValid) {
      console.log(`密碼驗證失敗: ${student_id}`);
      return res.status(401).json({ message: '學生ID或密碼錯誤' });
    }
    
    console.log(`密碼驗證成功，正在生成令牌...`);
    
    // 生成 JWT token
    const token = jwt.sign(
      { 
        student_id: student.student_id,
        name: student.student_name,
        role: 'student'  // 添加角色信息
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    console.log(`登入成功，令牌已生成: ${token.substring(0, 10)}...`);
    
    // 返回成功響應
    return res.status(200).json({
      message: '登入成功',
      token,
      student: {
        student_id: student.student_id,
        student_name: student.student_name
      }
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    return res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};

// 學生註冊
exports.register = async (req, res) => {
  try {
    const { student_id, student_name, password, email } = req.body;
    
    // 驗證請求體
    if (!student_id || !password) {
      return res.status(400).json({ message: '請提供學生ID和密碼' });
    }
    
    // 驗證學生ID格式 (9位數字)
    if (!/^\d{9}$/.test(student_id)) {
      return res.status(400).json({ message: '學生ID必須是9位數字' });
    }
    
    // 如果沒有提供名字，使用默認名字
    const finalStudentName = student_name || `學生${student_id}`;
    
    // 創建新學生
    const newStudent = await Student.create({
      student_id,
      student_name: finalStudentName,
      password,
      email
    });
    
    // 返回成功響應
    return res.status(201).json({
      message: '註冊成功',
      student: {
        student_id: newStudent.student_id,
        student_name: newStudent.student_name
      }
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    
    if (error.message === '學生ID已存在') {
      return res.status(409).json({ message: '此學生ID已被註冊' });
    }
    
    return res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};
