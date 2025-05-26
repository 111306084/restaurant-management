/**
 * 用於向特定評論添加圖片的工具腳本
 */
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

// 獲取命令行參數
const commentId = process.argv[2] || '28'; // 默認使用評論ID 28，用戶可通過命令行參數指定其他ID

async function addImageToComment(commentId) {
  try {
    console.log(`開始為評論ID ${commentId} 添加圖片...`);
    
    // 1. 檢查評論是否存在
    const [comments] = await db.query('SELECT * FROM comments WHERE comment_id = ?', [commentId]);
    if (comments.length === 0) {
      console.error(`評論ID ${commentId} 不存在!`);
      return;
    }
    
    console.log(`找到評論: ID=${commentId}, 內容="${comments[0].content}"`);
    
    // 2. 創建測試圖片
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const testImagePath = path.join(uploadsDir, `test-image-${commentId}.png`);
    
    // 創建一個簡單的文本文件作為測試圖片
    fs.writeFileSync(testImagePath, `This is a test image for comment ${commentId}`);
    
    console.log(`已創建測試圖片: ${testImagePath}`);
    
    // 3. 添加圖片記錄到數據庫
    const imageUrl = `/uploads/test-image-${commentId}.png`;
    
    // 檢查是否已存在此評論的圖片
    const [existingImages] = await db.query(
      'SELECT * FROM comment_images WHERE comment_id = ? AND image_url = ?',
      [commentId, imageUrl]
    );
    
    if (existingImages.length > 0) {
      console.log(`評論已有相同URL的圖片，跳過插入`);
    } else {
      const [result] = await db.query(
        'INSERT INTO comment_images (comment_id, image_url) VALUES (?, ?)',
        [commentId, imageUrl]
      );
      
      console.log(`圖片記錄已添加，ID: ${result.insertId}`);
    }
    
    // 4. 驗證圖片是否已關聯到評論
    const [images] = await db.query('SELECT * FROM comment_images WHERE comment_id = ?', [commentId]);
    console.log(`評論ID ${commentId} 現在有 ${images.length} 張圖片:`);
    images.forEach(img => {
      console.log(`- ID: ${img.image_id}, URL: ${img.image_url}`);
    });
    
    console.log('操作完成！');
  } catch (err) {
    console.error('添加圖片過程中出錯:', err);
  } finally {
    process.exit();
  }
}

// 執行添加圖片的操作
addImageToComment(commentId);
