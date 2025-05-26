const express = require('express');
const router = express.Router();

// 簡單測試路由
router.get('/test', (req, res) => {
  res.json({ message: '學生路由測試成功' });
});

// 其他路由暫時注釋掉

module.exports = router;
