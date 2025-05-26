<template>
  <div class="cart-container">
    <!-- 返回按鈕和標題 -->
    <div class="cart-header">
      <div class="back-button" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </div>
      <h1 class="cart-title" v-if="restaurant">{{ restaurant.name }} <span class="restaurant-address">{{ restaurant.address }}</span></h1>
      <h1 class="cart-title" v-else>購物車</h1>
    </div>

    <!-- 購物車標題 -->
    <div class="section-title">
      <h2>你的購物車</h2>
    </div>

    <!-- 購物車商品列表 -->
    <div class="cart-items" v-if="cartItems.length > 0">
      <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
        <div class="cart-item-image">
          <img src="@/assets/food-order-logo.svg" alt="NCCU Eats 菜品">
        </div>
        <div class="cart-item-info">
          <h3>{{ item.name }}</h3>
          <p class="cart-item-size">{{ getSizeName(item.size) }}</p>
          <p class="cart-item-notes" v-if="item.notes">備註：{{ item.notes }}</p>
        </div>
        <div class="cart-item-price">
          <p>NT. {{ item.price }}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-btn" @click="decreaseQuantity(index)" :disabled="item.quantity <= 1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <span class="quantity">{{ item.quantity }}</span>
          <button class="quantity-btn" @click="increaseQuantity(index)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
        <div class="cart-item-total">
          <p>NT. {{ item.price * item.quantity }}</p>
        </div>
        <button class="delete-btn" @click="removeCartItem(index)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 空購物車提示 -->
    <div class="empty-cart" v-else>
      <div class="empty-cart-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      </div>
      <h3>購物車是空的</h3>
      <p>添加一些美味的食物到購物車吧！</p>
      <button class="browse-btn" @click="goToRestaurants">瀏覽餐廳</button>
    </div>

    <!-- 優惠券區域 (只在有商品時顯示) -->
    <div class="coupon-section" v-if="cartItems.length > 0">
      <div class="section-title">
        <h2>使用店家優惠券</h2>
      </div>
      
      <!-- 優惠券選擇 -->
      <div class="coupon-list" v-if="coupons.length > 0">
        <div 
          v-for="(coupon, index) in coupons" 
          :key="index" 
          :class="['coupon-item', { 
            active: selectedCouponId === coupon.id,
            disabled: !coupon.canUse 
          }]"
          @click="coupon.canUse ? selectCoupon(coupon.id) : null"
        >
          <div class="coupon-radio">
            <div class="radio-circle" :class="{ checked: selectedCouponId === coupon.id }"></div>
          </div>
          <div class="coupon-info">
            <h3>{{ coupon.description }}</h3>
            <p>優惠碼: {{ coupon.code }}</p>
            <p class="min-order" v-if="coupon.min_order_amount && coupon.min_order_amount > 0">
              最低消費金額: NT$ {{ coupon.min_order_amount }}
            </p>
            <p class="coupon-status" v-if="!coupon.is_claimed">
              <span class="status-badge new">未領取 - 選擇時自動領取</span>
            </p>
            <p class="coupon-status" v-else-if="coupon.is_used">
              <span class="status-badge used">已使用</span>
            </p>
            <p class="coupon-status" v-else-if="isExpired(coupon.end_date)">
              <span class="status-badge expired">已過期</span>
            </p>
            <p class="coupon-status" v-else-if="coupon.limit_reached">
              <span class="status-badge limit">已領完</span>
            </p>
          </div>
          <div class="coupon-discount">
            <span v-if="coupon.discount_type === 'fixed'">-NT$ {{ coupon.discount_value }}</span>
            <span v-else-if="coupon.discount_type === 'percentage'">{{ coupon.discount_value }}% OFF</span>
          </div>
        </div>
      </div>
      <div class="no-coupons" v-else>
        <p>目前沒有可用的優惠券</p>
      </div>
    </div>

    <!-- 賬單計算區域 (只在有商品時顯示) -->
    <div class="bill-section" v-if="cartItems.length > 0">
      <div class="bill-row">
        <span>原價總計</span>
        <span>NT$ {{ subtotal }}</span>
      </div>
      <div class="bill-row" v-if="discount > 0">
        <span>優惠折扣</span>
        <span class="discount-text">-NT$ {{ discount }}</span>
      </div>
      <div class="bill-row total">
        <span>最終金額</span>
        <span class="final-price">NT$ {{ total }}</span>
      </div>
    </div>

    <!-- 賬單地址checkbox (只在有商品時顯示) -->
    <div class="billing-address-section" v-if="cartItems.length > 0">
      <label class="checkbox-container">
        <input type="checkbox" v-model="sameAsBillingAddress">
        <span class="checkmark"></span>
        我的帳單地址與配送地址相同
      </label>
    </div>

    <!-- 結賬按鈕 (只在有商品時顯示) -->
    <div class="checkout-bar" v-if="cartItems.length > 0">
      <button class="checkout-btn" @click="checkout">
        確認訂餐
      </button>
    </div>
  </div>
