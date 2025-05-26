const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { requireAuth } = require('../middleware/authMiddleware');

// 獲取購物車
router.get('/', requireAuth, cartController.getCart);

// 添加項目到購物車
router.post('/items', requireAuth, cartController.addToCart);

// 更新購物車項目數量
router.put('/items/:item_id', requireAuth, cartController.updateCartItem);

// 刪除購物車項目
router.delete('/items/:item_id', requireAuth, cartController.removeCartItem);

// 清空購物車
router.delete('/', requireAuth, cartController.clearCart);

// 獲取購物車項目數量
router.get('/count', requireAuth, cartController.getCartItemCount);

module.exports = router;
