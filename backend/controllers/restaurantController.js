const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 獲取餐廳資料
exports.getRestaurantProfile = async (req, res) => {
  try {
    const restaurantId = req.params.id || req.user.id;
    console.log('getRestaurantProfile - 請求餐廳ID:', restaurantId);
    
    // 檢查權限（如果不是查詢自己的資料）
    if (req.user && req.user.role === 'restaurant' && restaurantId !== req.user.id) {
      console.log('getRestaurantProfile - 權限驗證失敗');
      return res.status(403).json({ message: '無權限訪問此資料' });
    }
    
    // 查詢餐廳資料
    console.log('getRestaurantProfile - 執行資料庫查詢');
    const [restaurants] = await pool.query(
      `SELECT restaurant_id, restaurant_name, restaurant_type, price_range, 
              address, opening_hours, description, image_url, phone, created_at 
       FROM restaurants WHERE restaurant_id = ?`,
      [restaurantId]
    );
    
    console.log('getRestaurantProfile - 查詢結果:', restaurants);
    
    if (restaurants.length === 0) {
      console.log('getRestaurantProfile - 找不到餐廳資料');
      return res.status(404).json({ message: '找不到餐廳資料' });
    }
    
    // 返回餐廳資料（不包含密碼）
    console.log('getRestaurantProfile - 返回餐廳資料');
    return res.status(200).json({
      restaurant: restaurants[0]
    });
  } catch (error) {
    console.error('獲取餐廳資料錯誤:', error);
    return res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};

// 更新餐廳資料
exports.updateRestaurantProfile = async (req, res) => {
  try {
    console.log('===== 開始更新餐廳資料 =====');
    console.log('請求體:', req.body);
    console.log('請求參數:', req.params);
    console.log('請求標頭:', req.headers);
    // 首先檢查用戶是否已經驗證
    if (!req.user) {
      console.log('無效的認證令牌或未提供認證');
      return res.status(401).json({ success: false, message: '未提供認證令牌或令牌已過期' });
    }
    
    // 確保餐廳 ID 是字符串形式
    let restaurantId = req.params.id;
    let userId = req.user.id;
    
    // 輸出原始值
    console.log('檢查權限 - 請求參數 ID (原始):', restaurantId, '類型:', typeof restaurantId);
    console.log('檢查權限 - 用戶 ID (原始):', userId, '類型:', typeof userId);
    console.log('檢查權限 - 用戶角色:', req.user.role);
    
    // 確保兩者都是字符串形式，以便比較
    restaurantId = String(restaurantId);
    userId = String(userId);
    
    console.log('檢查權限 - 請求參數 ID (轉換後):', restaurantId);
    console.log('檢查權限 - 用戶 ID (轉換後):', userId);
    console.log('檢查權限 - 兩者是否相等:', restaurantId === userId);
    
    // 檢查權限（只能更新自己的資料）
    if (req.user.role !== 'restaurant') {
      console.log('權限驗證失敗 - 非餐廳角色');
      return res.status(403).json({ success: false, message: '無權限更新餐廳資料' });
    }
    
    // 使用轉換後的字符串進行比較
    if (restaurantId !== userId) {
      console.log('權限驗證失敗 - ID 不匹配');
      return res.status(403).json({ success: false, message: '無權限更新其他餐廳的資料' });
    }
    
    const { 
      restaurant_name, 
      restaurant_type, 
      price_range, 
      address, 
      opening_hours,
      description,
      image_url,
      phone,
      custom_types // 新增自定義餐廳類型
    } = req.body;
    
    console.log('更新餐廳資料:', req.body);
    
    // 確保價格範圍是有效的字符串格式
    let formattedPriceRange = price_range;
    
    // 如果是數組，轉換為字符串
    if (Array.isArray(formattedPriceRange)) {
      formattedPriceRange = formattedPriceRange.join(',');
    }
    
    // 確保不是 null 或 undefined
    if (formattedPriceRange === null || formattedPriceRange === undefined) {
      formattedPriceRange = '';
    }
    
    console.log('處理後的價格範圍:', formattedPriceRange);
    
    // 開始事務
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 更新餐廳資料
      console.log('準備執行 SQL 查詢，餐廳 ID:', restaurantId);
      console.log('餐廳名稱:', restaurant_name);
      console.log('餐廳類型:', restaurant_type);
      console.log('價格範圍 (SQL 參數):', formattedPriceRange);
      
      // 確保餐廳 ID 是正確的形式
      console.log('即將執行 SQL 查詢，餐廳 ID:', restaurantId);
      
      // 測試餐廳 ID 是否存在
      try {
        console.log('即將查詢餐廳 ID:', restaurantId, '類型:', typeof restaurantId);
        
        // 確保餐廳 ID 是有效的
        if (!restaurantId) {
          console.log('餐廳 ID 無效');
          return res.status(400).json({ success: false, message: '無效的餐廳 ID' });
        }
        
        const [rows] = await connection.query(
          'SELECT restaurant_id FROM restaurants WHERE restaurant_id = ?',
          [restaurantId]
        );
        
        // 安全地檢查結果 - 確保 rows 是定義的且是數組
        console.log('查詢餐廳結果:', rows);
        console.log('查詢餐廳結果類型:', typeof rows);
        console.log('查詢餐廳結果是否為數組:', Array.isArray(rows));
        
        // 確保 rows 是有效的數組才檢查其長度
        if (!rows || !Array.isArray(rows) || rows.length === 0) {
          console.log('找不到餐廳 ID:', restaurantId);
          return res.status(404).json({ success: false, message: '找不到指定的餐廳' });
        }
      } catch (error) {
        console.error('查詢餐廳時發生錯誤:', error);
        return res.status(500).json({ success: false, message: '查詢餐廳時發生錯誤' });
      }
      
      console.log('餐廳存在，繼續更新操作');
      
      // 輸出即將執行的 SQL 查詢及其參數
      console.log('即將執行的 SQL 查詢:');
      console.log(`UPDATE restaurants 
         SET restaurant_name = ?, 
             restaurant_type = ?, 
             price_range = ?, 
             address = ?, 
             opening_hours = ?,
             description = ?,
             image_url = ?,
             phone = ?
         WHERE restaurant_id = ?`);
      
      console.log('查詢參數:', {
        restaurant_name,
        restaurant_type,
        price_range: formattedPriceRange,
        address,
        opening_hours,
        description,
        image_url,
        phone,
        restaurant_id: restaurantId
      });
      
      // 執行更新查詢
      try {
        const [result] = await connection.query(
          `UPDATE restaurants 
           SET restaurant_name = ?, 
               restaurant_type = ?, 
               price_range = ?, 
               address = ?, 
               opening_hours = ?,
               description = ?,
               image_url = ?,
               phone = ?
           WHERE restaurant_id = ?`,
          [
            restaurant_name, 
            restaurant_type, 
            formattedPriceRange, // 使用處理後的價格範圍
            address, 
            opening_hours,
            description || null,
            image_url || null,
            phone || null,
            restaurantId
          ]
        );
        
        // 輸出查詢結果
        console.log('更新查詢結果:', result);
        console.log('受影響的行數:', result.affectedRows);
        
        if (result.affectedRows === 0) {
          console.log('警告: 沒有行被更新，可能是餐廳 ID 不存在或數據沒有變化');
        }
      } catch (error) {
        console.error('執行 SQL 更新查詢時發生錯誤:', error);
        throw error; // 重新拋出錯誤，以便外層捕捉
      }
      
      // 如果提供了自定義餐廳類型，則添加到 restaurant_types 表
      if (custom_types && Array.isArray(custom_types) && custom_types.length > 0) {
        for (const typeName of custom_types) {
          // 檢查類型是否已存在
          const [existingTypes] = await connection.query(
            'SELECT * FROM restaurant_types WHERE type_name = ?',
            [typeName]
          );
          
          // 如果不存在，則添加
          if (existingTypes.length === 0) {
            await connection.query(
              'INSERT INTO restaurant_types (type_name) VALUES (?)',
              [typeName]
            );
          }
        }
      }
      
      // 提交事務
      await connection.commit();
      
      // 獲取更新後的餐廳資料
      const [restaurants] = await pool.query(
        `SELECT restaurant_id, restaurant_name, restaurant_type, price_range, 
                address, opening_hours, description, image_url, phone, created_at 
         FROM restaurants WHERE restaurant_id = ?`,
        [restaurantId]
      );
      
      // 返回更新後的餐廳資料
      return res.status(200).json({
        success: true,
        message: '餐廳資料更新成功',
        restaurant: restaurants[0]
      });
    } catch (error) {
      // 回滾事務
      await connection.rollback();
      throw error;
    } finally {
      // 釋放連接
      connection.release();
    }
  } catch (error) {
    console.error('更新餐廳資料錯誤:', error);
    return res.status(500).json({ success: false, message: '伺服器錯誤', error: error.message });
  }
};

