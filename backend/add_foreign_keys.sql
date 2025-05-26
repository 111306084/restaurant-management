-- 增加外鍵約束以提高資料庫完整性

-- 為 orders 表的 restaurant_id 添加外鍵約束
ALTER TABLE orders 
ADD CONSTRAINT orders_restaurant_fk
FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

-- 為 coupons 表的 restaurant_id 添加外鍵約束
ALTER TABLE coupons
ADD CONSTRAINT coupons_restaurant_fk
FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

-- 如果 restaurant_type 是指向某個表的外鍵，則添加相應的約束
-- 假設有一個 restaurant_types 表來存儲餐廳類型
-- CREATE TABLE IF NOT EXISTS restaurant_types (
--   type_id VARCHAR(50) PRIMARY KEY,
--   type_name VARCHAR(100) NOT NULL,
--   description TEXT
-- );

-- ALTER TABLE restaurants
-- ADD CONSTRAINT restaurants_type_fk
-- FOREIGN KEY (restaurant_type) REFERENCES restaurant_types(type_id) ON DELETE SET NULL;

-- 更新訂單表中的coupon_id外鍵指向user_coupons表
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_coupon_fk;

ALTER TABLE orders
ADD CONSTRAINT orders_coupon_fk
FOREIGN KEY (coupon_id) REFERENCES user_coupons(user_coupon_id) ON DELETE SET NULL;
