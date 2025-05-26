<template>
  <div class="register-container">
    <div class="logo-container">
      <img src="/images/library.jpeg" alt="政治大學" class="school-logo">
    </div>
    <h1 class="page-title">商家註冊</h1>
    
    <div class="form-container">
      <div class="input-group">
        <label for="merchantName">商家名稱</label>
        <input 
          type="text" 
          id="merchantName" 
          placeholder="輸入您的商家名稱" 
          class="form-input" 
          v-model="merchantInfo.name"
          :class="{ 'input-error': errors.name }"
        >
        <small class="error-message" v-if="errors.name">{{ errors.name }}</small>
      </div>
      
      <div class="input-group">
        <label for="accountId">商家帳號</label>
        <input 
          type="text" 
          id="accountId" 
          placeholder="設定您的商家帳號" 
          class="form-input" 
          v-model="merchantInfo.accountId"
          :class="{ 'input-error': errors.accountId }"
        >
        <small class="error-message" v-if="errors.accountId">{{ errors.accountId }}</small>
      </div>
      
      <div class="input-group">
        <label for="password">密碼</label>
        <input 
          :type="showPassword ? 'text' : 'password'" 
          id="password" 
          placeholder="設定您的密碼" 
          class="form-input" 
          v-model="merchantInfo.password"
          :class="{ 'input-error': errors.password }"
        >
        <small class="error-message" v-if="errors.password">{{ errors.password }}</small>
        <span class="password-toggle" @click="togglePasswordVisibility">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </span>
      </div>
      
      <button 
        class="register-button" 
        @click="register" 
        :disabled="!canRegister || isSubmitting"
      >
        <span v-if="isSubmitting">處理中...</span>
        <span v-else>註冊</span>
      </button>
      
      <div class="login-now">
        <span>已經有帳號? </span>
        <router-link to="/merchant-login">立即登入</router-link>
      </div>
      
      <div v-if="registerError" class="error-container">
        {{ registerError }}
      </div>
      
      <div v-if="isSuccess" class="success-container">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MerchantRegister',
  data() {
    return {
      merchantInfo: {
        name: '',
        accountId: '',
        password: '',
        restaurant_type: '',
        price_range: '',
        address: '',
        opening_hours: ''
      },
      showPassword: false,
      errors: {
        name: '',
        accountId: '',
        password: ''
      },
      isSubmitting: false,
      registerError: '',
      isSuccess: false,
      successMessage: ''
    }
  },
  computed: {
    canRegister() {
      return this.merchantInfo.name && this.merchantInfo.password && !this.isSubmitting;
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    validateForm() {
      let isValid = true;
      this.errors = {
        name: '',
        accountId: '',
        password: ''
      };
      
      // 驗證商家名稱
      if (!this.merchantInfo.name) {
        this.errors.name = '商家名稱不能為空';
        isValid = false;
      } else if (this.merchantInfo.name.length < 2) {
        this.errors.name = '商家名稱至少需要 2 個字元';
        isValid = false;
      }
      
      // 驗證密碼
      if (!this.merchantInfo.password) {
        this.errors.password = '密碼不能為空';
        isValid = false;
      } else if (this.merchantInfo.password.length < 6) {
        this.errors.password = '密碼至少需要 6 個字元';
        isValid = false;
      }
      
      return isValid;
    },
    async register() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isSubmitting = true;
      this.registerError = '';
      
      try {
        // 連接到後端 API進行商家註冊處理
        const response = await axios.post('http://localhost:3000/api/restaurant/auth/register', {
          restaurant_name: this.merchantInfo.name,
          password: this.merchantInfo.password,
          restaurant_type: this.merchantInfo.restaurant_type || '一般餐廳',
          price_range: this.merchantInfo.price_range || '$',
          address: this.merchantInfo.address || '政大校園內',
          opening_hours: this.merchantInfo.opening_hours || '09:00-21:00'
        });
        
        console.log('註冊成功:', response.data);
        
        // 儲存商家資訊到本地儲存
        localStorage.setItem('merchant', JSON.stringify(response.data.restaurant));
        
        // 顯示成功訊息並跳轉到餐廳設置頁面
        alert(`註冊成功！請繼續設置您的餐廳資訊。\n\n您的餐廳ID是：${response.data.restaurant.restaurant_id}，請記住這個ID用於登入。`);
        
        // 跳轉到餐廳設置頁面
        this.$router.push('/restaurant-setup');
      } catch (error) {
        console.error('註冊錯誤:', error);
        this.registerError = error.response?.data?.message || '註冊失敗，請稍後再試';
        this.errors.name = this.registerError;
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.merchantInfo = {
        name: '',
        accountId: '',
        password: '',
        restaurant_type: '',
        price_range: '',
        address: '',
        opening_hours: ''
      };
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--color-background);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.logo-container {
  margin-bottom: 1.5rem;
  text-align: center;
}

.school-logo {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.form-container {
  width: 100%;
}

.input-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
  outline: none;
}

.input-error {
  border-color: var(--color-error);
}

.error-message {
  display: block;
  color: var(--color-error);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 42px;
  cursor: pointer;
}

.register-button {
  width: 100%;
  padding: 12px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
}

.register-button:hover {
  background-color: var(--color-primary-dark);
}

.register-button:disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
}

.login-now {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.login-now a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.login-now a:hover {
  text-decoration: underline;
}

.error-container {
  margin-top: 1.5rem;
  padding: 10px;
  background-color: rgba(var(--color-error-rgb), 0.1);
  border: 1px solid var(--color-error);
  border-radius: 8px;
  color: var(--color-error);
  text-align: center;
}

.success-container {
  margin-top: 1.5rem;
  padding: 10px;
  background-color: rgba(var(--color-success-rgb), 0.1);
  border: 1px solid var(--color-success);
  border-radius: 8px;
  color: var(--color-success);
  text-align: center;
}

@media (max-width: 600px) {
  .register-container {
    padding: 1.5rem;
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
  }
  
  .school-logo {
    width: 100px;
    height: 100px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
}
</style>
