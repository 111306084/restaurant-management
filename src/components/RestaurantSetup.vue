<template>
  <div class="setup-container">
    <div class="setup-header">
      <router-link to="/merchant-register" class="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </router-link>
      <h1 class="page-title">餐廳資訊設定</h1>
    </div>

    <div class="form-container">
      <h2 class="section-title">設定您的店家資訊</h2>
      <p class="section-subtitle">Set your restaurant to get started</p>
      
      <div class="input-group">
        <label for="restaurantAddress">餐廳地址</label>
        <input 
          type="text" 
          id="restaurantAddress" 
          placeholder="Your Restaurant Address" 
          class="form-input" 
          v-model="restaurantInfo.address"
          :class="{ 'input-error': errors.address }"
        >
        <small class="error-message" v-if="errors.address">{{ errors.address }}</small>
      </div>
      
      <div class="input-group">
        <label for="restaurantName">餐廳名稱</label>
        <input 
          type="text" 
          id="restaurantName" 
          placeholder="輸入餐廳名稱" 
          class="form-input" 
          v-model="restaurantInfo.name"
          :class="{ 'input-error': errors.name }"
        >
        <small class="error-message" v-if="errors.name">{{ errors.name }}</small>
      </div>
      
      <div class="divider"></div>
      
      <h2 class="section-title">設定店家的餐店資訊</h2>
      <p class="section-subtitle">Set your restaurant to get started</p>
      
      <div class="category-section">
        <label class="category-label">餐廳類別（請選擇一種）</label>
        <div class="category-options">
          <button 
            v-for="category in categories" 
            :key="category.id"
            class="category-btn"
            :class="{ 'active': selectedCategories.includes(category.id) }"
            @click="toggleCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </div>
        <small class="error-message" v-if="errors.categories">{{ errors.categories }}</small>
      </div>
      
      <div class="price-section">
        <label class="price-label">餐點價格區間</label>
        <div class="price-options">
          <button 
            v-for="range in priceRanges" 
            :key="range.id"
            class="price-btn"
            :class="{ 'active': selectedPriceRanges.includes(range.id) }"
            @click="togglePriceRange(range.id)"
          >
            {{ range.label }}
          </button>
        </div>
        <small class="error-message" v-if="errors.priceRanges">{{ errors.priceRanges }}</small>
      </div>
      
      <button class="continue-button" @click="saveAndContinue" :disabled="isSubmitting">
        <span v-if="isSubmitting">處理中...</span>
        <span v-else>繼續</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RestaurantSetup',
  data() {
    return {
      restaurantInfo: {
        name: '',
        address: ''
      },
      categories: [
        { id: 'traditional', name: '傳統早餐店' },
        { id: 'chinese', name: '中式餐廳' },
        { id: 'coffee', name: '咖啡廳' },
        { id: 'korean_food', name: '韓式料理' },
        { id: 'japanese', name: '日式料理' },
        { id: 'southeast_asian', name: '東南亞美食' },
        { id: 'korean_dessert', name: '韓式美食' },
        { id: 'fast_food', name: '速食餐廳' },
        { id: 'noodle', name: '麵食館' }
      ],
      priceRanges: [
        { id: 'range1', label: '10~25' },
        { id: 'range2', label: '25~50' },
        { id: 'range3', label: '50~75' },
        { id: 'range4', label: '75~100' },
        { id: 'range5', label: '125~150' },
        { id: 'range6', label: '150~175' },
        { id: 'range7', label: '175~200' },
        { id: 'range8', label: '200~250' }
      ],
      selectedCategories: [],
      selectedPriceRanges: [],
      errors: {
        name: '',
        address: '',
        categories: '',
        priceRanges: ''
      },
      isSubmitting: false
    }
  },
  methods: {
    toggleCategory(categoryId) {
      // 只允许选择一个餐厅类别
      this.selectedCategories = [categoryId];
    },
    togglePriceRange(rangeId) {
      // 只允许选择一个价格区间
      this.selectedPriceRanges = [rangeId];
    },
    validateForm() {
      let isValid = true;
      // 重置错误信息
      for (let key in this.errors) {
        this.errors[key] = '';
      }
      
      if (!this.restaurantInfo.name) {
        this.errors.name = '請輸入餐廳名稱';
        isValid = false;
      }
      
      if (!this.restaurantInfo.address) {
        this.errors.address = '請輸入餐廳地址';
        isValid = false;
      }
      
      if (this.selectedCategories.length === 0) {
        this.errors.categories = '請選擇餐廳類別';
        isValid = false;
      }
      
      if (this.selectedPriceRanges.length === 0) {
        this.errors.priceRanges = '請選擇價格區間';
        isValid = false;
      }
      
      return isValid;
    },
    saveAndContinue() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isSubmitting = true;
      
      // 收集数据
      const restaurantData = {
        name: this.restaurantInfo.name,
        address: this.restaurantInfo.address,
        category: this.selectedCategories[0],
        priceRange: this.selectedPriceRanges[0]
      };
      
      // 模拟API请求
      setTimeout(() => {
        // 这里应该连接到后端API进行商家餐厅信息的保存
        console.log('餐廳設定信息:', restaurantData);
        
        // 模拟请求成功
        this.isSubmitting = false;
        
        // 显示成功消息
        alert('餐廳資訊設定成功！請登入您的商家帳號。');
        
        // 跳转到商家登录页面
        this.$router.push('/merchant-login');
      }, 1500);
    }
  }
}
</script>

<style scoped>
.setup-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
  max-width: 600px;
  margin: 0 auto;
  margin-bottom: 50px;
}

.setup-header {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-right: 15px;
  color: #333;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.form-container {
  width: 100%;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 5px;
}

.section-subtitle {
  color: #666;
  margin-bottom: 20px;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #1a73e8;
}

.form-input.input-error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}

.divider {
  height: 1px;
  background-color: #eee;
  margin: 30px 0;
  width: 100%;
}

.category-section,
.price-section {
  margin-bottom: 30px;
}

.category-label,
.price-label {
  display: block;
  margin-bottom: 15px;
  font-weight: 500;
  color: #333;
}

.category-options,
.price-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.category-btn,
.price-btn {
  padding: 10px 15px;
  border-radius: 20px;
  border: none;
  background-color: #f5f7fa;
  color: #333;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.category-btn:hover,
.price-btn:hover {
  background-color: #e9f0fe;
}

.category-btn.active,
.price-btn.active {
  background-color: #1a73e8;
  color: white;
}

.continue-button {
  width: 100%;
  padding: 15px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.continue-button:hover:not(:disabled) {
  background-color: #1557b0;
}

.continue-button:disabled {
  background-color: #a0c3ff;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .section-title {
    font-size: 20px;
  }
  
  .form-input {
    padding: 12px;
  }
  
  .category-btn,
  .price-btn {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .continue-button {
    padding: 12px;
    font-size: 16px;
  }
}
</style> 