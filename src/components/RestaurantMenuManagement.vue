<template>
  <div class="menu-management">
    <h1>菜單管理</h1>
    
    <div v-if="loading" class="loading">
      <p>載入中...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <div v-else class="menu-container">
      <!-- 菜單概覽 -->
      <div class="menu-overview">
        <div class="section-header">
          <h2>{{ restaurantName }} 的菜單</h2>
          <button @click="showAddItemModal = true" class="add-btn">
            <i class="fas fa-plus"></i> 新增菜品
          </button>
        </div>
        
        <div class="category-filter">
          <span class="filter-label">分類過濾：</span>
          <button 
            class="filter-btn" 
            :class="{ active: activeCategory === 'all' }"
            @click="activeCategory = 'all'"
          >
            全部
          </button>
          <button 
            v-for="category in categories" 
            :key="category"
            class="filter-btn" 
            :class="{ active: activeCategory === category }"
            @click="activeCategory = category"
          >
            {{ category }}
          </button>
        </div>
        
        <div v-if="filteredMenuItems.length === 0" class="empty-state">
          <p v-if="activeCategory === 'all'">您還沒有添加任何菜品</p>
          <p v-else>此分類下沒有菜品</p>
          <button @click="showAddItemModal = true" class="add-first-btn">
            添加第一個菜品
          </button>
        </div>
        
        <div v-else class="menu-grid">
          <div 
            v-for="item in filteredMenuItems" 
            :key="item.menu_id"
            class="menu-item-card"
          >
            <div class="menu-item-image">
              <img :src="getImageUrl(item.image_url)" alt="菜品照片" />
              <div class="menu-item-actions">
                <button @click="editMenuItem(item)" class="action-btn edit-btn">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDeleteItem(item)" class="action-btn delete-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="menu-item-info">
              <h3 class="menu-item-name">{{ item.item_name }}</h3>
              <div class="menu-item-category">{{ item.category }}</div>
              <div class="menu-item-price">NT$ {{ item.price }}</div>
              <div class="menu-item-availability" :class="{ 'unavailable': !item.is_available }">
                {{ item.is_available ? '供應中' : '暫停供應' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 添加/編輯菜品彈窗 -->
      <div v-if="showAddItemModal || showEditItemModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ showEditItemModal ? '編輯菜品' : '新增菜品' }}</h3>
            <button @click="closeItemModal" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <form @submit.prevent="saveMenuItem" class="menu-item-form">
            <div class="form-row">
              <div class="form-group">
                <label for="item_name">菜品名稱 <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="item_name" 
                  v-model="currentItem.item_name" 
                  required
                  placeholder="輸入菜品名稱"
                />
              </div>
              
              <div class="form-group">
                <label for="price">價格 <span class="required">*</span></label>
                <div class="price-input">
                  <span class="currency">NT$</span>
                  <input 
                    type="number" 
                    id="price" 
                    v-model="currentItem.price" 
                    min="0" 
                    step="1" 
                    required
                    placeholder="輸入價格"
                  />
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="category">分類 <span class="required">*</span></label>
                <div class="category-input">
                  <select id="category" v-model="currentItem.category" required>
                    <option value="" disabled>選擇分類</option>
                    <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                    <option value="custom">自定義分類</option>
                  </select>
                  <input 
                    v-if="currentItem.category === 'custom'" 
                    type="text" 
                    v-model="newCategory" 
                    placeholder="輸入新分類名稱"
                    required
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="spicy_level">辣度</label>
                <select id="spicy_level" v-model="currentItem.spicy_level">
                  <option value="0">不辣</option>
                  <option value="1">微辣</option>
                  <option value="2">中辣</option>
                  <option value="3">重辣</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="recommend_level">推薦指數</label>
                <select id="recommend_level" v-model="currentItem.recommend_level">
                  <option value="0">一般</option>
                  <option value="1">推薦</option>
                  <option value="2">強力推薦</option>
                  <option value="3">招牌菜品</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="calories">熱量 (卡路里)</label>
                <input 
                  type="number" 
                  id="calories" 
                  v-model="currentItem.calories" 
                  min="0" 
                  placeholder="例如: 350"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="ingredients">食材原料</label>
              <textarea 
                id="ingredients" 
                v-model="currentItem.ingredients" 
                rows="2" 
                placeholder="列出主要食材，例如: 義大利麵、蝦仁、蒜頭、橄欖油..."
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="description">詳細描述</label>
              <textarea 
                id="description" 
                v-model="currentItem.description" 
                rows="3" 
                placeholder="描述菜品特色、製作方式、口感等..."
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="allergens">過敏原資訊</label>
              <input 
                type="text" 
                id="allergens" 
                v-model="currentItem.allergens" 
                placeholder="例如: 海鮮、堅果、麩質..."
              />
            </div>
            
            <div class="form-group">
              <label for="item-image-upload">菜品照片</label>
              <div class="image-upload-preview">
                <img 
                  :src="itemPreviewImage || getImageUrl(currentItem.image_url)" 
                  alt="菜品照片預覽" 
                />
                <input 
                  type="file" 
                  id="item-image-upload"
                  @change="handleItemImageUpload" 
                  accept="image/*"
                  ref="itemImageInput"
                  style="display: none"
                />
                <button type="button" @click="triggerItemImageUpload" class="upload-btn">
                  <i class="fas fa-upload"></i> 上傳照片
                </button>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="preparation_time">準備時間 (分鐘)</label>
                <input 
                  type="number" 
                  id="preparation_time" 
                  v-model="currentItem.preparation_time" 
                  min="1" 
                  placeholder="例如: 15"
                />
              </div>
              
              <div class="form-group">
                <div class="availability-toggle">
                  <input 
                    type="checkbox" 
                    id="is_available" 
                    v-model="currentItem.is_available"
                  />
                  <label for="is_available" class="toggle-label">
                    {{ currentItem.is_available ? '供應中' : '暫停供應' }}
                  </label>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeItemModal" class="cancel-btn">取消</button>
              <button type="submit" class="save-btn" :disabled="saving">
                {{ saving ? '儲存中...' : '儲存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- 刪除確認彈窗 -->
      <div v-if="showDeleteConfirmModal" class="modal-overlay">
        <div class="modal-content delete-confirm-modal">
          <div class="modal-header">
            <h3>確認刪除</h3>
            <button @click="showDeleteConfirmModal = false" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="delete-confirm-content">
            <p>確定要刪除「{{ itemToDelete.item_name }}」嗎？</p>
            <p class="warning">此操作無法恢復！</p>
          </div>
          
          <div class="form-actions">
            <button @click="showDeleteConfirmModal = false" class="cancel-btn">取消</button>
            <button @click="deleteMenuItem" class="delete-btn" :disabled="deleting">
              {{ deleting ? '刪除中...' : '確認刪除' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 操作結果提示 -->
      <div v-if="actionMessage" class="action-message" :class="{ success: !actionError, error: actionError }">
        {{ actionMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RestaurantMenuManagement',
  data() {
    return {
      restaurantId: '',
      restaurantName: '',
      menuItems: [],
      categories: ['主食', '前菜', '湯品', '甜點', '飲料'],
      activeCategory: 'all',
      loading: true,
      error: null,
      showAddItemModal: false,
      showEditItemModal: false,
      showDeleteConfirmModal: false,
      currentItem: {
        menu_id: '',
        item_name: '',
        category: '',
        price: '',
        description: '',
        image_url: '',
        is_available: true,
        spicy_level: '0',
        recommend_level: '0',
        calories: '',
        ingredients: '',
        allergens: '',
        preparation_time: ''
      },
      newCategory: '',
      itemPreviewImage: null,
      itemImageFile: null,
      itemToDelete: {},
      saving: false,
      deleting: false,
      actionMessage: '',
      actionError: false
    };
  },
  computed: {
    filteredMenuItems() {
      if (this.activeCategory === 'all') {
        return this.menuItems;
      }
      return this.menuItems.filter(item => item.category === this.activeCategory);
    }
  },
  created() {
    this.loadRestaurantInfo();
    this.fetchMenuItems();
  },
  methods: {
    async loadRestaurantInfo() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$router.push('/merchant-login');
          return;
        }
        
        // 從本地存儲獲取餐廳信息
        const restaurantData = JSON.parse(localStorage.getItem('restaurant'));
        if (restaurantData) {
          this.restaurantId = restaurantData.restaurant_id;
          this.restaurantName = restaurantData.restaurant_name;
        } else {
          // 如果本地沒有，從API獲取
          const response = await axios.get('http://localhost:3000/api/restaurant/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          this.restaurantId = response.data.restaurant.restaurant_id;
          this.restaurantName = response.data.restaurant.restaurant_name;
        }
      } catch (error) {
        console.error('獲取餐廳信息失敗:', error);
        this.error = '無法載入餐廳信息';
      }
    },
    async fetchMenuItems() {
      try {
        this.loading = true;
        const token = localStorage.getItem('token');
        
        if (!token) {
          this.$router.push('/merchant-login');
          return;
        }
        
        const response = await axios.get(`http://localhost:3000/api/restaurants/${this.restaurantId}/menu`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        this.menuItems = response.data.menuItems || [];
        
        // 從菜單項中提取分類
        const menuCategories = [...new Set(this.menuItems.map(item => item.category))];
        this.categories = [...new Set([...this.categories, ...menuCategories.filter(cat => cat)])]; // 合併預設分類和菜單分類
        
        this.loading = false;
      } catch (error) {
        console.error('獲取菜單失敗:', error);
        this.error = '無法載入菜單數據，請稍後再試';
        this.loading = false;
      }
    },
    editMenuItem(item) {
      this.currentItem = { ...item };
      this.showEditItemModal = true;
    },
    confirmDeleteItem(item) {
      this.itemToDelete = item;
      this.showDeleteConfirmModal = true;
    },
    async toggleItemAvailability(item) {
      try {
        const token = localStorage.getItem('token');
        const updatedItem = { ...item, is_available: !item.is_available };
        
        await axios.put(`http://localhost:3000/api/restaurant/${this.restaurantId}/menu/${item.menu_id}`, updatedItem, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // 更新本地數據
        const index = this.menuItems.findIndex(i => i.menu_id === item.menu_id);
        if (index !== -1) {
          this.menuItems[index].is_available = !item.is_available;
        }
        
        this.showActionMessage(`${item.item_name} ${updatedItem.is_available ? '已恢復供應' : '已暫停供應'}`);
      } catch (error) {
        console.error('更新菜品狀態失敗:', error);
        this.showActionMessage('更新菜品狀態失敗，請稍後再試', true);
      }
    },
    triggerItemImageUpload() {
      this.$refs.itemImageInput.click();
    },
    
    // 處理圖片URL，確保正確顯示
    getImageUrl(url) {
      console.log('處理圖片URL:', url);
      
      if (!url) {
        console.log('無URL，返回預設圖片');
        return require('@/assets/default-restaurant.jpg');
      }
      
      // 如果已經是完整的 URL，直接返回
      if (url.startsWith('http')) {
        console.log('已是完整URL，直接返回:', url);
        return url;
      }
      
      // 如果是以 /uploads 開頭，添加基礎 URL
      if (url.startsWith('/uploads')) {
        const fullUrl = `http://localhost:3000${url}`;
        console.log('處理上傳檔案URL:', fullUrl);
        return fullUrl;
      }
      
      // 如果是以 uploads/ 開頭，添加基礎 URL 和斜線
      if (url.startsWith('uploads/')) {
        const fullUrl = `http://localhost:3000/${url}`;
        console.log('處理相對上傳路徑:', fullUrl);
        return fullUrl;
      }
      
      // 其他情況，假設是相對路徑，添加 API 基礎 URL
      const apiUrl = `http://localhost:3000/api${url}`;
      console.log('處理API路徑:', apiUrl);
      return apiUrl;
    },
    handleItemImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // 檢查檔案類型
      if (!file.type.match('image.*')) {
        this.showActionMessage('請上傳圖片檔案', true);
        return;
      }
      
      // 檢查檔案大小 (限制為 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showActionMessage('圖片大小不能超過 5MB', true);
        return;
      }
      
      // 預覽圖片
      this.itemImageFile = file;
      const reader = new FileReader();
      reader.onload = e => {
        this.itemPreviewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    async uploadItemImage() {
      if (!this.itemImageFile) {
        console.log('無圖片檔案需要上傳');
        return null;
      }
      
      try {
        // 創建 FormData 對象
        const formData = new FormData();
        formData.append('image', this.itemImageFile);
        
        // 記錄圖片資訊
        console.log('正在上傳圖片:', {
          name: this.itemImageFile.name,
          type: this.itemImageFile.type,
          size: `${(this.itemImageFile.size / 1024).toFixed(2)} KB`
        });
        
        // 使用專門的菜單圖片上傳端點
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('無法獲取授權令牌');
          this.showActionMessage('授權錯誤，請重新登入', true);
          return null;
        }
        
        console.log(`正在使用菜單專用端點上傳圖片... 餐廳ID: ${this.restaurantId}`);
        const uploadUrl = `http://localhost:3000/api/restaurants/${this.restaurantId}/menu/upload-image`;
        console.log('上傳端點:', uploadUrl);
        
        const response = await axios.post(
          uploadUrl,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log('圖片上傳響應:', response.data);
        
        // 返回圖片 URL
        if (response.data && response.data.success && response.data.imageUrl) {
          const imageUrl = response.data.imageUrl;
          console.log('得到圖片URL:', imageUrl);
          
          // 測試圖片URL是否可訪問
          const fullUrl = `http://localhost:3000${imageUrl}`;
          console.log('完整圖片URL:', fullUrl);
          
          return fullUrl;
        } else {
          console.error('圖片上傳成功但無法取得URL:', response.data);
          throw new Error('圖片上傳失敗: ' + (response.data.message || '未知錯誤'));
        }
      } catch (error) {
        console.error('上傳圖片失敗:', error);
        this.showActionMessage('圖片上傳失敗，請稍後再試', true);
        return null;
      }
    },
    closeItemModal() {
      this.showAddItemModal = false;
      this.showEditItemModal = false;
      this.resetItemForm();
    },
    resetItemForm() {
      this.currentItem = {
        menu_id: '',
        item_name: '',
        category: '',
        price: '',
        description: '',
        image_url: '',
        is_available: true,
        spicy_level: '0',
        recommend_level: '0',
        calories: '',
        ingredients: '',
        allergens: '',
        preparation_time: ''
      };
      this.newCategory = '';
      this.itemPreviewImage = null;
      this.itemImageFile = null;
    },
    async saveMenuItem() {
      try {
        this.saving = true;
        const token = localStorage.getItem('token');
        
        // 處理自定義分類
        if (this.currentItem.category === 'custom' && this.newCategory) {
          this.currentItem.category = this.newCategory;
          if (!this.categories.includes(this.newCategory)) {
            this.categories.push(this.newCategory);
          }
        }
        
        // 如果有上傳新圖片，先處理圖片上傳
        if (this.itemImageFile) {
          const imageUrl = await this.uploadItemImage();
          if (imageUrl) {
            this.currentItem.image_url = imageUrl;
          }
        }
        
        // 確保數字類型字段是數字而不是字符串
        if (typeof this.currentItem.price === 'string') {
          this.currentItem.price = parseFloat(this.currentItem.price);
        }
        if (typeof this.currentItem.spicy_level === 'string') {
          this.currentItem.spicy_level = parseInt(this.currentItem.spicy_level, 10);
        }
        if (typeof this.currentItem.recommend_level === 'string') {
          this.currentItem.recommend_level = parseInt(this.currentItem.recommend_level, 10);
        }
        if (typeof this.currentItem.calories === 'string' && this.currentItem.calories) {
          this.currentItem.calories = parseInt(this.currentItem.calories, 10);
        }
        if (typeof this.currentItem.preparation_time === 'string' && this.currentItem.preparation_time) {
          this.currentItem.preparation_time = parseInt(this.currentItem.preparation_time, 10);
        }
        
        // 使用 axios 直接發送請求
        let response;
        const axios = require('axios');
        
        if (this.showEditItemModal) {
          // 更新現有菜品
          console.log('更新菜品數據:', this.currentItem);
          response = await axios.put(
            `http://localhost:3000/api/restaurants/${this.restaurantId}/menu/${this.currentItem.menu_id}`,
            this.currentItem,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('菜品更新響應:', response.data);
          
          // 更新本地數據
          const index = this.menuItems.findIndex(item => item.menu_id === this.currentItem.menu_id);
          if (index !== -1 && response.data && response.data.menuItem) {
            this.menuItems[index] = { ...response.data.menuItem };
          }
          
          this.showActionMessage(`${this.currentItem.item_name} 已成功更新`);
        } else {
          // 添加新菜品
          console.log('添加菜品數據:', this.currentItem);
          response = await axios.post(
            `http://localhost:3000/api/restaurants/${this.restaurantId}/menu`,
            this.currentItem,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('菜品添加響應:', response.data);
          
          // 添加到本地數據
          if (response.data && response.data.menuItem) {
            this.menuItems.push(response.data.menuItem);
          }
          
          this.showActionMessage(`${this.currentItem.item_name} 已成功添加`);
        }
        
        // 關閉模態窗口並重置表單
        this.closeItemModal();
      } catch (error) {
        console.error('保存菜品失敗:', error);
        if (error.response) {
          console.error('錯誤響應數據:', error.response.data);
          console.error('錯誤狀態碼:', error.response.status);
        }
        this.showActionMessage('保存菜品失敗，請稍後再試', true);
      } finally {
        this.saving = false;
      }
    },
    async deleteMenuItem() {
      try {
        this.deleting = true;
        const token = localStorage.getItem('token');
        
        await axios.delete(
          `http://localhost:3000/api/restaurants/${this.restaurantId}/menu/${this.itemToDelete.menu_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // 從本地數據中移除
        this.menuItems = this.menuItems.filter(item => item.menu_id !== this.itemToDelete.menu_id);
        
        this.showActionMessage(`${this.itemToDelete.item_name} 已成功刪除`);
        this.showDeleteConfirmModal = false;
      } catch (error) {
        console.error('刪除菜品失敗:', error);
        this.showActionMessage('刪除菜品失敗，請稍後再試', true);
      } finally {
        this.deleting = false;
      }
    },
    showActionMessage(message, isError = false) {
      this.actionMessage = message;
      this.actionError = isError;
      
      // 5秒後自動清除消息
      setTimeout(() => {
        this.actionMessage = '';
      }, 5000);
    }
  }
};
</script>

<style scoped>
.menu-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.loading, .error {
  text-align: center;
  margin: 40px 0;
}

.error {
  color: #e74c3c;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
}

.add-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #2980b9;
}

.category-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
}

.filter-btn {
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #495057;
}

.filter-btn.active {
  background-color: #ff5722;
  color: white;
  border-color: #ff5722;
  box-shadow: 0 2px 5px rgba(255, 87, 34, 0.3);
}

.filter-btn:hover:not(.active) {
  background-color: #f0f0f0;
  border-color: #ccc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.add-first-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  margin-top: 15px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.add-first-btn:hover {
  background-color: #2980b9;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.menu-item-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.menu-item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.menu-item-image {
  height: 150px;
  position: relative;
  overflow: hidden;
}

.menu-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.menu-item-card:hover .menu-item-image img {
  transform: scale(1.05);
}

.menu-item-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s;
}

.menu-item-card:hover .menu-item-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.edit-btn:hover {
  background-color: #2980b9;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.available-btn {
  background-color: #2ecc71;
  color: white;
}

.available-btn:hover {
  background-color: #27ae60;
}

.unavailable-btn {
  background-color: #f39c12;
  color: white;
}

.unavailable-btn:hover {
  background-color: #d35400;
}

.menu-item-info {
  padding: 15px;
}

.menu-item-name {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 18px;
}

.menu-item-category {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 8px;
}

.menu-item-price {
  font-weight: 600;
  color: #e74c3c;
  font-size: 16px;
  margin-bottom: 8px;
}

.menu-item-availability {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  display: inline-block;
  background-color: #d4edda;
  color: #155724;
}

.menu-item-availability.unavailable {
  background-color: #f8d7da;
  color: #721c24;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.delete-confirm-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #7f8c8d;
}

.close-btn:hover {
  color: #2c3e50;
}

.menu-item-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

label .required {
  color: #e74c3c;
  margin-left: 3px;
}

input, textarea, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.category-input {
  display: flex;
  gap: 10px;
}

.category-input select {
  flex: 1;
}

.category-input input {
  flex: 2;
}

.price-input {
  position: relative;
}

.currency {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.price-input input {
  padding-left: 40px;
}

.image-upload-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.image-upload-preview img {
  width: 100%;
  max-width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.upload-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #2980b9;
}

.availability-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-label {
  font-weight: normal;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  background-color: #e9ecef;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background-color: #dee2e6;
}

.save-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background-color: #2980b9;
}

.save-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.delete-confirm-content {
  padding: 20px;
  text-align: center;
}

.warning {
  color: #e74c3c;
  font-weight: 600;
  margin-top: 10px;
}

.action-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.action-message.success {
  background-color: #d4edda;
  color: #155724;
}

.action-message.error {
  background-color: #f8d7da;
  color: #721c24;
}

@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .modal-content {
    width: 95%;
    max-height: 80vh;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .add-btn {
    width: 100%;
    justify-content: center;
  }
  
  .category-filter {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
