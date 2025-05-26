-- 更新餐廳資料表結構
USE restaurant_system;

-- 首先刪除依賴於restaurants表的外鍵約束
ALTER TABLE menus
DROP FOREIGN KEY menus_ibfk_1;

ALTER TABLE orders
DROP FOREIGN KEY orders_ibfk_2;

ALTER TABLE comments
DROP FOREIGN KEY comments_ibfk_2;

-- 處理瀏覽記錄表的外鍵
ALTER TABLE browses
DROP FOREIGN KEY browses_ibfk_2;

-- 檢查是否有其他表引用restaurants表
-- 如果有廣告表，也需要刪除其外鍵
ALTER TABLE advertisements
DROP FOREIGN KEY advertisements_ibfk_1;

-- 修改restaurant_id欄位類型
ALTER TABLE restaurants 
MODIFY COLUMN restaurant_id VARCHAR(50) NOT NULL,
DROP PRIMARY KEY,
ADD PRIMARY KEY (restaurant_id);

-- 重新添加外鍵約束
ALTER TABLE menus
ADD CONSTRAINT menus_ibfk_1 FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

ALTER TABLE orders
ADD CONSTRAINT orders_ibfk_2 FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

ALTER TABLE comments
ADD CONSTRAINT comments_ibfk_2 FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

-- 重新添加瀏覽記錄表的外鍵
ALTER TABLE browses
ADD CONSTRAINT browses_ibfk_2 FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

-- 如果有廣告表，也需要重新添加其外鍵
ALTER TABLE advertisements
ADD CONSTRAINT advertisements_ibfk_1 FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

-- 清空現有餐廳資料（如果有的話）
TRUNCATE TABLE restaurants;

-- 更新完成後的確認訊息
SELECT 'Database structure updated successfully!' AS message;
