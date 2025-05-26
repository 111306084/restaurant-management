-- 更新餐廳資料表，添加更多展示資訊欄位
ALTER TABLE restaurants 
ADD COLUMN logo_url VARCHAR(255) AFTER restaurant_name,
ADD COLUMN email VARCHAR(100) AFTER phone,
ADD COLUMN website VARCHAR(255) AFTER email,
ADD COLUMN avg_preparation_time INT AFTER opening_hours,
ADD COLUMN delivery_fee DECIMAL(10, 2) AFTER avg_preparation_time,
ADD COLUMN min_order_amount DECIMAL(10, 2) AFTER delivery_fee,
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE AFTER min_order_amount,
ADD COLUMN tags VARCHAR(255) AFTER is_featured,
ADD COLUMN location_lat DECIMAL(10, 8) AFTER tags,
ADD COLUMN location_lng DECIMAL(10, 8) AFTER location_lat;

-- 創建餐廳圖片資料表（用於存儲多張餐廳照片）
CREATE TABLE IF NOT EXISTS restaurant_images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  image_type ENUM('interior', 'exterior', 'food', 'menu', 'other') NOT NULL DEFAULT 'other',
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (restaurant_id),
  CONSTRAINT fk_restaurant_images FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- 創建餐廳營業時間資料表（用於存儲每天的營業時間）
CREATE TABLE IF NOT EXISTS restaurant_hours (
  hour_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (restaurant_id),
  CONSTRAINT fk_restaurant_hours FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- 創建餐廳評分摘要資料表（用於快速獲取餐廳評分統計）
CREATE TABLE IF NOT EXISTS restaurant_ratings (
  rating_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  avg_food_rating DECIMAL(3, 2) DEFAULT 0,
  avg_service_rating DECIMAL(3, 2) DEFAULT 0,
  avg_environment_rating DECIMAL(3, 2) DEFAULT 0,
  avg_overall_rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (restaurant_id),
  CONSTRAINT fk_restaurant_ratings FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  UNIQUE KEY (restaurant_id)
);
