<template>
  <div class="restaurant-detail">
    <!-- 麵包屑導航 -->
    <div class="breadcrumb">
      <router-link to="/" class="breadcrumb-item">首頁</router-link>
      <span class="separator">/</span>
      <router-link to="/restaurants" class="breadcrumb-item">餐廳列表</router-link>
      <span class="separator">/</span>
      <span class="breadcrumb-item current">{{ restaurant?.restaurant_name || '餐廳詳情' }}</span>
    </div>
    
    <!-- 購物車浮動按鈕 -->
    <div class="floating-cart">
      <button class="cart-btn" @click="goToCheckout">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span class="cart-badge">{{ cartItemCount }}</span>
      </button>
    </div>
    
    <!-- 回到頂部按鈕 -->
    <div class="scroll-to-top" v-show="showScrollTop" @click="scrollToTop">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </div>
    
    <!-- 提示信息 -->
    <div v-if="showToast" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchRestaurantData" class="retry-btn">重試</button>
    </div>
    
    <div v-else class="restaurant-content">
      <!-- 餐廳基本資訊 -->
      <div class="restaurant-header">
        <div class="restaurant-cover">
          <img 
            :src="restaurant.image_url ? (restaurant.image_url.startsWith('http') ? restaurant.image_url : `http://localhost:3000${restaurant.image_url}`) : 'https://via.placeholder.com/800x300?text=餐廳封面照片'" 
            alt="餐廳封面"
            @error="handleImageError"
          >
        </div>
        
        <div class="restaurant-info">
          <h1>{{ restaurant.restaurant_name }}</h1>
          
          <div class="restaurant-rating">
            <div class="rating-display">
              <span class="rating-number">{{ ratingSummary?.avg_overall_rating ? Number(ratingSummary.avg_overall_rating).toFixed(1) : '0.0' }}</span>
              <rating-component 
                :value="Math.round(ratingSummary?.avg_overall_rating || 0)" 
                :disabled="true"
                :showText="false"
              />
              <span class="rating-count">({{ ratingSummary?.total_ratings || 0 }})</span>
            </div>
          </div>
          
          <div class="restaurant-meta">
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{{ restaurant.address }}</span>
            </div>
            
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{{ formatBusinessHours(restaurant.opening_hours) }}</span>
            </div>
            
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>{{ restaurant.phone || '暫無電話資訊' }}</span>
            </div>
          </div>
          
          <div class="restaurant-description">
            <p>{{ restaurant.description || '這家餐廳尚未提供詳細介紹。' }}</p>
          </div>
          
          <div class="restaurant-actions">
            <button class="action-btn primary order-now-btn" @click="scrollToMenu" v-if="isLoggedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              立即點餐
            </button>
            <router-link :to="{name: 'StudentLogin'}" class="action-btn primary" v-else>
              登入點餐
            </router-link>
            
            <button class="action-btn secondary" @click="scrollToReviews">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              查看評論
            </button>
          </div>
        </div>
      </div>
      
      <!-- 餐廳菜單 -->
      <div class="restaurant-menu">
        <h2 class="section-title">菜單</h2>
        
        <!-- 未登入提示 -->
        <div v-if="!isLoggedIn" class="login-prompt">
          <div class="login-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>請先<router-link :to="{name: 'StudentLogin'}" class="login-link">登入</router-link>才能進行點餐</p>
          </div>
        </div>
        
        <div class="menu-container">
          <!-- 菜單類別選項卡 -->
          <div class="menu-sidebar">
            <div class="menu-categories">
              <button 
                v-for="category in menuCategories" 
                :key="category.id"
                class="category-btn"
                :class="{ active: activeCategory === category.id }"
                @click="activeCategory = category.id"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
          
          <!-- 菜單項目 -->
          <div class="menu-content">
            <div v-if="filteredMenuItems.length === 0" class="no-items">
              <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>此類別暫無菜品</p>
                <span>請選擇其他類別瀏覽</span>
              </div>
            </div>
            
            <div v-else class="menu-items-container">
              <h3 class="category-title">{{ activeCategory }}</h3>
              <div class="menu-items-grid">
                <div 
                  v-for="item in filteredMenuItems" 
                  :key="item.id"
                  class="menu-item-card"
                >
                  <div class="menu-item-image">
                    <img :src="item.image_url || '/images/default-food.jpg'" alt="菜品圖片">
                    <!-- 特殊標籤 -->
                    <div class="item-badges">
                      <span class="item-badge new" v-if="item.isNew">新品</span>
                      <span class="item-badge hot" v-if="item.isHot">熱賣</span>
                      <span class="item-badge discount" v-if="item.discount">折扣</span>
                    </div>
                  </div>
                  
                  <div class="menu-item-content">
                    <h4 class="item-title">{{ item.item_name || item.name }}</h4>
                    <p class="item-description">{{ item.description || '暫無描述' }}</p>
                    <div class="item-footer">
                      <div class="price-container">
                        <span class="item-price">${{ item.price }}</span>
                        <span class="item-original-price" v-if="item.originalPrice">${{ item.originalPrice }}</span>
                      </div>
                      <button class="add-to-cart-btn" @click="addToCart(item)" v-if="isLoggedIn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>加入</span>
                      </button>
                      <router-link :to="{name: 'StudentLogin'}" class="login-btn" v-else>
                        登入
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 評論區域 -->
      <div class="reviews-section" id="reviews">
        <h2>用戶評價</h2>
        
        <div class="review-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeReviewTab === 'list' }"
            @click="activeReviewTab = 'list'"
          >
            評論 ({{ totalComments }})
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeReviewTab === 'write' }"
            @click="activeReviewTab = 'write'"
            v-if="isLoggedIn"
          >
            寫評論
          </button>
        </div>
        
        <div class="tab-content">
          <div v-if="activeReviewTab === 'list'" class="comments-tab">
            <comment-list 
              :restaurantId="restaurantId"
              @update-count="updateCommentCount"
              ref="commentList"
            />
          </div>
          
          <div v-if="activeReviewTab === 'write'" class="write-review-tab">
            <comment-form 
              :restaurantId="restaurantId"
              @comment-submitted="handleCommentSubmitted"
              @comment-updated="handleCommentUpdated"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RatingComponent from '@/components/RatingComponent.vue';
