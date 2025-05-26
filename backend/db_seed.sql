-- 插入測試學生數據
INSERT INTO students (student_id, student_name, password, email)
VALUES 
('111306001', '測試學生1', '$2b$10$XFE/UzEVOLHAMLvZy1C3Q.0PRSCZ9GDR5aq1I.e9HY6HVpZfJ8WSW', 'student1@example.com'),
('111306002', '測試學生2', '$2b$10$XFE/UzEVOLHAMLvZy1C3Q.0PRSCZ9GDR5aq1I.e9HY6HVpZfJ8WSW', 'student2@example.com');

-- 插入測試餐廳數據
INSERT INTO restaurants (restaurant_name, password, restaurant_type, price_range, address, opening_hours)
VALUES 
('政大小吃部', '$2b$10$XFE/UzEVOLHAMLvZy1C3Q.0PRSCZ9GDR5aq1I.e9HY6HVpZfJ8WSW', '中式', '$', '政大校內', '週一至週五 10:00-20:00'),
('校園咖啡廳', '$2b$10$XFE/UzEVOLHAMLvZy1C3Q.0PRSCZ9GDR5aq1I.e9HY6HVpZfJ8WSW', '咖啡廳', '$$', '政大校內', '週一至週日 08:00-22:00');

-- 插入測試菜單數據
INSERT INTO menus (restaurant_id, item_name, description, price, category)
VALUES 
(1, '滷肉飯', '香噴噴的滷肉配上熱騰騰的白飯', 35.00, '主食'),
(1, '炒青菜', '新鮮蔬菜快炒', 25.00, '配菜'),
(2, '美式咖啡', '濃郁的美式咖啡', 45.00, '飲料'),
(2, '鬆餅', '香甜可口的鬆餅', 65.00, '點心');

-- 注意：以下密碼 '$2b$10$XFE/UzEVOLHAMLvZy1C3Q.0PRSCZ9GDR5aq1I.e9HY6HVpZfJ8WSW' 對應的明文是 'password123'
