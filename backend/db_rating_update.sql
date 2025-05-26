-- 用戶評價和評分系統 - 資料庫更新腳本
USE restaurant_system;

-- 首先刪除現有的評論表及其外鍵約束
DROP TABLE IF EXISTS comment_images;
DROP TABLE IF EXISTS comment_likes;
DROP TABLE IF EXISTS comment_replies;
DROP TABLE IF EXISTS comments;

-- 創建新的評論表
CREATE TABLE IF NOT EXISTS comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(9) NOT NULL,
  restaurant_id VARCHAR(50) NOT NULL,
  order_id INT,
  food_rating INT NOT NULL CHECK (food_rating BETWEEN 1 AND 5),
  service_rating INT NOT NULL CHECK (service_rating BETWEEN 1 AND 5),
  environment_rating INT NOT NULL CHECK (environment_rating BETWEEN 1 AND 5),
  overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  content TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL
);

-- 評論圖片表
CREATE TABLE IF NOT EXISTS comment_images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  comment_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);

-- 評論回覆表
CREATE TABLE IF NOT EXISTS comment_replies (
  reply_id INT AUTO_INCREMENT PRIMARY KEY,
  comment_id INT NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  user_type ENUM('student', 'restaurant') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);

-- 評論點讚表
CREATE TABLE IF NOT EXISTS comment_likes (
  like_id INT AUTO_INCREMENT PRIMARY KEY,
  comment_id INT NOT NULL,
  student_id VARCHAR(9) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  UNIQUE KEY (comment_id, student_id)
);

-- 餐廳評分摘要表（用於快速查詢餐廳的平均評分和評論數量）
CREATE TABLE IF NOT EXISTS restaurant_ratings (
  restaurant_id VARCHAR(50) PRIMARY KEY,
  avg_food_rating DECIMAL(3, 2) DEFAULT 0,
  avg_service_rating DECIMAL(3, 2) DEFAULT 0,
  avg_environment_rating DECIMAL(3, 2) DEFAULT 0,
  avg_overall_rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- 添加索引以提高查詢效率
CREATE INDEX idx_comments_student ON comments(student_id);
CREATE INDEX idx_comments_restaurant ON comments(restaurant_id);
CREATE INDEX idx_comment_replies_comment ON comment_replies(comment_id);
CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_images_comment ON comment_images(comment_id);

-- 創建觸發器：當添加新評論時更新餐廳評分摘要
DELIMITER //
CREATE TRIGGER after_comment_insert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
  -- 如果餐廳評分摘要表中沒有該餐廳的記錄，則插入新記錄
  INSERT INTO restaurant_ratings (restaurant_id, avg_food_rating, avg_service_rating, avg_environment_rating, avg_overall_rating, total_ratings)
  SELECT 
    NEW.restaurant_id,
    AVG(food_rating),
    AVG(service_rating),
    AVG(environment_rating),
    AVG(overall_rating),
    COUNT(*)
  FROM comments
  WHERE restaurant_id = NEW.restaurant_id
  ON DUPLICATE KEY UPDATE
    avg_food_rating = VALUES(avg_food_rating),
    avg_service_rating = VALUES(avg_service_rating),
    avg_environment_rating = VALUES(avg_environment_rating),
    avg_overall_rating = VALUES(avg_overall_rating),
    total_ratings = VALUES(total_ratings);
END //

-- 創建觸發器：當更新評論時更新餐廳評分摘要
CREATE TRIGGER after_comment_update
AFTER UPDATE ON comments
FOR EACH ROW
BEGIN
  -- 更新餐廳評分摘要
  UPDATE restaurant_ratings
  SET 
    avg_food_rating = (SELECT AVG(food_rating) FROM comments WHERE restaurant_id = NEW.restaurant_id),
    avg_service_rating = (SELECT AVG(service_rating) FROM comments WHERE restaurant_id = NEW.restaurant_id),
    avg_environment_rating = (SELECT AVG(environment_rating) FROM comments WHERE restaurant_id = NEW.restaurant_id),
    avg_overall_rating = (SELECT AVG(overall_rating) FROM comments WHERE restaurant_id = NEW.restaurant_id),
    total_ratings = (SELECT COUNT(*) FROM comments WHERE restaurant_id = NEW.restaurant_id)
  WHERE restaurant_id = NEW.restaurant_id;
END //

-- 創建觸發器：當刪除評論時更新餐廳評分摘要
CREATE TRIGGER after_comment_delete
AFTER DELETE ON comments
FOR EACH ROW
BEGIN
  -- 更新餐廳評分摘要
  UPDATE restaurant_ratings
  SET 
    avg_food_rating = IFNULL((SELECT AVG(food_rating) FROM comments WHERE restaurant_id = OLD.restaurant_id), 0),
    avg_service_rating = IFNULL((SELECT AVG(service_rating) FROM comments WHERE restaurant_id = OLD.restaurant_id), 0),
    avg_environment_rating = IFNULL((SELECT AVG(environment_rating) FROM comments WHERE restaurant_id = OLD.restaurant_id), 0),
    avg_overall_rating = IFNULL((SELECT AVG(overall_rating) FROM comments WHERE restaurant_id = OLD.restaurant_id), 0),
    total_ratings = (SELECT COUNT(*) FROM comments WHERE restaurant_id = OLD.restaurant_id)
  WHERE restaurant_id = OLD.restaurant_id;
  
  -- 如果該餐廳沒有評論了，則刪除評分摘要記錄
  IF (SELECT COUNT(*) FROM comments WHERE restaurant_id = OLD.restaurant_id) = 0 THEN
    DELETE FROM restaurant_ratings WHERE restaurant_id = OLD.restaurant_id;
  END IF;
END //
DELIMITER ;

-- 測試數據（請先確認有有效的學生和餐廳數據）
-- 先查詢一個有效的學生ID
SELECT student_id FROM students LIMIT 1;

-- 先查詢一個有效的餐廳ID
SELECT restaurant_id FROM restaurants LIMIT 1;

-- 根據上述查詢結果，手動替換以下的值
-- INSERT INTO comments (student_id, restaurant_id, food_rating, service_rating, environment_rating, overall_rating, content, is_verified_purchase)
-- VALUES ('[valid_student_id]', '[valid_restaurant_id]', 4, 5, 3, 4, '食物很美味，服務態度很好，環境可以再改善一點。', TRUE);
