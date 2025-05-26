<template>
  <div class="restaurant-detail-container">
    <!-- 返回按鈕 -->
    <div class="back-button" @click="goBack">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      返回
    </div>

    <!-- 餐廳封面 -->
    <div class="restaurant-cover">
      <img 
        :src="getImageUrl(restaurant.image_url)" 
        alt="餐廳圖片"
        @error="handleImageError"
      >
    </div>

    <!-- 餐廳基本信息 -->
    <div class="restaurant-info">
      <h1>{{ restaurant.name }}</h1>
      <div class="restaurant-tags">
        <span class="tag">{{ restaurant.category }}</span>
        <span class="tag">NT{{ restaurant.price }}平均</span>
      </div>
      <div class="restaurant-address">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        {{ restaurant.address || '政治大學指南路二段64號' }}
      </div>
      <div class="restaurant-open-hours">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        {{ restaurant.hours || '11:00 - 21:00' }}
      </div>
      <button class="rate-button" @click="goToRatingPage">撰寫評價</button>
    </div>

    <!-- 菜單區域 -->
    <div class="menu-section">
      <h2>菜單</h2>
      <div class="menu-tabs">
        <div 
          v-for="(category, index) in menuCategories" 
          :key="index" 
          :class="['menu-tab', { active: selectedMenuCategory === category }]"
          @click="selectedMenuCategory = category"
        >
          {{ category }}
        </div>
      </div>

      <div class="menu-items">
        <div v-for="(item, index) in filteredMenuItems" :key="index" class="menu-item" @click="goToMenuItemDetail(item)">
          <div class="menu-item-image">
            <img src="@/assets/food-order-logo.svg" alt="NCCU Eats 菜品">
          </div>
          <div class="menu-item-info">
            <h3>{{ item.name }}</h3>
            <p class="menu-item-description">{{ item.description }}</p>
            <p class="menu-item-price">NT{{ item.price }}</p>
          </div>
          <div class="add-to-cart-button">+</div>
        </div>
      </div>
    </div>

    <!-- 評論區域 -->
    <div class="reviews-section">
      <h2>評論</h2>
      
      <!-- 評論表單 -->
      <comment-form 
        :restaurantId="restaurantId" 
        @comment-submitted="handleCommentSubmitted"
        @reload-comments="loadComments"
      />
      
      <!-- 評論列表 -->
      <comment-list 
        :restaurantId="restaurantId" 
        ref="commentList"
        @update-count="updateCommentCount"
      />
    </div>
  </div>
</template>

<script>
import CommentForm from './CommentForm.vue';
import CommentList from './CommentList.vue';
import axios from 'axios';

