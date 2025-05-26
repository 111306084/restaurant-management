<template>
  <div class="restaurant-profile">
    <h1>餐廳資料管理</h1>
    
    <div v-if="loading" class="loading">
      <p>載入中...</p>
    </div>
    
    <div v-else class="profile-form">
      <!-- 表單標題 -->
      <div class="form-header">
        <h2>餐廳資料編輯</h2>
      </div>
      
      <!-- 封面照片上傳區域 -->
      <div class="photo-upload-section">
        <div class="photo-upload-card">
          <p class="photo-description">餐廳封面照片</p>
          <div class="photo-preview">
            <img 
              :src="getImageUrl(restaurant.image_url) || previewImage || require('@/assets/default-restaurant.jpg')" 
              alt="餐廳封面照片" 
              class="cover-image"
              style="object-fit: cover; width: 100%; height: 100%;"
            />
          </div>
          <button @click="triggerFileInput('main')" class="upload-photo-btn primary">
            <i class="fas fa-upload"></i> 上傳封面照片
          </button>
          <p class="upload-info" v-if="restaurant.image_url">最後更新: {{ formatDate(restaurant.updated_at) }}</p>
        </div>
      </div>
      
      <!-- 表單區域 -->
      <form @submit.prevent="updateProfile" class="profile-edit-form">
        <!-- 隱藏的文件輸入框 -->
        <input type="file" ref="mainImageInput" style="display: none" accept="image/*" @change="handleImageUpload" />
        
        <!-- 基本資訊 -->
        <div class="form-section">
          <h3>基本資訊</h3>
          
          <div class="form-group">
            <label for="restaurant_name">餐廳名稱</label>
            <input 
              type="text" 
              id="restaurant_name" 
              v-model="restaurant.restaurant_name" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="description">餐廳描述</label>
            <textarea 
              id="description" 
              v-model="restaurant.description" 
              rows="4" 
              placeholder="描述您的餐廳特色、菜品風格等..."
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="restaurant_type">餐廳類型</label>
            <select 
              id="restaurant_type" 
              v-model="restaurant.restaurant_type" 
              class="form-select"
            >
              <option value="" disabled>請選擇餐廳類型</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="price_range">價格範圍 (可多選)</label>
            <div class="price-range-tags">
              <button 
                v-for="range in priceRanges" 
                :key="range.id"
                type="button"
                :class="['price-tag', { 'active': restaurant.price_range.includes(range.id) }]"
                @click="togglePriceRange(range.id)"
              >
                {{ range.label }}
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="tags">標籤 (以逗號分隔)</label>
            <input 
              type="text" 
              id="tags" 
              v-model="restaurant.tags" 
              placeholder="例如：素食,辣,健康,學生優惠"
            />
          </div>
          
          <div class="form-group">
            <label for="is_featured">特色餐廳</label>
            <div class="toggle-switch">
              <input 
                type="checkbox" 
                id="is_featured" 
                v-model="restaurant.is_featured"
              />
              <label for="is_featured" class="toggle-label"></label>
              <span class="toggle-text">{{ restaurant.is_featured ? '是' : '否' }}</span>
            </div>
          </div>
        </div>
        
        <!-- 聯絡資訊 -->
        <div class="form-section">
          <h3>聯絡資訊</h3>
          
          <div class="form-group">
            <label for="address">地址</label>
            <input 
              type="text" 
              id="address" 
              v-model="restaurant.address" 
              placeholder="餐廳完整地址"
            />
          </div>
          
          <div class="form-group">
            <label for="phone">聯絡電話</label>
            <input 
              type="text" 
              id="phone" 
              v-model="restaurant.phone" 
              placeholder="餐廳聯絡電話"
            />
          </div>
          
          <div class="form-group">
            <label for="email">電子郵件</label>
            <input 
              type="email" 
              id="email" 
              v-model="restaurant.email" 
              placeholder="餐廳電子郵件"
            />
          </div>
          
          <div class="form-group">
            <label for="website">網站</label>
            <input 
              type="url" 
              id="website" 
              v-model="restaurant.website" 
              placeholder="餐廳網站網址"
            />
          </div>
          
        </div>
        
        <!-- 營業資訊 -->
        <div class="form-section">
          <h3>營業資訊</h3>
          
          <div class="form-group">
            <label for="opening_hours">營業時間</label>
            <input 
              type="text" 
              id="opening_hours" 
              v-model="restaurant.opening_hours" 
              placeholder="例如：週一至週五 11:00-21:00"
            />
          </div>
          
          <div class="form-group">
            <label for="avg_preparation_time">平均準備時間 (分鐘)</label>
            <input 
              type="number" 
              id="avg_preparation_time" 
              v-model="restaurant.avg_preparation_time" 
              placeholder="例如：15"
              min="0"
            />
          </div>
          
          <div class="form-group">
            <label for="delivery_fee">外送費用 (NT$)</label>
            <input 
              type="number" 
              id="delivery_fee" 
              v-model="restaurant.delivery_fee" 
              placeholder="例如：30"
              min="0"
              step="1"
            />
          </div>
          
          <div class="form-group">
            <label for="min_order_amount">最低訂單金額 (NT$)</label>
            <input 
              type="number" 
              id="min_order_amount" 
              v-model="restaurant.min_order_amount" 
              placeholder="例如：100"
              min="0"
              step="1"
            />
          </div>
        </div>
        
        <!-- 照片網址 (隱藏，由系統自動填入) -->
        <div class="form-section hidden">
          <input type="hidden" id="image_url" v-model="restaurant.image_url" />
          <input type="hidden" id="banner_image_url" v-model="restaurant.banner_image_url" />
          <input type="hidden" id="logo_url" v-model="restaurant.logo_url" />
        </div>
        
        <!-- 表單操作 -->
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="updating">
            {{ updating ? '更新中...' : '更新資料' }}
          </button>
        </div>
      </form>
      
      <!-- 更新訊息 -->
      <div v-if="updateMessage" class="update-message" :class="{ success: !updateError, error: updateError }">
        {{ updateMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import restaurantAPI from '../services/restaurantService';

export default {
  name: 'RestaurantProfile',
  data() {
    return {
      restaurant: {
        restaurant_id: '',
        restaurant_name: '',
        restaurant_type: '',
        price_range: [],
        address: '',
        opening_hours: '',
        description: '',
        image_url: '',
        phone: '',
        email: '',
        website: '',
        avg_preparation_time: null,
        delivery_fee: null,
        min_order_amount: null,
        is_featured: false,
        tags: '',
        location_lat: null,
        location_lng: null
      },
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
      loading: true,
      error: null,
      updating: false,
      updateMessage: '',
      updateError: false,
      previewImage: null,
      imageFile: null,
      bannerImageFile: null,
      logoImageFile: null,
      galleryImageFiles: [],
      restaurantImages: [],
      isUploading: false
    };
  },
  created() {
    this.fetchRestaurantProfile();
    this.fetchRestaurantImages();
  },
  methods: {
    // 處理連續的價格範圍，將它們合併為一個更大的範圍
    processPriceRanges(priceRanges) {
      if (!priceRanges || priceRanges.length === 0) return '';
      
      // 將價格範圍排序
      const sortedRanges = [...priceRanges].sort((a, b) => {
        // 處理特殊情況 "300+"
        if (a === '300+') return 1;
        if (b === '300+') return -1;
        
        // 正常情況下，按照範圍的起始值排序
        const [aMin] = a.split('-').map(n => parseInt(n));
        const [bMin] = b.split('-').map(n => parseInt(n));
        return aMin - bMin;
      });
      
      // 合併連續的範圍
      const mergedRanges = [];
      let currentRange = null;
      
      for (const range of sortedRanges) {
        // 處理特殊情況 "300+"
        if (range === '300+') {
          mergedRanges.push(range);
          continue;
        }
        
        const [min, max] = range.split('-').map(n => parseInt(n));
        
        if (!currentRange) {
          currentRange = { min, max };
        } else {
          // 檢查是否連續
          if (min <= currentRange.max + 25) {
            // 範圍連續，更新最大值
            currentRange.max = Math.max(currentRange.max, max);
          } else {
            // 範圍不連續，添加當前範圍並開始新範圍
            mergedRanges.push(`${currentRange.min}-${currentRange.max}`);
            currentRange = { min, max };
          }
        }
      }
      
      // 添加最後一個範圍
      if (currentRange) {
        mergedRanges.push(`${currentRange.min}-${currentRange.max}`);
      }
      
      return mergedRanges.join(',');
    },
    togglePriceRange(rangeId) {
      // 檢查是否已經選擇了該價格範圍
      const index = this.restaurant.price_range.indexOf(rangeId);
      
      if (index === -1) {
        // 如果沒有選擇，則添加
        this.restaurant.price_range.push(rangeId);
      } else {
        // 如果已經選擇，則移除
        this.restaurant.price_range.splice(index, 1);
      }
    },
    
    async fetchRestaurantProfile() {
      try {
        this.loading = true;
        const token = localStorage.getItem('token');
        
        if (!token) {
          // 如果沒有令牌，使用默認值
          this.loading = false;
          return;
        }
        
        // 從 localStorage 獲取餐廳基本信息
        const restaurantData = JSON.parse(localStorage.getItem('restaurant') || '{}');
        
        // 將餐廳基本信息合併到本地 restaurant 對象
        this.restaurant = {
          ...this.restaurant,
          restaurant_id: restaurantData.id || '',
          restaurant_name: restaurantData.name || '',
          // 其他基本信息保持默認值
        };
        
        try {
          // 獲取餐廳 ID
          const restaurantId = this.restaurant.restaurant_id || restaurantData.restaurant_id;
          console.log('已獲取餐廳ID:', restaurantId);
          
          // 嘗試從後端獲取餐廳詳細資料，使用正確的 API 路徑
          const response = await axios.get(`http://localhost:3000/api/restaurants/${restaurantId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          const apiRestaurantData = response.data.restaurant || {};
          
          // 將後端數據合併到本地 restaurant 對象
          this.restaurant = {
            ...this.restaurant,
            ...apiRestaurantData
          };
          
          // 處理價格範圍的多選功能
          if (typeof this.restaurant.price_range === 'string' && this.restaurant.price_range) {
            // 如果是字符串，轉換為數組
            this.restaurant.price_range = [this.restaurant.price_range];
          } else if (!Array.isArray(this.restaurant.price_range)) {
            // 如果不是數組，初始化為空數組
            this.restaurant.price_range = [];
          }
          
          // 確保數值型欄位正確處理
          if (this.restaurant.avg_preparation_time) {
            this.restaurant.avg_preparation_time = parseInt(this.restaurant.avg_preparation_time);
          }
          if (this.restaurant.delivery_fee) {
            this.restaurant.delivery_fee = parseFloat(this.restaurant.delivery_fee);
          }
          if (this.restaurant.min_order_amount) {
            this.restaurant.min_order_amount = parseFloat(this.restaurant.min_order_amount);
          }
        } catch (apiError) {
          console.warn('無法從 API 獲取餐廳詳細資料，使用默認值:', apiError);
          // 如果 API 請求失敗，使用已經設置的默認值繼續
        }
        
        this.loading = false;
      } catch (error) {
        console.error('獲取餐廳資料失敗:', error);
        // 使用默認值而不是顯示錯誤訊息
        this.loading = false;
      }
    },
    
    async fetchRestaurantImages() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // 從 localStorage 獲取餐廳 ID
        const restaurantData = JSON.parse(localStorage.getItem('restaurant') || '{}');
        const restaurantId = restaurantData.restaurant_id || restaurantData.id;
        
        if (!restaurantId) {
          console.error('無法獲取餐廳ID');
          this.updateMessage = '無法獲取餐廳ID，請重新登入';
          this.updateError = true;
          return;
        }
        console.log('已獲取餐廳ID:', restaurantId);
        
        console.log('嘗試獲取餐廳照片集，餐廳ID:', restaurantId);
        
        try {
          console.log('嘗試獲取餐廳照片集，餐廳ID:', restaurantId);
          const response = await axios.get(`http://localhost:3000/api/restaurants/images`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
            
          console.log('餐廳照片集響應:', response.data);
            
          if (response.data.success) {
            this.restaurantImages = response.data.images || [];
            console.log('成功獲取餐廳照片集:', this.restaurantImages.length, '張照片');
          } else {
            this.restaurantImages = [];
            console.log('無法獲取餐廳照片集，使用空數組');
          }
        } catch (error) {
          console.error('獲取餐廳照片集失敗:', error?.response?.status, error?.response?.data || error.message);
          // 如果 API 尚未實現，使用空數組
          this.restaurantImages = [];
          console.log('無法獲取餐廳照片集，使用空數組');
        }
      } catch (error) {
        console.error('獲取餐廳照片集失敗:', error?.response?.status, error?.response?.data || error.message);
        // 如果 API 尚未實現，使用空數組
        this.restaurantImages = [];
      }
    },
    
    triggerFileInput(type) {
      // 只保留封面照片上傳功能
      if (type === 'main') {
        this.$refs.mainImageInput.click();
      }
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
      if (url.includes('image-')) {
        return `http://localhost:3000/uploads/${url}`;
      }
      
      // 其他情況，假設是相對路徑，添加 API 基礎 URL
      return `http://localhost:3000/api${url}`;
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '未知';
      const date = new Date(dateString);
      return date.toLocaleString('zh-TW', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    async handleImageUpload(event) {
      // 確保 event 和 event.target 存在
      if (!event || !event.target || !event.target.files) {
        console.error('無效的事件對象，無法讀取文件');
        return;
      }
      
      const file = event.target.files[0];
      if (!file) return;
      
      // 檢查檔案類型
      if (!file.type.match('image.*')) {
        this.updateMessage = '請上傳圖片檔案';
        this.updateError = true;
        return;
      }
      
      // 檢查檔案大小 (限制為 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.updateMessage = '圖片大小不能超過 5MB';
        this.updateError = true;
        return;
      }
      
      // 顯示上傳中狀態
      this.isUploading = true;
      
      try {
        // 先顯示預覽
        const reader = new FileReader();
        this.imageFile = file;
        reader.onload = e => {
          this.previewImage = e.target.result;
        };
        reader.readAsDataURL(file);
        
        // 創建 FormData 對象
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'main'); // 固定為主圖片類型
        
        const token = localStorage.getItem('token');
        if (!token) {
          this.updateMessage = '請先登入';
          this.updateError = true;
          return;
        }
        
        // 確保我們有餐廳ID
        const restaurantData = JSON.parse(localStorage.getItem('restaurant') || '{}');
        const restaurantId = restaurantData.restaurant_id || restaurantData.id;
        
        if (!restaurantId) {
          console.error('無法獲取餐廳ID');
          this.updateMessage = '無法獲取餐廳ID，請重新登入';
          this.updateError = true;
          return;
        }
        console.log('正在上傳餐廳封面照片，餐廳ID:', restaurantId);
        
        // 上傳圖片到後端
        const response = await axios.post('http://localhost:3000/api/restaurants/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('圖片上傳響應:', response.data);
        
        if (response.data.success) {
          // 更新餐廳圖片URL為後端返回的URL
          const imageUrl = response.data.imageUrl;
          this.restaurant.image_url = imageUrl;
          console.log('已更新餐廳封面照片URL:', imageUrl);
          
          this.updateMessage = '封面照片上傳成功';
          this.updateError = false;
          
          // 重新獲取餐廳資料以確保數據同步
          await this.fetchRestaurantProfile();
        } else {
          this.updateMessage = response.data.message || '圖片上傳失敗';
          this.updateError = true;
        }
      } catch (error) {
        console.error('上傳圖片錯誤:', error);
        this.updateMessage = '圖片上傳失敗: ' + (error.response?.data?.message || error.message);
        this.updateError = true;
      } finally {
        this.isUploading = false;
        // 清空文件輸入以允許重新選擇同一文件
        event.target.value = '';
      }
    },
    
    async uploadImage(file, type = 'main') {
      if (!file) return null;
      
      try {
        // 創建 FormData 對象
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', type);
        
        // 使用餐廳 API 服務上傳圖片
        const response = await restaurantAPI.uploadImage(formData);
        
        if (response.success) {
          return response.imageUrl;
        }
        
        // 如果後端 API 尚未實現，使用 base64 作為臨時解決方案
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(file);
        });
      } catch (error) {
        console.error('上傳圖片失敗:', error);
        
        // 如果 API 調用失敗，使用 base64 作為備用方案
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(file);
        });
      }
    },
    
    async uploadGalleryImages() {
      if (this.galleryImageFiles.length === 0) return [];
      
      try {
        const token = localStorage.getItem('token');
        const uploadPromises = this.galleryImageFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('type', 'gallery');
          
          try {
            const response = await axios.post('http://localhost:3000/api/restaurants/upload-gallery-image', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.data.success) {
              return response.data.image;
            }
            return null;
          } catch (error) {
            console.error('上傳照片集圖片失敗:', error);
            return null;
          }
        });
        
        const results = await Promise.all(uploadPromises);
        return results.filter(result => result !== null);
      } catch (error) {
        console.error('上傳照片集失敗:', error);
        return [];
      }
    },
    
    async updateProfile() {
      try {
        this.isSubmitting = true;
        this.errorMessage = '';
        
        console.log('===== 開始更新餐廳資料 =====');
        console.log('原始餐廳數據:', this.restaurant);
        this.updateError = false;
        
        const token = localStorage.getItem('token');
        
        // 處理主要圖片上傳
        if (this.imageFile) {
          const imageUrl = await this.uploadImage(this.imageFile, 'main');
          if (imageUrl) {
            this.restaurant.image_url = imageUrl;
          }
        }
        
        // 處理橫幅圖片上傳
        if (this.bannerImageFile) {
          const bannerImageUrl = await this.uploadImage(this.bannerImageFile, 'banner');
          if (bannerImageUrl) {
            this.restaurant.banner_image_url = bannerImageUrl;
          }
        }
        
        // 處理標誌圖片上傳
        if (this.logoImageFile) {
          const logoImageUrl = await this.uploadImage(this.logoImageFile, 'logo');
          if (logoImageUrl) {
            this.restaurant.logo_url = logoImageUrl;
          }
        }
        
        // 處理照片集上傳
        if (this.galleryImageFiles && this.galleryImageFiles.length > 0) {
          const uploadedImages = await this.uploadGalleryImages();
          
          // 更新照片集
          if (uploadedImages.length > 0) {
            // 移除臨時圖片
            this.restaurantImages = this.restaurantImages.filter(img => !img.isTemp);
            // 添加新上傳的圖片
            this.restaurantImages = [...this.restaurantImages, ...uploadedImages];
          }
          
          // 清空臨時文件
          this.galleryImageFiles = [];
        }
        
        // 發送更新請求
        // 從本地存儲中獲取餐廳 ID
        const restaurantData = JSON.parse(localStorage.getItem('restaurant') || '{}');
        
        // 輸出存儲的餐廳數據，用於調試
        console.log('存儲的餐廳數據:', restaurantData);
        
        // 嘗試不同的屬性名稱，因為可能在不同地方使用了不同的屬性名
        let restaurantId = restaurantData.restaurant_id || restaurantData.id;
        
        console.log('獲取的餐廳 ID:', restaurantId);
        
        if (!restaurantId) {
          throw new Error('無法獲取餐廳ID，請重新登入');
        }
        
        console.log('準備更新餐廳資料，ID:', restaurantId);
        
        // 處理價格範圍的多選功能
        const dataToSend = { ...this.restaurant };
        
        // 輸出要發送的數據，用於調試
        console.log('要發送的原始數據:', JSON.stringify(dataToSend));
        
        // 處理價格範圍，合併連續的範圍
        if (Array.isArray(dataToSend.price_range)) {
          if (dataToSend.price_range.length > 0) {
            // 使用 processPriceRanges 方法處理連續的價格範圍
            dataToSend.price_range = this.processPriceRanges(dataToSend.price_range);
            console.log('處理後的合併價格範圍:', dataToSend.price_range);
          } else {
            // 如果沒有選擇價格範圍，設置為空字符串
            dataToSend.price_range = '';
          }
        } else if (dataToSend.price_range === null || dataToSend.price_range === undefined) {
          // 確保不是 null 或 undefined
          dataToSend.price_range = '';
        }
        
        // 確保餐廳類型是有效的字符串
        if (!dataToSend.restaurant_type) {
          dataToSend.restaurant_type = ''; // 如果沒有選擇餐廳類型，設置為空字符串
        } else if (typeof dataToSend.restaurant_type !== 'string') {
          // 如果不是字符串，嘗試轉換
          dataToSend.restaurant_type = String(dataToSend.restaurant_type);
        }
        
        console.log('處理後的餐廳類型:', dataToSend.restaurant_type, '類型:', typeof dataToSend.restaurant_type);
        
        console.log('處理後的價格範圍:', dataToSend.price_range);
        console.log('要發送的最終數據:', JSON.stringify(dataToSend));
        
        // 確保有有效的認證令牌
        if (!token) {
          console.error('未找到認證令牌');
          throw new Error('您的登入已過期，請重新登入');
        }
        
        console.log('使用餐廳 API 服務發送請求');
        
        // 使用專門的餐廳 API 服務
        const response = await restaurantAPI.updateProfile(restaurantId, dataToSend);
        
        if (response.success) {
          this.updateMessage = '餐廳資料更新成功！';
          this.restaurant = response.restaurant || this.restaurant;
          
          // 清除文件引用
          this.imageFile = null;
          this.bannerImageFile = null;
          this.logoImageFile = null;
          
          // 更新本地存儲的餐廳資料
          const restaurantData = JSON.parse(localStorage.getItem('restaurant'));
          if (restaurantData) {
            restaurantData.restaurant_name = this.restaurant.restaurant_name;
            localStorage.setItem('restaurant', JSON.stringify(restaurantData));
          }
        } else {
          throw new Error(response.message || '更新失敗');
        }
      } catch (error) {
        // 顯示更詳細的錯誤信息
        console.error('更新餐廳資料失敗:', error);
        
        // 如果是 API 響應錯誤，顯示後端返回的錯誤信息
        if (error.response) {
          console.error('後端響應:', error.response.status, error.response.data);
          this.updateMessage = `更新失敗: ${error.response.data.message || '伺服器錯誤'}`;
        } else if (error.request) {
          // 請求已發送但沒有收到響應
          console.error('無響應:', error.request);
          this.updateMessage = '更新失敗: 無法連接到伺服器';
        } else {
          // 其他錯誤
          this.updateMessage = `更新失敗: ${error.message || '未知錯誤'}`;
        }
        
        this.updateError = true;
      } finally {
        this.updating = false;
        
        // 5秒後清除訊息
        setTimeout(() => {
          this.updateMessage = '';
          this.updateError = false;
        }, 5000);
      }
    }
  }
}
</script>

