-- 餐廳菜單管理功能增強 - 資料庫更新腳本
USE restaurant_system;

-- 檢查 restaurant_types 表是否存在，如果不存在則創建
CREATE TABLE IF NOT EXISTS restaurant_types (
  type_id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入一些預設的餐廳類型
INSERT IGNORE INTO restaurant_types (type_name) VALUES 
('中式料理'),
('日式料理'),
('韓式料理'),
('泰式料理'),
('義式料理'),
('美式料理'),
('法式料理'),
('印度料理'),
('墨西哥料理'),
('素食料理'),
('快餐'),
('咖啡廳'),
('甜點店'),
('飲料店');

-- 檢查 menu_categories 表是否存在，如果不存在則創建
CREATE TABLE IF NOT EXISTS menu_categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id VARCHAR(50) NOT NULL,
  category_name VARCHAR(50) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  UNIQUE KEY (restaurant_id, category_name)
);

-- 插入一些常見的菜單分類（這些會在餐廳創建時自動添加）
-- 這裡不直接插入，而是在餐廳註冊時通過API添加

-- 檢查 menus 表是否存在，如果不存在則創建
CREATE TABLE IF NOT EXISTS menus (
  menu_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id VARCHAR(50) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT '未分類',
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- 創建索引以提高查詢效率
CREATE INDEX IF NOT EXISTS idx_menus_restaurant ON menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menus_category ON menus(category);
