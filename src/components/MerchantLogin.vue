<template>
  <div class="login-container">
    <div class="logo-container">
      <img src="@/assets/merchant-login-banner.svg" alt="政治大學商家管理系統" class="school-logo">
    </div>
    <h1 class="welcome-text">商家登入</h1>
    
    <div class="form-container">
      <div class="input-group">
        <input 
          type="text" 
          id="accountId"
          placeholder="請輸入商家帳號" 
          class="form-input" 
          v-model="loginInfo.accountId"
          :class="{ 'input-error': errors.accountId }"
          @keyup.enter="login"
        >
        <small class="form-error" v-if="errors.accountId">{{ errors.accountId }}</small>
      </div>
      
      <div class="input-group">
        <input 
          :type="showPassword ? 'text' : 'password'" 
          id="password"
          placeholder="請輸入密碼" 
          class="form-input" 
          v-model="loginInfo.password"
          :class="{ 'input-error': errors.password }"
          @keyup.enter="login"
        >
        <span class="password-toggle" @click="togglePasswordVisibility">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </span>
        <small class="form-error" v-if="errors.password">{{ errors.password }}</small>
      </div>
      
      <div class="forgot-password">
        <a href="#">忘記密碼？</a>
      </div>
      
      <button 
        class="login-button" 
        @click="login"
        :class="{ 'error-btn': loginError }"
        :disabled="isSubmitting || !canLogin"
      >
        <span v-if="isSubmitting">
          <svg class="loading-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="30 60" stroke-linecap="round">
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </circle>
          </svg>
          登入中...
        </span>
        <span v-else-if="loginError">{{ loginError }}</span>
        <span v-else>登入</span>
      </button>
      
      <div class="register-now">
        <span>還不是合作商家？</span>
        <router-link to="/merchant-register" class="register-link">立即註冊</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MerchantLogin',
  data() {
    return {
      loginInfo: {
        accountId: '',
        password: ''
      },
      newRegisteredId: null,
      showPassword: false,
      errors: {
        accountId: '',
        password: ''
      },
      isSubmitting: false,
      loginError: ''
    }
  },
  computed: {
    canLogin() {
      return this.loginInfo.accountId && this.loginInfo.password;
    }
  },
  mounted() {
    // 檢查是否有剛剛註冊的餐廳ID
    const newRegisteredId = localStorage.getItem('newRegisteredRestaurantId');
    if (newRegisteredId) {
      this.newRegisteredId = newRegisteredId;
      this.loginInfo.accountId = newRegisteredId;
      // 清除localStorage中的臨時ID
      localStorage.removeItem('newRegisteredRestaurantId');
    }
    
    // 自動聚焦到帳號輸入框
    this.$nextTick(() => {
      document.getElementById('accountId')?.focus();
    });
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    validateForm() {
      let isValid = true;
      // 重置錯誤信息
      this.loginError = '';
      for (let key in this.errors) {
        this.errors[key] = '';
      }
      
      if (!this.loginInfo.accountId) {
        this.errors.accountId = '請輸入商家帳號';
        isValid = false;
      }
      
      if (!this.loginInfo.password) {
        this.errors.password = '請輸入密碼';
        isValid = false;
      }
      
      return isValid;
    },
    async login() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isSubmitting = true;
      this.loginError = '';
      
      try {
        console.log('嘗試登入的商家帳號:', this.loginInfo.accountId);
        
        // 連接到後端API進行登入驗證
        const response = await axios.post('http://localhost:3000/api/restaurant/auth/login', {
          restaurant_id: this.loginInfo.accountId, // 使用商家帳號作為 restaurant_id
          password: this.loginInfo.password
        });
        
        // 登入成功
        console.log('登入成功:', response.data);
        
        // 儲存登入狀態和令牌
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('restaurant', JSON.stringify(response.data.restaurant));
        localStorage.setItem('user_logged_in', 'true'); // 確保通用登入狀態被設置
        
        // 觸發自定義事件，通知 NavBar 組件登入狀態已經改變
        window.dispatchEvent(new Event('login-state-changed'));
        
        // 顯示成功訊息
        this.$toast?.success?.('登入成功！歡迎回來') || alert('登入成功！歡迎回來');
        
        // 跳轉到餐廳儀表板頁面
        this.$router.push('/restaurant-dashboard');
      } catch (error) {
        console.error('登入錯誤:', error);
        this.loginError = error.response?.data?.message || '登入失敗，請檢查您的商家帳號和密碼';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg);
  max-width: 500px;
  margin: 40px auto;
  background-color: var(--background-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  animation: fadeIn var(--transition-normal) ease-out;
}

.logo-container {
  width: 100%;
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--border-radius-md);
}

.school-logo {
  width: 100%;
  max-width: 400px;
  max-height: 250px;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.school-logo:hover {
  transform: scale(1.05);
}

.welcome-text {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: var(--spacing-xl);
  text-align: center;
  width: 100%;
  color: var(--primary-color);
  animation: slideUp var(--transition-normal) ease-out;
}

.form-container {
  width: 100%;
  animation: slideUp var(--transition-normal) ease-out;
  animation-delay: 0.1s;
  opacity: 0;
  animation-fill-mode: forwards;
}

.input-group {
  position: relative;
  margin-bottom: var(--spacing-lg);
}

.form-input {
  width: 100%;
  padding: 15px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.form-input.input-error {
  border-color: var(--color-error, #F44336);
}

.form-error {
  color: var(--color-error, #F44336);
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-hint);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.password-toggle:hover {
  color: var(--primary-color);
}

.forgot-password {
  text-align: right;
  margin-bottom: var(--spacing-lg);
}

.forgot-password a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  transition: color var(--transition-fast);
}

.forgot-password a:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: var(--spacing-lg);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-button.error-btn {
  background-color: var(--color-error, #F44336);
}

.register-now {
  text-align: center;
  font-size: 16px;
  color: var(--text-secondary);
}

.register-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-fast);
  margin-left: 5px;
}

.register-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.loading-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

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
</style>