<style scoped>
.restaurant-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}

/* 價格範圍多選標籤樣式 */
.price-range-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.price-tag {
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

.price-tag.active {
  background-color: #ff5722;
  color: white;
  border-color: #ff5722;
  font-weight: 600;
  box-shadow: 0 3px 6px rgba(255, 87, 34, 0.4);
  transform: translateY(-1px);
}

.price-tag:hover {
  background-color: #ffe5dd;
  border-color: #ffb8a3;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(255, 87, 34, 0.2);
}

.price-tag.active:hover {
  background-color: #e64a19;
  box-shadow: 0 4px 8px rgba(255, 87, 34, 0.5);
}

/* 下拉選單樣式 */
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
  background-color: white;
  transition: border-color 0.3s;
}

.form-select:focus {
  border-color: #4a90e2;
  outline: none;
}

/* 照片管理區域樣式 */
.photo-management-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.photo-management-section h3 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.photo-management-section h4 {
  margin-bottom: 10px;
  font-size: 18px;
  color: #444;
}

.photo-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.main-photo-upload {
  margin-bottom: 30px;
}

.photo-upload-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.photo-preview {
  margin: 15px 0;
  text-align: center;
}

.cover-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.upload-photo-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-photo-btn:hover {
  background-color: #3a80d2;
}