export default {
  name: 'RestaurantDetailPage',
  components: {
    CommentForm,
    CommentList
  },
  data() {
    return {
      restaurant: {},
      restaurantId: '',
      selectedMenuCategory: '主菜',
      menuCategories: ['主菜', '配餐', '飲料', '甜點'],
      menuItems: [
        { id: 1, name: '招牌韓式炸雞', price: 180, category: '主菜', description: '香脆多汁的炸雞，配上秘製醬料' },
        { id: 2, name: '辣炒年精', price: 160, category: '主菜', description: '香辣可口的年精，搭配特製辣醬' },
        { id: 3, name: '泰式海鮮炒飯', price: 150, category: '主菜', description: '泰式風味的海鮮炒飯，香氛四溢' },
        { id: 4, name: '炸薯條', price: 60, category: '配餐', description: '香脆的薯條，搭配特製酸甜醬' },
        { id: 5, name: '水果沙拉', price: 80, category: '配餐', description: '新鮮水果搭配特製沙拉醬' },
        { id: 6, name: '可口可樂', price: 40, category: '飲料', description: '冷飲可口可樂' },
        { id: 7, name: '檸檬紅茶', price: 45, category: '飲料', description: '清爽的檸檬紅茶' },
        { id: 8, name: '巧克力蹲克', price: 70, category: '甜點', description: '濃郁的巧克力風味，配上鮮奶' },
        { id: 9, name: '草莓蹲克', price: 70, category: '甜點', description: '鮮甜的草莓配上香脆餅皮' }
      ],
      commentCount: 0
    }
  },
  computed: {
    filteredMenuItems() {
      return this.menuItems.filter(item => item.category === this.selectedMenuCategory);
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    goToMenuItemDetail(item) {
      // 導航到菜品詳情頁面
      console.log('導航到菜品詳情頁面:', item.name);
      // 如果需要導航到菜品詳情頁面，可以使用以下代碼
      // this.$router.push({ name: 'MenuItemDetail', params: { id: item.id } });
    },
    goToRatingPage() {
      // 導航到評分頁面或者滾動到評論表單
      const commentFormElement = document.querySelector('.comment-form-container');
      if (commentFormElement) {
        commentFormElement.scrollIntoView({ behavior: 'smooth' });
      }
    },
    // 處理評論提交事件
    handleCommentSubmitted(comment) {
      console.log('收到新評論:', comment);
      this.loadComments();
    },
    // 加載評論列表
    loadComments() {
      if (this.$refs.commentList) {
        this.$refs.commentList.fetchData();
      }
    },
    // 更新評論數量
    updateCommentCount(count) {
      this.commentCount = count;
    },
    // 從後端獲取餐廳詳情
    async fetchRestaurantDetails() {
      try {
        console.log('正在獲取餐廳詳情，ID:', this.restaurantId);
        const response = await axios.get(`http://localhost:3000/api/restaurants/${this.restaurantId}`);
        
        if (response.data && response.data.restaurant) {
          this.restaurant = response.data.restaurant;
          console.log('獲取到的餐廳詳情:', this.restaurant);
          
          // 根據餐廳類型設定菜單類別
          this.fetchRestaurantMenu();
        } else {
          console.error('獲取餐廳詳情失敗，使用預設數據');
          this.useDefaultRestaurantData();
        }
      } catch (error) {
        console.error('獲取餐廳詳情錯誤:', error);
        this.useDefaultRestaurantData();
      }
    },
    
    // 從後端獲取餐廳菜單
    async fetchRestaurantMenu() {
      try {
        console.log('正在獲取餐廳菜單，ID:', this.restaurantId);
        const response = await axios.get(`http://localhost:3000/api/restaurants/${this.restaurantId}/menu`);
        
        if (response.data && Array.isArray(response.data.menu)) {
          this.menuItems = response.data.menu;
          console.log('獲取到的餐廳菜單:', this.menuItems);
          
          // 從菜單中提取類別
          const categories = [...new Set(this.menuItems.map(item => item.category))];
          if (categories.length > 0) {
            this.menuCategories = categories;
            this.selectedMenuCategory = categories[0];
          }
        } else {
          console.error('獲取餐廳菜單失敗，使用預設菜單');
          this.useDefaultMenuData();
        }
      } catch (error) {
        console.error('獲取餐廳菜單錯誤:', error);
        this.useDefaultMenuData();
      }
    },
    
    // 使用預設餐廳數據
    useDefaultRestaurantData() {
      this.restaurant = {
        restaurant_id: this.restaurantId,
        restaurant_name: '關東煙',
        restaurant_type: '中式料理',
        price_range: '250',
        address: '政治大學指南路二段64號',
        opening_hours: '11:00 - 21:00',
        rating: 3.3
      };
      
      this.useDefaultMenuData();
    },
    
    // 使用預設菜單數據
    useDefaultMenuData() {
      this.menuCategories = ['主食', '小菜', '湯品', '飲料'];
      this.selectedMenuCategory = '主食';
      this.menuItems = [
        { name: '叉燒飯', price: 120, category: '主食', description: '香嫩多汁的叉燒，搭配香噬噬白飯' },
        { name: '燒臘拼盤', price: 180, category: '主食', description: '招牌燒鴨、叉燒和燒肉的豪華組合' },
        { name: '油雞飯', price: 110, category: '主食', description: '皮脆肉嫩的油雞，配上特製醬汁' },
        { name: '清炒時蔭', price: 80, category: '小菜', description: '新鮮時令蔭菜' },
        { name: '酸辣黃瓜', price: 60, category: '小菜', description: '爽脆開胃的涼拌小菜' },
        { name: '例湯', price: 30, category: '湯品', description: '每日煮製的例湯' },
        { name: '熱茶', price: 20, category: '飲料', description: '可續杯的熱茶' }
      ];
    },
    
    // 處理圖片加載錯誤
    handleImageError(event) {
      event.target.src = require('@/assets/default-restaurant.jpg');
    },
    
    // 處理圖片URL，確保正確顯示
    getImageUrl(url) {
      if (!url) return require('@/assets/default-restaurant.jpg');
      
      // 如果已經是完整的 URL，直接返回
      if (url.startsWith('http')) return url;
      
      // 如果是以 /uploads 開頭，添加基礎 URL
      if (url.startsWith('/uploads')) {
        return `http://localhost:3000${url}`;
      }
      
      // 處理不帶前綴的上傳圖片路徑
      if (url && url.includes('image-')) {
        return `http://localhost:3000/uploads/${url}`;
      }
      
      // 其他情況，假設是相對路徑，添加 API 基礎 URL
      return `http://localhost:3000/api${url}`;
    },
  },
  mounted() {
    // 從路由參數中獲取餐廳ID
    this.restaurantId = this.$route.params.id || '1';
    
    // 從後端 API 獲取餐廳詳情
    this.fetchRestaurantDetails();
    
    // 加載評論
    this.loadComments();
  }
}
</script>

<style scoped>
.restaurant-detail-container {
  padding: 0 0 60px 0;
  max-width: 800px;
  margin: 0 auto;
}

.back-button {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
}

.back-button:hover {
  color: #006cb8;
}

.restaurant-cover {
  width: 100%;
  height: 250px;
  overflow: hidden;
  margin-bottom: 20px;
}

.restaurant-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.restaurant-info {
  padding: 0 20px;
  margin-bottom: 30px;
}

.restaurant-info h1 {
  font-size: 28px;
  margin-bottom: 12px;
  color: #333;
}

.restaurant-tags {
  display: flex;
  margin-bottom: 15px;
}

.tag {
  background-color: #f0f0f0;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  margin-right: 10px;
  color: #666;
}

.restaurant-address, .restaurant-open-hours {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #666;
  font-size: 15px;
}

.restaurant-address svg, .restaurant-open-hours svg {
  margin-right: 8px;
}

.rate-button {
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 15px;
  cursor: pointer;
  margin-top: 15px;
  transition: background-color 0.3s;
}

.rate-button:hover {
  background-color: #0d62c9;
}

.menu-section, .reviews-section {
  padding: 0 20px;
  margin-bottom: 40px;
}

.menu-section h2, .reviews-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #333;
}

.menu-tabs {
  display: flex;
  overflow-x: auto;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.menu-tab {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  white-space: nowrap;
  color: #666;
}

.menu-tab.active {
  color: #006cb8;
  border-bottom: 2px solid #006cb8;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.menu-item {
  display: flex;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
}

.menu-item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 15px;
}

.menu-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-item-info {
  flex: 1;
}

.menu-item-info h3 {
  font-size: 17px;
  margin-bottom: 5px;
  color: #333;
}

.menu-item-description {
  font-size: 14px;
  color: #777;
  margin-bottom: 5px;
}

.menu-item-price {
  font-weight: bold;
  color: #006cb8;
}

.add-to-cart-button {
  position: absolute;
  right: 15px;
  bottom: 15px;
  width: 30px;
  height: 30px;
  background-color: #006cb8;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.review-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #006cb8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
}

.review-user-info {
  flex: 1;
}

.review-user-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
}

.review-rating {
  display: flex;
}

.star {
  color: #ddd;
  margin-right: 2px;
}

.star.filled {
  color: #ffc107;
}

.review-date {
  font-size: 13px;
  color: #999;
}

.review-content {
  font-size: 15px;
  color: #555;
  line-height: 1.4;
}
</style> 