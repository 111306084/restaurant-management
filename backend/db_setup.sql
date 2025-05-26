-- 創建資料庫
CREATE DATABASE IF NOT EXISTS restaurant_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restaurant_system;

-- 學生資料表
CREATE TABLE IF NOT EXISTS students (
  student_id VARCHAR(9) PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 餐廳資料表cd /Users/chiu/vue-project/backend
node server.js
CREATE TABLE IF NOT EXISTS restaurants (
  restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  restaurant_type VARCHAR(100),
  price_range VARCHAR(50),
  address VARCHAR(200),
  opening_hours VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 菜單資料表
CREATE TABLE IF NOT EXISTS menus (
  menu_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- 訂單資料表
CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(9) NOT NULL,
  restaurant_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  delivery_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- 訂單項目資料表
CREATE TABLE IF NOT EXISTS order_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(menu_id) ON DELETE CASCADE
);

-- 評論資料表
CREATE TABLE IF NOT EXISTS comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(9) NOT NULL,
  restaurant_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- 購物車資料表
CREATE TABLE IF NOT EXISTS carts (
  cart_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(9) NOT NULL,
  menu_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(menu_id) ON DELETE CASCADE,
  UNIQUE KEY (student_id, menu_id)
);

-- 瀏覽記錄資料表
CREATE TABLE IF NOT EXISTS browses (
  browse_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(9) NOT NULL,
  restaurant_id INT NOT NULL,
  browse_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- 優惠券資料表
CREATE TABLE IF NOT EXISTS coupons (
  coupon_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  code VARCHAR(20) NOT NULL,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- 廣告資料表
CREATE TABLE IF NOT EXISTS advertisements (
  ad_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT,
  image_url VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);
