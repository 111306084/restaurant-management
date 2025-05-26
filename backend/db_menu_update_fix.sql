-- 修正索引創建語法
USE restaurant_system;

-- 檢查索引是否存在，如果不存在則創建
-- 對於 menus 表的 restaurant_id 索引
SELECT COUNT(1) INTO @index_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'menus' 
AND index_name = 'idx_menus_restaurant';

SET @create_index = CONCAT("CREATE INDEX idx_menus_restaurant ON menus(restaurant_id)");

SET @drop_index = CONCAT("DROP INDEX idx_menus_restaurant ON menus");

-- 如果索引不存在，則創建
SET @sqlstmt = IF(@index_exists = 0, @create_index, 'SELECT "Index already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 對於 menus 表的 category 索引
SELECT COUNT(1) INTO @index_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'menus' 
AND index_name = 'idx_menus_category';

SET @create_index = CONCAT("CREATE INDEX idx_menus_category ON menus(category)");

-- 如果索引不存在，則創建
SET @sqlstmt = IF(@index_exists = 0, @create_index, 'SELECT "Index already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
