<template>
  <div class="card register-container">
    <div class="logo-container">
      <img src="@/assets/merchant-register-banner.svg" alt="政治大學商家註冊系統" class="school-logo">
    </div>
    <h1 class="welcome-text">商家註冊</h1>
    
    <div class="form-container">
      <div class="form-group">
        <label for="merchantName" class="form-label">商家名稱</label>
        <input 
          type="text" 
          id="merchantName" 
          placeholder="輸入您的商家名稱" 
          class="form-input" 
          v-model="merchantInfo.name"
          :class="{ 'input-error': errors.name }"
        >
        <small class="form-error" v-if="errors.name">{{ errors.name }}</small>
      </div>
      
      <div class="form-group">
        <label for="accountId" class="form-label">商家帳號</label>
        <input 
          type="text" 
          id="accountId" 
          placeholder="設定您的商家帳號" 
          class="form-input" 
          v-model="merchantInfo.accountId"
          :class="{ 'input-error': errors.accountId }"
        >
        <small class="form-error" v-if="errors.accountId">{{ errors.accountId }}</small>
      </div>
      
      <div class="form-group">
        <label for="password" class="form-label">密碼</label>
        <div class="password-input-container">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="password" 
            placeholder="設定您的密碼" 
            class="form-input" 
            v-model="merchantInfo.password"
            :class="{ 'input-error': errors.password }"
          >
          <button type="button" class="password-toggle" @click="togglePasswordVisibility" aria-label="切換密碼顯示">
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
        <small class="form-error" v-if="errors.password">{{ errors.password }}</small>
      </div>
      
      <button class="btn-primary register-button" @click="register" :disabled="isSubmitting || !canRegister">
        <span v-if="isSubmitting">
          <svg class="spinner" viewBox="0 0 50 50">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
          </svg>
          處理中...
        </span>
        <span v-else>註冊</span>
      </button>
      
      <div v-if="registerError" class="error-container mt-3">
        {{ registerError }}
      </div>
      
      <div class="login-link mt-4">
        <span>已有商家帳號？</span>
        <router-link to="/merchant-login" class="login-now-link">立即登入</router-link>
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
        password: ''
      },
      showPassword: false,
      errors: {
        name: '',
        accountId: '',
        password: ''
      },
      isSubmitting: false,
      registerError: ''
    }
  },
  computed: {
    canRegister() {
      return this.merchantInfo.name && 
             this.merchantInfo.accountId && 
             this.merchantInfo.password;
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    validateForm() {
      let isValid = true;
      
      // 重置所有錯誤
      Object.keys(this.errors).forEach(key => {
        this.errors[key] = '';
      });
      
      // 驗證商家名稱
      if (!this.merchantInfo.name.trim()) {
        this.errors.name = '請輸入商家名稱';
        isValid = false;
      } else if (this.merchantInfo.name.length > 100) {
        this.errors.name = '商家名稱不能超過100個字符';
        isValid = false;
      }
      
      // 驗證商家帳號
      if (!this.merchantInfo.accountId.trim()) {
        this.errors.accountId = '請輸入商家帳號';
        isValid = false;
      } else if (!/^[a-zA-Z0-9_-]{3,20}$/.test(this.merchantInfo.accountId)) {
        this.errors.accountId = '商家帳號必須是3-20個英文字母、數字、底線或連字號';
        isValid = false;
      }
      
      // 驗證密碼
      if (!this.merchantInfo.password) {
        this.errors.password = '請輸入密碼';
        isValid = false;
      } else if (this.merchantInfo.password.length < 6) {
        this.errors.password = '密碼長度不能少於6個字符';
        isValid = false;
      } else if (this.merchantInfo.password.length > 20) {
        this.errors.password = '密碼長度不能超過20個字符';
        isValid = false;
      }
      
      return isValid;
    },
    async register() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isSubmitting = true;
      
      try {
        // 準備請求資料
        const requestData = {
          restaurant_name: this.merchantInfo.name,
          account_id: this.merchantInfo.accountId,
          password: this.merchantInfo.password
        };
        
        // 發送註冊請求
        const response = await axios.post('http://localhost:3000/api/restaurant/auth/register', requestData);
        
        // 註冊成功
        console.log('註冊成功:', response.data);
        
        // 自動登入
        const loginData = {
          restaurant_id: this.merchantInfo.accountId,
          password: this.merchantInfo.password
        };
        
        const loginResponse = await axios.post('http://localhost:3000/api/restaurant/auth/login', loginData);
        
        // 儲存登入資訊
        const { token, restaurant } = loginResponse.data;
        localStorage.setItem('token', token);
        localStorage.setItem('restaurant', JSON.stringify(restaurant));
        
        // 清空表單
        this.resetForm();
        
        // 顯示成功訊息並導向餐廳資料編輯頁面
        alert('註冊成功！請完善您的餐廳資料。');
        this.$router.push('/restaurant-profile');
      } catch (error) {
        console.error('註冊失敗:', error);
        
        // 處理錯誤訊息
        if (error.response && error.response.data && error.response.data.message) {
          this.registerError = error.response.data.message;
        } else {
          this.registerError = '註冊失敗，請稍後再試。';
        }
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.merchantInfo = {
        name: '',
        accountId: '',
        password: ''
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
  max-width: 480px;
  margin: var(--spacing-xl) auto;
  padding: var(--spacing-xl);
  background-color: var(--color-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.logo-container {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.school-logo {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
}

.welcome-text {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  width: 100%;
}

.form-container {
  width: 100%;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--color-text);
}

.form-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
  outline: none;
}

.form-input.input-error {
  border-color: var(--color-error);
}

.form-error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
  display: block;
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.password-toggle:hover {
  color: var(--color-primary);
}

.register-button {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--font-size-md);
  font-weight: 500;
  margin-top: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
}

.login-now-link {
  color: var(--color-primary);
  font-weight: 500;
  margin-left: var(--spacing-xs);
  transition: color var(--transition-fast);
}

.login-now-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.error-container {
  background-color: rgba(var(--color-error-rgb), 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-error);
  font-size: var(--font-size-sm);
  text-align: center;
  width: 100%;
}

/* 載入動畫 */
.spinner {
  animation: rotate 2s linear infinite;
  width: 20px;
  height: 20px;
  margin-right: var(--spacing-xs);
}

.path {
  stroke: white;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: var(--spacing-lg);
    margin: var(--spacing-md) auto;
    box-shadow: none;
    border-radius: 0;
  }
  
  .school-logo {
    width: 100px;
    height: 100px;
  }
  
  .welcome-text {
    font-size: var(--font-size-lg);
  }
  
  .form-input {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .register-button {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}</style>