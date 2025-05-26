const db = require('../config/db');

// 直接使用 mysql2/promise 的查詢方法
async function query(sql, params) {
  try {
    const [rows] = await db.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('SQL 查詢錯誤:', error);
    throw error;
  }
}

// 獲取餐廳的優惠券
async function getRestaurantCoupons(restaurantId, isStudent = false) {
  try {
    console.log('請求餐廳ID:', restaurantId, '類型:', typeof restaurantId);
    console.log('請求者是否為學生:', isStudent);
    
    // 使用本地時區的日期，而不是UTC時區
    const now = new Date();
    const currentDate = now.getFullYear() + '-' + 
                        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(now.getDate()).padStart(2, '0');
    
    console.log('獲取餐廳優惠券 - 當前本地日期:', currentDate);
    
    // 定義SQL查詢
    let sql = `SELECT * FROM coupons WHERE restaurant_id = ? `;
    let params = [restaurantId];
    
    // 檢查活動狀態
    sql += `AND is_active = 1 `;
    
    // 如果是學生請求，增加日期條件確保只顯示當前可用的優惠券
    if (isStudent) {
      sql += `AND start_date <= ? AND end_date >= ? `;
      params.push(currentDate, currentDate);
    }
    
    sql += `ORDER BY created_at DESC`;
    
    console.log('執行SQL:', sql);
    console.log('參數:', params);
    
    const coupons = await query(sql, params);
    
    console.log('獲取到的優惠券數量:', coupons.length);
    if (coupons.length > 0) {
      console.log('第一個優惠券的餐廳ID:', coupons[0].restaurant_id);
      console.log('第一個優惠券的開始日期:', coupons[0].start_date);
      console.log('第一個優惠券的結束日期:', coupons[0].end_date);
    }
    
    // 計算每個優惠券的使用次數
    for (const coupon of coupons) {
      const usageCount = await query(
        `SELECT COUNT(*) as count FROM user_coupons WHERE coupon_id = ?`,
        [coupon.coupon_id]
      );
      
      coupon.claimed_count = usageCount[0].count;
      
      const usedCount = await query(
        `SELECT COUNT(*) as count FROM user_coupons WHERE coupon_id = ? AND is_used = 1`,
        [coupon.coupon_id]
      );
      
      coupon.used_count = usedCount[0].count;
    }
    
    return coupons;
  } catch (error) {
    console.error('獲取餐廳優惠券錯誤:', error);
    throw error;
  }
}

// 獲取單個優惠券詳情
async function getCouponById(couponId) {
  try {
    console.log(`獲取優惠券詳情，優惠券ID: ${couponId}`);
    
    // 使用 LEFT JOIN 而不是 JOIN，確保即使餐廳不存在也能返回優惠券
    const coupons = await query(
      `SELECT c.*, r.restaurant_name 
       FROM coupons c
       LEFT JOIN restaurants r ON c.restaurant_id = r.restaurant_id
       WHERE c.coupon_id = ?`,
      [couponId]
    );
    
    console.log(`查詢結果:`, coupons);
    
    if (coupons.length === 0) {
      return null;
    }
    
    const coupon = coupons[0];
    
    // 獲取優惠券使用統計
    const usageStats = await query(
      `SELECT 
        COUNT(*) as claimed_count,
        SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) as used_count
       FROM user_coupons 
       WHERE coupon_id = ?`,
      [couponId]
    );
    
    coupon.claimed_count = usageStats[0].claimed_count;
    coupon.used_count = usageStats[0].used_count;
    
    return coupon;
  } catch (error) {
    console.error('獲取優惠券詳情錯誤:', error);
    throw error;
  }
}

