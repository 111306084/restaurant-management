-- 修改資料類型以確保一致性

-- 將 orders 表中的 restaurant_id 從 INT 改為 VARCHAR(50)，與 restaurants 表保持一致
ALTER TABLE orders 
MODIFY COLUMN restaurant_id VARCHAR(50) NOT NULL;

-- 檢查 coupons 表的 restaurant_id 類型
-- 如果是 INT，則也需要修改為 VARCHAR(50)
ALTER TABLE coupons
MODIFY COLUMN restaurant_id VARCHAR(50) NOT NULL;

-- 現在添加外鍵約束
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
