-- 第一步：修改資料類型以確保一致性
ALTER TABLE orders 
MODIFY COLUMN restaurant_id VARCHAR(50) NOT NULL;

ALTER TABLE coupons
MODIFY COLUMN restaurant_id VARCHAR(50) NOT NULL;

-- 第二步：修正數據 - 將 orders 表中 restaurant_id 為 0 的記錄更新為有效值
-- 假設 '000000' 是一個有效的餐廳ID（根據之前的日誌顯示）
UPDATE orders SET restaurant_id = '000000' WHERE restaurant_id = '0';

-- 第三步：添加外鍵約束
-- 為 orders 表的 restaurant_id 添加外鍵約束
ALTER TABLE orders 
ADD CONSTRAINT orders_restaurant_fk
FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

-- 為 coupons 表的 restaurant_id 添加外鍵約束
ALTER TABLE coupons
ADD CONSTRAINT coupons_restaurant_fk
FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

-- 更新訂單表中的coupon_id外鍵指向user_coupons表
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_coupon_fk;

ALTER TABLE orders
ADD CONSTRAINT orders_coupon_fk
FOREIGN KEY (coupon_id) REFERENCES user_coupons(user_coupon_id) ON DELETE SET NULL;
