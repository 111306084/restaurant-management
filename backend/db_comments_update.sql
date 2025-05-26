-- 更新評論資料表，添加詳細評分欄位
ALTER TABLE comments 
ADD COLUMN food_rating INT NOT NULL DEFAULT 0 CHECK (food_rating BETWEEN 0 AND 5) AFTER rating,
ADD COLUMN service_rating INT NOT NULL DEFAULT 0 CHECK (service_rating BETWEEN 0 AND 5) AFTER food_rating,
ADD COLUMN environment_rating INT NOT NULL DEFAULT 0 CHECK (environment_rating BETWEEN 0 AND 5) AFTER service_rating,
ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE AFTER content,
ADD COLUMN likes_count INT DEFAULT 0 AFTER is_anonymous;

-- 重命名原有的 rating 欄位為 overall_rating
ALTER TABLE comments CHANGE COLUMN rating overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5);

-- 創建評論圖片資料表
CREATE TABLE IF NOT EXISTS comment_images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  comment_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (comment_id),
  CONSTRAINT fk_comment_images FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);

-- 創建評論點讚資料表
CREATE TABLE IF NOT EXISTS comment_likes (
  like_id INT AUTO_INCREMENT PRIMARY KEY,
  comment_id INT NOT NULL,
  student_id VARCHAR(9) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (comment_id),
  INDEX (student_id),
  CONSTRAINT fk_comment_likes_comment FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_likes_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  UNIQUE KEY (comment_id, student_id)
);

-- 創建評論回覆資料表
CREATE TABLE IF NOT EXISTS comment_replies (
  reply_id INT AUTO_INCREMENT PRIMARY KEY,
  comment_id INT NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  user_type ENUM('student', 'restaurant') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (comment_id),
  CONSTRAINT fk_comment_replies FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);