// 創建新優惠券
async function createCoupon(couponData) {
  try {
    // 生成唯一的優惠券碼
    if (!couponData.code) {
      couponData.code = generateCouponCode();
    }
    
    console.log('創建優惠券數據:', couponData);
    
    // 保持 restaurant_id 的原始格式，不進行轉換
    let restaurantId = couponData.restaurant_id;
    console.log('使用餐廳ID:', restaurantId, '類型:', typeof restaurantId);
    
    const result = await query(
      `INSERT INTO coupons (
        restaurant_id, code, discount_type, discount_value, 
        min_order_amount, description, start_date, end_date, 
        usage_limit, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurantId,
        couponData.code,
        couponData.discount_type,
        couponData.discount_value,
        couponData.min_order_amount || null,
        couponData.description || `${couponData.discount_type === 'percentage' ? (couponData.discount_value + '%') : (couponData.discount_value + '元')}優惠`,
        couponData.start_date,
        couponData.end_date,
        couponData.usage_limit === undefined || couponData.usage_limit === '' ? null : couponData.usage_limit,
        couponData.is_active === undefined ? 1 : couponData.is_active
      ]
    );
    
    console.log('創建優惠券結果:', result);
    
    // 獲取新創建的優惠券
    if (result.insertId) {
      const newCoupon = await getCouponById(result.insertId);
      console.log('新創建的優惠券:', newCoupon);
      return newCoupon;
    }
    
    return null;
  } catch (error) {
    console.error('創建優惠券錯誤:', error);
    throw error;
  }
}

// 更新優惠券
async function updateCoupon(couponId, couponData) {
  try {
    await query(
      `UPDATE coupons SET
        discount_type = ?,
        discount_value = ?,
        min_order_amount = ?,
        description = ?,
        start_date = ?,
        end_date = ?,
        usage_limit = ?,
        is_active = ?
      WHERE coupon_id = ?`,
      [
        couponData.discount_type,
        couponData.discount_value,
        couponData.min_order_amount || null,
        couponData.description,
        couponData.start_date,
        couponData.end_date,
        couponData.usage_limit || null,
        couponData.is_active,
        couponId
      ]
    );
    
    return getCouponById(couponId);
  } catch (error) {
    console.error('更新優惠券錯誤:', error);
    throw error;
  }
}

// 刪除優惠券
async function deleteCoupon(couponId) {
  try {
    // 檢查優惠券是否被使用過
    const usedCoupons = await query(
      `SELECT COUNT(*) as count FROM user_coupons 
       WHERE coupon_id = ? AND is_used = 1`,
      [couponId]
    );
    
    if (usedCoupons[0].count > 0) {
      throw new Error('此優惠券已被使用，無法刪除');
    }
    
    // 先刪除關聯的用戶優惠券記錄
    await query(
      `DELETE FROM user_coupons WHERE coupon_id = ?`,
      [couponId]
    );
    
    // 再刪除優惠券本身
    const result = await query(
      `DELETE FROM coupons WHERE coupon_id = ?`,
      [couponId]
    );
    
    return { deleted: result.affectedRows > 0 };
  } catch (error) {
    console.error('刪除優惠券錯誤:', error);
    throw error;
  }
}

// 獲取可用的優惠券列表（學生視角）
async function getAvailableCoupons(studentId) {
  try {
    // 使用本地時區的日期，而不是UTC時區
    const now = new Date();
    const currentDate = now.getFullYear() + '-' + 
                        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(now.getDate()).padStart(2, '0');
    
    console.log('獲取優惠券 - 當前本地日期:', currentDate);
    console.log('學生 ID:', studentId);
    
    // 獲取所有優惠券先不篩選，為了驗證開始日期的比較問題
    const allCoupons = await query(
      `SELECT c.*, r.restaurant_name, r.image_url as restaurant_image
       FROM coupons c
       JOIN restaurants r ON c.restaurant_id = r.restaurant_id
       WHERE c.is_active = 1
       ORDER BY c.created_at DESC`
    );
    
    console.log('查詢到的所有優惠券數量:', allCoupons.length);
    
    // 手動篩選符合條件的優惠券
    const coupons = [];
    for (const coupon of allCoupons) {
      const startDate = new Date(coupon.start_date);
      const endDate = new Date(coupon.end_date);
      const currentDateObj = new Date(currentDate);
      
      // 移除時間部分進行比較
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      currentDateObj.setHours(0, 0, 0, 0);
      
      console.log(`優惠券 ${coupon.coupon_id} - 開始日期: ${coupon.start_date}, 結束日期: ${coupon.end_date}`);
      console.log(`比較: 當前日期 ${currentDateObj.toISOString()} ${currentDateObj >= startDate ? '>=' : '<'} 開始日期 ${startDate.toISOString()}`);
      console.log(`比較: 當前日期 ${currentDateObj.toISOString()} ${currentDateObj <= endDate ? '<=' : '>'} 結束日期 ${endDate.toISOString()}`);
      
      // 當前日期必須大於等於開始日期且小於等於結束日期
      if (currentDateObj >= startDate && currentDateObj <= endDate) {
        console.log(`優惠券 ${coupon.coupon_id} 符合條件，加入可用列表`);
        coupons.push(coupon);
      } else {
        console.log(`優惠券 ${coupon.coupon_id} 不符合條件，跳過`);
      }
    }
    
    console.log('符合條件的優惠券數量:', coupons.length);
    
    // 檢查每個優惠券的使用情況
    for (const coupon of coupons) {
      // 檢查學生是否已領取此優惠券
      const userCoupon = await query(
        `SELECT * FROM user_coupons 
         WHERE student_id = ? AND coupon_id = ?`,
        [studentId, coupon.coupon_id]
      );
      
      coupon.is_claimed = userCoupon.length > 0;
      coupon.is_used = userCoupon.length > 0 && userCoupon[0].is_used;
      coupon.user_coupon_id = userCoupon.length > 0 ? userCoupon[0].user_coupon_id : null;
      
      // 計算已領取數量
      const claimedCount = await query(
        `SELECT COUNT(*) as count FROM user_coupons WHERE coupon_id = ?`,
        [coupon.coupon_id]
      );
      
      coupon.claimed_count = claimedCount[0].count;
      
      // 檢查是否達到使用上限
      if (coupon.usage_limit) {
        coupon.limit_reached = coupon.claimed_count >= coupon.usage_limit;
      } else {
        coupon.limit_reached = false;
      }
    }
    
    return coupons;
  } catch (error) {
    console.error('獲取可用優惠券錯誤:', error);
    throw error;
  }
}

// 學生領取優惠券
async function claimCoupon(studentId, couponId) {
  try {
    // 檢查優惠券是否存在且有效
    const coupon = await getCouponById(couponId);
    
    if (!coupon) {
      throw new Error('優惠券不存在');
    }
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (!coupon.is_active || coupon.start_date > currentDate || coupon.end_date < currentDate) {
      throw new Error('優惠券不在有效期內');
    }
    
    // 檢查是否達到使用上限
    if (coupon.usage_limit) {
      const claimedCount = await query(
        `SELECT COUNT(*) as count FROM user_coupons WHERE coupon_id = ?`,
        [couponId]
      );
      
      if (claimedCount[0].count >= coupon.usage_limit) {
        throw new Error('優惠券已達到使用上限');
      }
    }
    
    // 檢查學生是否已領取此優惠券
    const existingClaim = await query(
      `SELECT * FROM user_coupons WHERE student_id = ? AND coupon_id = ?`,
      [studentId, couponId]
    );
    
    if (existingClaim.length > 0) {
      throw new Error('您已領取過此優惠券');
    }
    
    // 領取優惠券
    const result = await query(
      `INSERT INTO user_coupons (student_id, coupon_id) VALUES (?, ?)`,
      [studentId, couponId]
    );
    
    // 獲取新領取的優惠券詳情
    const userCoupon = await query(
      `SELECT uc.*, c.*, r.restaurant_name
       FROM user_coupons uc
       JOIN coupons c ON uc.coupon_id = c.coupon_id
       JOIN restaurants r ON c.restaurant_id = r.restaurant_id
       WHERE uc.user_coupon_id = ?`,
      [result.insertId]
    );
    
    return userCoupon[0];
  } catch (error) {
    console.error('領取優惠券錯誤:', error);
    throw error;
  }
}

// 獲取學生的優惠券列表
async function getStudentCoupons(studentId, restaurantId = null) {
  try {
    // 使用本地時區的日期，而不是UTC時區
    const now = new Date();
    const currentDate = now.getFullYear() + '-' + 
                        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(now.getDate()).padStart(2, '0');
    
    console.log('獲取學生優惠券 - 當前本地日期:', currentDate);
    console.log('學生ID:', studentId, '餐廳ID:', restaurantId);
    
    if (restaurantId) {
      // 如果指定了餐廳ID，返回該餐廳的所有可用優惠券，標記學生的領取和使用狀態
      const sql = `
        SELECT 
          c.*,
          uc.user_coupon_id,
          uc.is_used,
          uc.claimed_at,
          uc.used_at,
          uc.order_id,
          CASE WHEN uc.user_coupon_id IS NOT NULL THEN 1 ELSE 0 END as is_claimed,
          r.restaurant_name,
          r.image_url as restaurant_image
        FROM coupons c
        JOIN restaurants r ON c.restaurant_id = r.restaurant_id
        LEFT JOIN user_coupons uc ON c.coupon_id = uc.coupon_id AND uc.student_id = ?
        WHERE c.restaurant_id = ? AND c.is_active = 1 
          AND c.start_date <= ? AND c.end_date >= ?
        ORDER BY 
          CASE 
            WHEN uc.user_coupon_id IS NOT NULL AND uc.is_used = 0 THEN 1  -- 已領取未使用
            WHEN uc.user_coupon_id IS NULL THEN 2                         -- 未領取
            ELSE 3                                                        -- 已使用
          END,
          c.created_at DESC
      `;
      
      const params = [studentId, restaurantId, currentDate, currentDate];
      console.log('執行SQL (餐廳優惠券):', sql);
      console.log('參數:', params);
      
      const coupons = await query(sql, params);
      console.log(`找到餐廳 ${restaurantId} 的 ${coupons.length} 個優惠券`);
      
      // 為每個優惠券添加額外的狀態信息
      coupons.forEach(coupon => {
        coupon.limit_reached = coupon.usage_limit && coupon.claimed_count >= coupon.usage_limit;
      });
      
      return coupons;
    } else {
      // 原有邏輯：返回學生已領取的所有優惠券
      let sql = `SELECT uc.*, c.*, r.restaurant_name, r.image_url as restaurant_image
         FROM user_coupons uc
         JOIN coupons c ON uc.coupon_id = c.coupon_id
         JOIN restaurants r ON c.restaurant_id = r.restaurant_id
         WHERE uc.student_id = ?`;
      
      let params = [studentId];
      
      sql += ` ORDER BY 
           CASE 
             WHEN uc.is_used = 0 AND c.end_date >= ? THEN 1
             WHEN uc.is_used = 0 AND c.end_date < ? THEN 2
             ELSE 3
           END,
           uc.claimed_at DESC`;
      
      params.push(currentDate, currentDate);
      
      console.log('執行SQL (學生所有優惠券):', sql);
      console.log('參數:', params);
      
      const coupons = await query(sql, params);
      
      console.log(`找到學生的 ${coupons.length} 個優惠券`);
      
      return coupons;
    }
  } catch (error) {
    console.error('獲取學生優惠券錯誤:', error);
    throw error;
  }
}

// 使用優惠券
async function useCoupon(userCouponId, orderId) {
  try {
    // 檢查優惠券是否存在且未使用
    const userCoupon = await query(
      `SELECT uc.*, c.* 
       FROM user_coupons uc
       JOIN coupons c ON uc.coupon_id = c.coupon_id
       WHERE uc.user_coupon_id = ?`,
      [userCouponId]
    );
    
    if (userCoupon.length === 0) {
      throw new Error('優惠券不存在');
    }
    
    if (userCoupon[0].is_used) {
      throw new Error('優惠券已使用');
    }
    
    // 使用本地時區的日期，而不是UTC時區
    const now = new Date();
    const currentDate = now.getFullYear() + '-' + 
                        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(now.getDate()).padStart(2, '0');
    
    console.log('使用優惠券 - 當前本地日期:', currentDate);
    console.log('優惠券結束日期:', userCoupon[0].end_date);
    
    if (userCoupon[0].end_date < currentDate) {
      throw new Error('優惠券已過期');
    }
    
    // 標記優惠券為已使用
    await query(
      `UPDATE user_coupons 
       SET is_used = 1, used_at = CURRENT_TIMESTAMP, order_id = ? 
       WHERE user_coupon_id = ?`,
      [orderId, userCouponId]
    );
    
    return { success: true, message: '優惠券使用成功' };
  } catch (error) {
    console.error('使用優惠券錯誤:', error);
    throw error;
  }
}

// 生成優惠券碼
function generateCouponCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  
  return code;
}

// 調試用：獲取所有優惠券，不帶任何條件限制
async function getAllCouponsForDebug() {
  try {
    console.log('調試功能：獲取所有優惠券記錄');
    
    // 直接獲取所有優惠券，不帶任何過濾條件
    const allCoupons = await query('SELECT * FROM coupons');
    console.log(`數據庫中共有 ${allCoupons.length} 個優惠券記錄`);
    
    if (allCoupons.length > 0) {
      console.log('第一個優惠券示例:', JSON.stringify(allCoupons[0], null, 2));
    }
    
    return allCoupons;
  } catch (error) {
    console.error('調試獲取所有優惠券錯誤:', error);
    throw error;
  }
}

module.exports = {
  getRestaurantCoupons,
  getCouponById,
  getAvailableCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  claimCoupon,
  getStudentCoupons,
  useCoupon,
  getAllCouponsForDebug
};