import CommentList from '@/components/CommentList.vue';
import CommentForm from '@/components/CommentForm.vue';
import CartService from '@/services/CartService';
import axios from 'axios';

export default {
  name: 'RestaurantDetail',
  components: {
    RatingComponent,
    CommentList,
    CommentForm
  },
  data() {
    return {
      restaurantId: this.$route.params.id,
      restaurant: null,
      loading: true,
      error: null,
      activeReviewTab: 'list',
      totalComments: 0,
      ratingSummary: {
        avg_food_rating: 0,
        avg_service_rating: 0,
        avg_environment_rating: 0,
        avg_overall_rating: 0,
        total_ratings: 0
      },
      menuCategories: [],
      menuItems: [],
      activeCategory: null,
      showScrollTop: false,
      showToast: false,
      toastMessage: '',
      toastType: 'success',
      isLoggedIn: localStorage.getItem('token') !== null && localStorage.getItem('student') !== null,
      cartItemCount: 0
    }
  },
  computed: {
    filteredMenuItems() {
      if (!this.activeCategory || !this.menuItems) return [];
      return this.menuItems.filter(item => item.category === this.activeCategory);
    }
  },
  created() {
    // 設置頁面標題
    document.title = `${this.restaurant?.restaurant_name || '餐廳詳情'} - 政大餐廳系統`;
    
    // 添加滾動事件監聽器
    window.addEventListener('scroll', this.handleScroll);
    
    // 添加本地存儲事件監聽器
    window.addEventListener('storage', this.checkLoginStatus);
    window.addEventListener('login', this.checkLoginStatus);
    window.addEventListener('logout', this.checkLoginStatus);
    window.addEventListener('cartUpdated', this.updateCartCount);
    
    // 獲取餐廳數據
    this.fetchRestaurantData();
    
    // 獲取評分摘要
    this.fetchRatingSummary();
    
    // 獲取購物車數量
    this.updateCartCount();
  },
  mounted() {
    this.handleScroll();
    
    // 如果URL中有#reviews參數，自動滾動到評論區域
    if (this.$route.hash === '#reviews') {
      this.$nextTick(() => {
        this.scrollToReviews();
      });
    }
  },
  beforeUnmount() {
    // 移除監聽器
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('storage', this.checkLoginStatus);
    window.removeEventListener('login', this.checkLoginStatus);
    window.removeEventListener('logout', this.checkLoginStatus);
    window.removeEventListener('cartUpdated', this.updateCartCount);
  },
  methods: {
    async fetchRestaurantData() {
      try {
        this.loading = true;
        this.error = null;
        
        console.log('開始獲取餐廳數據，餐廳ID:', this.restaurantId);
        
        // 使用 Promise.all 同時請求餐廳資料和菜單資料，加快載入速度
        const [restaurantResponse, menuResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/restaurants/${this.restaurantId}`),
          axios.get(`http://localhost:3000/api/restaurants/${this.restaurantId}/menu`)
        ]);
        
        console.log('獲取餐廳響應:', restaurantResponse.data);
        
        if (!restaurantResponse.data || !restaurantResponse.data.restaurant) {
          console.error('餐廳數據格式不正確:', restaurantResponse.data);
          this.error = '找不到餐廳資訊或資料格式錯誤';
          this.loading = false;
          return;
        }
        
        this.restaurant = restaurantResponse.data.restaurant;
        console.log('成功獲取餐廳數據:', this.restaurant);
        
        // 處理菜單資料
        console.log('獲取菜單響應:', menuResponse.data);
        
        if (menuResponse.data && Array.isArray(menuResponse.data.menuItems)) {
          this.menuItems = menuResponse.data.menuItems;
          
          // 從菜單中提取類別
          if (this.menuItems && this.menuItems.length > 0) {
            console.log('成功獲取菜單項目，數量:', this.menuItems.length);
            // 獲取所有不重複的類別
            const categories = [...new Set(this.menuItems.map(item => item.category))];
            console.log('提取的類別:', categories);
            this.menuCategories = categories.map(category => ({
              id: category,
              name: category
            }));
        
            if (this.menuCategories.length > 0) {
              this.activeCategory = this.menuCategories[0].id;
              console.log('設置默認類別:', this.activeCategory);
            }
          } else {
            console.log('菜單項目為空');
          }
        } else {
          console.log('菜單數據為空或格式不正確');
        }
        
        // 在背景獲取評分數據，不阻塞頁面載入
        this.fetchRatingSummary();
        
      } catch (error) {
        console.error('獲取餐廳數據錯誤:', error);
        this.error = '無法載入餐廳資訊，請稍後再試';
      } finally {
        // 確保無論如何都將loading設為false
        this.loading = false;
        console.log('數據加載完成，loading狀態:', this.loading);
      }
    },
    
    formatBusinessHours(hours) {
      if (!hours) return '營業時間未提供';
      // 這裡可以根據實際數據格式來格式化營業時間
      return hours;
    },
    
    scrollToReviews() {
      this.activeReviewTab = 'list';
      
      // 滾動到評論區域
      const reviewsElement = document.getElementById('reviews');
      if (reviewsElement) {
        reviewsElement.scrollIntoView({ behavior: 'smooth' });
      }
    },
    
    handleCommentSubmitted(comment) {
      console.log('評論已提交:', comment);
      
      // 將新評論添加到評論列表
      if (this.$refs.commentList) {
        this.$refs.commentList.addNewComment(comment);
      }
      
      // 切換到評論列表標籤
      this.activeReviewTab = 'list';
      
      // 顯示成功提示
      this.showToastMessage('評論已成功提交！', 'success');
    },
    
    handleCommentUpdated(comment) {
      console.log('評論已更新:', comment);
      
      // 更新評論列表中的評論
      if (this.$refs.commentList) {
        this.$refs.commentList.updateExistingComment(comment);
      }
      
      // 切換到評論列表標籤
      this.activeReviewTab = 'list';
      
      // 顯示成功提示
      this.showToastMessage('評論已成功更新！', 'success');
    },
    
    updateCommentCount(count) {
      this.totalComments = count;
    },
    
    async fetchRatingSummary() {
      try {
        const ratingResponse = await axios.get(`http://localhost:3000/api/restaurants/${this.restaurantId}/ratings`);
        if (ratingResponse.data && ratingResponse.data.ratingSummary) {
          this.ratingSummary = ratingResponse.data.ratingSummary;
        }
      } catch (error) {
        console.error('獲取評分摘要錯誤:', error);
        // 使用默認評分
        this.ratingSummary = {
          avg_food_rating: 0,
          avg_service_rating: 0,
          avg_environment_rating: 0,
          avg_overall_rating: 0,
          total_ratings: 0
        };
      }
    },
    handleImageError(event) {
      // 當圖片加載失敗時，使用預設圖片
      event.target.src = 'https://via.placeholder.com/800x300?text=餐廳封面照片';
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    handleScroll() {
      this.showScrollTop = window.scrollY > 300;
    },
    async addToCart(item) {
      try {
        // 檢查用戶是否已登入
        const isLoggedIn = localStorage.getItem('token') !== null && localStorage.getItem('student') !== null;
        if (!isLoggedIn) {
          // 未登入時跳轉到登入頁面
          this.$router.push({ name: 'StudentLogin' });
          return;
        }

        if (!this.restaurant) {
          console.error('Restaurant data not available');
          return;
        }
        
        const restaurantData = {
          id: this.restaurant.restaurant_id,
          name: this.restaurant.restaurant_name
        };
        
        const cartItem = {
          id: item.menu_id,
          name: item.item_name || item.name,
          price: parseFloat(item.price),
          quantity: 1,
          notes: '',
          totalPrice: parseFloat(item.price),
          category: item.category
        };
        
        const success = await CartService.addToCart(restaurantData, cartItem);
        
        if (success) {
          this.showToastMessage('已添加到購物車');
          this.updateCartCount();
        }
      } catch (error) {
        console.error('添加到購物車錯誤:', error);
        this.showToastMessage('添加失敗，請稍後再試', 'error');
      }
    },
    showToastMessage(message, type = 'success') {
      this.toastMessage = message;
      this.toastType = type;
      this.showToast = true;
      
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },
    checkLoginStatus() {
      this.isLoggedIn = localStorage.getItem('token') !== null && localStorage.getItem('student') !== null;
    },
    scrollToMenu() {
      const menuElement = document.querySelector('.restaurant-menu');
      if (menuElement) {
        menuElement.scrollIntoView({ behavior: 'smooth' });
      }
    },
    async updateCartCount() {
      try {
        if (this.isLoggedIn) {
          const count = await CartService.getItemCount();
          this.cartItemCount = count;
        } else {
          this.cartItemCount = 0;
        }
      } catch (error) {
        console.error('獲取購物車數量失敗:', error);
      }
    },
    goToCheckout() {
      if (this.isLoggedIn && this.cartItemCount > 0) {
        this.$router.push('/cart');
      } else if (!this.isLoggedIn) {
        this.showToastMessage('請先登入才能進行結帳');
        setTimeout(() => {
          this.$router.push('/student-login');
        }, 1500);
      } else if (this.cartItemCount === 0) {
        this.showToastMessage('購物車是空的，請先選購商品');
      }
    }
  }
}
</script>

