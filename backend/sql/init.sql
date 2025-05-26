-- 創建學生表
CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(10) PRIMARY KEY,
    student_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 創建餐廳表
CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id VARCHAR(10) PRIMARY KEY,
    restaurant_name VARCHAR(100) NOT NULL,
    restaurant_type VARCHAR(50),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 創建菜單表
CREATE TABLE IF NOT EXISTS menus (
    menu_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id VARCHAR(10) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

-- 創建優惠券表
CREATE TABLE IF NOT EXISTS coupons (
    coupon_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id VARCHAR(10) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    discount_type ENUM('fixed', 'percentage') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

-- 創建用戶優惠券表
CREATE TABLE IF NOT EXISTS user_coupons (
    user_coupon_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10) NOT NULL,
    coupon_id INT NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    order_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id)
);

-- 創建購物車表
CREATE TABLE IF NOT EXISTS carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10) NOT NULL,
    restaurant_id VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

-- 創建購物車項目表
CREATE TABLE IF NOT EXISTS cart_items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    menu_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id),
    FOREIGN KEY (menu_id) REFERENCES menus(menu_id)
);

-- 創建訂單表
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10) NOT NULL,
    restaurant_id VARCHAR(10) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    original_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL,
    delivery_address TEXT,
    coupon_id INT NULL,
    user_coupon_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id),
    FOREIGN KEY (user_coupon_id) REFERENCES user_coupons(user_coupon_id)
);

-- 創建訂單項目表
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (menu_id) REFERENCES menus(menu_id)
);

-- 創建評論表
CREATE TABLE IF NOT EXISTS comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10) NOT NULL,
    restaurant_id VARCHAR(10) NOT NULL,
    order_id INT NULL,
    food_rating INT NOT NULL,
    service_rating INT NOT NULL,
    environment_rating INT NOT NULL,
    overall_rating INT NOT NULL,
    content TEXT,
    image_url TEXT,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 創建評論點讚表
CREATE TABLE IF NOT EXISTS comment_likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    student_id VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(comment_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    UNIQUE KEY unique_like (comment_id, student_id)
);

-- 創建評分摘要表
CREATE TABLE IF NOT EXISTS rating_summaries (
    restaurant_id VARCHAR(10) PRIMARY KEY,
    avg_food_rating DECIMAL(3,2) DEFAULT 0,
    avg_service_rating DECIMAL(3,2) DEFAULT 0,
    avg_environment_rating DECIMAL(3,2) DEFAULT 0,
    avg_overall_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
); 