-- 保留 Lazy Pasta慵懶義式廚房 (restaurant_id = 'lazy001')，刪除其他餐廳
-- 使用更安全的方式處理外鍵約束

-- 暫時關閉外鍵約束檢查
SET FOREIGN_KEY_CHECKS = 0;

-- 刪除所有非 lazy001 的餐廳
DELETE FROM restaurants WHERE restaurant_id != 'lazy001';

-- 重新開啟外鍵約束檢查
SET FOREIGN_KEY_CHECKS = 1;

-- 確認剩餘的餐廳
SELECT restaurant_id, restaurant_name FROM restaurants;
