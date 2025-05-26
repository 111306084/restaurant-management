const db = require('../config/db');

// 直接使用 mysql2/promise 的查詢方法，不需要 promisify
async function query(sql, params) {
  try {
    const [rows] = await db.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('SQL 查詢錯誤:', error);
    throw error;
  }
}

// 獲取餐廳的所有菜單項目
async function getMenuItems(restaurantId) {
  try {
    const result = await query(
      'SELECT * FROM menus WHERE restaurant_id = ? AND is_available = TRUE ORDER BY category, item_name',
      [restaurantId]
    );
    return result;
  } catch (error) {
    console.error('獲取菜單項目錯誤:', error);
    throw error;
  }
}

// 根據ID獲取菜單項目
async function getMenuItemById(menuId) {
  try {
    const result = await query(
      'SELECT * FROM menus WHERE menu_id = ?',
      [menuId]
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('獲取菜單項目錯誤:', error);
    throw error;
  }
}

// 添加菜單項目
async function addMenuItem(restaurantId, itemData) {
  try {
    const { item_name, description, price, category, is_available } = itemData;
    
    const result = await query(
      'INSERT INTO menus (restaurant_id, item_name, description, price, category, is_available) VALUES (?, ?, ?, ?, ?, ?)',
      [restaurantId, item_name, description, price, category, is_available !== undefined ? is_available : true]
    );
    
    return {
      menu_id: result.insertId,
      restaurant_id: restaurantId,
      item_name,
      description,
      price,
      category,
      is_available: is_available !== undefined ? is_available : true
    };
  } catch (error) {
    console.error('添加菜單項目錯誤:', error);
    throw error;
  }
}

// 更新菜單項目
async function updateMenuItem(menuId, itemData) {
  try {
    const { item_name, description, price, category, is_available } = itemData;
    
    // 構建更新查詢
    let updateFields = [];
    let queryParams = [];
    
    if (item_name !== undefined) {
      updateFields.push('item_name = ?');
      queryParams.push(item_name);
    }
    
    if (description !== undefined) {
      updateFields.push('description = ?');
      queryParams.push(description);
    }
    
    if (price !== undefined) {
      updateFields.push('price = ?');
      queryParams.push(price);
    }
    
    if (category !== undefined) {
      updateFields.push('category = ?');
      queryParams.push(category);
    }
    
    if (is_available !== undefined) {
      updateFields.push('is_available = ?');
      queryParams.push(is_available);
    }
    
    if (updateFields.length === 0) {
      return { updated: false, message: '沒有提供要更新的字段' };
    }
    
    // 添加菜單ID到查詢參數
    queryParams.push(menuId);
    
    // 執行更新
    await query(
      `UPDATE menus SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE menu_id = ?`,
      queryParams
    );
    
    // 獲取更新後的菜單項目
    const updatedItem = await getMenuItemById(menuId);
    
    return {
      updated: true,
      item: updatedItem
    };
  } catch (error) {
    console.error('更新菜單項目錯誤:', error);
    throw error;
  }
}

// 刪除菜單項目
async function deleteMenuItem(menuId) {
  try {
    await query('DELETE FROM menus WHERE menu_id = ?', [menuId]);
    return { deleted: true };
  } catch (error) {
    console.error('刪除菜單項目錯誤:', error);
    throw error;
  }
}

module.exports = {
  getMenuItems,
  getMenuItemById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
};