<style scoped>
.restaurant-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 載入和錯誤狀態 */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 40px auto;
  max-width: 600px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 87, 34, 0.1);
  border-radius: 50%;
  border-top-color: #ff5722;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #ff5722;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(255, 87, 34, 0.3);
}

.retry-btn:hover {
  background-color: #e64a19;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 87, 34, 0.4);
}

/* 餐廳頭部信息 */
.restaurant-header {
  display: flex;
  margin-bottom: 30px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.restaurant-cover {
  flex: 0 0 45%;
  max-height: 400px;
  overflow: hidden;
  position: relative;
}

.restaurant-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.restaurant-cover:hover img {
  transform: scale(1.05);
}

.restaurant-info {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.restaurant-info h1 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 2.2rem;
  font-weight: 700;
}

.restaurant-rating {
  margin-bottom: 25px;
  background-color: #fff9f6;
  padding: 12px;
  border-radius: 8px;
  display: inline-block;
}

.rating-display {
  display: flex;
  align-items: center;
}

.rating-number {
  font-size: 28px;
  font-weight: bold;
  color: #ff5722;
  margin-right: 12px;
}

.rating-count {
  margin-left: 12px;
  color: #666;
  font-size: 15px;
}

.restaurant-meta {
  margin-bottom: 25px;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #555;
  font-size: 15px;
}

.meta-item svg {
  margin-right: 15px;
  color: #ff5722;
  min-width: 18px;
}

.restaurant-description {
  margin-bottom: 30px;
  flex-grow: 1;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #ff5722;
}

.restaurant-description p {
  margin: 0;
  line-height: 1.7;
  color: #444;
}

.restaurant-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.action-btn.primary {
  background-color: #ff5722;
  color: white;
  border: none;
}

.action-btn.secondary {
  background-color: white;
  color: #ff5722;
  border: 1px solid #ff5722;
}

.action-btn:hover {
  opacity: 0.9;
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 餐廳菜單 */
.restaurant-menu {
  margin-bottom: 40px;
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-top: 0;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.login-prompt {
  background-color: #fff8e1;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.login-info {
  display: flex;
  align-items: center;
  color: #856404;
}

.login-info svg {
  margin-right: 12px;
  color: #ffc107;
}

.login-link {
  color: #ff5722;
  font-weight: 500;
  text-decoration: none;
  margin: 0 4px;
}

.login-link:hover {
  text-decoration: underline;
}

.menu-container {
  display: flex;
  gap: 30px;
  padding-top: 10px;
}

.menu-sidebar {
  width: 220px;
  flex-shrink: 0;
}

.menu-categories {
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f9f9f9;
  padding: 10px;
}

.category-btn {
  text-align: left;
  padding: 14px 16px;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.category-btn:hover {
  background-color: rgba(255, 87, 34, 0.1);
  color: #ff5722;
}

.category-btn.active {
  background-color: #ff5722;
  color: white;
}

.menu-content {
  flex: 1;
  min-width: 0;
}

.no-items {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #aaa;
}

.empty-state svg {
  margin-bottom: 20px;
  stroke: #ddd;
}

.empty-state p {
  font-size: 18px;
  margin: 0 0 8px 0;
}

.empty-state span {
  font-size: 14px;
}

.category-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #333;
}

.menu-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.menu-item-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.menu-item-image {
  height: 180px;
  position: relative;
  overflow: hidden;
}

.menu-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.menu-item-card:hover .menu-item-image img {
  transform: scale(1.1);
}

.item-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
  z-index: 1;
}

.item-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  backdrop-filter: blur(4px);
}

.item-badge.new {
  background-color: rgba(76, 175, 80, 0.9);
}

.item-badge.hot {
  background-color: rgba(244, 67, 54, 0.9);
}

.item-badge.discount {
  background-color: rgba(255, 152, 0, 0.9);
}

.menu-item-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.item-title {
  margin: 0 0 10px 0;
  font-size: 17px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.item-description {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
}

.price-container {
  display: flex;
  flex-direction: column;
}

.item-price {
  font-size: 18px;
  font-weight: 600;
  color: #ff5722;
}

.item-original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.add-to-cart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background-color: #ff5722;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.add-to-cart-btn:hover {
  background-color: #e64a19;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.add-to-cart-btn span {
  display: inline-block;
}

.add-to-cart-btn svg {
  width: 16px;
  height: 16px;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  background-color: #f0f0f0;
  color: #555;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s;
}

.login-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .menu-container {
    flex-direction: column;
  }
  
  .menu-sidebar {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .menu-categories {
    flex-direction: row;
    overflow-x: auto;
    padding: 10px;
    gap: 10px;
    scrollbar-width: none;
  }
  
  .menu-categories::-webkit-scrollbar {
    display: none;
  }
  
  .category-btn {
    white-space: nowrap;
    padding: 10px 16px;
  }
  
  .menu-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.breadcrumb-item {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
}

.breadcrumb-item:not(.current):hover {
  color: #ff5722;
  text-decoration: underline;
}

.breadcrumb .current {
  color: #ff5722;
  font-weight: 600;
}

.separator {
  margin: 0 10px;
  color: #ccc;
}

.floating-cart {
  position: fixed;
  right: 30px;
  bottom: 100px;
  z-index: 100;
}

.cart-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #ff5722;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 87, 34, 0.4);
  transition: all 0.3s;
  position: relative;
}

.cart-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 87, 34, 0.5);
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #333;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.item-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.item-tag.new {
  background-color: #4CAF50;
}

.item-tag.hot {
  background-color: #F44336;
}

.item-tag.discount {
  background-color: #FF9800;
}

.price-info {
  display: flex;
  flex-direction: column;
}

/* 回到頂部按鈕 */
.scroll-to-top {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 100;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: rgba(51, 51, 51, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.scroll-to-top:hover {
  transform: translateY(-5px);
  background-color: rgba(51, 51, 51, 0.9);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
}

/* 提示信息 */
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: fadeInUp 0.3s ease-out;
}

.toast.success {
  background-color: #4CAF50;
}

.toast.error {
  background-color: #F44336;
}

.toast.warning {
  background-color: #FF9800;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
