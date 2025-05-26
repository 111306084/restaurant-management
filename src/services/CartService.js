import api from './api';

// 購物車存儲鍵 - 用於本地緩存
const CART_STORAGE_KEY = 'food_delivery_cart';

/**
 * 確保對象有效
 * @param {Object} obj 要檢查的對象
 * @returns {boolean} 對象是否有效
 */
const isValidObject = (obj) => {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
};

/**
 * 購物車服務類
 */
export default {
  /**
   * 獲取購物車數據
   * @returns {Object} 返回購物車數據對象，包含餐廳信息和商品列表
   */
  async getCart() {
    try {
      // 檢查用戶是否已登入
      const isLoggedIn = localStorage.getItem('user_logged_in') === 'true' || 
                        localStorage.getItem('merchantLoggedIn') === 'true' || 
                        localStorage.getItem('student') !== null;
      
      if (!isLoggedIn) {
        // 如果未登入，使用本地存儲
        const cartData = localStorage.getItem(CART_STORAGE_KEY);
        if (!cartData) {
          return { restaurant: null, items: [] };
        }
        
        const parsedData = JSON.parse(cartData);
        
        // 確保數據格式正確
        if (!isValidObject(parsedData)) {
          console.error('Invalid cart data format');
          return { restaurant: null, items: [] };
        }
        
        // 確保items是數組
        if (!Array.isArray(parsedData.items)) {
          parsedData.items = [];
        }
        
        return {
          restaurant: parsedData.restaurant || null,
          items: parsedData.items || []
        };
      } else {
        // 如果已登入，從後端獲取購物車數據
        try {
          const response = await api.get('/cart');
          
          if (response.success) {
            // 將後端數據轉換為前端格式
            const cartData = {
              restaurant: response.cart ? {
                id: response.cart.restaurant_id,
                name: response.cart.restaurant_name || '餐廳'
              } : null,
              items: response.items.map(item => ({
                id: item.menu_id,
                name: item.item_name,
                price: parseFloat(item.price),
                quantity: item.quantity,
                totalPrice: parseFloat(item.price) * item.quantity,
                notes: item.special_instructions,
                category: item.category,
                cartItemId: item.item_id // 保存購物車項目ID用於後續操作
              }))
            };
            
            // 同步到本地存儲以便離線使用
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
            
            return cartData;
          }
        } catch (apiError) {
          console.error('Error fetching cart from API:', apiError);
          // 如果API調用失敗，回退到本地存儲
          const cartData = localStorage.getItem(CART_STORAGE_KEY);
          if (cartData) {
            return JSON.parse(cartData);
          }
        }
      }
      
      return { restaurant: null, items: [] };
    } catch (error) {
      console.error('Error getting cart data:', error);
      return { restaurant: null, items: [] };
    }
  },

  /**
   * 添加商品到購物車
   * @param {Object} restaurant 餐廳信息
   * @param {Object} item 要添加的商品
   * @returns {Boolean} 是否添加成功
   */
  async addToCart(restaurant, item) {
    try {
      // 驗證必要參數
      if (!isValidObject(restaurant) || !restaurant.id) {
        console.error('Invalid restaurant object');
        return false;
      }
      
      if (!isValidObject(item) || !item.id) {
        console.error('Invalid item object');
        return false;
      }
      
      const cart = await this.getCart();
      
      // 如果購物車非空且餐廳不同，需要先清空購物車
      if (cart.restaurant && cart.items.length > 0 && cart.restaurant.id !== restaurant.id) {
        const message = `您的購物車中已有來自「${cart.restaurant.name || '其他餐廳'}」的商品，是否清空購物車添加新商品？`;
        if (!window.confirm(message)) {
          return false;
        }
        // 強制清空購物車
        await this.clearCart();
        // 重新獲取已清空的購物車
        const newEmptyCart = await this.getCart();
        cart.restaurant = newEmptyCart.restaurant;
        cart.items = newEmptyCart.items;
      }
      
      // 確保item有正確的總價
      const itemCopy = { ...item };
      if (!itemCopy.totalPrice) {
        itemCopy.totalPrice = itemCopy.price * itemCopy.quantity;
      }
      
      // 檢查用戶是否已登入
      const isLoggedIn = localStorage.getItem('user_logged_in') === 'true' || 
                        localStorage.getItem('merchantLoggedIn') === 'true' || 
                        localStorage.getItem('student') !== null;
      
      if (isLoggedIn) {
        try {
          // 如果已登入，使用API添加到購物車
          const studentData = localStorage.getItem('student');
          if (studentData) {
            // 發送API請求
            const response = await api.post('/cart/items', {
              restaurant_id: restaurant.id,
              menu_id: item.id,
              quantity: item.quantity,
              special_instructions: item.notes || ''
            });
            
            if (response.success) {
              // 觸發購物車更新事件
              window.dispatchEvent(new Event('cartUpdated'));
              return true;
            }
          }
        } catch (apiError) {
          console.error('Error adding to cart via API:', apiError);
          // 如果API調用失敗，回退到本地存儲
        }
      }
      
      // 本地存儲邏輯（用於未登入用戶或API調用失敗的情況）
      // 設置餐廳信息 - 創建深拷貝避免引用問題
      const restaurantCopy = { ...restaurant };
      
      const newCart = {
        restaurant: restaurantCopy,
        items: [...(cart.items || [])]
      };
      
      // 嘗試查找相同商品
      const existingItemIndex = newCart.items.findIndex(
        cartItem => cartItem.id === itemCopy.id && cartItem.size === itemCopy.size && cartItem.notes === itemCopy.notes
      );
      
      if (existingItemIndex !== -1) {
        // 已存在相同商品，增加數量
        newCart.items[existingItemIndex].quantity += itemCopy.quantity;
        newCart.items[existingItemIndex].totalPrice = newCart.items[existingItemIndex].price * newCart.items[existingItemIndex].quantity;
      } else {
        // 添加新商品
        newCart.items.push(itemCopy);
      }
      
      // 保存購物車
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      
      // 觸發storage事件，讓導航欄購物車數量更新
      window.dispatchEvent(new Event('cartUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  },

  /**
   * 更新購物車中的商品數量
   * @param {Number} index 商品在購物車中的索引
   * @param {Number} quantity 新的數量
   */
  async updateItemQuantity(index, quantity) {
    try {
      // 驗證參數
      if (typeof index !== 'number' || index < 0 || !Number.isInteger(index)) {
        console.error('Invalid index:', index);
        return;
      }
      
      if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
        console.error('Invalid quantity:', quantity);
        return;
      }
      
      const cart = await this.getCart();
      if (!cart || !Array.isArray(cart.items) || index >= cart.items.length) {
        console.error('Invalid cart or index out of bounds');
        return;
      }
      
      const item = cart.items[index];
      
      // 檢查用戶是否已登入
      const isLoggedIn = localStorage.getItem('user_logged_in') === 'true' || 
                        localStorage.getItem('merchantLoggedIn') === 'true' || 
                        localStorage.getItem('student') !== null;
      
      if (isLoggedIn && item.cartItemId) {
        try {
          // 如果已登入且有購物車項目ID，使用API更新數量
          const response = await api.put(`/cart/items/${item.cartItemId}`, {
            quantity: quantity
          });
          
          if (response.success) {
            // 觸發購物車更新事件
            window.dispatchEvent(new Event('cartUpdated'));
            return;
          }
        } catch (apiError) {
          console.error('Error updating cart item via API:', apiError);
          // 如果API調用失敗，回退到本地存儲
        }
      }
      
      // 本地存儲邏輯（用於未登入用戶或API調用失敗的情況）
      cart.items[index].quantity = quantity;
      cart.items[index].totalPrice = cart.items[index].price * quantity;
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      
      // 觸發storage事件
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error updating item quantity:', error);
    }
  },

  /**
   * 從購物車中移除商品
   * @param {Number} index 商品在購物車中的索引
   */
  async removeItem(index) {
    try {
      // 驗證參數
      if (typeof index !== 'number' || index < 0 || !Number.isInteger(index)) {
        console.error('Invalid index:', index);
        return;
      }
      
      const cart = await this.getCart();
      if (!cart || !Array.isArray(cart.items) || index >= cart.items.length) {
        console.error('Invalid cart or index out of bounds');
        return;
      }
      
      const item = cart.items[index];
      
      // 檢查用戶是否已登入
      const isLoggedIn = localStorage.getItem('user_logged_in') === 'true' || 
                        localStorage.getItem('merchantLoggedIn') === 'true' || 
                        localStorage.getItem('student') !== null;
      
      if (isLoggedIn && item.cartItemId) {
        try {
          // 如果已登入且有購物車項目ID，使用API刪除項目
          const response = await api.delete(`/cart/items/${item.cartItemId}`);
          
          if (response.success) {
            // 觸發購物車更新事件
            window.dispatchEvent(new Event('cartUpdated'));
            return;
          }
        } catch (apiError) {
          console.error('Error removing cart item via API:', apiError);
          // 如果API調用失敗，回退到本地存儲
        }
      }
      
      // 本地存儲邏輯（用於未登入用戶或API調用失敗的情況）
      cart.items.splice(index, 1);
      
      // 如果購物車為空，也清空餐廳信息
      if (cart.items.length === 0) {
        cart.restaurant = null;
      }
      
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      
      // 觸發storage事件
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  },

  /**
   * 清空購物車
   */
  async clearCart() {
    try {
      // 檢查用戶是否已登入
      const isLoggedIn = localStorage.getItem('user_logged_in') === 'true' || 
                        localStorage.getItem('merchantLoggedIn') === 'true' || 
                        localStorage.getItem('student') !== null;
      
      if (isLoggedIn) {
        try {
          // 如果已登入，使用API清空購物車
          const response = await api.delete('/cart');
          
          if (response.success) {
            // 同步清空本地存儲
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ restaurant: null, items: [] }));
            // 觸發購物車更新事件
            window.dispatchEvent(new Event('cartUpdated'));
            return;
          }
        } catch (apiError) {
          console.error('Error clearing cart via API:', apiError);
          // 如果API調用失敗，回退到本地存儲
        }
      }
      
      // 本地存儲邏輯（用於未登入用戶或API調用失敗的情況）
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ restaurant: null, items: [] }));
      
      // 觸發storage事件
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },

  /**
   * 獲取購物車中的商品總數
   * @returns {Number} 購物車中的商品總數
   */
  async getItemCount() {
    try {
      // 檢查用戶是否已登入
      const isLoggedIn = localStorage.getItem('user_logged_in') === 'true' || 
                        localStorage.getItem('merchantLoggedIn') === 'true' || 
                        localStorage.getItem('student') !== null;
      
      if (isLoggedIn) {
        try {
          // 如果已登入，使用API獲取購物車項目數量
          const response = await api.get('/cart/count');
          
          if (response.success) {
            return response.count;
          }
        } catch (apiError) {
          console.error('Error getting cart count via API:', apiError);
          // 如果API調用失敗，回退到本地存儲
        }
      }
      
      // 本地存儲邏輯（用於未登入用戶或API調用失敗的情況）
      const cart = await this.getCart();
      if (!cart || !Array.isArray(cart.items)) {
        return 0;
      }
      return cart.items.reduce((count, item) => {
        const itemQuantity = parseInt(item.quantity) || 0;
        return count + itemQuantity;
      }, 0);
    } catch (error) {
      console.error('Error getting item count:', error);
      return 0;
    }
  },

  /**
   * 計算購物車商品小計金額
   * @returns {Number} 小計金額
   */
  async getSubtotal() {
    try {
      const cart = await this.getCart();
      if (!cart || !Array.isArray(cart.items)) {
        return 0;
      }
      return cart.items.reduce((sum, item) => {
        const totalPrice = parseFloat(item.totalPrice) || 0;
        return sum + totalPrice;
      }, 0);
    } catch (error) {
      console.error('Error calculating subtotal:', error);
      return 0;
    }
  }
}; 