const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { requireAuth } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置 multer 儲存
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制5MB
  fileFilter: function(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳圖片檔案'), false);
    }
  }
});

// 獲取所有餐廳列表（公開）
router.get('/', restaurantController.getAllRestaurants);

// 獲取單個餐廳資料（公開）
router.get('/:id', restaurantController.getRestaurantProfile);

// 獲取餐廳菜單（公開）
router.get('/:id/menu', restaurantController.getRestaurantMenu);

// 新增菜單項目（需要認證）
router.post('/:id/menu', requireAuth, restaurantController.saveMenuItem);

// 更新菜單項目（需要認證）
router.put('/:id/menu/:menu_id', requireAuth, restaurantController.saveMenuItem);

// 刪除菜單項目（需要認證）
router.delete('/:id/menu/:menu_id', requireAuth, restaurantController.deleteMenuItem);

// 切換菜單項目可用狀態（需要認證）
router.patch('/:id/menu/:menu_id/toggle-availability', requireAuth, restaurantController.toggleMenuItemAvailability);

// 菜單項目圖片上傳端點（需要認證）
router.post('/:id/menu/upload-image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('接收到菜單圖片上傳請求:', { 
      restaurantId: req.params.id,
      userId: req.user?.id,
      role: req.user?.role
    });
    
    // 授權檢查
    if (req.user.role !== 'restaurant') {
      console.error('非餐廳角色嘗試上傳圖片');
      return res.status(403).json({ 
        success: false, 
        message: '只有餐廳可以上傳菜單圖片' 
      });
    }
    
    // 檢查檔案是否存在
    if (!req.file) {
      console.error('未提供圖片檔案');
      return res.status(400).json({ success: false, message: '未提供圖片檔案' });
    }
    
    console.log('已接收圖片檔案:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024).toFixed(2)} KB`
    });
    
    // 確保 uploads/menu 目錄存在
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const menuUploadsDir = path.join(__dirname, '..', 'uploads/menu');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('創建 uploads 目錄...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    if (!fs.existsSync(menuUploadsDir)) {
      console.log('創建 uploads/menu 目錄...');
      fs.mkdirSync(menuUploadsDir, { recursive: true });
    }
    
    // 設置目錄權限
    fs.chmodSync(uploadsDir, 0o755);
    fs.chmodSync(menuUploadsDir, 0o755);
    
    // 將檔案移動到菜單圖片目錄
    const originalPath = path.join(__dirname, '..', 'uploads', req.file.filename);
    const newFilename = `menu-${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const newPath = path.join(__dirname, '..', 'uploads/menu', newFilename);
    
    console.log('圖片路徑信息:', {
      originalPath,
      newPath,
      newFilename
    });
    
    // 確保原始檔案存在
    if (fs.existsSync(originalPath)) {
      console.log('原始檔案存在，正在移動到菜單目錄...');
      fs.renameSync(originalPath, newPath);
      
      // 確認新檔案已創建
      if (fs.existsSync(newPath)) {
        console.log('檔案移動成功');
      } else {
        console.error('檔案移動失敗，新檔案不存在');
      }
    } else {
      console.error('原始檔案不存在:', originalPath);
      return res.status(500).json({ 
        success: false, 
        message: '上傳檔案處理失敗，原始檔案不存在' 
      });
    }
    
    // 返回圖片URL路徑 - 注意這裡與餐廳圖片路徑不同
    const imageUrl = `/uploads/menu/${newFilename}`;
    
    console.log(`菜單項目圖片上傳成功: ${imageUrl}`);
    
    return res.status(200).json({ 
      success: true, 
      message: '菜單圖片上傳成功', 
      imageUrl 
    });
  } catch (error) {
    console.error('上傳菜單圖片錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '上傳菜單圖片失敗', 
      error: error.message 
    });
  }
});

// 測試用路由 - 不需要認證
router.post('/test/import', restaurantController.bulkImportRestaurants);
router.post('/:id/test/menu/import', restaurantController.bulkImportMenuItems);

// 需要餐廳身份驗證的路由
// 獲取當前餐廳資料
router.get('/profile/me', requireAuth, (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(403).json({ message: '未授權訪問' });
  }
  req.params.id = req.user.id;
  return restaurantController.getRestaurantProfile(req, res);
});

// 更新餐廳資料
router.put('/:id', requireAuth, restaurantController.updateRestaurantProfile);

// 刪除餐廳帳號
router.delete('/:id', requireAuth, restaurantController.deleteRestaurantAccount);

// 批量匯入餐廳資料 (只有管理員可用)
router.post('/import', requireAuth, restaurantController.bulkImportRestaurants);

// 批量匯入餐廳菜單
router.post('/:id/menu/import', requireAuth, restaurantController.bulkImportMenuItems);

// 上傳餐廳圖片路由
router.post('/upload-image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '未提供圖片檔案' });
    }
    
    // 確保 uploads 目錄存在
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads', { recursive: true });
    }
    
    if (!fs.existsSync('uploads/restaurants')) {
      fs.mkdirSync('uploads/restaurants', { recursive: true });
    }
    
    // 將檔案移動到餐廳圖片目錄
    const originalPath = path.join('uploads', req.file.filename);
    const newFilename = `restaurant-${Date.now()}-${req.file.originalname}`;
    const newPath = path.join('uploads/restaurants', newFilename);
    
    // 確保原始檔案存在
    if (fs.existsSync(originalPath)) {
      fs.renameSync(originalPath, newPath);
    }
    
    const imageType = req.body.type || 'main';
    const restaurantId = req.user.id;
    
    // 返回圖片URL
    const imageUrl = `/uploads/restaurants/${newFilename}`;
    
    // 如果有附加類型信息，與餐廳綁定
    if (restaurantId && imageType) {
      let updateField = null;
      
      // 根據圖片類型決定要更新的欄位
      switch(imageType) {
        case 'main':
          updateField = 'image_url';
          break;
        case 'banner':
          updateField = 'banner_image_url';
          break;
        case 'logo':
          updateField = 'logo_image_url';
          break;
      }
      
      if (updateField) {
        try {
          // 更新餐廳圖片URL
          await restaurantController.updateRestaurantImage(restaurantId, updateField, imageUrl);
        } catch (dbError) {
          console.error('更新餐廳圖片URL失敗:', dbError);
          // 繼續處理，不中斷響應
        }
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      message: '餐廳圖片上傳成功', 
      imageUrl 
    });
  } catch (error) {
    console.error('圖片上傳錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '圖片上傳失敗', 
      error: error.message 
    });
  }
});

// 上傳餐廳照片集圖片
router.post('/upload-gallery-image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '未提供圖片檔案' });
    }
    
    const restaurantId = req.user.id;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // 將圖片保存到資料庫
    const image = await restaurantController.saveRestaurantImage(restaurantId, imageUrl);
    
    return res.status(200).json({
      success: true,
      message: '餐廳照片上傳成功',
      image
    });
  } catch (error) {
    console.error('上傳餐廳照片失敗:', error);
    return res.status(500).json({
      success: false,
      message: '上傳餐廳照片失敗',
      error: error.message
    });
  }
});

// 獲取餐廳照片集 - 自己的照片（需要認證）
router.get('/images', requireAuth, async (req, res) => {
  try {
    const restaurantId = req.user.id;
    
    // 從資料庫獲取餐廳照片
    const images = await restaurantController.getRestaurantImages(restaurantId);
    
    return res.status(200).json({
      success: true,
      images
    });
  } catch (error) {
    console.error('獲取餐廳照片集失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取餐廳照片集失敗',
      error: error.message
    });
  }
});

// 獲取特定餐廳的照片集（需要認證）
router.get('/:id/images', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user.id;
    
    // 檢查權限（只能查看自己的照片）
    if (id !== requesterId) {
      return res.status(403).json({
        success: false,
        message: '無權限查看此餐廳照片'
      });
    }
    
    // 從資料庫獲取餐廳照片
    const images = await restaurantController.getRestaurantImages(id);
    
    return res.status(200).json({
      success: true,
      images
    });
  } catch (error) {
    console.error('獲取餐廳照片集失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取餐廳照片集失敗',
      error: error.message
    });
  }
});

// 獲取特定餐廳的照片集（公開）
router.get('/:id/images/public', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 從資料庫獲取餐廳照片
    const images = await restaurantController.getRestaurantImages(id);
    
    return res.status(200).json({
      success: true,
      images
    });
  } catch (error) {
    console.error('獲取餐廳照片集失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取餐廳照片集失敗',
      error: error.message
    });
  }
});

// 刪除餐廳照片
router.delete('/images/:imageId', requireAuth, async (req, res) => {
  try {
    const { imageId } = req.params;
    const restaurantId = req.user.id;
    
    // 從資料庫刪除照片記錄
    const result = await restaurantController.deleteRestaurantImage(imageId, restaurantId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: '找不到指定照片或您沒有權限刪除'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: '照片已成功刪除'
    });
  } catch (error) {
    console.error('刪除餐廳照片失敗:', error);
    return res.status(500).json({
      success: false,
      message: '刪除餐廳照片失敗',
      error: error.message
    });
  }
});

module.exports = router;
