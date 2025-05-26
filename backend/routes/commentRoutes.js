const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { requireAuth } = require('../middleware/authMiddleware');

// 公開路由 - 不需要認證
// 獲取餐廳的評分摘要
router.get('/restaurants/:restaurantId/ratings', commentController.getRatingSummary);

// 獲取餐廳的評論列表 (公開路由)
router.get('/restaurants/:restaurantId/comments', commentController.getRestaurantComments);

// 獲取餐廳的評論列表 (需要認證，商家管理用)
router.get('/restaurants/:restaurantId/comments-auth', requireAuth, commentController.getRestaurantComments);

// 需要認證的路由
// 添加新評論
router.post('/restaurants/:restaurantId/comments', requireAuth, commentController.addComment);

// 更新評論
router.put('/comments/:commentId', requireAuth, commentController.updateComment);

// 刪除評論
router.delete('/comments/:commentId', requireAuth, commentController.deleteComment);

// 添加評論回覆
router.post('/comments/:commentId/replies', requireAuth, commentController.addCommentReply);

// 點讚評論
router.post('/comments/:commentId/likes', requireAuth, commentController.likeComment);

// 取消點讚
router.delete('/comments/:commentId/likes', requireAuth, commentController.unlikeComment);

// 檢查用戶是否已點讚評論
router.get('/comments/:commentId/likes/check', requireAuth, commentController.checkUserLiked);

// 添加評論圖片
router.post('/comments/:commentId/images', requireAuth, commentController.addCommentImage);

// 刪除評論圖片
router.delete('/images/:imageId', requireAuth, commentController.deleteCommentImage);

// 獲取用戶的評論
router.get('/user/comments', requireAuth, commentController.getUserComments);

module.exports = router;
