const Student = require('../models/studentModel');

// 獲取學生資料
exports.getStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // 驗證請求的學生ID與令牌中的ID是否匹配
    if (studentId !== req.user.id) {
      return res.status(403).json({ message: '無權限訪問此資料' });
    }
    
    // 查找學生
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: '找不到學生' });
    }
    
    // 返回學生資料（不包含密碼）
    const studentData = { ...student };
    delete studentData.password;
    
    return res.status(200).json({
      message: '獲取學生資料成功',
      student: studentData
    });
  } catch (error) {
    console.error('獲取學生資料錯誤:', error);
    return res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};

// 更新學生密碼
exports.updatePassword = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { password } = req.body;
    
    // 驗證請求的學生ID與令牌中的ID是否匹配
    if (studentId !== req.user.id) {
      return res.status(403).json({ message: '無權限修改此帳號' });
    }
    
    // 驗證請求體
    if (!password) {
      return res.status(400).json({ message: '請提供新密碼' });
    }
    
    // 更新密碼
    const updated = await Student.updatePassword(studentId, password);
    if (!updated) {
      return res.status(404).json({ message: '找不到學生' });
    }
    
    return res.status(200).json({ message: '密碼更新成功' });
  } catch (error) {
    console.error('更新密碼錯誤:', error);
    return res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};
