const pool = require('../config/db');

// 獲取餐廳的所有菜單分類
exports.getCategories = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId || req.user.id;
    
    // 檢查權限（如果不是查詢自己的資料）
    if (req.user && req.user.role === 'restaurant' && restaurantId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: '無權限訪問此資料' 
      });
    }
    
    // 查詢餐廳的菜單分類
    const [categories] = await pool.query(
      'SELECT * FROM menu_categories WHERE restaurant_id = ? ORDER BY display_order, category_name',
      [restaurantId]
    );
    
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('獲取菜單分類錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤', 
      error: error.message 
    });
  }
};

// 添加新的菜單分類
exports.addCategory = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId || req.user.id;
    const { category_name, display_order } = req.body;
    
    // 驗證請求體
    if (!category_name) {
      return res.status(400).json({ 
        success: false, 
        message: '請提供菜單分類名稱' 
      });
    }
    
    // 檢查權限（只能添加自己餐廳的分類）
    if (req.user.role !== 'restaurant' || restaurantId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: '無權限添加此餐廳的菜單分類' 
      });
    }
    
    // 檢查是否已存在
    const [existingCategories] = await pool.query(
      'SELECT * FROM menu_categories WHERE restaurant_id = ? AND category_name = ?',
      [restaurantId, category_name]
    );
    
    if (existingCategories.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: '此菜單分類已存在' 
      });
    }
    
    // 添加新分類
    const [result] = await pool.query(
      'INSERT INTO menu_categories (restaurant_id, category_name, display_order) VALUES (?, ?, ?)',
      [restaurantId, category_name, display_order || 0]
    );
    
    // 獲取新添加的分類
    const [newCategory] = await pool.query(
      'SELECT * FROM menu_categories WHERE category_id = ?',
      [result.insertId]
    );
    
    return res.status(201).json({
      success: true,
      message: '菜單分類添加成功',
      category: newCategory[0]
    });
  } catch (error) {
    console.error('添加菜單分類錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤', 
      error: error.message 
    });
  }
};

// 更新菜單分類
exports.updateCategory = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId || req.user.id;
    const { categoryId } = req.params;
    const { category_name, display_order } = req.body;
    
    // 驗證請求體
    if (!category_name) {
      return res.status(400).json({ 
        success: false, 
        message: '請提供菜單分類名稱' 
      });
    }
    
    // 檢查權限（只能更新自己餐廳的分類）
    if (req.user.role !== 'restaurant' || restaurantId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: '無權限更新此餐廳的菜單分類' 
      });
    }
    
    // 檢查分類是否存在
    const [existingCategories] = await pool.query(
      'SELECT * FROM menu_categories WHERE category_id = ? AND restaurant_id = ?',
      [categoryId, restaurantId]
    );
    
    if (existingCategories.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到此菜單分類' 
      });
    }
    
    // 檢查新名稱是否與其他分類衝突
    const [conflictCategories] = await pool.query(
      'SELECT * FROM menu_categories WHERE restaurant_id = ? AND category_name = ? AND category_id != ?',
      [restaurantId, category_name, categoryId]
    );
    
    if (conflictCategories.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: '此菜單分類名稱已被使用' 
      });
    }
    
    // 更新分類
    await pool.query(
      'UPDATE menu_categories SET category_name = ?, display_order = ? WHERE category_id = ?',
      [category_name, display_order || 0, categoryId]
    );
    
    // 獲取更新後的分類
    const [updatedCategory] = await pool.query(
      'SELECT * FROM menu_categories WHERE category_id = ?',
      [categoryId]
    );
    
    return res.status(200).json({
      success: true,
      message: '菜單分類更新成功',
      category: updatedCategory[0]
    });
  } catch (error) {
    console.error('更新菜單分類錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤', 
      error: error.message 
    });
  }
};

// 刪除菜單分類
exports.deleteCategory = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId || req.user.id;
    const { categoryId } = req.params;
    
    // 檢查權限（只能刪除自己餐廳的分類）
    if (req.user.role !== 'restaurant' || restaurantId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: '無權限刪除此餐廳的菜單分類' 
      });
    }
    
    // 檢查分類是否存在
    const [existingCategories] = await pool.query(
      'SELECT * FROM menu_categories WHERE category_id = ? AND restaurant_id = ?',
      [categoryId, restaurantId]
    );
    
    if (existingCategories.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到此菜單分類' 
      });
    }
    
    // 獲取要刪除的分類名稱，用於更新菜單項目
    const categoryName = existingCategories[0].category_name;
    
    // 開始事務
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 將使用此分類的菜單項目更新為「未分類」
      await connection.query(
        'UPDATE menus SET category = ? WHERE restaurant_id = ? AND category = ?',
        ['未分類', restaurantId, categoryName]
      );
      
      // 刪除分類
      await connection.query(
        'DELETE FROM menu_categories WHERE category_id = ?',
        [categoryId]
      );
      
      // 提交事務
      await connection.commit();
      
      return res.status(200).json({
        success: true,
        message: '菜單分類刪除成功'
      });
    } catch (error) {
      // 回滾事務
      await connection.rollback();
      throw error;
    } finally {
      // 釋放連接
      connection.release();
    }
  } catch (error) {
    console.error('刪除菜單分類錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤', 
      error: error.message 
    });
  }
};