// 獲取所有餐廳列表
exports.getAllRestaurants = async (req, res) => {
  try {
    console.log('獲取餐廳列表 - 從資料庫讀取');
    // 查詢所有餐廳資料
    const [restaurants] = await pool.query(
      `SELECT restaurant_id, restaurant_name, restaurant_type, price_range, 
              address, opening_hours, description, image_url, phone 
       FROM restaurants`
    );
    
    console.log('餐廳查詢結果:', restaurants);
    
    // 獲取所有餐廳的評分數據
    const [ratings] = await pool.query(
      `SELECT restaurant_id, avg_overall_rating FROM restaurant_ratings`
    );
    
    // 創建評分映射表
    const ratingMap = {};
    ratings.forEach(rating => {
      ratingMap[rating.restaurant_id] = rating.avg_overall_rating;
    });
    
    // 處理餐廳資料，為空欄位提供預設值，並添加評分數據
    const processedRestaurants = restaurants.map(restaurant => ({
      ...restaurant,
      image_url: restaurant.image_url || 'https://via.placeholder.com/300x200?text=餐廳照片',
      description: restaurant.description || '暂無描述',
      phone: restaurant.phone || '暂無電話號碼',
      rating: ratingMap[restaurant.restaurant_id] || 0 // 添加評分，如果沒有評分則為 0
    }));
    
    // 返回餐廳列表
    return res.status(200).json({
      restaurants: processedRestaurants
    });
  } catch (error) {
    console.error('獲取餐廳列表錯誤:', error);
    return res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};

// 獲取餐廳菜單
exports.getRestaurantMenu = async (req, res) => {
  try {
    const restaurantId = req.params.id || req.user?.id;
    console.log('getRestaurantMenu - 請求餐廳ID:', restaurantId);
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: '缺少餐廳ID'
      });
    }
    
    // 查詢餐廳菜單
    console.log('getRestaurantMenu - 執行資料庫查詢');
    const [menuItems] = await pool.query(
      'SELECT * FROM menus WHERE restaurant_id = ?',
      [restaurantId]
    );
    
    console.log(`getRestaurantMenu - 查詢結果: ${menuItems.length} 個項目`);
    
    // 查詢餐廳的菜單分類
    const [categories] = await pool.query(
      'SELECT * FROM menu_categories WHERE restaurant_id = ? ORDER BY display_order, category_name',
      [restaurantId]
    );
    
    // 將分類轉換為對象，方便快速查找
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.category_name] = cat;
    });
    
    if (menuItems.length === 0) {
      console.log('getRestaurantMenu - 無菜單項目');
      return res.status(200).json({
        success: true,
        menuItems: [],
        categorizedMenu: {},
        categories
      });
    }
    
    // 將菜單按類別分組
    const categorizedMenu = menuItems.reduce((acc, item) => {
      const category = item.category || '未分類';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
    
    console.log('getRestaurantMenu - 菜單分類:', Object.keys(categorizedMenu));
    
    // 返回菜單列表
    console.log('getRestaurantMenu - 返回菜單數據');
    return res.status(200).json({
      success: true,
      menuItems,
      categorizedMenu,
      categories
    });
  } catch (error) {
    console.error('獲取餐廳菜單錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤', 
      error: error.message 
    });
  }
};

