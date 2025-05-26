<template>
  <div class="menu-item-detail-container">
    <!-- 返回按鈕 -->
    <div class="back-button" @click="goBack">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    </div>

    <!-- 菜品名稱 -->
    <h1 class="menu-item-name">{{ menuItem.name }}</h1>
    <p class="menu-item-description">{{ menuItem.description }}</p>

    <!-- 份量選擇 -->
    <div class="option-section">
      <h2>份量</h2>
      <div class="size-options">
        <div 
          v-for="size in sizes" 
          :key="size.id" 
          :class="['size-option', { active: selectedSize === size.id }]"
          @click="selectSize(size.id)"
        >
          {{ size.name }}
        </div>
      </div>
    </div>

    <!-- 數量選擇 -->
    <div class="option-section">
      <h2>數量</h2>
      <div class="quantity-selector">
        <button class="quantity-btn" @click="decreaseQuantity" :disabled="quantity <= 1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <span class="quantity">{{ quantity }}</span>
        <button class="quantity-btn" @click="increaseQuantity">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- 備註 -->
    <div class="option-section">
      <h2>備註</h2>
      <textarea 
        class="notes-input" 
        placeholder="餐點特殊需求" 
        v-model="notes"
      ></textarea>
    </div>

    <!-- 底部添加到購物車 -->
    <div class="add-to-cart-bar">
      <button class="add-to-cart-btn" @click="addToCart" :disabled="isAddingToCart">
        <span class="plus-icon">+</span>
        {{ isAddingToCart ? '添加中...' : '加入購物車' }}
        <span class="price">NT. {{ totalPrice }}</span>
      </button>
    </div>
    
    <!-- 添加成功提示 -->
    <div class="toast" :class="{ show: showToast }">
      <div class="toast-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>已添加到購物車</span>
      </div>
    </div>
  </div>
</template>

<script>
import CartService from '../services/CartService';
import axios from 'axios';

