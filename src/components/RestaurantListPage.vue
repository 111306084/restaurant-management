<template>
  <div class="restaurant-list-container">
    <!-- 搜尋欄 -->
    <div class="search-container">
      <div class="search-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <input type="text" placeholder="餐廳名稱..." class="search-input" v-model="searchKeyword">
    </div>

    <!-- 篩選按鈕 -->
    <div class="filter-container">
      <button class="filter-button" @click="toggleFilterModal">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="21" x2="4" y2="14"></line>
          <line x1="4" y1="10" x2="4" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="3"></line>
          <line x1="20" y1="21" x2="20" y2="16"></line>
          <line x1="20" y1="12" x2="20" y2="3"></line>
          <line x1="1" y1="14" x2="7" y2="14"></line>
          <line x1="9" y1="8" x2="15" y2="8"></line>
          <line x1="17" y1="16" x2="23" y2="16"></line>
        </svg>
        篩選
        <span class="filter-count" v-if="activeFilters > 0">{{ activeFilters }}</span>
      </button>
    </div>

    <!-- 餐廳列表 -->
    <div v-if="loading" class="loading-container">
      <div class="skeleton-grid">
        <div class="skeleton-card" v-for="n in 6" :key="n">
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-rating"></div>
            <div class="skeleton-price"></div>
            <div class="skeleton-address"></div>
          </div>
        </div>
      </div>
      <p class="loading-text">載入中...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button class="retry-button" @click="fetchRestaurants">重試</button>
    </div>
    
    <div v-else class="restaurant-grid">
      <div 
        v-for="(restaurant, index) in filteredRestaurants" 
        :key="index" 
        class="restaurant-card"
        @click="goToRestaurantDetail(restaurant)"
      >
        <div class="restaurant-image">
          <img 
            :src="getImageUrl(restaurant.image_url)" 
            alt="餐廳圖片"
            @error="handleImageError($event)"
          >
          <div class="restaurant-badge" v-if="restaurant.restaurant_type">{{ restaurant.restaurant_type }}</div>
        </div>
        <div class="restaurant-content">
          <h3 class="restaurant-name">{{ restaurant.restaurant_name }}</h3>
          <div class="restaurant-info">
            <div class="restaurant-rating">
              <div class="stars">
                <i class="star" v-for="n in 5" :key="n" :class="{'filled': n <= (restaurant.rating !== undefined ? restaurant.rating : 0)}">★</i>
              </div>
              <span class="rating-value">{{ restaurant.rating !== undefined ? Number(restaurant.rating).toFixed(1) : '0.0' }}</span>
            </div>
            <p class="restaurant-price">
              <span class="price-tag">$ {{ restaurant.price_range }}</span>
              <span class="dot-separator">•</span> 
              <span class="time-info">{{ restaurant.opening_hours || '11:00-21:00' }}</span>
            </p>
            <p class="restaurant-address">{{ restaurant.address || '政大校園內' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 篩選器彈出模態框 -->
    <div class="filter-modal" v-if="showFilterModal">
      <div class="filter-modal-content">
        <div class="filter-modal-header">
          <button class="filter-cancel-btn" @click="toggleFilterModal">取消</button>
          <h2 class="filter-title">篩選</h2>
          <button class="filter-clear-btn" @click="clearFilters">清除全部</button>
        </div>

        <div class="filter-section" @click="toggleSection('category')">
          <h3 class="filter-section-title">餐廳分類</h3>
          <span class="arrow" :class="{ 'down': openSection === 'category' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>

        <div class="filter-options" v-if="openSection === 'category'">
          <div class="filter-tags">
            <button 
              v-for="category in categories" 
              :key="category"
              :class="['filter-tag', { 'active': selectedCategory === category }]"
              @click="selectCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div class="filter-section" @click="toggleSection('priceRange')">
          <h3 class="filter-section-title">平均消費區間</h3>
          <span class="arrow" :class="{ 'down': openSection === 'priceRange' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>

        <div class="filter-options" v-if="openSection === 'priceRange'">
          <div class="filter-tags">
            <button 
              v-for="range in priceRanges" 
              :key="range.id"
              :class="['filter-tag', { 'active': selectedPriceRange === range.id }]"
              @click="selectPriceRange(range.id)"
            >
              {{ range.label }}
            </button>
          </div>
        </div>

        <button class="apply-filters-btn" @click="applyFilters">套用篩選</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RestaurantListPage',
  data() {
    return {
      searchKeyword: '',
      showFilterModal: false,
      openSection: null,
      selectedCategory: null,
      selectedPriceRange: null,
      activeFilters: 0,
      categories: ['傳統早餐店', '中式餐廳', '咖啡廳', '韓式料理', '日式料理', '東南亞美食', '速食餐廳', '麵食館', '義式料理', '港式料理', '素食餐廳', '甜點店', '飲料店'],
      priceRanges: [
        { id: '10-25', label: '10~25' },
        { id: '25-50', label: '25~50' },
        { id: '50-75', label: '50~75' },
        { id: '75-100', label: '75~100' },
        { id: '100-125', label: '100~125' },
        { id: '125-150', label: '125~150' },
        { id: '150-175', label: '150~175' },
        { id: '175-200', label: '175~200' },
        { id: '200-250', label: '200~250' },
        { id: '250-300', label: '250~300' },
        { id: '300+', label: '300元以上' }
      ],
      restaurants: [],
      loading: true,
      error: null,
      loadingTimeout: null,
      cachedRestaurants: null,
      lastFetchTime: null
    }
  },
  computed: {
    filteredRestaurants() {
      let result = this.restaurants;

      // 按名稱搜尋
      if (this.searchKeyword) {
        result = result.filter(r => 
          r.restaurant_name.toLowerCase().includes(this.searchKeyword.toLowerCase())
        );
      }

      // 按類別篩選
      if (this.selectedCategory) {
        result = result.filter(r => r.restaurant_type === this.selectedCategory);
      }

      // 按價格範圍篩選
      if (this.selectedPriceRange) {
        // 處理餐廳價格範圍可能是區間的情況
        result = result.filter(r => {
          // 檢查餐廳價格是否為範圍格式 (例如 "25-100")
          if (r.price_range.includes('-')) {
            // 解析餐廳價格範圍
            const [restMin, restMax] = r.price_range.split('-').map(p => parseInt(p.replace('$', '')));
            
            // 解析選擇的價格範圍
            if (this.selectedPriceRange.includes('-')) {
              const [filterMin, filterMax] = this.selectedPriceRange.split('-').map(p => parseInt(p));
              
              // 檢查餐廳價格範圍是否與選擇的價格範圍有重疊
              return (restMin <= filterMax && restMax >= filterMin);
            } else {
              // 處理 "300+" 情況
              const filterMin = parseInt(this.selectedPriceRange.replace('+', ''));
              return restMax >= filterMin;
            }
          } else {
            // 處理餐廳價格為單一值的情況
            const price = parseFloat(r.price_range.replace('$', ''));
            
            if (this.selectedPriceRange.includes('-')) {
              const [filterMin, filterMax] = this.selectedPriceRange.split('-').map(p => parseInt(p));
              return price >= filterMin && price <= filterMax;
            } else {
              // 處理 "300+" 情況
              const filterMin = parseInt(this.selectedPriceRange.replace('+', ''));
              return price >= filterMin;
            }
          }
        });
      }

      return result;
    }
  },
  created() {
    // 檢查本地存儲中是否有緩存的數據
    const cachedData = localStorage.getItem('restaurantListCache');
    const cachedTimestamp = localStorage.getItem('restaurantListCacheTime');
    
    if (cachedData && cachedTimestamp) {
      // 如果緩存時間不超過10分鐘，直接使用緩存數據
      const cacheTime = parseInt(cachedTimestamp);
      const currentTime = new Date().getTime();
      
      if (currentTime - cacheTime < 10 * 60 * 1000) { // 10分鐘
        this.restaurants = JSON.parse(cachedData);
        this.loading = false;
        this.lastFetchTime = cacheTime;
        return;
      }
    }
    this.fetchRestaurants();
  },
  methods: {
    async fetchRestaurants() {
      try {
        // 清除所有緩存，確保只顯示從後端獲取的餐廳
        localStorage.removeItem('restaurantListCache');
        localStorage.removeItem('restaurantListCacheTime');
        this.cachedRestaurants = null;
        this.lastFetchTime = null;
        
        this.loading = true;
        this.error = null;
        
        // 設置載入超時
        this.loadingTimeout = setTimeout(() => {
          if (this.loading) {
            this.error = '載入超時，請稍後再試';
            this.loading = false;
          }
        }, 8000); // 8秒超時
        
        const response = await axios.get('http://localhost:3000/api/restaurants', {
          timeout: 15000, // 15秒請求超時
          // 添加一個隨機參數以避免網絡緩存
          params: { _t: new Date().getTime() }
        });
        
        // 清除超時計時器
        clearTimeout(this.loadingTimeout);
        
        if (response.data.restaurants && Array.isArray(response.data.restaurants)) {
          this.restaurants = response.data.restaurants;
          console.log('從後端獲取的餐廳列表:', this.restaurants);
          
          if (this.restaurants.length === 0) {
            this.error = '無法載入餐廳資訊，請稍後再試';
          }
        } else {
          this.error = '返回數據格式不正確，請稍後再試';
        }
      } catch (error) {
        // 清除超時計時器
        clearTimeout(this.loadingTimeout);
        
        console.error('獲取餐廳列表錯誤:', error);
        
        if (error.code === 'ECONNABORTED') {
          this.error = '連接超時，請檢查網絡或稍後再試';
        } else if (error.response) {
          this.error = `伺服器錯誤 (${error.response.status})，請稍後再試`;
        } else {
          this.error = '無法載入餐廳資訊，請稍後再試';
        }
      } finally {
        this.loading = false;
      }
    },
    goToRestaurantDetail(restaurant) {
      this.$router.push(`/restaurant/${restaurant.restaurant_id}`);
    },
    
    toggleFilterModal() {
      this.showFilterModal = !this.showFilterModal;
      if (!this.showFilterModal) {
        document.body.style.overflow = 'auto';
      } else {
        document.body.style.overflow = 'hidden';
      }
    },
    toggleSection(section) {
      this.openSection = this.openSection === section ? null : section;
    },
    selectCategory(category) {
      this.selectedCategory = this.selectedCategory === category ? null : category;
    },
    selectPriceRange(range) {
      this.selectedPriceRange = this.selectedPriceRange === range ? null : range;
    },
    clearFilters() {
      this.selectedCategory = null;
      this.selectedPriceRange = null;
      this.activeFilters = 0;
    },
    applyFilters() {
      this.activeFilters = (this.selectedCategory ? 1 : 0) + (this.selectedPriceRange ? 1 : 0);
      this.toggleFilterModal();
    },
    
    handleImageError(event) {
    // 圖片載入錯誤時，替換為本地預設圖片
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
  }
  }
}
</script>

<style scoped>
.restaurant-list-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-container {
  position: relative;
  margin-bottom: 20px;
  width: 100%;
  background-color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
}

.search-icon {
  margin-right: 12px;
  color: #666;
}

.search-input {
  flex: 1;
  border: none;
  padding: 10px 0;
  background: transparent;
  font-size: 16px;
  outline: none;
  color: #333;
}

.filter-container {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-button {
  display: flex;
  align-items: center;
  padding: 12px 22px;
  background: #ff5722;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(255, 87, 34, 0.3);
  transition: all 0.2s ease;
}

.filter-button:hover {
  background-color: #e64a19;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 87, 34, 0.4);
}

.filter-button svg {
  margin-right: 8px;
  stroke: white;
}

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  background-color: #ff5722;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  margin-left: 8px;
  padding: 0 4px;
}

.restaurant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.restaurant-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid #f0f0f0;
}

