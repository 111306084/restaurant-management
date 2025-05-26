-- 修正評論表中的restaurant_id欄位類型
USE restaurant_system;

-- 先刪除外鍵約束
ALTER TABLE comments DROP FOREIGN KEY comments_ibfk_2;

-- 修改欄位類型
ALTER TABLE comments MODIFY restaurant_id INT NOT NULL;

-- 重新添加外鍵約束
ALTER TABLE comments ADD CONSTRAINT comments_ibfk_2 
FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

-- 更新restaurant_ratings表中的restaurant_id欄位（如果存在）
ALTER TABLE restaurant_ratings MODIFY restaurant_id INT NOT NULL;

-- 確保評論表中有所需的所有欄位
SHOW COLUMNS FROM comments;

-- 檢查是否有評論數據
SELECT COUNT(*) AS comment_count FROM comments;

-- 檢查評分摘要表中的數據
SELECT * FROM restaurant_ratings LIMIT 5;
