const commentModel = require('../models/commentModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置上傳目錄
const uploadDir = path.join(__dirname, '../uploads');
const commentUploadDir = path.join(__dirname, '../uploads/comments');

// 確保上傳目錄存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(commentUploadDir)) {
  fs.mkdirSync(commentUploadDir, { recursive: true });
}

// 配置存儲
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // 始終將評論圖片存儲到 comments 子目錄
    console.log('將評論圖片存儲到 comments 目錄:', commentUploadDir);
    
    // 確保目錄存在
    if (!fs.existsSync(commentUploadDir)) {
      console.log('創建 comments 目錄:', commentUploadDir);
      fs.mkdirSync(commentUploadDir, { recursive: true });
    }
    
    cb(null, commentUploadDir); // 始終使用評論專用目錄
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    // 為了記錄和防止特殊字符問題，清理檔案名
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // 確保使用原始檔案的副檔名，但清理檔案名並添加唯一字符串
    const finalFileName = 'image-' + uniqueSuffix + '-' + cleanFileName.replace(ext, '') + ext;
    
    console.log('生成的檔案名:', finalFileName);
    cb(null, finalFileName);
  }
});

// 文件過濾器
const fileFilter = (req, file, cb) => {
  // 接受圖片格式
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允許上傳圖片文件'), false);
  }
};

// 配置 multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter
});

// 獲取餐廳的評分摘要
exports.getRatingSummary = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    console.log('\n==== 獲取餐廳評分摘要 ====');
    console.log(`餐廳ID: ${restaurantId}`);
    
    // 直接使用字符串類型的 restaurant_id
    try {
      const ratingSummary = await commentModel.getRatingSummary(restaurantId);
      
      console.log('評分摘要:', ratingSummary);
      
      res.status(200).json({
        success: true,
        ratingSummary
      });
    } catch (dbError) {
      console.error('從數據庫獲取評分摘要失敗:', dbError);
      // 即使數據庫查詢失敗，也返回一個預設的評分摘要
      res.status(200).json({
        success: true,
        ratingSummary: {
          restaurant_id: restaurantId,
          avg_food_rating: 0,
          avg_service_rating: 0,
          avg_environment_rating: 0,
          avg_overall_rating: 0,
          total_ratings: 0
        }
      });
    }
  } catch (error) {
    console.error('獲取餐廳評分摘要錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取餐廳評分摘要時發生錯誤',
      error: error.message
    });
  }
};

// 獲取餐廳的評論列表
exports.getRestaurantComments = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    console.log('\n==== 獲取餐廳評論 ====');
    console.log(`餐廳ID: ${restaurantId}, 頁碼: ${page}, 每頁數量: ${limit}`);
    
    // 直接使用字符串類型的 restaurant_id
    try {
      const result = await commentModel.getRestaurantComments(restaurantId, page, limit);
      
      console.log(`獲取到評論: ${result.comments ? result.comments.length : 0}條`);
      
      // 確保返回一致的數據結構
      const responseData = {
        success: true,
        comments: result.comments || [],
        pagination: result.pagination || {
          currentPage: page,
          totalPages: 1,
          total: result.comments ? result.comments.length : 0,
          limit
        }
      };
      
      console.log('返回評論數據結構:', JSON.stringify(responseData).substring(0, 100) + '...');
      
      res.status(200).json(responseData);
    } catch (dbError) {
      console.error('從數據庫獲取評論失敗:', dbError);
      // 即使數據庫查詢失敗，也返回一個有效的空數據結構
      res.status(200).json({
        success: true,
        comments: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          total: 0,
          limit
        },
        message: '獲取評論時發生錯誤，返回空列表'
      });
    }
  } catch (error) {
    console.error('獲取餐廳評論列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取餐廳評論列表時發生錯誤',
      error: error.message
    });
  }
};

