-- 備份所有相關表的數據
CREATE TABLE IF NOT EXISTS restaurants_backup AS SELECT * FROM restaurants;
CREATE TABLE IF NOT EXISTS browses_backup AS SELECT * FROM browses;
CREATE TABLE IF NOT EXISTS coupons_backup AS SELECT * FROM coupons;

-- 刪除所有外鍵約束
SET FOREIGN_KEY_CHECKS = 0;

-- 修改 restaurants 表的 restaurant_id 欄位
ALTER TABLE restaurants MODIFY restaurant_id VARCHAR(50) NOT NULL;

-- 修改相關表的 restaurant_id 欄位以匹配
ALTER TABLE browses MODIFY restaurant_id VARCHAR(50) NOT NULL;
ALTER TABLE coupons MODIFY restaurant_id VARCHAR(50) NOT NULL;

-- 重新啟用外鍵檢查
SET FOREIGN_KEY_CHECKS = 1;

-- 重新添加外鍵約束
ALTER TABLE browses ADD CONSTRAINT browses_ibfk_2 FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;
ALTER TABLE coupons ADD CONSTRAINT coupons_ibfk_1 FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

-- 清空所有表（因為數據類型不兼容）
TRUNCATE TABLE coupons;
TRUNCATE TABLE browses;
TRUNCATE TABLE restaurants;

-- 創建一個測試用戶，用於驗證登入功能
INSERT INTO restaurants (restaurant_id, restaurant_name, password, restaurant_type, price_range, address, opening_hours)
VALUES ('test123', '測試餐廳', '$2b$10$3Iy1hzmgpIqGLQmEGNxRxuDGkUL1I.J1cL7SsC7qwF66yHl1YhKLi', '一般餐廳', '$', '政大校園內', '09:00-21:00');
-- 注意：上面的密碼是 'password' 的 bcrypt 哈希值，您可以使用這個帳號和密碼進行測試
