const db = require('../config/db');

// 直接使用 mysql2/promise 的查詢方法，不需要 promisify
async function query(sql, params) {
  try {
    const [rows] = await db.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('SQL 查詢錯誤:', error);
    throw error;
  }
}

// 創建新訂單
async function createOrder(studentId, restaurantId, totalAmount, paymentMethod, deliveryAddress = null) {
  try {
    const result = await query(
      `INSERT INTO orders 
       (student_id, restaurant_id, total_amount, payment_method, delivery_address, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [studentId, restaurantId, totalAmount, paymentMethod, deliveryAddress]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('創建訂單錯誤:', error);
    throw error;
  }
}

// 添加訂單項目
async function addOrderItems(orderId, items) {
  try {
    const values = items.map(item => [
      orderId,
      item.menu_id,
      item.quantity,
      item.price,
      item.special_instructions || null
    ]);
    
    const placeholders = items.map(() => '(?, ?, ?, ?, ?)').join(', ');
    
    await query(
      `INSERT INTO order_items 
       (order_id, menu_id, quantity, price, special_instructions) 
       VALUES ${placeholders}`,
      values.flat()
    );
    
    return true;
  } catch (error) {
    console.error('添加訂單項目錯誤:', error);
    throw error;
  }
}

// 獲取學生的訂單列表
async function getStudentOrders(studentId, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    
    // 獲取訂單列表，確保包含折扣相關欄位
    const orders = await query(
      `SELECT o.*, r.restaurant_name,
              o.original_amount,
              o.discount_amount,
              o.total_amount,
              o.coupon_id
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.restaurant_id
       WHERE o.student_id = ?
       ORDER BY o.order_date DESC
       LIMIT ? OFFSET ?`,
      [studentId, limit, offset]
    );
    
    // 獲取訂單總數
    const countResult = await query(
      `SELECT COUNT(*) as total FROM orders WHERE student_id = ?`,
      [studentId]
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // 獲取每個訂單的項目
    for (const order of orders) {
      const items = await query(
        `SELECT oi.*, m.item_name, m.description, m.category
         FROM order_items oi
         JOIN menus m ON oi.menu_id = m.menu_id
         WHERE oi.order_id = ?`,
        [order.order_id]
      );
      
      order.items = items;
    }
    
    return {
      orders,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    console.error('獲取學生訂單列表錯誤:', error);
    throw error;
  }
}

// 獲取餐廳的訂單列表
async function getRestaurantOrders(restaurantId, status = null, page = 1, limit = 10) {
  // 獲取數據庫連接
  const connection = await db.getConnection();
  
  try {
    const offset = (page - 1) * limit;
    console.log('獲取餐廳訂單，餐廳ID:', restaurantId, '頁碼:', page, '每頁數量:', limit);
    
    // 確保 restaurant_id 是字符串類型
    const restaurantIdStr = String(restaurantId);
    console.log('轉換後的餐廳ID類型:', typeof restaurantIdStr, '值:', restaurantIdStr);
    
    // 先查詢該餐廳是否有訂單
    const [testQuery] = await connection.query(
      'SELECT COUNT(*) as count FROM orders WHERE restaurant_id = ?',
      [restaurantIdStr]
    );
    console.log('餐廳訂單測試查詢結果:', testQuery[0]);
    
    let query_str = `
      SELECT o.*, 
             s.student_name,
             o.original_amount,
             o.discount_amount,
             o.total_amount,
             o.coupon_id
      FROM orders o
      JOIN students s ON o.student_id = s.student_id
      WHERE o.restaurant_id = ?
    `;
    
    const queryParams = [restaurantIdStr];
    
    // 如果指定了狀態，則添加狀態過濾
    if (status) {
      query_str += ` AND o.status = ?`;
      queryParams.push(status);
    }
    
    query_str += ` ORDER BY o.order_date DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    console.log('即將執行的SQL查詢:', query_str);
    console.log('查詢參數:', queryParams);
    
    // 使用 query 而非 execute，避免 prepared statement 協議的限制
    const [orders] = await connection.query(query_str, queryParams);
    
    console.log('原始訂單查詢結果:', {
      訂單數量: orders.length,
      第一筆訂單: orders.length > 0 ? orders[0] : null
    });
    
    // 處理每個訂單的金額格式
    for (const order of orders) {
      // 確保金額欄位為數字類型
      order.original_amount = parseFloat(order.original_amount) || 0;
      order.discount_amount = parseFloat(order.discount_amount) || 0;
      order.total_amount = parseFloat(order.total_amount) || 0;
      
      // 確認金額一致性
      if (order.original_amount > 0 && order.discount_amount > 0) {
        const expectedTotal = order.original_amount - order.discount_amount;
        if (Math.abs(expectedTotal - order.total_amount) > 0.01) {
          console.warn('訂單金額不一致，進行調整', {
            order_id: order.order_id,
            original: order.original_amount,
            discount: order.discount_amount,
            currentTotal: order.total_amount,
            expectedTotal
          });
          // 自動修正金額
          order.total_amount = expectedTotal;
        }
      }
      
      // 輸出訂單金額信息以進行調試
      console.log('訂單列表價格信息:', {
        order_id: order.order_id,
        original_amount: order.original_amount,
        discount_amount: order.discount_amount,
        total_amount: order.total_amount,
        coupon_id: order.coupon_id
      });
    }
    
    // 獲取訂單的物品
    for (const order of orders) {
      try {
        // 修復欄位名稱：使用正確的menus表欄位
        const [items] = await connection.query(
          `SELECT oi.*, m.item_name, m.price
           FROM order_items oi
           JOIN menus m ON oi.menu_id = m.menu_id
           WHERE oi.order_id = ?`,
          [order.order_id]
        );
        
        order.items = items;
        console.log('成功獲取訂單項目:', {
          order_id: order.order_id,
          items_count: items.length
        });
      } catch (error) {
        console.error('獲取訂單項目錯誤:', error);
        // 如果出錯，設置空數組
        order.items = [];
      }
    }
    
    // 獲取總訂單數量用於分頁
    let countQuery = `
      SELECT COUNT(*) as total
      FROM orders
      WHERE restaurant_id = ?
    `;
    
    const countParams = [restaurantIdStr];
    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }
    
    const [countResult] = await connection.query(countQuery, countParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    console.log('餐廳訂單統計結果:', {
      總訂單數: total,
      總頁數: totalPages,
      目前頁碼: page
    });
    
    return {
      orders,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    console.error('獲取餐廳訂單列表錯誤:', error);
    throw error;
  } finally {
    // 釋放連接
    connection.release();
  }
}

// 獲取訂單詳情
async function getOrderById(orderId) {
  console.log('獲取訂單詳情，訂單ID:', orderId);
  
  try {
    // 獲取訂單基本信息
    const orders = await query(
      `SELECT o.*, 
              s.student_name, 
              r.restaurant_name, 
              r.restaurant_id,
              r.address as restaurant_address,
              o.original_amount,
              o.discount_amount,
              o.total_amount,
              o.coupon_id
       FROM orders o
       JOIN students s ON o.student_id = s.student_id
       JOIN restaurants r ON o.restaurant_id = r.restaurant_id
       WHERE o.order_id = ?`,
      [orderId]
    );
    
    if (orders.length === 0) {
      return null;
    }
    
    const order = orders[0];
    
    // 獲取訂單項目
    const items = await query(
      `SELECT oi.*, m.item_name, m.description, m.category
       FROM order_items oi
       JOIN menus m ON oi.menu_id = m.menu_id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    
    order.items = items;
    
    // 確保金額欄位為數字類型
    order.original_amount = parseFloat(order.original_amount) || 0;
    order.discount_amount = parseFloat(order.discount_amount) || 0;
    order.total_amount = parseFloat(order.total_amount) || 0;
    
    // 確認金額一致性
    if (order.original_amount > 0 && order.discount_amount > 0) {
      const expectedTotal = order.original_amount - order.discount_amount;
      if (Math.abs(expectedTotal - order.total_amount) > 0.01) {
        console.warn('訂單金額不一致，進行調整', {
          order_id: order.order_id,
          original: order.original_amount,
          discount: order.discount_amount,
          currentTotal: order.total_amount,
          expectedTotal
        });
        // 自動修正金額
        order.total_amount = expectedTotal;
      }
    }
    
    // 輸出訂單價格信息以進行調試
    console.log('訂單詳情價格信息:', {
      order_id: order.order_id,
      original_amount: order.original_amount,
      discount_amount: order.discount_amount,
      total_amount: order.total_amount,
      coupon_id: order.coupon_id
    });
    
    return order;
  } catch (error) {
    console.error('獲取訂單詳情錯誤:', error);
    throw error;
  }
}

// 更新訂單狀態
async function updateOrderStatus(orderId, status) {
  try {
    await query(
      `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?`,
      [status, orderId]
    );
    
    return true;
  } catch (error) {
    console.error('更新訂單狀態錯誤:', error);
    throw error;
  }
}

// 從購物車創建訂單
async function createOrderFromCart(studentId, paymentMethod, deliveryAddress = null, userCouponId = null) {
  // 獲取數據庫連接
  const connection = await db.getConnection();
  
  try {
    // 開始事務
    await connection.beginTransaction();
    
    // 獲取購物車數據
    const [cartData] = await connection.query(
      `SELECT ci.*, c.restaurant_id, m.menu_id, m.item_name, m.price, m.category
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.cart_id
       JOIN menus m ON ci.menu_id = m.menu_id
       WHERE c.student_id = ?`,
      [studentId]
    );
    
    console.log('購物車數據:', JSON.stringify(cartData, null, 2));
    
    if (cartData.length === 0) {
      await connection.rollback();
      connection.release();
      throw new Error('購物車為空');
    }
    
    const restaurantId = cartData[0].restaurant_id;
    
    // 計算總金額（原價）
    let originalAmount = 0;
    for (const item of cartData) {
      originalAmount += item.price * item.quantity;
    }
    
    // 處理優惠券折扣
    let discountAmount = 0;
    let finalAmount = originalAmount;
    let couponApplied = false;
    let actualUserCouponId = null;
    let actualCouponId = null;
    
    if (userCouponId) {
      try {
        console.log('處理優惠券，傳入的優惠券ID:', userCouponId, '學生ID:', studentId);
        
        // 優先作為 user_coupon_id 查詢（已領取的優惠券）
        let [userCoupons] = await connection.query(
          `SELECT uc.*, c.discount_type, c.discount_value, c.min_order_amount, c.coupon_id as actual_coupon_id
           FROM user_coupons uc
           JOIN coupons c ON uc.coupon_id = c.coupon_id
           WHERE uc.user_coupon_id = ? AND uc.student_id = ? AND uc.is_used = 0`,
          [userCouponId, studentId]
        );
        
        console.log('作為user_coupon_id查詢結果:', JSON.stringify(userCoupons, null, 2));
        
        // 如果沒有找到，可能是直接傳coupon_id（未領取需自動領取）
        if (!userCoupons || userCoupons.length === 0) {
          console.log('未找到已領取的優惠券，檢查是否為有效的coupon_id...');
          
          // 檢查是否為有效的優惠券ID
          const [validCoupons] = await connection.query(
            `SELECT * FROM coupons WHERE coupon_id = ? AND is_active = 1`,
            [userCouponId]
          );
          
          if (validCoupons && validCoupons.length > 0) {
            console.log('找到有效的coupon_id，自動為學生領取...');
            
            // 檢查學生是否已領取過此優惠券
            const [existingClaims] = await connection.query(
              `SELECT * FROM user_coupons WHERE student_id = ? AND coupon_id = ?`,
              [studentId, userCouponId]
            );
            
            if (existingClaims.length === 0) {
              // 自動領取優惠券
              const [claimResult] = await connection.query(
                `INSERT INTO user_coupons (student_id, coupon_id) VALUES (?, ?)`,
                [studentId, userCouponId]
              );
              
              console.log('自動領取優惠券成功，user_coupon_id:', claimResult.insertId);
              
              // 重新查詢已領取的優惠券
              [userCoupons] = await connection.query(
                `SELECT uc.*, c.discount_type, c.discount_value, c.min_order_amount, c.coupon_id as actual_coupon_id
                 FROM user_coupons uc
                 JOIN coupons c ON uc.coupon_id = c.coupon_id
                 WHERE uc.user_coupon_id = ? AND uc.student_id = ? AND uc.is_used = 0`,
                [claimResult.insertId, studentId]
              );
              
              console.log('自動領取後查詢結果:', JSON.stringify(userCoupons, null, 2));
            } else {
              console.log('學生已領取過此優惠券，使用現有記錄');
              userCoupons = existingClaims;
            }
          }
        }
        
        if (userCoupons && userCoupons.length > 0) {
          const coupon = userCoupons[0];
          actualUserCouponId = coupon.user_coupon_id; // 保存實際的user_coupon_id
          actualCouponId = coupon.actual_coupon_id || coupon.coupon_id; // 保存實際的coupon_id
          
          console.log(`找到優惠券記錄，user_coupon_id: ${actualUserCouponId}, coupon_id: ${actualCouponId}`);
          
          // 檢查最低訂單金額要求
          if (!coupon.min_order_amount || originalAmount >= coupon.min_order_amount) {
            // 計算折扣
            if (coupon.discount_type === 'fixed') {
              discountAmount = parseFloat(coupon.discount_value);
            } else if (coupon.discount_type === 'percentage') {
              discountAmount = parseFloat((originalAmount * (coupon.discount_value / 100)).toFixed(2));
            }
            
            // 應用折扣
            finalAmount = originalAmount - discountAmount;
            if (finalAmount < 0) finalAmount = 0; // 確保金額不為負數
            couponApplied = true;
            
            console.log(`優惠券已應用，折扣金額: ${discountAmount}, 最終金額: ${finalAmount}`);
          } else {
            console.log(`優惠券未應用，訂單金額 ${originalAmount} 未達到最低要求 ${coupon.min_order_amount}`);
          }
        } else {
          console.error('未找到可用的優惠券記錄');
          // 不應用不存在或未領取的優惠券
          userCouponId = null;
          actualUserCouponId = null;
          actualCouponId = null;
        }
      } catch (couponError) {
        console.error('處理優惠券時出錯:', couponError);
        console.error('錯誤詳情:', couponError.stack || couponError);
        // 繼續處理訂單，但不應用優惠券
        userCouponId = null;
        actualUserCouponId = null;
        actualCouponId = null;
      }
    }
    
    console.log('訂單金額計算:', {
      originalAmount,
      discountAmount,
      finalAmount,
      couponApplied,
      userCouponId,
      actualCouponId
    });
    
    // 再次確認所有金額正確
    console.log('最終訂單金額確認:', {
      原價總額: originalAmount,
      折扣金額: discountAmount,
      最終金額: finalAmount,
      優惠券ID: actualCouponId,
      使用者優惠券ID: actualUserCouponId,
      優惠券已應用: couponApplied
    });
    
    // 確保折扣金額為數字類型
    const discountAmountNum = parseFloat(discountAmount) || 0;
    const originalAmountNum = parseFloat(originalAmount) || 0;
    const finalAmountNum = parseFloat(finalAmount) || 0;
    
    // 創建訂單
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
       (student_id, restaurant_id, total_amount, original_amount, discount_amount, 
        payment_method, delivery_address, coupon_id, user_coupon_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, restaurantId, finalAmountNum, originalAmountNum, discountAmountNum, 
       paymentMethod, deliveryAddress, actualCouponId, actualUserCouponId, 'pending']
    );
    
    console.log('訂單插入結果:', orderResult);
    
    const orderId = orderResult.insertId;
    console.log(`訂單創建成功，ID: ${orderId}`);
    
    // 添加訂單項目
    if (cartData.length > 0) {
      try {
        const orderItems = cartData.map(item => ({
          order_id: orderId,
          menu_id: item.menu_id,
          quantity: item.quantity,
          price: item.price,
          special_instructions: item.special_instructions || null
        }));

        // 批量添加訂單項目
        const insertValuesPlaceholder = orderItems
          .map(() => '(?, ?, ?, ?, ?)')
          .join(', ');
          
        const insertItemsValues = [];
        orderItems.forEach(item => {
          insertItemsValues.push(
            item.order_id,
            item.menu_id,
            item.quantity,
            item.price,
            item.special_instructions
          );
        });

        await connection.query(
          `INSERT INTO order_items 
           (order_id, menu_id, quantity, price, special_instructions) 
           VALUES ${insertValuesPlaceholder}`,
          insertItemsValues
        );
        
        console.log(`已添加 ${orderItems.length} 個訂單項目`);
      } catch (itemError) {
        console.error('添加訂單項目時出錯:', itemError);
        throw itemError;
      }
    }
    
    // 如果成功應用了優惠券，標記為已使用
    if (couponApplied && actualUserCouponId) {
      try {
        await connection.query(
          `UPDATE user_coupons 
           SET is_used = 1, used_at = CURRENT_TIMESTAMP, order_id = ? 
           WHERE user_coupon_id = ?`,
          [orderId, actualUserCouponId]
        );
        
        console.log(`優惠券 #${actualUserCouponId} 已被標記為已使用，訂單 #${orderId}`);
      } catch (couponUpdateError) {
        console.error('更新優惠券狀態時出錯:', couponUpdateError);
        console.error('錯誤詳情:', couponUpdateError.stack || couponUpdateError);
        // 不中斷訂單創建流程
      }
    }
    
    // 清空購物車
    try {
      await connection.query(
        `DELETE FROM cart_items WHERE cart_id IN (SELECT cart_id FROM carts WHERE student_id = ?)`,
        [studentId]
      );
      console.log(`已清空學生 ${studentId} 的購物車`);
    } catch (cartClearError) {
      console.error('清空購物車時出錯:', cartClearError);
      // 不中斷訂單創建流程
    }
    
    await connection.commit();
    console.log(`訂單 #${orderId} 創建完成，事務已提交`);
    return orderId;
  } catch (error) {
    // 回滚事務
    try {
      await connection.rollback();
      console.error('訂單創建失敗，事務已回滾');
    } catch (rollbackError) {
      console.error('回滚事務失敗:', rollbackError);
    }
    console.error('從購物車創建訂單錯誤:', error);
    throw error;
  } finally {
    // 釋放連接
    connection.release();
    console.log('數據庫連接已釋放');
  }
}

module.exports = {
  createOrder,
  addOrderItems,
  getStudentOrders,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  createOrderFromCart
};
