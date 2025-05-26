const cartModel = require('../models/cartModel');
const menuModel = require('../models/menuModel');

// 獲取購物車
exports.getCart = async (req, res) => {
  try {
    // 檢查用戶類型，只有學生用戶才有購物車
    if (!req.user.student_id || req.user.role === 'restaurant') {
      return res.status(403).json({
        success: false,
        message: '只有學生用戶可以訪問購物車'
      });
    }
    
    const studentId = req.user.student_id;
    
    // 獲取購物車及其項目
    const cartData = await cartModel.getStudentCart(studentId);
    
    res.status(200).json({
      success: true,
      cart: cartData.cart,
      items: cartData.items
    });
  } catch (error) {
    console.error('獲取購物車錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取購物車時發生錯誤',
      error: error.message
    });
  }
};

// 添加項目到購物車
exports.addToCart = async (req, res) => {
  try {
    // 檢查用戶類型，只有學生用戶才有購物車
    if (!req.user.student_id || req.user.role === 'restaurant') {
      return res.status(403).json({
        success: false,
        message: '只有學生用戶可以添加項目到購物車'
      });
    }
    
    const studentId = req.user.student_id;
    const { restaurant_id, menu_id, quantity, special_instructions } = req.body;
    
    if (!menu_id || !restaurant_id) {
      return res.status(400).json({
        success: false,
        message: '缺少必要參數'
      });
    }
    
    // 獲取菜單項目以確認價格
    const menuItem = await menuModel.getMenuItemById(menu_id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: '菜單項目不存在'
      });
    }
    
    // 創建或更新購物車
    const cart = await cartModel.createOrUpdateCart(studentId, restaurant_id);
    
    // 添加項目到購物車
    await cartModel.addItemToCart(
      cart.cart_id,
      menu_id,
      quantity || 1,
      menuItem.price,
      special_instructions
    );
    
    // 獲取更新後的購物車
    const updatedCart = await cartModel.getStudentCart(studentId);
    
    res.status(200).json({
      success: true,
      message: '成功添加到購物車',
      cart: updatedCart.cart,
      items: updatedCart.items
    });
  } catch (error) {
    console.error('添加到購物車錯誤:', error);
    res.status(500).json({
      success: false,
      message: '添加到購物車時發生錯誤',
      error: error.message
    });
  }
};

// 更新購物車項目數量
exports.updateCartItem = async (req, res) => {
  try {
    const { item_id } = req.params;
    const { quantity } = req.body;
    
    if (!item_id || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要參數'
      });
    }
    
    // 更新購物車項目數量
    await cartModel.updateCartItemQuantity(item_id, quantity);
    
    // 獲取更新後的購物車
    const updatedCart = await cartModel.getStudentCart(req.user.student_id);
    
    res.status(200).json({
      success: true,
      message: quantity > 0 ? '購物車項目已更新' : '購物車項目已刪除',
      cart: updatedCart.cart,
      items: updatedCart.items
    });
  } catch (error) {
    console.error('更新購物車項目錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新購物車項目時發生錯誤',
      error: error.message
    });
  }
};

// 刪除購物車項目
exports.removeCartItem = async (req, res) => {
  try {
    const { item_id } = req.params;
    
    if (!item_id) {
      return res.status(400).json({
        success: false,
        message: '缺少必要參數'
      });
    }
    
    await cartModel.removeCartItem(item_id);
    
    // 獲取更新後的購物車
    const updatedCart = await cartModel.getStudentCart(req.user.student_id);
    
    res.status(200).json({
      success: true,
      message: '購物車項目已刪除',
      cart: updatedCart.cart,
      items: updatedCart.items
    });
  } catch (error) {
    console.error('刪除購物車項目錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除購物車項目時發生錯誤',
      error: error.message
    });
  }
};

// 清空購物車
exports.clearCart = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    
    // 獲取購物車
    const cartData = await cartModel.getStudentCart(studentId);
    
    if (!cartData.cart) {
      return res.status(404).json({
        success: false,
        message: '購物車不存在'
      });
    }
    
    await cartModel.clearCart(cartData.cart.cart_id);
    
    res.status(200).json({
      success: true,
      message: '購物車已清空',
      cart: cartData.cart,
      items: []
    });
  } catch (error) {
    console.error('清空購物車錯誤:', error);
    res.status(500).json({
      success: false,
      message: '清空購物車時發生錯誤',
      error: error.message
    });
  }
};

// 獲取購物車項目數量
exports.getCartItemCount = async (req, res) => {
  try {
    // 檢查用戶類型，只有學生用戶才有購物車
    if (!req.user.student_id || req.user.role === 'restaurant') {
      return res.status(200).json({
        success: true,
        count: 0
      });
    }
    
    const studentId = req.user.student_id;
    console.log('開始獲取學生 ID', studentId, '的購物車項目數量...');
    
    const count = await cartModel.getCartItemCount(studentId);
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('獲取學生', req.user.student_id, '的購物車項目數量錯誤:', error);
    console.error('錯誤詳情:', error);
    res.status(500).json({
      success: false,
      message: '獲取購物車項目數量時發生錯誤',
      error: error.message
    });
  }
};
