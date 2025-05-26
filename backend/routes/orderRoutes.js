const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/authMiddleware');

// 所有訂單路由都需要認證
router.use(requireAuth);

// 創建訂單（從購物車）
router.post('/', orderController.createOrder);

// 獲取學生的訂單列表
router.get('/student', orderController.getStudentOrders);

// 獲取餐廳的訂單列表
router.get('/restaurant', orderController.getRestaurantOrders);

// 獲取餐廳的訂單統計
router.get('/restaurant/stats', orderController.getRestaurantOrderStats);

// 獲取訂單詳情
router.get('/:orderId', orderController.getOrderById);

// 更新訂單狀態（僅餐廳）
router.put('/:orderId/status', orderController.updateOrderStatus);

// 取消訂單
router.put('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;
