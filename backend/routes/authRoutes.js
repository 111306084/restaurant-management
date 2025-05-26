const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 學生登入
router.post('/login', authController.login);

// 學生註冊
router.post('/register', authController.register);

module.exports = router;
