const db = require('./config/db');

async function insertTestImage() {
  try {
    console.log('開始測試插入評論圖片...');
    
    // 獲取一個已存在的評論ID
    const [comments] = await db.query('SELECT comment_id FROM comments LIMIT 1');
    if (comments.length === 0) {
      console.log('資料庫中沒有找到任何評論');
      return;
    }
    
    const commentId = comments[0].comment_id;
    console.log('找到評論ID:', commentId);
    
    // 插入測試圖片記錄
    const imageUrl = '/uploads/test-image.txt';
    const [result] = await db.query(
      'INSERT INTO comment_images (comment_id, image_url) VALUES (?, ?)',
      [commentId, imageUrl]
    );
    
    console.log('測試圖片已插入，ID:', result.insertId);
    
    // 驗證圖片已插入
    const [images] = await db.query(
      'SELECT * FROM comment_images WHERE comment_id = ?',
      [commentId]
    );
    
    console.log('評論的圖片:', JSON.stringify(images, null, 2));
    
    console.log('測試完成');
  } catch (err) {
    console.error('測試過程中出錯:', err);
  } finally {
    process.exit();
  }
}

// 執行測試
insertTestImage();
