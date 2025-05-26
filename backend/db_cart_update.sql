-- 購物車資料持久化存儲 - 資料庫更新腳本
USE restaurant_system;

-- 首先刪除現有的購物車表及其外鍵約束
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;

-- 檢查 menus 表的 menu_id 列類型
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'restaurant_system' 
AND TABLE_NAME = 'menus' 
AND COLUMN_NAME = 'menu_id';

-- 創建新的購物車表
CREATE TABLE IF NOT EXISTS carts (
  cart_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(9) NOT NULL,
  restaurant_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  UNIQUE KEY (student_id, restaurant_id)
);

-- 創建購物車項目表
CREATE TABLE IF NOT EXISTS cart_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  menu_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(menu_id) ON DELETE CASCADE,
  UNIQUE KEY (cart_id, menu_id)
);

-- 添加索引以提高查詢效率
CREATE INDEX idx_cart_student ON carts(student_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- 測試數據（請先確認有有效的學生和餐廳數據）
-- 先查詢一個有效的學生ID
SELECT student_id FROM students LIMIT 1;

-- 先查詢一個有效的餐廳ID
SELECT restaurant_id FROM restaurants LIMIT 1;

-- 先查詢一個有效的菜單項目ID
SELECT menu_id FROM menus LIMIT 1;

-- 根據上述查詢結果，手動替換以下的值
-- INSERT INTO carts (student_id, restaurant_id) VALUES ('[valid_student_id]', '[valid_restaurant_id]');
-- INSERT INTO cart_items (cart_id, menu_id, quantity, price) VALUES (1, [valid_menu_id], 2, 120.00);
