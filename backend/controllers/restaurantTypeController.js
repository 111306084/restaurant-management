const pool = require('../config/db');

// 獲取所有餐廳類型
exports.getAllTypes = async (req, res) => {
  try {
    const [types] = await pool.query('SELECT * FROM restaurant_types ORDER BY type_name');
    
    return res.status(200).json({
      success: true,
      types
    });
  } catch (error) {
    console.error('獲取餐廳類型錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤', 
      error: error.message 
    });
  }
};

// 添加新的餐廳類型
exports.addType = async (req, res) => {
  try {
    const { type_name, description } = req.body;
    
    // 驗證請求體
    if (!type_name) {
      return res.status(400).json({ 
        success: false, 
        message: '請提供餐廳類型名稱' 
      });
    }
    
    // 檢查是否已存在
    const [existingTypes] = await pool.query(
      'SELECT * FROM restaurant_types WHERE type_name = ?',
      [type_name]
    );
    
    if (existingTypes.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: '此餐廳類型已存在' 
      });
    }
    
    // 添加新類型
    const [result] = await pool.query(
      'INSERT INTO restaurant_types (type_name, description) VALUES (?, ?)',
      [type_name, description || null]
    );
    
    // 獲取新添加的類型
    const [newType] = await pool.query(
      'SELECT * FROM restaurant_types WHERE type_id = ?',
      [result.insertId]
    );
    
    return res.status(201).json({
      success: true,
      message: '餐廳類型添加成功',
      type: newType[0]
    });
  } catch (error) {
    console.error('添加餐廳類型錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤', 
      error: error.message 
    });
  }
};

// 刪除餐廳類型
exports.deleteType = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 驗證請求參數
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: '請提供餐廳類型ID' 
      });
    }
    
    // 檢查是否存在
    const [existingTypes] = await pool.query(
      'SELECT * FROM restaurant_types WHERE type_id = ?',
      [id]
    );
    
    if (existingTypes.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到此餐廳類型' 
      });
    }
    
    // 刪除類型
    await pool.query(
      'DELETE FROM restaurant_types WHERE type_id = ?',
      [id]
    );
    
    return res.status(200).json({
      success: true,
      message: '餐廳類型刪除成功'
    });
  } catch (error) {
    console.error('刪除餐廳類型錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤', 
      error: error.message 
    });
  }
};