</template>

<script>
import CartService from '../services/CartService';
import axios from 'axios';
import { orderAPI } from '../services/api';

export default {
  name: 'CartPage',
  data() {
    return {
      restaurant: null,
      cartItems: [],
      coupons: [], // 移除模擬的優惠券數據
      selectedCouponId: null,
      sameAsBillingAddress: true,
      isProcessing: false
    }
  },
  computed: {
    // ...
    subtotal() {
      return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    discount() {
      if (!this.selectedCouponId) {
        console.log('沒有選擇優惠券，折扣為0');
        return 0;
      }
      
      const selectedCoupon = this.coupons.find(coupon => coupon.id === this.selectedCouponId);
      console.log('計算折扣 - 選中的優惠券:', selectedCoupon);
      
      if (!selectedCoupon || !selectedCoupon.canUse) {
        console.log('選中的優惠券不可用，折扣為0');
        return 0;
      }
      
      let calculatedDiscount = 0;
      if (selectedCoupon.discount_type === 'fixed') {
        calculatedDiscount = parseFloat(selectedCoupon.discount_value);
        console.log('固定折扣:', calculatedDiscount);
      } else if (selectedCoupon.discount_type === 'percentage') {
        calculatedDiscount = Math.round(this.subtotal * (parseFloat(selectedCoupon.discount_value) / 100) * 100) / 100;
        console.log('百分比折扣:', selectedCoupon.discount_value + '%', '計算結果:', calculatedDiscount);
      }
      
      console.log('最終折扣金額:', calculatedDiscount);
      return calculatedDiscount;
    },
    total() {
      return this.subtotal - this.discount;
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    getSizeName(sizeId) {
      const sizeMap = {
        'large': '大份',
        'small': '小份',
        'regular': '正常份'
      };
      return sizeMap[sizeId] || '';
    },
    async increaseQuantity(index) {
      if (index >= 0 && index < this.cartItems.length) {
        this.cartItems[index].quantity++;
        // 更新購物車服務
        try {
          await CartService.updateItemQuantity(index, this.cartItems[index].quantity);
        } catch (error) {
          console.error('Error updating quantity:', error);
        }
      }
    },
    async decreaseQuantity(index) {
      if (index >= 0 && index < this.cartItems.length && this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--;
        // 更新購物車服務
        try {
          await CartService.updateItemQuantity(index, this.cartItems[index].quantity);
        } catch (error) {
          console.error('Error updating quantity:', error);
        }
      }
    },
    async removeCartItem(index) {
      if (index >= 0 && index < this.cartItems.length) {
        try {
          // 從購物車服務中移除
          await CartService.removeItem(index);
          this.cartItems.splice(index, 1);
          
          // 如果購物車為空，返回上一頁
          if (this.cartItems.length === 0) {
            this.restaurant = null;
            // 可選：跳轉回餐廳列表頁
            // this.$router.push('/restaurants');
          }
        } catch (error) {
          console.error('Error removing item:', error);
        }
      }
    },
    selectCoupon(couponId) {
      // 如果已選擇該優惠券，則取消選擇
      if (this.selectedCouponId === couponId) {
        this.selectedCouponId = null;
        return;
      }
      
      // 檢查最低消費金額
      const coupon = this.coupons.find(c => c.id === couponId);
      console.log('選擇優惠券:', couponId, '優惠券詳情:', coupon);
      
      if (coupon && coupon.min_order_amount > 0 && this.subtotal < coupon.min_order_amount) {
        alert(`此優惠券需要最低消費金額 NT$ ${coupon.min_order_amount}，您當前消費金額為 NT$ ${this.subtotal}`);
        return;
      }
      
      // 檢查優惠券是否可用
      if (coupon && !coupon.canUse) {
        let reason = '此優惠券不可使用';
        if (coupon.is_used) reason = '此優惠券已使用';
        else if (this.isExpired(coupon.end_date)) reason = '此優惠券已過期';
        else if (coupon.limit_reached) reason = '此優惠券已達使用上限';
        
        alert(reason);
        return;
      }
      
      // 選擇優惠券
      this.selectedCouponId = couponId;
      console.log('已選擇優惠券ID:', couponId);
    },
    goToRestaurants() {
      this.$router.push('/restaurants');
    },
    async checkout() {
      try {
        // 檢查購物車是否為空
        if (this.cartItems.length === 0) {
          alert('購物車是空的，請先添加商品');
          return;
        }

        // 構建確認訊息，包含折扣信息
        let confirmMessage = `確認提交訂單？\n\n`;
        confirmMessage += `原價總計：NT$ ${this.subtotal}\n`;
        if (this.discount > 0) {
          confirmMessage += `優惠折扣：-NT$ ${this.discount}\n`;
        }
        confirmMessage += `最終金額：NT$ ${this.total}`;
        
        // 顯示確認對話框
        const confirmOrder = confirm(confirmMessage);
        if (!confirmOrder) return;
        
        // 顯示處理中提示
        this.isProcessing = true;
        
        // 找到選中的優惠券
        const selectedCoupon = this.selectedCouponId ? 
          this.coupons.find(c => c.id === this.selectedCouponId) : null;
        
        // 準備優惠券ID - 根據優惠券狀態決定傳遞什麼ID
        let couponIdToSend = null;
        if (selectedCoupon) {
          if (selectedCoupon.is_claimed) {
            // 已領取的優惠券，傳遞 user_coupon_id
            couponIdToSend = selectedCoupon.user_coupon_id;
            console.log('使用已領取的優惠券，user_coupon_id:', couponIdToSend);
          } else {
            // 未領取的優惠券，先自動領取再使用
            try {
              // 領取優惠券
              const token = localStorage.getItem('token');
              const claimResponse = await axios.post(`http://localhost:3000/api/coupons/claim/${selectedCoupon.coupon_id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (claimResponse.data.success) {
                // 使用新領取的 user_coupon_id
                couponIdToSend = claimResponse.data.userCoupon.user_coupon_id;
                console.log('自動領取優惠券成功，user_coupon_id:', couponIdToSend);
              } else {
                console.error('自動領取優惠券失敗:', claimResponse.data.message);
                alert('優惠券領取失敗，將不使用優惠券繼續訂單');
                couponIdToSend = null;
              }
            } catch (claimError) {
              console.error('領取優惠券時發生錯誤:', claimError);
              alert('優惠券領取失敗，將不使用優惠券繼續訂單');
              couponIdToSend = null;
            }
          }
        }
        
        // 準備訂單數據
        const orderData = {
          payment_method: 'cash', // 預設使用現金支付
          delivery_address: this.useDeliveryAddress ? this.deliveryAddress : null,
          selected_coupon_id: couponIdToSend // 修正：傳遞處理後的優惠券ID
        };
        
        console.log('準備提交訂單數據:', JSON.stringify(orderData, null, 2));
        
        // 創建訂單
        const response = await orderAPI.createOrder(orderData);
        console.log('訂單創建成功:', response);
        
        if (!response || !response.success) {
          throw new Error(response?.message || '訂單創建失敗');
        }
        
        // 顯示成功消息
        alert(`訂單已成功提交，訂單編號: ${response.order.order_id}`);
        
        // 清空本地購物車數據
        this.cartItems = [];
        localStorage.removeItem('food_delivery_cart');
        
        try {
          // 清空後端購物車
          await CartService.clearCart();
        } catch (clearError) {
          console.error('清空購物車錯誤 (非致命):', clearError);
          // 繼續處理，因為訂單已經創建成功
        }
        
        // 跳轉到訂單確認頁面
        this.$router.push(`/order-confirmation/${response.order.order_id}`);
      } catch (error) {
        console.error('提交訂單錯誤:', error);
        let errorMessage = '提交訂單過程中發生錯誤';
        
        if (error.response) {
          errorMessage += `：${error.response.data?.message || '伺服器錯誤'}`;
        } else if (error.message) {
          errorMessage += `：${error.message}`;
        }
        
        alert(errorMessage);
      } finally {
        this.isProcessing = false;
      }
    },
    
    async fetchRestaurantCoupons() {
      if (!this.restaurant || !this.restaurant.id) {
        console.error('無法獲取優惠券：餐廳ID不存在');
        return;
      }
      
      try {
        console.log('正在獲取餐廳可用優惠券，餐廳ID:', this.restaurant.id);
        
        // 檢查是否有有效的令牌
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('無法獲取優惠券：未找到認證令牌');
          this.coupons = [];
          return;
        }
        
        console.log('使用令牌:', token.substring(0, 20) + '...');
        
        // 使用新的API獲取該餐廳的優惠券（包括學生的領取狀態）
        const response = await axios.get(`http://localhost:3000/api/coupons/student`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            restaurant_id: this.restaurant.id  // 傳遞餐廳ID作為查詢參數
          }
        });
        
        console.log('API 響應:', response.status, response.statusText);
        console.log('響應數據:', response.data);
        
        if (response.data.success) {
          console.log(`獲取到 ${response.data.coupons.length} 個餐廳優惠券`);
          
          // 處理優惠券狀態 - 新API已經返回該餐廳的優惠券，不需要過濾
          this.coupons = response.data.coupons.map(coupon => ({
            ...coupon,
            // 如果已領取，使用 user_coupon_id；如果未領取，使用 coupon_id
            id: coupon.is_claimed ? coupon.user_coupon_id : coupon.coupon_id,
            isUserCoupon: coupon.is_claimed, // 標記是否已領取
            canUse: !coupon.is_used && !this.isExpired(coupon.end_date) && !coupon.limit_reached,
            // 添加詳細的狀態信息用於調試
            debugInfo: {
              is_claimed: coupon.is_claimed,
              is_used: coupon.is_used,
              user_coupon_id: coupon.user_coupon_id,
              coupon_id: coupon.coupon_id,
              expired: this.isExpired(coupon.end_date),
              limit_reached: coupon.limit_reached
            }
          }));
          
          console.log('處理後的優惠券（含調試信息）:', this.coupons);
        } else {
          console.error('獲取優惠券失敗:', response.data.message);
          this.coupons = [];
        }
      } catch (error) {
        console.error('獲取優惠券時發生錯誤:', error);
        this.coupons = [];
      }
    },
    isExpired(endDate) {
      if (!endDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expDate = new Date(endDate);
      expDate.setHours(0, 0, 0, 0);
      return expDate < today;
    }
  },
  async mounted() {
    try {
      // 獲取購物車數據
      const cartData = await CartService.getCart();
      this.restaurant = cartData.restaurant;
      this.cartItems = cartData.items || [];
      
      // 如果有餐廳信息，獲取該餐廳的優惠券
      if (this.restaurant && this.restaurant.id) {
        await this.fetchRestaurantCoupons();
      }
    } catch (error) {
      console.error('Error loading cart data:', error);
      this.cartItems = [];
    }
  }
}
</script>

<style scoped>
/* 購物車容器 */
.cart-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans TC', sans-serif;
}

/* 優惠券樣式 */
.coupon-section {
  margin-bottom: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coupon-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.coupon-item:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.coupon-item.active {
  border-color: #4CAF50;
  background-color: #f0f8f0;
}

.coupon-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f5f5f5;
}

.coupon-item.disabled:hover {
  border-color: #ddd;
  box-shadow: none;
}

.coupon-radio {
  margin-right: 15px;
}

.radio-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-circle.checked {
  border-color: #4CAF50;
  background-color: #4CAF50;
  position: relative;
}

.radio-circle.checked::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  position: absolute;
}

.coupon-info {
  flex: 1;
}

.coupon-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
}

.coupon-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.coupon-info .min-order {
  margin-top: 5px;
  font-size: 12px;
  color: #ff6b6b;
}

.coupon-discount {
  font-size: 16px;
  color: #e74c3c;
  font-weight: 600;
  text-align: right;
  min-width: 100px;
}

.coupon-status {
  margin: 5px 0 0 0;
  font-size: 12px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.new {
  background-color: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

.status-badge.used {
  background-color: #fce4ec;
  color: #c2185b;
  border: 1px solid #f8bbd9;
}

.status-badge.expired {
  background-color: #ffebee;
  color: #d32f2f;
  border: 1px solid #ffcdd2;
}

.status-badge.limit {
  background-color: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #e1bee7;
}

.no-coupons {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
  background-color: white;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

.cart-header {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}

.back-button {
  display: flex;
  align-items: center;
  margin-right: 18px;
  cursor: pointer;
}

.cart-title {
  font-size: 26px;
  margin: 0;
  color: #333;
  font-weight: 600;
}

.restaurant-address {
  font-size: 16px;
  color: #666;
  font-weight: normal;
  display: block;
  margin-top: 5px;
}

.section-title {
  margin-bottom: 20px;
}

.section-title h2 {
  font-size: 22px;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.cart-items {
  margin-bottom: 35px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.cart-item-image {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  margin-right: 18px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-item-image img {
  max-width: 70%;
  max-height: 70%;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info h3 {
  font-size: 18px;
  margin: 0 0 8px;
  color: #333;
  font-weight: 600;
}

.cart-item-size, .cart-item-notes {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.cart-item-price {
  margin: 0 25px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  margin: 0 25px;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background-color: #4a6fa5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quantity-btn:hover:not(:disabled) {
  background-color: #3a5a8c;
  transform: scale(1.05);
}

.quantity-btn:disabled {
  background-color: #a0b3d1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.quantity {
  margin: 0 12px;
  font-size: 18px;
  font-weight: 500;
  min-width: 25px;
  text-align: center;
}

.cart-item-total {
  font-weight: bold;
  color: #333;
  width: 90px;
  text-align: right;
  font-size: 18px;
}

.delete-btn {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background-color: #e74c3c;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  margin-left: 15px;
  transition: all 0.2s;
}

.delete-btn:hover {
  background-color: #c0392b;
  transform: scale(1.05);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-cart-icon {
  color: #ddd;
  margin-bottom: 25px;
}

.empty-cart h3 {
  font-size: 24px;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

.empty-cart p {
  color: #666;
  margin-bottom: 35px;
  font-size: 16px;
}

.browse-btn {
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 14px 35px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.browse-btn:hover {
  background-color: #0d62c9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(26, 115, 232, 0.3);
}

.coupon-section {
  margin-bottom: 35px;
}

.coupon-list {
  background-color: #f9f9f9;
  border-radius: 14px;
  overflow: hidden;
}

.coupon-item {
  display: flex;
  padding: 18px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.coupon-item:last-child {
  border-bottom: none;
}

.coupon-item.active {
  background-color: #f0f7ff;
}

.coupon-item:hover:not(.active) {
  background-color: #f5f5f5;
}

.coupon-radio {
  display: flex;
  align-items: center;
  margin-right: 18px;
}

.radio-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s;
}

.radio-circle.checked {
  border-color: #1a73e8;
}

.radio-circle.checked:after {
  content: '';
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #1a73e8;
  position: absolute;
}

.coupon-info {
  flex: 1;
}

.coupon-info h3 {
  font-size: 18px;
  margin: 0 0 6px;
  color: #333;
  font-weight: 600;
}

.coupon-info p {
  margin: 0;
  font-size: 15px;
  color: #666;
}

.coupon-discount {
  margin-left: auto;
  font-weight: bold;
  color: #f5222d;
  font-size: 18px;
}

.bill-section {
  margin-bottom: 25px;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 20px;
  background-color: #fcfcfc;
}

.bill-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 18px;
}

.bill-row.total {
  font-weight: bold;
  font-size: 1.2em;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
}

.discount-text {
  color: #e74c3c;
  font-weight: bold;
}

.final-price {
  color: #2ecc71;
  font-weight: bold;
}

.billing-address-section {
  margin-bottom: 35px;
}

.checkbox-container {
  display: block;
  position: relative;
  padding-left: 38px;
  cursor: pointer;
  font-size: 16px;
  user-select: none;
  color: #555;
  line-height: 25px;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 22px;
  width: 22px;
  background-color: #f5f7fa;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: all 0.2s;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #eee;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #1a73e8;
  border-color: #1a73e8;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 8px;
  top: 3px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkout-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20px;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  z-index: 10;
  display: flex;
  justify-content: center;
}

.checkout-btn {
  width: 100%;
  max-width: 600px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 0;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.2s;
}

.checkout-btn:hover {
  background-color: #0d62c9;
}
</style> 