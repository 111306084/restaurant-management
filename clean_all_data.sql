-- 全面清理資料庫，只保留 Lazy Pasta慵懶義式廚房 (restaurant_id = 'lazy001')
-- 並清理所有相關的表格資料

-- 暫時關閉外鍵約束檢查
SET FOREIGN_KEY_CHECKS = 0;

-- 清理評論圖片表
DELETE FROM comment_images 
WHERE comment_id IN (
  SELECT comment_id FROM comments 
  WHERE restaurant_id != 'lazy001'
);

-- 清理評論表
DELETE FROM comments 
WHERE restaurant_id != 'lazy001';

-- 清理餐廳評分表
DELETE FROM restaurant_ratings 
WHERE restaurant_id != 'lazy001';

-- 清理菜單項目表
DELETE FROM menus 
WHERE restaurant_id != 'lazy001';

-- 清理菜單分類表
DELETE FROM menu_categories 
WHERE restaurant_id != 'lazy001';

-- 清理訂單項目表
DELETE FROM order_items 
WHERE order_id IN (
  SELECT order_id FROM orders 
  WHERE restaurant_id != 'lazy001'
);

-- 清理訂單表
DELETE FROM orders 
WHERE restaurant_id != 'lazy001';

-- 清理購物車項目表
DELETE FROM cart_items 
WHERE cart_id IN (
  SELECT cart_id FROM carts 
  WHERE restaurant_id != 'lazy001'
);

-- 清理購物車表
DELETE FROM carts 
WHERE restaurant_id != 'lazy001';

-- 清理優惠券表
DELETE FROM coupons 
WHERE restaurant_id != 'lazy001';

-- 清理瀏覽記錄表
DELETE FROM browses 
WHERE restaurant_id != 'lazy001';

-- 刪除所有非 lazy001 的餐廳
DELETE FROM restaurants WHERE restaurant_id != 'lazy001';

-- 重新開啟外鍵約束檢查
SET FOREIGN_KEY_CHECKS = 1;

-- 確認剩餘的餐廳
SELECT restaurant_id, restaurant_name FROM restaurants;