// 添加新評論
exports.addComment = async (req, res) => {
  try {
    const { restaurantId } = req.params; // 從 URL 參數中獲取餐廳ID
    const commentData = req.body;
    
    console.log('\n\n==== 準備添加評論 ====');
    console.log('請求方法:', req.method);
    console.log('請求路徑:', req.originalUrl);
    console.log('餐廳ID參數:', restaurantId);
    console.log('請求數據:', JSON.stringify(commentData, null, 2));
    console.log('用戶信息:', JSON.stringify(req.user, null, 2));
    console.log('請求頭部:', JSON.stringify(req.headers, null, 2));
    console.log('\n');
    
    // 確保學生ID來自已認證的用戶
    commentData.student_id = req.user.student_id;
    
    if (!commentData.student_id) {
      console.error('缺少學生ID，令牌中的用戶信息為:', req.user);
      return res.status(400).json({
        success: false,
        message: '學生ID不能為空，請確保您已登入'
      });
    }
    
    // 設置餐廳ID為 URL 參數中的值，使用字符串類型
    commentData.restaurant_id = restaurantId;
    console.log('使用字符串類型的餐廳ID:', restaurantId);
    
    // 確保評分是數字類型
    if (commentData.food_rating !== undefined) {
      commentData.food_rating = Number(commentData.food_rating);
    } else {
      console.error('缺少 food_rating');
      return res.status(400).json({
        success: false,
        message: '缺少食物評分'
      });
    }
    
    if (commentData.service_rating !== undefined) {
      commentData.service_rating = Number(commentData.service_rating);
    } else {
      console.error('缺少 service_rating');
      return res.status(400).json({
        success: false,
        message: '缺少服務評分'
      });
    }
    
    if (commentData.environment_rating !== undefined) {
      commentData.environment_rating = Number(commentData.environment_rating);
    } else {
      console.error('缺少 environment_rating');
      return res.status(400).json({
        success: false,
        message: '缺少環境評分'
      });
    }
    
    if (commentData.overall_rating !== undefined) {
      commentData.overall_rating = Number(commentData.overall_rating);
    } else {
      console.error('缺少 overall_rating');
      return res.status(400).json({
        success: false,
        message: '缺少整體評分'
      });
    }
    
    console.log('處理後的評論數據:', JSON.stringify(commentData, null, 2));
    
    try {
      const newComment = await commentModel.addComment(commentData);
      
      console.log('評論添加成功:', newComment);
      
      // 確保回應包含完整的評論數據
      res.status(201).json({
        success: true,
        message: '評論添加成功',
        comment: newComment
      });
      console.log('回應已發送');
    } catch (dbError) {
      console.error('評論添加到數據庫錯誤:', dbError);
      console.error('錯誤詳情:', dbError.stack || dbError);
      res.status(500).json({
        success: false,
        message: '評論添加到數據庫時發生錯誤',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('添加評論錯誤:', error);
    console.error('錯誤詳情:', error.stack || error);
    res.status(500).json({
      success: false,
      message: '添加評論時發生錯誤',
      error: error.message
    });
  }
};

// 更新評論
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const commentData = req.body;
    const studentId = req.user.student_id;
    
    // 檢查評論是否存在並屬於該學生
    const comments = await commentModel.getRestaurantComments(commentData.restaurant_id);
    const comment = comments.comments.find(c => c.comment_id == commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '評論不存在'
      });
    }
    
    if (comment.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: '無權更新此評論'
      });
    }
    
    const updatedComment = await commentModel.updateComment(commentId, commentData);
    
    res.status(200).json({
      success: true,
      message: '評論更新成功',
      comment: updatedComment
    });
  } catch (error) {
    console.error('更新評論錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新評論時發生錯誤',
      error: error.message
    });
  }
};

// 刪除評論
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const studentId = req.user.student_id;
    
    // 檢查評論是否存在並屬於該學生
    const comments = await commentModel.getUserComments(studentId);
    const comment = comments.comments.find(c => c.comment_id == commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '評論不存在或不屬於該用戶'
      });
    }
    
    await commentModel.deleteComment(commentId);
    
    res.status(200).json({
      success: true,
      message: '評論刪除成功'
    });
  } catch (error) {
    console.error('刪除評論錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除評論時發生錯誤',
      error: error.message
    });
  }
};

// 添加評論回覆
exports.addCommentReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    console.log('添加評論回覆 - 用戶信息:', req.user);
    console.log('添加評論回覆 - 請求體:', req.body);
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: '回覆內容不能為空'
      });
    }
    
    // 確定回覆者類型和ID
    let userId, userType;
    
    // 優化識別邏輯，同時支持多種用戶識別方式
    if (req.user.role === 'student' || req.user.student_id) {
      // 學生用戶
      userId = req.user.student_id || req.user.id;
      userType = 'student';
    } else if (req.user.role === 'restaurant' || req.user.restaurant_id) {
      // 餐廳用戶
      userId = req.user.restaurant_id || req.user.id;
      userType = 'restaurant';
    } else {
      console.error('無法識別用戶類型:', req.user);
      return res.status(403).json({
        success: false,
        message: '無權添加回覆'
      });
    }
    
    console.log(`已識別用戶類型: ${userType}, ID: ${userId}`);
    
    const replyData = {
      user_id: userId,
      user_type: userType,
      content
    };
    
    console.log('將添加回覆數據:', replyData);
    
    const newReply = await commentModel.addCommentReply(commentId, replyData);
    
    console.log('回覆添加成功:', newReply);
    
    res.status(201).json({
      success: true,
      message: '回覆添加成功',
      reply: newReply
    });
  } catch (error) {
    console.error('添加評論回覆錯誤:', error);
    res.status(500).json({
      success: false,
      message: '添加評論回覆時發生錯誤',
      error: error.message
    });
  }
};

