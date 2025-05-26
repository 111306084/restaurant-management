-- 首先刪除現有的購物車表及其外鍵約束
DROP TABLE IF EXISTS carts;

-- 創建新的購物車表
CREATE TABLE IF NOT EXISTS carts (
  cart_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(9) NOT NULL,
  restaurant_id INT NOT NULL,
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
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);-- 先備份原始資料（如果有的話）
CREATE TABLE IF NOT EXISTS restaurants_backup AS SELECT * FROM restaurants;

-- 刪除與 restaurants 表相關的外鍵約束
ALTER TABLE browses DROP FOREIGN KEY browses_ibfk_2;
ALTER TABLE coupons DROP FOREIGN KEY coupons_ibfk_1;

-- 修改 restaurants 表的 restaurant_id 欄位，移除自動遞增屬性
ALTER TABLE restaurants CHANGE COLUMN restaurant_id restaurant_id VARCHAR(50) NOT NULL;

-- 重新添加外鍵約束
ALTER TABLE browses ADD CONSTRAINT browses_ibfk_2 FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;
ALTER TABLE coupons ADD CONSTRAINT coupons_ibfk_1 FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

-- 清空原始資料表（因為資料型別不相容）
TRUNCATE TABLE restaurants;
