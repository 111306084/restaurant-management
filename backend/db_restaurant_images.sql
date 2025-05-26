-- 創建餐廳圖片表
USE restaurant_system;

-- 檢查表是否存在，如不存在則創建
CREATE TABLE IF NOT EXISTS restaurant_images (
  image_id VARCHAR(50) PRIMARY KEY,
  restaurant_id VARCHAR(50) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  image_type VARCHAR(20) DEFAULT 'other',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- 添加索引
-- 先檢查索引是否存在，如果不存在則創建
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
              WHERE table_schema = 'restaurant_system' 
              AND table_name = 'restaurant_images' 
              AND index_name = 'idx_restaurant_images_restaurant_id');

SET @sqlstmt := IF(@exist > 0, 'SELECT "索引已存在"', 'CREATE INDEX idx_restaurant_images_restaurant_id ON restaurant_images(restaurant_id)');

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
