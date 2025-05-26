const express = require('express');
const router = express.Router();
const restaurantAuthController = require('../controllers/restaurantAuthController');

// 餐廳登入
router.post('/login', restaurantAuthController.login);

// 餐廳註冊
router.post('/register', restaurantAuthController.register);

module.exports = router;