.restaurant-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}

.restaurant-image {
  width: 100%;
  height: 180px;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
}

.restaurant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.restaurant-card:hover .restaurant-image img {
  transform: scale(1.08);
}

.restaurant-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.restaurant-content {
  padding: 18px;
}

.restaurant-name {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.restaurant-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.restaurant-rating {
  display: flex;
  align-items: center;
}

.stars {
  display: flex;
  margin-right: 8px;
}

.star {
  color: #ddd;
  font-size: 16px;
}

.star.filled {
  color: #ffb700;
}

.rating-value {
  font-weight: 600;
  color: #333;
}

.restaurant-price {
  display: flex;
  align-items: center;
  margin: 0;
  color: #666;
  font-size: 14px;
}

.price-tag {
  font-weight: 500;
  color: #ff5722;
}

.dot-separator {
  margin: 0 6px;
  color: #aaa;
}

.time-info {
  color: #666;
}

.restaurant-address {
  margin: 0;
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.filter-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e1e1e1;
}

.filter-title {
  margin: 0;
  font-size: 18px;
}

.filter-cancel-btn, .filter-clear-btn {
  background: none;
  border: none;
  color: #1a73e8;
  font-size: 16px;
  cursor: pointer;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e1e1e1;
  cursor: pointer;
}

.filter-section-title {
  margin: 0;
  font-size: 18px;
}

.arrow {
  transition: transform 0.3s ease;
}

.arrow.down {
  transform: rotate(180deg);
}

.filter-options {
padding: 16px;
border-bottom: 1px solid #e1e1e1;
}

.filter-tags {
display: flex;
flex-wrap: wrap;
gap: 10px;
}

.filter-tag {
padding: 10px 18px;
background-color: #fff2ee;
border: 1px solid #ffcdc0;
border-radius: 20px;
font-size: 15px;
font-weight: 500;
color: #ff5722;
cursor: pointer;
transition: all 0.2s ease;
box-shadow: 0 2px 4px rgba(255, 87, 34, 0.15);
}

.filter-tag.active {
background-color: #ff5722;
color: white;
border-color: #ff5722;
font-weight: 600;
box-shadow: 0 3px 6px rgba(255, 87, 34, 0.4);
transform: translateY(-1px);
}

.filter-tag:hover {
background-color: #e9ecf0;
}

.filter-tag.active:hover {
background-color: #e64a19;
}

.apply-filters-btn {
position: fixed;
bottom: 20px;
left: 20px;
right: 20px;
padding: 16px;
background-color: #ff5722;
color: white;
border: none;
border-radius: 12px;
font-size: 17px;
font-weight: 600;
cursor: pointer;
box-shadow: 0 4px 8px rgba(255, 87, 34, 0.3);
transition: all 0.2s ease;
}

.apply-filters-btn:hover {
background-color: #e64a19;
transform: translateY(-2px);
box-shadow: 0 6px 12px rgba(255, 87, 34, 0.4);
}

.loading-container, .error-container {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 50px 0;
text-align: center;
}

.loading-container {
width: 100%;
animation: pulse 1.5s infinite alternate;
}

@keyframes pulse {
0% { opacity: 0.6; }
100% { opacity: 1; }
}

.loading-text {
text-align: center;
margin-top: 20px;
color: #666;
}

.skeleton-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 25px;
}

