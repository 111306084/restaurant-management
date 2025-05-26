-- 修復評論表中的餐廳ID欄位類型
USE restaurant_system;

-- 先檢查外鍵約束
SELECT CONSTRAINT_NAME
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_NAME = 'comments'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND TABLE_SCHEMA = 'restaurant_system';

-- 刪除外鍵約束（根據實際名稱）
ALTER TABLE comments DROP FOREIGN KEY comments_ibfk_1;
-- 可能需要刪除其他外鍵，根據上面查詢的結果

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
