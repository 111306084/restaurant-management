-- 修復評論表中的餐廳ID欄位類型
USE restaurant_system;

-- 先備份評論表
CREATE TABLE IF NOT EXISTS comments_backup LIKE comments;
INSERT INTO comments_backup SELECT * FROM comments;

-- 刪除外鍵約束
ALTER TABLE comments DROP FOREIGN KEY comments_ibfk_1;
ALTER TABLE comments DROP FOREIGN KEY comments_ibfk_3;

-- 刪除索引
ALTER TABLE comments DROP INDEX idx_comments_restaurant;

-- 修改餐廳ID欄位類型
ALTER TABLE comments MODIFY COLUMN restaurant_id VARCHAR(50) NOT NULL;

-- 重新創建索引
ALTER TABLE comments ADD INDEX idx_comments_restaurant (restaurant_id);

-- 重新添加外鍵約束
ALTER TABLE comments 
ADD CONSTRAINT comments_ibfk_1 FOREIGN KEY (student_id) REFERENCES students (student_id) ON DELETE CASCADE,
ADD CONSTRAINT comments_ibfk_2 FOREIGN KEY (restaurant_id) REFERENCES restaurants (restaurant_id) ON DELETE CASCADE,
ADD CONSTRAINT comments_ibfk_3 FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE SET NULL;

-- 檢查修改後的表結構
DESCRIBE comments;
