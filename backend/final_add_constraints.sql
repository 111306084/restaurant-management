-- 第一步：修正數據 - 將 orders 表中 restaurant_id 為 0 的記錄更新為有效值
-- 根據之前的記憶，'000000' 是一個有效的餐廳ID（關東煮）
UPDATE orders SET restaurant_id = '000000' WHERE restaurant_id = '0';

-- 同樣修正 coupons 表中的數據
UPDATE coupons SET restaurant_id = '000000' WHERE restaurant_id = '0';

-- 第二步：添加缺少的外鍵約束
-- 為 orders 表的 restaurant_id 添加外鍵約束
ALTER TABLE orders 
ADD CONSTRAINT orders_restaurant_fk
FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

-- 為 coupons 表的 restaurant_id 添加外鍵約束
ALTER TABLE coupons
ADD CONSTRAINT coupons_restaurant_fk
FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;
