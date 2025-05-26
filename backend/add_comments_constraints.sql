-- 為評論表添加外鍵約束
USE restaurant_system;

-- 首先，刪除引用不存在餐廳的評論記錄
DELETE FROM comments 
WHERE restaurant_id NOT IN (SELECT restaurant_id FROM restaurants);

-- 添加外鍵約束
ALTER TABLE comments 
ADD CONSTRAINT comments_ibfk_1 FOREIGN KEY (student_id) REFERENCES students (student_id) ON DELETE CASCADE,
ADD CONSTRAINT comments_ibfk_2 FOREIGN KEY (restaurant_id) REFERENCES restaurants (restaurant_id) ON DELETE CASCADE,
ADD CONSTRAINT comments_ibfk_3 FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE SET NULL;

-- 檢查修改後的表結構
SHOW CREATE TABLE comments;

-- 檢查剩餘的評論記錄
SELECT * FROM comments;
