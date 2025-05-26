-- 創建 user_coupons 表
CREATE TABLE IF NOT EXISTS `user_coupons` (
  `user_coupon_id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `coupon_id` INT NOT NULL,
  `claimed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `is_used` BOOLEAN DEFAULT FALSE,
  `used_at` DATETIME NULL,
  `order_id` INT NULL,
  
  -- 外鍵約束
  CONSTRAINT `user_coupons_ibfk_1` FOREIGN KEY (`student_id`) 
    REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `user_coupons_ibfk_2` FOREIGN KEY (`coupon_id`) 
    REFERENCES `coupons` (`coupon_id`) ON DELETE CASCADE,
  CONSTRAINT `user_coupons_ibfk_3` FOREIGN KEY (`order_id`) 
    REFERENCES `orders` (`order_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 添加索引以優化查詢性能
CREATE INDEX `idx_student_id` ON `user_coupons` (`student_id`);
CREATE INDEX `idx_coupon_id` ON `user_coupons` (`coupon_id`);
CREATE INDEX `idx_is_used` ON `user_coupons` (`is_used`);