.upload-photo-btn.primary {
  background-color: #ff5722;
}

.upload-photo-btn.primary:hover {
  background-color: #e64a19;
}

.upload-info {
  margin-top: 10px;
  font-size: 12px;
  color: #888;
  text-align: center;
}

/* 預覽區域樣式 */
.preview-section {
  margin-bottom: 40px;
  background-color: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  font-weight: 700;
  font-size: 32px;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

h3 {
  font-size: 20px;
  margin-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
}

.loading, .error {
  text-align: center;
  margin: 40px 0;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.error {
  color: #e74c3c;
  background-color: #fdf3f2;
}

/* 預覽區域樣式 */
.preview-section {
  margin-bottom: 40px;
  background-color: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.preview-section h2 {
  padding: 20px;
  margin: 0;
  background-color: #2c3e50;
  color: white;
}

.preview-container {
  padding: 20px;
}

/* 橫幅照片預覽 */
.banner-preview {
  position: relative;
  height: 250px;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-upload-btn {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.banner-upload-btn:hover {
  background-color: rgba(0, 0, 0, 0.9);
}

/* 基本資訊預覽 */
.info-preview {
  display: flex;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.logo-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin-right: 20px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-upload-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 6px 0;
  cursor: pointer;
  font-size: 12px;
  text-align: center;
  transition: background-color 0.3s;
}

.logo-upload-btn:hover {
  background-color: rgba(0, 0, 0, 0.9);
}

.basic-info {
  flex: 1;
}

.basic-info h2 {
  margin-top: 0;
  margin-bottom: 5px;
  font-size: 24px;
}

.restaurant-id {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 10px;
}

.restaurant-type, .price-range {
  margin: 5px 0;
  color: #34495e;
}

.tags-preview {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background-color: #e5f7ff;
  color: #0078d4;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
  display: inline-block;
}

/* 餐廳描述預覽 */
.description-preview {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  line-height: 1.6;
}

.placeholder {
  color: #95a5a6;
  font-style: italic;
}

/* 照片集預覽 */
.gallery-preview {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gallery-preview h3 {
  margin-top: 0;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.empty-gallery {
  text-align: center;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #7f8c8d;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.gallery-image-container {
  position: relative;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-image-container:hover .gallery-image {
  transform: scale(1.05);
}

.image-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  gap: 5px;
}

.delete-image-btn {
  background-color: rgba(231, 76, 60, 0.8);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-image-btn:hover {
  background-color: rgba(231, 76, 60, 1);
}

.upload-gallery-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: #f0f0f0;
  border: 2px dashed #ccc;
  border-radius: 8px;
  color: #7f8c8d;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-gallery-btn:hover {
  background-color: #e0e0e0;
  border-color: #aaa;
  color: #2c3e50;
}

/* 表單區域樣式 */
.profile-edit-form {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.form-section {
  margin-bottom: 30px;
}

.form-section.hidden {
  display: none;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

input, textarea, select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus, textarea:focus, select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

/* 切換開關樣式 */
.toggle-switch {
  display: flex;
  align-items: center;
}

.toggle-switch input[type="checkbox"] {
  display: none;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  background-color: #ccc;
  border-radius: 13px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

input[type="checkbox"]:checked + .toggle-label {
  background-color: #2ecc71;
}

input[type="checkbox"]:checked + .toggle-label::after {
  transform: translateX(24px);
}

.toggle-text {
  margin-left: 10px;
  font-weight: 600;
}

/* 位置輸入樣式 */
.location-group {
  margin-bottom: 30px;
}

.location-inputs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.location-inputs input {
  flex: 1;
}

.map-placeholder {
  height: 200px;
  background-color: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
}

/* 表單操作樣式 */
.form-actions {
  margin-top: 40px;
  text-align: center;
}

.submit-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.submit-btn:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.submit-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 更新訊息樣式 */
.update-message {
  margin-top: 30px;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
  animation: fadeIn 0.5s ease-out;
}

.update-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.update-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* 動畫效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .info-preview {
    flex-direction: column;
    align-items: center;
  }
  
  .logo-container {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .basic-info {
    text-align: center;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .form-section h3 {
    text-align: center;
  }
}
</style>