export default {
  name: 'MenuItemDetail',
  data() {
    return {
      menuItem: {},
      restaurant: {},
      selectedSize: 'large',
      quantity: 1,
      notes: '',
      sizes: [
        { id: 'large', name: '大', price: 0 },
        { id: 'small', name: '小', price: -20 }
      ],
      isAddingToCart: false,
      showToast: false
    }
  },
  computed: {
    basePrice() {
      return this.menuItem.price || 0;
    },
    sizePrice() {
      const selectedSizeObj = this.sizes.find(size => size.id === this.selectedSize);
      return selectedSizeObj ? selectedSizeObj.price : 0;
    },
    totalPrice() {
      return (this.basePrice + this.sizePrice) * this.quantity;
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    selectSize(sizeId) {
      this.selectedSize = sizeId;
    },
    increaseQuantity() {
      this.quantity++;
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    // 從後端獲取餐廳詳情
    fetchRestaurantDetails(restaurantId) {
      return axios.get(`http://localhost:3000/api/restaurants/${restaurantId}`)
        .then(response => {
          if (response.data && response.data.restaurant) {
            this.restaurant = response.data.restaurant;
            console.log('獲取到的餐廳詳情:', this.restaurant);
          } else {
            throw new Error('獲取餐廳詳情失敗');
          }
        })
        .catch(error => {
          console.error('獲取餐廳詳情錯誤:', error);
          throw error;
        });
    },
    // 從後端獲取菜單項詳情
    fetchMenuItemDetails(restaurantId, itemId) {
      return axios.get(`http://localhost:3000/api/restaurants/${restaurantId}/menu/${itemId}`)
        .then(response => {
          if (response.data && response.data.menuItem) {
            this.menuItem = response.data.menuItem;
            console.log('獲取到的菜單項詳情:', this.menuItem);
          } else {
            throw new Error('獲取菜單項詳情失敗');
          }
        })
        .catch(error => {
          console.error('獲取菜單項詳情錯誤:', error);
          throw error;
        });
    },
    // 使用預設數據
    useDefaultData() {
      this.restaurant = {
        restaurant_id: this.$route.params.restaurantId,
        restaurant_name: '關東煙',
        restaurant_type: '中式料理',
        price_range: '250',
        address: '政治大學指南路二段64號',
        opening_hours: '11:00 - 21:00'
      };
      
      this.menuItem = {
        id: this.$route.params.itemId,
        name: '招牌韓式炸雞',
        price: 180,
        description: '香脆多汁的炸雞，配上秘製醬料'
      };
    },
    addToCart() {
      // 添加到購物車
      if (this.isAddingToCart) return;
      
      this.isAddingToCart = true;
      
      // 構建購物車項目
      const cartItem = {
        id: Date.now(), // 臨時ID
        menuItemId: this.menuItem.id,
        restaurantId: this.restaurant.restaurant_id || this.restaurant.id,
        name: this.menuItem.name,
        price: this.basePrice + this.sizePrice,
        quantity: this.quantity,
        size: this.selectedSize,
        notes: this.notes,
        totalPrice: this.totalPrice
      };
      
      // 使用CartService添加到購物車
      CartService.addToCart(cartItem)
        .then(() => {
          // 顯示成功提示
          this.showToast = true;
          setTimeout(() => {
            this.showToast = false;
          }, 3000);
          
          // 重置表單
          this.quantity = 1;
          this.notes = '';
        })
        .catch(error => {
          console.error('添加到購物車失敗:', error);
          alert('添加到購物車失敗，請稍後再試');
        })
        .finally(() => {
          this.isAddingToCart = false;
        });
    }
  },
  mounted() {
    // 從路由參數獲取餐廳ID和菜品ID
    const restaurantId = this.$route.params.restaurantId;
    const itemId = this.$route.params.itemId;
    
    if (!restaurantId || !itemId) {
      console.error('缺少必要的路由參數');
      this.$router.push('/restaurants');
      return;
    }
    
    console.log(`正在獲取餐廳 ${restaurantId} 的菜單項 ${itemId} 詳情`);
    
    // 獲取餐廳信息和菜單項詳情
    this.fetchRestaurantDetails(restaurantId)
      .then(() => this.fetchMenuItemDetails(restaurantId, itemId))
      .catch(error => {
        console.error('獲取數據時發生錯誤:', error);
        this.useDefaultData();
      });
  }
}
</script>

<style scoped>
.menu-item-detail-container {
  padding: 20px;
  padding-bottom: 100px;
  max-width: 900px;
  margin: 0 auto;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: #333;
  cursor: pointer;
  margin-bottom: 25px;
}

.menu-item-name {
  font-size: 32px;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

.menu-item-description {
  color: #666;
  margin-bottom: 35px;
  font-size: 17px;
  line-height: 1.5;
}

.option-section {
  margin-bottom: 35px;
}

.option-section h2 {
  font-size: 22px;
  margin-bottom: 18px;
  color: #333;
  font-weight: 600;
}

.size-options {
  display: flex;
  gap: 20px;
}

.size-option {
  flex: 1;
  padding: 18px;
  text-align: center;
  border-radius: 12px;
  background-color: #f5f7fa;
  cursor: pointer;
  color: #666;
  font-weight: 500;
  font-size: 18px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.size-option:hover {
  background-color: #e9f0fe;
}

.size-option.active {
  background-color: #1a73e8;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(26, 115, 232, 0.3);
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 25px;
}

.quantity-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f5f7fa;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333;
  transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #e9f0fe;
  transform: scale(1.05);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  font-size: 24px;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.notes-input {
  width: 100%;
  min-height: 120px;
  border-radius: 12px;
  border: 1px solid #e1e1e1;
  padding: 15px;
  font-size: 16px;
  resize: none;
  transition: border-color 0.3s;
}

.notes-input:focus {
  outline: none;
  border-color: #1a73e8;
}

.add-to-cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background-color: white;
  box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.add-to-cart-btn {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 18px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s, transform 0.3s;
}

.add-to-cart-btn:disabled {
  background-color: #a0c3ff;
  cursor: not-allowed;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #0d62c9;
  transform: translateY(-2px);
}

.plus-icon {
  margin-right: 10px;
  font-size: 24px;
}

.price {
  font-weight: bold;
  font-size: 22px;
}

.toast {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px 30px;
  border-radius: 30px;
  font-size: 18px;
  z-index: 1000;
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
}

.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.toast-content {
  display: flex;
  align-items: center;
}

.toast-content svg {
  margin-right: 12px;
  color: #52c41a;
}
</style> 