const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { requireAuth } = require('../middleware/authMiddleware');

// 餐廳相關的優惠券端點
router.get('/restaurant/:id', requireAuth, couponController.getRestaurantCoupons);
router.post('/restaurant/:id', requireAuth, couponController.createCoupon);
router.get('/restaurant/:id/:couponId', requireAuth, couponController.getCouponById);
router.put('/restaurant/:id/:couponId', requireAuth, couponController.updateCoupon);
router.delete('/restaurant/:id/:couponId', requireAuth, couponController.deleteCoupon);

// 學生相關的優惠券端點
router.get('/available', requireAuth, couponController.getAvailableCoupons);
router.post('/claim/:couponId', requireAuth, couponController.claimCoupon);
router.get('/student', requireAuth, couponController.getStudentCoupons);
router.get('/my-coupons', requireAuth, couponController.getStudentCoupons);
router.post('/use/:userCouponId', requireAuth, couponController.useCoupon);

// 調試用端點
router.get('/debug/all', requireAuth, couponController.getAllCouponsDebug);

module.exports = router;
