const orderModel = require('../models/orderModel');
const db = require('../config/db');

// 創建訂單
exports.createOrder = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    const { payment_method, delivery_address, selected_coupon_id } = req.body;
    
    if (!payment_method) {
      return res.status(400).json({
        success: false,
        message: '請提供支付方式'
      });
    }
    
    // 從購物車創建訂單，傳遞優惠券ID
    const orderId = await orderModel.createOrderFromCart(
      studentId, 
      payment_method, 
      delivery_address,
      selected_coupon_id // 新增優惠券ID參數
    );
    
    // 獲取訂單詳情
    const order = await orderModel.getOrderById(orderId);
    
    res.status(201).json({
      success: true,
      message: '訂單創建成功',
      order
    });
  } catch (error) {
    console.error('創建訂單錯誤:', error);
    res.status(500).json({
      success: false,
      message: '創建訂單時發生錯誤',
      error: error.message
    });
  }
};

// 獲取學生的訂單列表
exports.getStudentOrders = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await orderModel.getStudentOrders(studentId, page, limit);
    
    res.status(200).json({
      success: true,
      orders: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('獲取學生訂單列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取訂單列表時發生錯誤',
      error: error.message
    });
  }
};

// 獲取餐廳的訂單列表
exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurantId = req.user.id; // 從JWT中獲取餐廳ID
    const status = req.query.status || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    console.log('獲取餐廳訂單詳細參數:', {
      餐廳ID: restaurantId,
      狀態篩選: status,
      頁碼: page,
      每頁數量: limit,
      請求時間: new Date().toISOString()
    });
    
    const result = await orderModel.getRestaurantOrders(restaurantId, status, page, limit);
    
    console.log('餐廳訂單查詢結果:', {
      訂單數量: result.orders.length,
      訂單列表: result.orders.map(order => ({
        order_id: order.order_id,
        status: order.status,
        total_amount: order.total_amount,
        order_date: order.order_date
      })),
      分頁信息: result.pagination
    });
    
    res.status(200).json({
      success: true,
      orders: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('獲取餐廳訂單列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取訂單列表時發生錯誤',
      error: error.message
    });
  }
};

// 獲取訂單詳情
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // 檢查權限（學生只能查看自己的訂單，餐廳只能查看自己的訂單）
    const order = await orderModel.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '訂單不存在'
      });
    }
    
    // 檢查權限
    if (req.user.role === 'student' && order.student_id !== req.user.student_id) {
      return res.status(403).json({
        success: false,
        message: '無權限查看此訂單'
      });
    } else if (req.user.role === 'restaurant' && order.restaurant_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '無權限查看此訂單'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('獲取訂單詳情錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取訂單詳情時發生錯誤',
      error: error.message
    });
  }
};

// 更新訂單狀態
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: '請提供訂單狀態'
      });
    }
    
    // 檢查訂單是否存在
    const order = await orderModel.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '訂單不存在'
      });
    }
    
    // 檢查權限（只有餐廳可以更新訂單狀態，且只能更新自己的訂單）
    if (req.user.role !== 'restaurant' || order.restaurant_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '無權限更新此訂單狀態'
      });
    }
    
    // 檢查狀態是否有效
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '無效的訂單狀態'
      });
    }
    
    // 更新訂單狀態
    await orderModel.updateOrderStatus(orderId, status);
    
    // 獲取更新後的訂單
    const updatedOrder = await orderModel.getOrderById(orderId);
    
    res.status(200).json({
      success: true,
      message: '訂單狀態更新成功',
      order: updatedOrder
    });
  } catch (error) {
    console.error('更新訂單狀態錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新訂單狀態時發生錯誤',
      error: error.message
    });
  }
};

// 取消訂單
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // 檢查訂單是否存在
    const order = await orderModel.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '訂單不存在'
      });
    }
    
    // 檢查權限（學生只能取消自己的訂單，餐廳只能取消自己的訂單）
    if (req.user.role === 'student' && order.student_id !== req.user.student_id) {
      return res.status(403).json({
        success: false,
        message: '無權限取消此訂單'
      });
    } else if (req.user.role === 'restaurant' && order.restaurant_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '無權限取消此訂單'
      });
    }
    
    // 檢查訂單狀態（只有待處理或已確認的訂單可以取消）
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: '此訂單狀態無法取消'
      });
    }
    
    // 更新訂單狀態為取消
    await orderModel.updateOrderStatus(orderId, 'cancelled');
    
    // 獲取更新後的訂單
    const updatedOrder = await orderModel.getOrderById(orderId);
    
    res.status(200).json({
      success: true,
      message: '訂單已取消',
      order: updatedOrder
    });
  } catch (error) {
    console.error('取消訂單錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取消訂單時發生錯誤',
      error: error.message
    });
  }
};

// 獲取餐廳訂單統計
exports.getRestaurantOrderStats = async (req, res) => {
  try {
    const restaurantId = req.user.id; // 從JWT中獲取餐廳ID
    const date = req.query.date; // 獲取日期參數
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: '請提供日期參數'
      });
    }
    
    // 確保餐廳ID為字符串
    const restaurantIdStr = String(restaurantId);
    
    console.log('訂單統計查詢參數:', {
      餐廳ID: restaurantIdStr,
      餐廳ID類型: typeof restaurantId,
      日期: date,
      日期類型: typeof date,
      查詢時間: new Date().toISOString(),
      用戶信息: req.user
    });
    
    // 直接使用簡單的日期比較，避免時區問題
    const [results] = await db.execute(
      `SELECT 
        COUNT(*) as count,
        IFNULL(ROUND(SUM(CAST(total_amount AS DECIMAL(10,2))), 2), 0) as revenue
       FROM orders 
       WHERE restaurant_id = ? 
       AND DATE(order_date) = ? 
       AND status != 'cancelled'`,
      [restaurantIdStr, date]
    );
    
    // 輸出原始查詢結果
    console.log('SQL查詢原始結果:', results);
    
    // 確保有結果，即使沒有訂單
    const stats = results[0] || { count: 0, revenue: 0 };
    
    // 檢查並輸出原始數據類型
    console.log('原始統計數據類型:', {
      count: stats.count,
      count_type: typeof stats.count,
      revenue: stats.revenue,
      revenue_type: typeof stats.revenue
    });
    
    // 確保數值類型正確
    const count = parseInt(stats.count) || 0;
    const revenue = parseFloat(stats.revenue) || 0;
    
    // 輸出訂單統計詳情以進行調試
    console.log('訂單統計處理後結果:', {
      餐廳ID: restaurantIdStr,
      日期: date,
      訂單數量: count,
      訂單數量類型: typeof count,
      營收: revenue,
      營收類型: typeof revenue,
      原始查詢結果: stats
    });
    
    // 為了確保前端能正確解析，將數值轉換為字符串
    res.status(200).json({
      success: true,
      stats: {
        count: String(count),
        revenue: String(parseFloat(revenue.toFixed(2)))
      }
    });
  } catch (error) {
    console.error('獲取餐廳訂單統計錯誤:', error);
    console.error('錯誤詳情:', error.stack);
    res.status(500).json({
      success: false,
      message: '獲取訂單統計時發生錯誤',
      error: error.message
    });
  }
};
