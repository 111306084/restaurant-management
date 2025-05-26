const db = require('../config/db');

// 直接使用 mysql2/promise 的查詢方法，不需要 promisify
async function query(sql, params) {
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    console.error('SQL 查詢錯誤:', error);
    throw error;
  }
}

// 獲取餐廳的評分摘要
async function getRatingSummary(restaurantId) {
  try {
    const result = await query(
      `SELECT * FROM restaurant_ratings WHERE restaurant_id = ?`,
      [restaurantId]
    );
    
    if (result.length === 0) {
      // 如果沒有評分記錄，返回默認值
      return {
        restaurant_id: restaurantId,
        avg_food_rating: 0,
        avg_service_rating: 0,
        avg_environment_rating: 0,
        avg_overall_rating: 0,
        total_ratings: 0
      };
    }
    
    return result[0];
  } catch (error) {
    console.error('獲取餐廳評分摘要錯誤:', error);
    throw error;
  }
}

// 獲取餐廳的評論列表
async function getRestaurantComments(restaurantId, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    
    // 獲取評論列表
    const comments = await query(
      `SELECT c.*, 
              s.student_name,
              (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.comment_id) as likes_count
       FROM comments c
       LEFT JOIN students s ON c.student_id = s.student_id
       WHERE c.restaurant_id = ?
       ORDER BY c.comment_date DESC
       LIMIT ? OFFSET ?`,
      [restaurantId, limit, offset]
    );
    
    // 獲取評論總數
    const countResult = await query(
      `SELECT COUNT(*) as total FROM comments WHERE restaurant_id = ?`,
      [restaurantId]
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // 獲取每個評論的圖片
    for (const comment of comments) {
      const images = await query(
        `SELECT * FROM comment_images WHERE comment_id = ?`,
        [comment.comment_id]
      );
      comment.images = images;
      
      // 獲取每個評論的回覆
      const replies = await query(
        `SELECT cr.*, 
                CASE 
                  WHEN cr.user_type = 'student' THEN (SELECT student_name FROM students WHERE student_id = cr.user_id)
                  WHEN cr.user_type = 'restaurant' THEN '商家'
                  ELSE 'Unknown'
                END as user_name
         FROM comment_replies cr
         WHERE cr.comment_id = ?
         ORDER BY cr.created_at ASC`,
        [comment.comment_id]
      );
      comment.replies = replies;
    }
    
    return {
      comments,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    console.error('獲取餐廳評論列表錯誤:', error);
    throw error;
  }
}

// 添加新評論
async function addComment(commentData) {
  console.log(`\n==== 模型層開始添加評論 ====`);
  console.log('評論數據:', JSON.stringify(commentData, null, 2));
  
  // 獲取數據庫連接
  const connection = await db.getConnection();
  
  try {
    const {
      student_id,
      restaurant_id,
      order_id,
      food_rating,
      service_rating,
      environment_rating,
      overall_rating,
      content,
      is_anonymous,
      is_verified_purchase
    } = commentData;
    
    // 驗證必要欄位
    if (!student_id) {
      throw new Error('缺少學生ID');
    }
    
    if (!restaurant_id) {
      throw new Error('缺少餐廳ID');
    }
    
    console.log('準備插入評論到數據庫...');
    
    // 開始事務
    await connection.beginTransaction();
    
    try {
      // 插入評論 - 使用 execute 方法
      const [result] = await connection.execute(
        `INSERT INTO comments (
          student_id, restaurant_id, order_id, food_rating, service_rating, 
          environment_rating, overall_rating, content, is_anonymous, is_verified_purchase
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          student_id, 
          restaurant_id, 
          order_id || null, 
          food_rating, 
          service_rating,
          environment_rating, 
          overall_rating, 
          content || '', 
          is_anonymous || false, 
          is_verified_purchase || false
        ]
      );
      
      console.log('評論插入結果:', result);
      const commentId = result.insertId;
      console.log('新評論ID:', commentId);
      
      // 如果有圖片，添加圖片 - 使用循環和 execute 方法
      if (commentData.images && Array.isArray(commentData.images) && commentData.images.length > 0) {
        console.log('準備添加圖片:', commentData.images);
        
        try {
          // 使用循環而不是批量插入，避免預處理語句不支持的問題
          for (const imageUrl of commentData.images) {
            await connection.execute(
              `INSERT INTO comment_images (comment_id, image_url) VALUES (?, ?)`,
              [commentId, imageUrl]
            );
            console.log(`圖片添加成功: ${imageUrl}`);
          }
          
          console.log('全部圖片添加完成');
        } catch (imageError) {
          console.error('添加圖片錯誤:', imageError);
          // 繼續執行，不回滾事務，因為圖片是可選的
        }
      }
      
      try {
        // 更新餐廳評分 - 使用直接的 SQL 查詢而不是預處理語句
        // 使用一個簡單的 SQL 查詢來更新餐廳評分
        await connection.query(
          `INSERT INTO restaurant_ratings 
           (restaurant_id, avg_food_rating, avg_service_rating, avg_environment_rating, avg_overall_rating, total_ratings)
           SELECT 
             ?, 
             AVG(food_rating), 
             AVG(service_rating), 
             AVG(environment_rating), 
             AVG(overall_rating), 
             COUNT(*)
           FROM comments 
           WHERE restaurant_id = ?
           ON DUPLICATE KEY UPDATE 
             avg_food_rating = VALUES(avg_food_rating),
             avg_service_rating = VALUES(avg_service_rating),
             avg_environment_rating = VALUES(avg_environment_rating),
             avg_overall_rating = VALUES(avg_overall_rating),
             total_ratings = VALUES(total_ratings)`,
          [restaurant_id, restaurant_id]
        );
        
        console.log('餐廳評分更新成功');
      } catch (ratingError) {
        console.error('更新餐廳評分錯誤:', ratingError);
        // 繼續執行，不回滾事務，因為評分更新是次要的
      }
      
      // 提交事務
      await connection.commit();
      
      // 獲取新添加的評論（事務完成後）
      const [newComment] = await connection.execute(
        `SELECT c.*, s.student_name
         FROM comments c
         LEFT JOIN students s ON c.student_id = s.student_id
         WHERE c.comment_id = ?`,
        [commentId]
      );
      
      if (newComment.length === 0) {
        console.error('無法查詢到新添加的評論');
        throw new Error('評論添加失敗');
      }
      
      // 獲取新添加的評論圖片
      const [images] = await connection.execute(
        `SELECT * FROM comment_images WHERE comment_id = ?`,
        [commentId]
      );
      
      // 將圖片添加到評論對象中
      newComment[0].images = images;
      
      console.log('評論添加成功\n');
      console.log('評論圖片:', JSON.stringify(images));
      return newComment[0];
    } catch (transactionError) {
      // 如果事務中的任何操作失敗，回滾事務
      await connection.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error('添加評論錯誤:', error);
    console.error('錯誤詳情:', error.stack || error);
    throw error;
  } finally {
    // 釋放連接
    connection.release();
  }
}

// 注意：我們已經在 addComment 函數中直接使用 SQL 查詢更新餐廳評分，
// 不再需要這個函數。如果將來需要單獨更新評分，可以重新實現它。

// 更新評論
async function updateComment(commentId, commentData) {
  try {
    const {
      food_rating,
      service_rating,
      environment_rating,
      overall_rating,
      content,
      is_anonymous
    } = commentData;
    
    await query(
      `UPDATE comments SET
        food_rating = ?,
        service_rating = ?,
        environment_rating = ?,
        overall_rating = ?,
        content = ?,
        is_anonymous = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE comment_id = ?`,
      [
        food_rating, service_rating, environment_rating, 
        overall_rating, content, is_anonymous || false, commentId
      ]
    );
    
    // 獲取更新後的評論
    const updatedComment = await query(
      `SELECT c.*, s.student_name
       FROM comments c
       LEFT JOIN students s ON c.student_id = s.student_id
       WHERE c.comment_id = ?`,
      [commentId]
    );
    
    if (updatedComment.length === 0) {
      throw new Error('評論更新失敗');
    }
    
    return updatedComment[0];
  } catch (error) {
    console.error('更新評論錯誤:', error);
    throw error;
  }
}

// 刪除評論
async function deleteComment(commentId) {
  try {
    // 刪除評論（觸發器會自動刪除相關的圖片、回覆和點讚）
    await query('DELETE FROM comments WHERE comment_id = ?', [commentId]);
    return { deleted: true };
  } catch (error) {
    console.error('刪除評論錯誤:', error);
    throw error;
  }
}

// 添加評論回覆
async function addCommentReply(commentId, replyData) {
  try {
    const { user_id, user_type, content } = replyData;
    
    const result = await query(
      `INSERT INTO comment_replies (comment_id, user_id, user_type, content)
       VALUES (?, ?, ?, ?)`,
      [commentId, user_id, user_type, content]
    );
    
    const replyId = result.insertId;
    
    // 獲取新添加的回覆
    const newReply = await query(
      `SELECT cr.*, 
              CASE 
                WHEN cr.user_type = 'student' THEN (SELECT student_name FROM students WHERE student_id = cr.user_id)
                WHEN cr.user_type = 'restaurant' THEN '商家'
                ELSE 'Unknown'
              END as user_name
       FROM comment_replies cr
       WHERE cr.reply_id = ?`,
      [replyId]
    );
    
    if (newReply.length === 0) {
      throw new Error('回覆添加失敗');
    }
    
    return newReply[0];
  } catch (error) {
    console.error('添加評論回覆錯誤:', error);
    throw error;
  }
}

// 點讚評論
async function likeComment(commentId, studentId) {
  try {
    // 檢查是否已經點讚
    const existingLike = await query(
      'SELECT * FROM comment_likes WHERE comment_id = ? AND student_id = ?',
      [commentId, studentId]
    );
    
    if (existingLike.length > 0) {
      return { liked: true, message: '已經點讚過了' };
    }
    
    // 添加點讚
    await query(
      'INSERT INTO comment_likes (comment_id, student_id) VALUES (?, ?)',
      [commentId, studentId]
    );
    
    // 獲取點讚數
    const likesCount = await query(
      'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
      [commentId]
    );
    
    return { 
      liked: true, 
      likesCount: likesCount[0].count 
    };
  } catch (error) {
    console.error('點讚評論錯誤:', error);
    throw error;
  }
}

// 取消點讚
async function unlikeComment(commentId, studentId) {
  try {
    // 刪除點讚
    await query(
      'DELETE FROM comment_likes WHERE comment_id = ? AND student_id = ?',
      [commentId, studentId]
    );
    
    // 獲取點讚數
    const likesCount = await query(
      'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
      [commentId]
    );
    
    return { 
      unliked: true, 
      likesCount: likesCount[0].count 
    };
  } catch (error) {
    console.error('取消點讚錯誤:', error);
    throw error;
  }
}

// 檢查用戶是否已點讚評論
async function checkUserLiked(commentId, studentId) {
  try {
    const result = await query(
      'SELECT * FROM comment_likes WHERE comment_id = ? AND student_id = ?',
      [commentId, studentId]
    );
    
    return { liked: result.length > 0 };
  } catch (error) {
    console.error('檢查用戶點讚狀態錯誤:', error);
    throw error;
  }
}

// 添加評論圖片
async function addCommentImage(commentId, imageUrl) {
  try {
    console.log(`正在添加圖片到評論 ${commentId}, URL: ${imageUrl}`);
    
    // 檢查評論是否存在
    const commentCheck = await query('SELECT * FROM comments WHERE comment_id = ?', [commentId]);
    if (!commentCheck || commentCheck.length === 0) {
      console.error(`評論 ${commentId} 不存在，無法添加圖片`);
      throw new Error(`評論 ${commentId} 不存在`);
    }
    
    const result = await query(
      'INSERT INTO comment_images (comment_id, image_url) VALUES (?, ?)',
      [commentId, imageUrl]
    );
    
    console.log(`圖片添加成功，新圖片ID: ${result.insertId}`);
    
    // 驗證圖片是否正確添加
    const savedImage = await query('SELECT * FROM comment_images WHERE image_id = ?', [result.insertId]);
    console.log('已保存的圖片數據:', JSON.stringify(savedImage));
    
    return { 
      image_id: result.insertId,
      comment_id: commentId,
      image_url: imageUrl
    };
  } catch (error) {
    console.error('添加評論圖片錯誤:', error);
    throw error;
  }
}

// 刪除評論圖片
async function deleteCommentImage(imageId) {
  try {
    await query('DELETE FROM comment_images WHERE image_id = ?', [imageId]);
    return { deleted: true };
  } catch (error) {
    console.error('刪除評論圖片錯誤:', error);
    throw error;
  }
}

// 獲取用戶的評論
async function getUserComments(studentId, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    
    // 獲取評論列表
    const comments = await query(
      `SELECT c.*, r.restaurant_name,
              (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.comment_id) as likes_count
       FROM comments c
       LEFT JOIN restaurants r ON c.restaurant_id = r.restaurant_id
       WHERE c.student_id = ?
       ORDER BY c.comment_date DESC
       LIMIT ? OFFSET ?`,
      [studentId, limit, offset]
    );
    
    // 獲取評論總數
    const countResult = await query(
      `SELECT COUNT(*) as total FROM comments WHERE student_id = ?`,
      [studentId]
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // 獲取每個評論的圖片
    for (const comment of comments) {
      const images = await query(
        `SELECT * FROM comment_images WHERE comment_id = ?`,
        [comment.comment_id]
      );
      comment.images = images;
      
      // 獲取每個評論的回覆
      const replies = await query(
        `SELECT cr.*, 
                CASE 
                  WHEN cr.user_type = 'student' THEN (SELECT student_name FROM students WHERE student_id = cr.user_id)
                  WHEN cr.user_type = 'restaurant' THEN '商家'
                  ELSE 'Unknown'
                END as user_name
         FROM comment_replies cr
         WHERE cr.comment_id = ?
         ORDER BY cr.created_at ASC`,
        [comment.comment_id]
      );
      comment.replies = replies;
    }
    
    return {
      comments,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    console.error('獲取用戶評論列表錯誤:', error);
    throw error;
  }
}

module.exports = {
  getRatingSummary,
  getRestaurantComments,
  addComment,
  updateComment,
  deleteComment,
  addCommentReply,
  likeComment,
  unlikeComment,
  checkUserLiked,
  addCommentImage,
  deleteCommentImage,
  getUserComments
};
