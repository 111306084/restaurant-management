-- 添加 user_coupon_id 欄位
ALTER TABLE orders
ADD COLUMN user_coupon_id INT NULL AFTER coupon_id,
ADD FOREIGN KEY (user_coupon_id) REFERENCES user_coupons(user_coupon_id);

-- 更新現有訂單的 user_coupon_id
UPDATE orders o
JOIN user_coupons uc ON o.coupon_id = uc.user_coupon_id
SET o.user_coupon_id = uc.user_coupon_id,
    o.coupon_id = uc.coupon_id
WHERE o.coupon_id IS NOT NULL; 