// 點讚評論
exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const studentId = req.user.student_id;
    
    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: '必須是學生才能點讚評論'
      });
    }
    
    const result = await commentModel.likeComment(commentId, studentId);
    
    res.status(200).json({
      success: true,
      message: '點讚成功',
      ...result
    });
  } catch (error) {
    console.error('點讚評論錯誤:', error);
    res.status(500).json({
      success: false,
      message: '點讚評論時發生錯誤',
      error: error.message
    });
  }
};

// 取消點讚
exports.unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const studentId = req.user.student_id;
    
    if (!studentId) {
      return res.status(403).json({
        success: false,
        message: '必須是學生才能取消點讚評論'
      });
    }
    
    const result = await commentModel.unlikeComment(commentId, studentId);
    
    res.status(200).json({
      success: true,
      message: '取消點讚成功',
      ...result
    });
  } catch (error) {
    console.error('取消點讚錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取消點讚時發生錯誤',
      error: error.message
    });
  }
};

// 檢查用戶是否已點讚評論
exports.checkUserLiked = async (req, res) => {
  try {
    const { commentId } = req.params;
    const studentId = req.user.student_id;
    
    if (!studentId) {
      return res.status(200).json({
        success: true,
        liked: false
      });
    }
    
    const result = await commentModel.checkUserLiked(commentId, studentId);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('檢查用戶點讚狀態錯誤:', error);
    res.status(500).json({
      success: false,
      message: '檢查用戶點讚狀態時發生錯誤',
      error: error.message
    });
  }
};

// 添加評論圖片
exports.addCommentImage = async (req, res) => {
  try {
    const { commentId } = req.params;
    console.log(`接收到評論圖片上傳請求，評論ID: ${commentId}`);
    
    // 檢查評論是否存在
    try {
      // 從 db 模塊中直接引入 query 函數
      const db = require('../config/db');
      const [commentExists] = await db.query('SELECT * FROM comments WHERE comment_id = ?', [commentId]);
      console.log(`評論存在檢查結果:`, commentExists.length > 0 ? '存在' : '不存在');
      
      if (!commentExists || commentExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: `評論 ${commentId} 不存在`
        });
      }
    } catch (checkErr) {
      console.error('檢查評論存在性錯誤:', checkErr);
    }
    
    // 使用 multer 中間件處理單個文件上傳
    upload.single('image')(req, res, async function(err) {
      if (err) {
        console.error('文件上傳錯誤:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      if (!req.file) {
        console.error('沒有收到文件');
        return res.status(400).json({
          success: false,
          message: '沒有上傳圖片'
        });
      }
      
      console.log('已收到文件:', req.file);
      
      // 生成可訪問的URL - 始終使用 comments 目錄
      const imageUrl = `/uploads/comments/${req.file.filename}`;
      console.log('新圖片URL路徑:', imageUrl);
      
      console.log('圖片已保存到:', req.file.path);
      console.log('圖片URL:', imageUrl);
      console.log('圖片長度:', req.file.size, 'bytes');
      console.log('圖片類型:', req.file.mimetype);
      
      try {
        // 保存到數據庫
        const result = await commentModel.addCommentImage(commentId, imageUrl);
        console.log('圖片已保存到數據庫:', result);
        
        // 檢查圖片是否已正確保存
        const db = require('../config/db');
        const [savedImages] = await db.query('SELECT * FROM comment_images WHERE comment_id = ?', [commentId]);
        console.log(`評論 ${commentId} 的圖片數量:`, savedImages.length);
        
        res.status(201).json({
          success: true,
          message: '評論圖片添加成功',
          image: result
        });
      } catch (dbError) {
        console.error('圖片保存到數據庫錯誤:', dbError);
        res.status(500).json({
          success: false,
          message: '圖片保存到數據庫錯誤',
          error: dbError.message
        });
      }
    });
  } catch (error) {
    console.error('添加評論圖片錯誤:', error);
    res.status(500).json({
      success: false,
      message: '添加評論圖片時發生錯誤',
      error: error.message
    });
  }
};

// 刪除評論圖片
exports.deleteCommentImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    await commentModel.deleteCommentImage(imageId);
    
    res.status(200).json({
      success: true,
      message: '評論圖片刪除成功'
    });
  } catch (error) {
    console.error('刪除評論圖片錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除評論圖片時發生錯誤',
      error: error.message
    });
  }
};

// 獲取用戶的評論
exports.getUserComments = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await commentModel.getUserComments(studentId, page, limit);
    
    res.status(200).json({
      success: true,
      comments: result.comments,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('獲取用戶評論列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶評論列表時發生錯誤',
      error: error.message
    });
  }
};