// 新增或更新菜單項目
exports.saveMenuItem = async (req, res) => {
  try {
    const restaurantId = req.params.id || req.user.id;
    const { menu_id } = req.params;
    const { 
      item_name, 
      category, 
      price, 
      description, 
      image_url, 
      is_available,
      spicy_level,
      recommend_level,
      calories,
      ingredients,
      allergens,
      preparation_time
    } = req.body;
    
    // 驗證請求體
    if (!item_name || !category || !price) {
      return res.status(400).json({ 
        success: false, 
        message: '請提供菜品名稱、分類和價格' 
      });
    }
    
    // 檢查權限（只能更新自己餐廳的菜單）
    if (req.user.role !== 'restaurant' || restaurantId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: '無權限更新此餐廳的菜單' 
      });
    }
    
    // 開始事務
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      let result;
      
      // 檢查分類是否存在，如果不存在則添加
      const [existingCategories] = await connection.query(
        'SELECT * FROM menu_categories WHERE restaurant_id = ? AND category_name = ?',
        [restaurantId, category]
      );
      
      if (existingCategories.length === 0) {
        await connection.query(
          'INSERT INTO menu_categories (restaurant_id, category_name) VALUES (?, ?)',
          [restaurantId, category]
        );
      }
      
      if (menu_id) {
        // 更新現有菜品
        const [existingItems] = await connection.query(
          'SELECT * FROM menus WHERE menu_id = ? AND restaurant_id = ?',
          [menu_id, restaurantId]
        );
        
        if (existingItems.length === 0) {
          await connection.rollback();
          return res.status(404).json({ 
            success: false, 
            message: '找不到此菜品' 
          });
        }
        
        result = await connection.query(
          `UPDATE menus 
           SET item_name = ?, category = ?, price = ?, description = ?, 
               image_url = ?, is_available = ?, spicy_level = ?, recommend_level = ?,
               calories = ?, ingredients = ?, allergens = ?, preparation_time = ? 
           WHERE menu_id = ?`,
          [
            item_name,
            category,
            price,
            description || null,
            image_url || null,
            is_available !== undefined ? is_available : true,
            spicy_level || 0,
            recommend_level || 0,
            calories || null,
            ingredients || null,
            allergens || null,
            preparation_time || null,
            menu_id
          ]
        );
        
        // 獲取更新後的菜品
        const [updatedItem] = await connection.query(
          'SELECT * FROM menus WHERE menu_id = ?',
          [menu_id]
        );
        
        await connection.commit();
        
        return res.status(200).json({
          success: true,
          message: '菜品更新成功',
          menuItem: updatedItem[0]
        });
      } else {
        // 添加新菜品
        result = await connection.query(
          `INSERT INTO menus 
           (restaurant_id, item_name, category, price, description, image_url, is_available,
            spicy_level, recommend_level, calories, ingredients, allergens, preparation_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            restaurantId,
            item_name,
            category,
            price,
            description || null,
            image_url || null,
            is_available !== undefined ? is_available : true,
            spicy_level || 0,
            recommend_level || 0,
            calories || null,
            ingredients || null,
            allergens || null,
            preparation_time || null
          ]
        );
        
        // 獲取新添加的菜品
        const [newItem] = await connection.query(
          'SELECT * FROM menus WHERE menu_id = ?',
          [result[0].insertId]
        );
        
        await connection.commit();
        
        return res.status(201).json({
          success: true,
          message: '菜品添加成功',
          menuItem: newItem[0]
        });
      }
    } catch (error) {
      // 回滾事務
      await connection.rollback();
      throw error;
    } finally {
      // 釋放連接
      connection.release();
    }
  } catch (error) {
    console.error('保存菜品錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤', 
      error: error.message 
    });
  }
};

// 刪除菜單項目
exports.deleteMenuItem = async (req, res) => {
  try {
    const restaurantId = req.params.id || req.user.id;
    const { menu_id } = req.params;
    
    // 檢查權限（只能刪除自己餐廳的菜單）
    if (req.user.role !== 'restaurant' || restaurantId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: '無權限刪除此餐廳的菜單' 
      });
    }
    
    // 檢查菜品是否存在
    const [existingItems] = await pool.query(
      'SELECT * FROM menus WHERE menu_id = ? AND restaurant_id = ?',
      [menu_id, restaurantId]
    );
    
    if (existingItems.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到此菜品' 
      });
    }
    
    // 刪除菜品
    await pool.query(
      'DELETE FROM menus WHERE menu_id = ?',
      [menu_id]
    );
    
    return res.status(200).json({
      success: true,
      message: '菜品刪除成功'
    });
  } catch (error) {
    console.error('刪除菜品錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤', 
      error: error.message 
    });
  }
};

// 切換菜品供應狀態
exports.toggleMenuItemAvailability = async (req, res) => {
  try {
    const restaurantId = req.params.id || req.user.id;
    const { menu_id } = req.params;
    
    // 檢查權限（只能更新自己餐廳的菜單）
    if (req.user.role !== 'restaurant' || restaurantId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: '無權限更新此餐廳的菜單' 
      });
    }
    
    // 檢查菜品是否存在
    const [existingItems] = await pool.query(
      'SELECT * FROM menus WHERE menu_id = ? AND restaurant_id = ?',
      [menu_id, restaurantId]
    );
    
    if (existingItems.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到此菜品' 
      });
    }
    
    const currentStatus = existingItems[0].is_available;
    
    // 切換狀態
    await pool.query(
      'UPDATE menus SET is_available = ? WHERE menu_id = ?',
      [!currentStatus, menu_id]
    );
    
    // 獲取更新後的菜品
    const [updatedItem] = await pool.query(
      'SELECT * FROM menus WHERE menu_id = ?',
      [menu_id]
    );
    
    return res.status(200).json({
      success: true,
      message: `菜品狀態已更新為${!currentStatus ? '供應中' : '暫停供應'}`,
      menuItem: updatedItem[0]
    });
  } catch (error) {
    console.error('切換菜品狀態錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤', 
      error: error.message 
    });
  }
};

// 批量匯入餐廳資料
exports.bulkImportRestaurants = async (req, res) => {
  try {
    const { restaurants } = req.body;
    
    // 驗證請求體
    if (!restaurants || !Array.isArray(restaurants) || restaurants.length === 0) {
      return res.status(400).json({ message: '請提供有效的餐廳資料陣列' });
    }
    
    // 插入餐廳資料的SQL
    const insertRestaurantSQL = `
      INSERT INTO restaurants 
      (restaurant_id, restaurant_name, restaurant_type, price_range, address, opening_hours, description, image_url, phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      restaurant_name = VALUES(restaurant_name),
      restaurant_type = VALUES(restaurant_type),
      price_range = VALUES(price_range),
      address = VALUES(address),
      opening_hours = VALUES(opening_hours),
      description = VALUES(description),
      image_url = VALUES(image_url),
      phone = VALUES(phone)
    `;
    
    // 計數器
    let importCount = 0;
    let updateCount = 0;
    
    // 循環插入餐廳資料
    for (const restaurant of restaurants) {
      // 檢查必要欄位
      if (!restaurant.restaurant_id || !restaurant.restaurant_name) {
        console.warn('跳過無效餐廳資料:', restaurant);
        continue;
      }
      
      const [result] = await pool.query(insertRestaurantSQL, [
        restaurant.restaurant_id,
        restaurant.restaurant_name,
        restaurant.restaurant_type || null,
        restaurant.price_range || null,
        restaurant.address || null,
        restaurant.opening_hours || null,
        restaurant.description || null,
        restaurant.image_url || null,
        restaurant.phone || null
      ]);
      
      if (result.affectedRows > 0) {
        if (result.insertId > 0) {
          importCount++;
        } else {
          updateCount++;
        }
      }
    }
    
    return res.status(200).json({
      message: '餐廳資料匯入成功',
      imported: importCount,
      updated: updateCount
    });
  } catch (error) {
    console.error('批量匯入餐廳資料錯誤:', error);
    return res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};

// 更新餐廳圖片URL
exports.updateRestaurantImage = async (restaurantId, fieldName, imageUrl) => {
  try {
    // 確保欄位名稱是有效的
    const validFields = ['image_url', 'banner_image_url', 'logo_url'];
    if (!validFields.includes(fieldName)) {
      throw new Error('無效的圖片欄位名稱');
    }
    
    // 更新餐廳圖片URL
    const [result] = await pool.query(
      `UPDATE restaurants SET ${fieldName} = ? WHERE restaurant_id = ?`,
      [imageUrl, restaurantId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('更新餐廳圖片URL錯誤:', error);
    throw error;
  }
};

// 保存餐廳圖片到資料庫
exports.saveRestaurantImage = async (restaurantId, imageUrl) => {
  try {
    // 生成唯一ID
    const imageId = uuidv4();
    
    // 保存圖片記錄到資料庫
    const [result] = await pool.query(
      'INSERT INTO restaurant_images (image_id, restaurant_id, image_url) VALUES (?, ?, ?)',
      [imageId, restaurantId, imageUrl]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('保存餐廳圖片失敗');
    }
    
    // 返回新創建的圖片記錄
    return {
      image_id: imageId,
      restaurant_id: restaurantId,
      image_url: imageUrl,
      image_type: 'other',
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('保存餐廳圖片錯誤:', error);
    throw error;
  }
};

// 獲取餐廳圖片集
exports.getRestaurantImages = async (restaurantId) => {
  try {
    // 從資料庫獲取餐廳圖片
    const [images] = await pool.query(
      'SELECT * FROM restaurant_images WHERE restaurant_id = ? ORDER BY created_at DESC',
      [restaurantId]
    );
    
    return images;
  } catch (error) {
    console.error('獲取餐廳圖片集錯誤:', error);
    throw error;
  }
};

// 刪除餐廳圖片
exports.deleteRestaurantImage = async (imageId, restaurantId) => {
  try {
    // 先獲取圖片記錄
    const [images] = await pool.query(
      'SELECT * FROM restaurant_images WHERE image_id = ? AND restaurant_id = ?',
      [imageId, restaurantId]
    );
    
    if (images.length === 0) {
      return false;
    }
    
    const image = images[0];
    
    // 從資料庫刪除記錄
    const [result] = await pool.query(
      'DELETE FROM restaurant_images WHERE image_id = ? AND restaurant_id = ?',
      [imageId, restaurantId]
    );
    
    if (result.affectedRows === 0) {
      return false;
    }
    
    // 嘗試從文件系統刪除圖片文件
    try {
      const imagePath = path.join(__dirname, '..', image.image_url.replace(/^\//, ''));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (fileError) {
      console.error('刪除圖片文件錯誤:', fileError);
      // 繼續處理，即使文件刪除失敗
    }
    
    return true;
  } catch (error) {
    console.error('刪除餐廳圖片錯誤:', error);
    throw error;
  }
};

// 刪除餐廳帳號
exports.deleteRestaurantAccount = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    
    // 確保只能刪除自己的帳號
    if (req.user.role !== 'restaurant' || restaurantId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: '無權限刪除此餐廳帳號' 
      });
    }
    
    // 開始事務
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 1. 刪除餐廳照片集
      const [images] = await connection.query(
        'SELECT * FROM restaurant_images WHERE restaurant_id = ?',
        [restaurantId]
      );
      
      // 刪除圖片文件
      for (const image of images) {
        try {
          const imagePath = path.join(__dirname, '..', image.image_url.replace(/^\//, ''));
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (fileError) {
          console.error('刪除圖片文件錯誤:', fileError);
          // 繼續處理，即使文件刪除失敗
        }
      }
      
      // 刪除資料庫中的圖片記錄
      await connection.query(
        'DELETE FROM restaurant_images WHERE restaurant_id = ?',
        [restaurantId]
      );
      
      // 2. 刪除餐廳菜單
      await connection.query(
        'DELETE FROM menus WHERE restaurant_id = ?',
        [restaurantId]
      );
      
      // 3. 刪除餐廳評分
      await connection.query(
        'DELETE FROM restaurant_ratings WHERE restaurant_id = ?',
        [restaurantId]
      );
      
      // 4. 刪除餐廳評論
      await connection.query(
        'DELETE FROM comments WHERE restaurant_id = ?',
        [restaurantId]
      );
      
      // 5. 刪除餐廳訂單明細
      // 先獲取餐廳的所有訂單 ID
      const [orders] = await connection.query(
        'SELECT order_id FROM orders WHERE restaurant_id = ?',
        [restaurantId]
      );
      
      const orderIds = orders.map(order => order.order_id);
      
      if (orderIds.length > 0) {
        // 刪除訂單明細
        await connection.query(
          'DELETE FROM order_items WHERE order_id IN (?)',
          [orderIds]
        );
      }
      
      // 6. 刪除餐廳訂單
      await connection.query(
        'DELETE FROM orders WHERE restaurant_id = ?',
        [restaurantId]
      );
      
      // 7. 最後刪除餐廳資料
      const [result] = await connection.query(
        'DELETE FROM restaurants WHERE restaurant_id = ?',
        [restaurantId]
      );
      
      // 提交事務
      await connection.commit();
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          message: '找不到指定餐廳帳號' 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: '餐廳帳號已成功刪除' 
      });
    } catch (error) {
      // 發生錯誤，回滞事務
      await connection.rollback();
      throw error;
    } finally {
      // 釋放連接
      connection.release();
    }
  } catch (error) {
    console.error('刪除餐廳帳號錯誤:', error);
    return res.status(500).json({ 
      success: false, 
      message: '刪除餐廳帳號時發生錯誤', 
      error: error.message 
    });
  }
};

// 批量匯入餐廳菜單
exports.bulkImportMenuItems = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const { menuItems } = req.body;
    
    // 驗證請求體
    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      return res.status(400).json({ message: '請提供有效的菜單資料陣列' });
    }
    
    // 驗證權限（只有餐廳管理員可以匯入自己餐廳的菜單）
    if (req.user.role === 'restaurant' && restaurantId !== req.user.id) {
      return res.status(403).json({ message: '無權限匯入此餐廳菜單' });
    }
    
    // 插入菜單資料的SQL
    const insertMenuItemSQL = `
      INSERT INTO menus 
      (menu_id, restaurant_id, item_name, category, price, description, image_url, is_available, 
       spicy_level, recommend_level, calories, ingredients, allergens, preparation_time) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      item_name = VALUES(item_name),
      category = VALUES(category),
      price = VALUES(price),
      description = VALUES(description),
      image_url = VALUES(image_url),
      is_available = VALUES(is_available),
      spicy_level = VALUES(spicy_level),
      recommend_level = VALUES(recommend_level),
      calories = VALUES(calories),
      ingredients = VALUES(ingredients),
      allergens = VALUES(allergens),
      preparation_time = VALUES(preparation_time)
    `;
    
    // 計數器
    let importCount = 0;
    let updateCount = 0;
    
    // 循環插入菜單資料
    for (const menuItem of menuItems) {
      // 檢查必要欄位
      if (!menuItem.item_name || !menuItem.price) {
        console.warn('跳過無效菜單資料:', menuItem);
        continue;
      }
      
      // 若未指定菜單ID，生成唯一ID
      const menuId = menuItem.menu_id || `${restaurantId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const [result] = await pool.query(insertMenuItemSQL, [
        menuId,
        restaurantId,
        menuItem.item_name,
        menuItem.category || '未分類',
        menuItem.price,
        menuItem.description || null,
        menuItem.image_url || null,
        menuItem.is_available !== undefined ? menuItem.is_available : true,
        menuItem.spicy_level || 0,
        menuItem.recommend_level || 0,
        menuItem.calories || null,
        menuItem.ingredients || null,
        menuItem.allergens || null,
        menuItem.preparation_time || null
      ]);
      
      if (result.affectedRows > 0) {
        if (result.insertId > 0) {
          importCount++;
        } else {
          updateCount++;
        }
      }
    }
    
    return res.status(200).json({
      message: '菜單匯入成功',
      imported: importCount,
      updated: updateCount
    });
  } catch (error) {
    console.error('批量匯入菜單錯誤:', error);
    return res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};
