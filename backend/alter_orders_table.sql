-- 修改 orders 表，添加優惠券相關欄位
ALTER TABLE orders 
ADD COLUMN original_amount DECIMAL(10,2) DEFAULT 0 AFTER total_amount,
ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0 AFTER original_amount,
ADD COLUMN coupon_id INT NULL AFTER discount_amount;

-- 添加外鍵約束
ALTER TABLE orders
ADD CONSTRAINT orders_coupon_fk
FOREIGN KEY (coupon_id) REFERENCES user_coupons(user_coupon_id) ON DELETE SET NULL;

-- 添加索引以優化查詢
CREATE INDEX idx_coupon_id ON orders(coupon_id);
