-- 清除範例餐廳的 SQL 腳本
USE restaurant_system;

-- 先備份餐廳表，以防萬一
CREATE TABLE IF NOT EXISTS restaurants_backup_before_clean LIKE restaurants;
INSERT INTO restaurants_backup_before_clean SELECT * FROM restaurants;

-- 保留的餐廳 ID 列表（真正的商家餐廳）
-- 根據餐廳名稱判斷，保留看起來像真實餐廳的記錄
-- 這裡我們保留 "高句麗韓式料理", "喜記港式燒臘", "政大烤場", "Lazy Pasta慵懶義式廚房", "Lazy Pasta"
-- 如果有其他需要保留的餐廳，請在此列表中添加

-- 刪除不在保留列表中的餐廳
DELETE FROM restaurants 
WHERE restaurant_id NOT IN (
    '123456',  -- 高句麗韓式料理
    '234567',  -- 喜記港式燒臘
    '345678',  -- 政大烤場
    'lazy001', -- Lazy Pasta慵懶義式廚房
    'lazypasta' -- Lazy Pasta
);

-- 顯示剩餘的餐廳
SELECT restaurant_id, restaurant_name FROM restaurants;