.skeleton-card {
background-color: white;
border-radius: 16px;
overflow: hidden;
box-shadow: 0 4px 15px rgba(0,0,0,0.08);
border: 1px solid #f0f0f0;
height: 300px;
}

.skeleton-image {
width: 100%;
height: 180px;
background-color: #f0f0f0;
animation: shimmer 2s infinite linear;
background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
background-size: 200% 100%;
}

.skeleton-content {
padding: 18px;
}

.skeleton-title {
height: 24px;
width: 70%;
background-color: #f0f0f0;
margin-bottom: 12px;
border-radius: 4px;
animation: shimmer 2s infinite linear;
background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
background-size: 200% 100%;
}

.skeleton-rating, .skeleton-price, .skeleton-address {
height: 16px;
width: 90%;
background-color: #f0f0f0;
margin-bottom: 8px;
border-radius: 4px;
animation: shimmer 2s infinite linear;
background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
background-size: 200% 100%;
}

.skeleton-price {
width: 60%;
}

.skeleton-address {
width: 80%;
}

@keyframes shimmer {
0% {
  background-position: 200% 0;
}
100% {
  background-position: -200% 0;
}
}

.retry-button {
margin-top: 20px;
padding: 10px 20px;
background-color: #4a90e2;
color: white;
border: none;
border-radius: 4px;
cursor: pointer;
}
</style> 