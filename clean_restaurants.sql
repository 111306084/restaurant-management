-- 保留 Lazy Pasta慵懶義式廚房 (restaurant_id = 'lazy001')，刪除其他餐廳
-- 首先刪除與餐廳相關的外鍵數據

-- 刪除評論圖片
DELETE FROM comment_images 
WHERE comment_id IN (
  SELECT comment_id FROM comments 
  WHERE restaurant_id != 'lazy001'
);

-- 刪除評論
DELETE FROM comments 
WHERE restaurant_id != 'lazy001';

-- 刪除餐廳評分
DELETE FROM restaurant_ratings 
WHERE restaurant_id != 'lazy001';

-- 刪除菜單項目
DELETE FROM menus 
WHERE restaurant_id != 'lazy001';

-- 刪除菜單分類
DELETE FROM menu_categories 
WHERE restaurant_id != 'lazy001';

-- 刪除訂單項目
DELETE FROM order_items 
WHERE order_id IN (
  SELECT order_id FROM orders 
  WHERE restaurant_id != 'lazy001'
);

-- 刪除訂單
DELETE FROM orders 
WHERE restaurant_id != 'lazy001';

-- 刪除購物車項目
DELETE FROM cart_items 
WHERE cart_id IN (
  SELECT cart_id FROM carts 
  WHERE restaurant_id != 'lazy001'
);

-- 刪除購物車
DELETE FROM carts 
WHERE restaurant_id != 'lazy001';

-- 刪除優惠券
DELETE FROM coupons 
WHERE restaurant_id != 'lazy001';

-- 刪除瀏覽記錄
DELETE FROM browses 
WHERE restaurant_id != 'lazy001';

-- 最後刪除餐廳
DELETE FROM restaurants 
WHERE restaurant_id != 'lazy001';

-- 確認剩餘的餐廳
SELECT * FROM restaurants;
