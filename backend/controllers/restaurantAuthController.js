const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
require('dotenv').config();

// 餐廳登入
exports.login = async (req, res) => {
  try {
    const { restaurant_id, password } = req.body;
    
    // 驗證請求體
    if (!restaurant_id || !password) {
      return res.status(400).json({ message: '請提供商家帳號和密碼' });
    }
    
    console.log('後端收到的登入請求:', { restaurant_id, password: '***隱藏***' });
    
    // 查找餐廳 - 使用字符串形式的restaurant_id
    const [restaurants] = await pool.query(
      'SELECT * FROM restaurants WHERE restaurant_id = ?',
      [restaurant_id.toString()]
    );
    
    console.log('查詢結果數量:', restaurants.length);
    
    if (restaurants.length === 0) {
      return res.status(401).json({ message: '商家帳號或密碼錯誤' });
    }
    
    const restaurant = restaurants[0];
    
    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, restaurant.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '商家帳號或密碼錯誤' });
    }
    
    // 生成 JWT token
    const token = jwt.sign(
      { 
        id: restaurant.restaurant_id,
        name: restaurant.restaurant_name,
        role: 'restaurant'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    console.log('令牌生成成功');
    
    // 返回成功響應
    return res.status(200).json({
      message: '登入成功',
      token,
      restaurant: {
        restaurant_id: restaurant.restaurant_id,
        restaurant_name: restaurant.restaurant_name,
        restaurant_type: restaurant.restaurant_type,
        address: restaurant.address
      }
    });
  } catch (error) {
    console.error('餐廳登入錯誤:', error);
    return res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};

// 餐廳註冊
exports.register = async (req, res) => {
  try {
    const { account_id, restaurant_name, password } = req.body;
    
    // 驗證請求體
    if (!account_id || !restaurant_name || !password) {
      return res.status(400).json({ message: '請提供商家帳號、餐廳名稱和密碼' });
    }
    
    // 檢查餐廳名稱或帳號是否已存在
    const [existingRestaurants] = await pool.query(
      'SELECT * FROM restaurants WHERE restaurant_name = ? OR restaurant_id = ?',
      [restaurant_name, account_id]
    );
    
    if (existingRestaurants.length > 0) {
      // 檢查是哪個欄位重複
      const idExists = existingRestaurants.some(r => r.restaurant_id === account_id);
      const nameExists = existingRestaurants.some(r => r.restaurant_name === restaurant_name);
      
      if (idExists) {
        return res.status(409).json({ message: '此商家帳號已被註冊' });
      } else if (nameExists) {
        return res.status(409).json({ message: '此餐廳名稱已被註冊' });
      }
    }
    
    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 創建新餐廳，使用帳號ID作為餐廳ID
    await pool.query(
      `INSERT INTO restaurants (restaurant_id, restaurant_name, password) 
       VALUES (?, ?, ?)`,
      [account_id, restaurant_name, hashedPassword]
    );
    
    // 獲取新創建的餐廳
    const [newRestaurants] = await pool.query(
      'SELECT * FROM restaurants WHERE restaurant_id = ?',
      [account_id]
    );
    
    const newRestaurant = newRestaurants[0];
    
    // 返回成功響應
    return res.status(201).json({
      message: '註冊成功',
      restaurant: {
        restaurant_id: newRestaurant.restaurant_id,
        restaurant_name: newRestaurant.restaurant_name
      }
    });
  } catch (error) {
    console.error('餐廳註冊錯誤:', error);
    return res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};
