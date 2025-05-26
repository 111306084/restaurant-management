/**
 * 用於診斷評論圖片相關問題的工具腳本
 */
const db = require('./config/db');

// 輔助函數: 等待一段時間
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debugImages() {
  try {
    console.log('=============== 圖片診斷工具開始 ===============');

    // 1. 檢查 comment_images 表是否存在
    console.log('\n>> 檢查表結構');
    const [tables] = await db.query('SHOW TABLES LIKE "comment_images"');
    const tableExists = tables.length > 0;
    console.log(`comment_images 表存在: ${tableExists}`);

    if (!tableExists) {
      console.error('表不存在，需要建立表');
      return;
    }

    // 2. 檢查表結構
    const [columns] = await db.query('DESCRIBE comment_images');
    console.log('表結構:');
    columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));

    // 3. 檢查評論數據
    console.log('\n>> 檢查評論數據');
    const [comments] = await db.query('SELECT comment_id FROM comments ORDER BY comment_id LIMIT 10');
    console.log(`找到 ${comments.length} 條評論`);
    console.log('評論 ID 列表:', comments.map(c => c.comment_id).join(', '));

    // 4. 檢查圖片數據
    console.log('\n>> 檢查圖片數據');
    const [imageCount] = await db.query('SELECT COUNT(*) as count FROM comment_images');
    console.log(`總共有 ${imageCount[0].count} 張圖片`);

    if (imageCount[0].count > 0) {
      const [images] = await db.query('SELECT * FROM comment_images');
      console.log('圖片數據:');
      images.forEach(img => {
        console.log(`- ID: ${img.image_id}, 評論ID: ${img.comment_id}, URL: ${img.image_url}`);
      });

      // 5. 檢查圖片與評論的關聯
      console.log('\n>> 檢查圖片與評論的關聯');
      for (const comment of comments) {
        const [images] = await db.query('SELECT * FROM comment_images WHERE comment_id = ?', [comment.comment_id]);
        console.log(`評論 ID ${comment.comment_id} 有 ${images.length} 張圖片`);
      }
    } else {
      console.log('沒有找到任何圖片記錄，將嘗試插入測試數據');
      
      // 6. 嘗試插入測試數據
      if (comments.length > 0) {
        const commentId = comments[0].comment_id;
        console.log(`將為評論 ID ${commentId} 插入測試圖片`);
        
        // 創建測試圖片記錄
        const imageUrl = '/uploads/test-image-debug.png';
        const [result] = await db.query(
          'INSERT INTO comment_images (comment_id, image_url) VALUES (?, ?)',
          [commentId, imageUrl]
        );
        
        console.log(`測試圖片已插入，ID: ${result.insertId}`);
        
        // 檢查是否成功插入
        const [inserted] = await db.query('SELECT * FROM comment_images WHERE image_id = ?', [result.insertId]);
        console.log('已插入的圖片:', inserted);
      }
    }

    console.log('\n=============== 圖片診斷工具結束 ===============');
  } catch (err) {
    console.error('診斷過程中出錯:', err);
  } finally {
    process.exit();
  }
}

// 執行診斷
debugImages();
