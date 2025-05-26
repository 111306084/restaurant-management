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

// 獲取學生的購物車
async function getStudentCart(studentId) {
  console.log(`開始獲取學生 ID ${studentId} 的購物車...`);
  
  try {
    // 使用單個查詢獲取購物車和項目
    const cartResult = await query(
      'SELECT * FROM carts WHERE student_id = ? LIMIT 1',
      [studentId]
    );

    if (cartResult.length === 0) {
      console.log(`學生 ${studentId} 沒有購物車`);
      return { cart: null, items: [] };
    }

    const cart = cartResult[0];
    console.log(`找到學生 ${studentId} 的購物車，ID: ${cart.cart_id}`);

    // 獲取購物車中的所有項目（使用索引優化查詢）
    const cartItems = await query(
      `SELECT ci.*, m.item_name, m.description, m.category
       FROM cart_items ci
       JOIN menus m ON ci.menu_id = m.menu_id
       WHERE ci.cart_id = ?
       ORDER BY ci.item_id`,  // 添加排序以使用索引
      [cart.cart_id]
    );

    console.log(`獲取到 ${cartItems.length} 個購物車項目`);
    
    return {
      cart,
      items: cartItems
    };
  } catch (error) {
    console.error(`獲取學生 ${studentId} 的購物車錯誤:`, error);
    console.error('錯誤詳情:', error.stack || error);
    // 發生錯誤時返回空購物車，而不是拋出錯誤
    return { cart: null, items: [] };
  }
}

// 創建或更新購物車
async function createOrUpdateCart(studentId, restaurantId) {
  try {
    // 檢查學生是否已有購物車
    const existingCart = await query(
      'SELECT * FROM carts WHERE student_id = ?',
      [studentId]
    );

    if (existingCart.length > 0) {
      const cart = existingCart[0];
      
      // 如果購物車中的餐廳與當前不同，則清空購物車項目並更新餐廳
      if (cart.restaurant_id !== restaurantId) {
        await query('DELETE FROM cart_items WHERE cart_id = ?', [cart.cart_id]);
        await query(
          'UPDATE carts SET restaurant_id = ?, updated_at = CURRENT_TIMESTAMP WHERE cart_id = ?',
          [restaurantId, cart.cart_id]
        );
      }
      
      return cart;
    } else {
      // 創建新購物車
      const result = await query(
        'INSERT INTO carts (student_id, restaurant_id) VALUES (?, ?)',
        [studentId, restaurantId]
      );
      
      return {
        cart_id: result.insertId,
        student_id: studentId,
        restaurant_id: restaurantId
      };
    }
  } catch (error) {
    console.error('創建/更新購物車錯誤:', error);
    throw error;
  }
}

// 添加項目到購物車
async function addItemToCart(cartId, menuId, quantity, price, specialInstructions = null) {
  try {
    // 檢查項目是否已在購物車中
    const existingItem = await query(
      'SELECT * FROM cart_items WHERE cart_id = ? AND menu_id = ?',
      [cartId, menuId]
    );

    if (existingItem.length > 0) {
      // 更新現有項目的數量
      await query(
        'UPDATE cart_items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE item_id = ?',
        [quantity, existingItem[0].item_id]
      );
      return existingItem[0].item_id;
    } else {
      // 添加新項目
      const result = await query(
        'INSERT INTO cart_items (cart_id, menu_id, quantity, price, special_instructions) VALUES (?, ?, ?, ?, ?)',
        [cartId, menuId, quantity, price, specialInstructions]
      );
      return result.insertId;
    }
  } catch (error) {
    console.error('添加購物車項目錯誤:', error);
    throw error;
  }
}

// 更新購物車項目數量
async function updateCartItemQuantity(itemId, quantity) {
  try {
    if (quantity <= 0) {
      // 如果數量為0或負數，刪除項目
      await query('DELETE FROM cart_items WHERE item_id = ?', [itemId]);
      return { deleted: true };
    } else {
      // 更新數量
      await query(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE item_id = ?',
        [quantity, itemId]
      );
      return { updated: true };
    }
  } catch (error) {
    console.error('更新購物車項目數量錯誤:', error);
    throw error;
  }
}

// 刪除購物車項目
async function removeCartItem(itemId) {
  try {
    await query('DELETE FROM cart_items WHERE item_id = ?', [itemId]);
    return { deleted: true };
  } catch (error) {
    console.error('刪除購物車項目錯誤:', error);
    throw error;
  }
}

// 清空購物車
async function clearCart(cartId) {
  try {
    await query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    return { cleared: true };
  } catch (error) {
    console.error('清空購物車錯誤:', error);
    throw error;
  }
}

// 獲取購物車項目數量
async function getCartItemCount(studentId) {
  console.log(`開始獲取學生 ID ${studentId} 的購物車項目數量...`);
  
  try {
    // 使用單個優化查詢直接獲取總數
    const result = await query(
      `SELECT SUM(ci.quantity) as total_items 
       FROM cart_items ci 
       JOIN carts c ON ci.cart_id = c.cart_id 
       WHERE c.student_id = ?`,
      [studentId]
    );
    
    console.log(`購物車項目數量查詢結果:`, result);
    
    // 確保結果有效
    const count = result[0] && result[0].total_items ? Number(result[0].total_items) : 0;
    console.log(`學生 ${studentId} 的購物車項目數量: ${count}`);
    
    return count;
  } catch (error) {
    console.error(`獲取學生 ${studentId} 的購物車項目數量錯誤:`, error);
    console.error('錯誤詳情:', error.stack || error);
    // 發生錯誤時返回 0，而不是拋出錯誤
    return 0;
  }
}

module.exports = {
  getStudentCart,
  createOrUpdateCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  getCartItemCount
};
