<template>
  <div class="register-container">
    <div class="logo-container">
      <img src="/images/library.jpeg" alt="政治大學圖書館" class="library-image">
    </div>
    
    <h1 class="register-title">建立你的帳號</h1>
    
    <div class="register-description">
      <p>註冊帳號後，你可以開始使用「NCCU Food」，發布對校園餐廳的真實評價！</p>
    </div>
    
    <div class="form-container">
      <div class="input-group">
        <input 
          type="text" 
          placeholder="請輸入9位數學生證號碼" 
          class="form-input" 
          v-model="studentId"
          @keyup.enter="handleRegister"
        >
      </div>
      
      <div class="input-group">
        <input 
          :type="showPassword ? 'text' : 'password'" 
          placeholder="請設定密碼" 
          class="form-input" 
          v-model="password"
          @keyup.enter="handleRegister"
        >
        <span class="password-toggle" @click="togglePasswordVisibility">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </span>
      </div>
      
      <div v-if="showError" class="error-message">{{ errorMessage }}</div>
      
      <button class="register-button" @click="handleRegister" :disabled="isRegistering">
        <span v-if="isRegistering">
          <svg class="loading-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="display: inline-block; margin-right: 8px; vertical-align: middle;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="30 60" stroke-linecap="round">
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </circle>
          </svg>
          處理中...
        </span>
        <span v-else>建立帳號</span>
      </button>
    </div>

    <!-- 成功提示框 -->
    <div class="success-modal" v-if="showSuccessModal">
      <div class="success-modal-content">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 class="success-title">註冊成功</h2>
        <p class="success-message">您的帳號已成功建立！</p>
        <p class="success-message">請使用學生證號碼和密碼登入。</p>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/services/api';

export default {
  name: 'RegisterPage',
  data() {
    return {
      studentId: '',
      password: '',
      isRegistering: false,
      showSuccessModal: false,
      errorMessage: '',
      showError: false,
      showPassword: false
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async handleRegister() {
      // 驗證表單
      if (!this.studentId || !this.password) {
        this.showError = true;
        this.errorMessage = '請填寫所有必填欄位';
        return;
      }
      
      // 驗證學生ID格式
      if (!/^\d{9}$/.test(this.studentId)) {
        this.showError = true;
        this.errorMessage = '學生ID必須是9位數字';
        return;
      }
      
      // 驗證密碼長度
      if (this.password.length < 6) {
        this.showError = true;
        this.errorMessage = '密碼長度必須至少為6個字符';
        return;
      }
      
      this.isRegistering = true;
      this.showError = false;
      
      try {
        // 調用註冊 API
        await authAPI.register({
          student_id: this.studentId,
          password: this.password
        });
        
        // 顯示成功提示
        this.showSuccessModal = true;
        
        // 3秒後跳轉回登入頁面
        setTimeout(() => {
          this.$router.push('/student-login');
        }, 3000);
      } catch (error) {
        console.error('註冊錯誤:', error);
        this.showError = true;
        this.errorMessage = error.message || '註冊失敗，請稍後再試';
      } finally {
        this.isRegistering = false;
      }
    }
  }
}
</script>

<style scoped>
.register-container {
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
  position: relative;
}

.logo-container {
  width: 100%;
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--border-radius-md);
}

.library-image {
  width: 100%;
  max-height: 250px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  transition: transform var(--transition-slow);
}

.library-image:hover {
  transform: scale(1.05);
}

.register-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  text-align: center;
  width: 100%;
  color: var(--primary-color);
  animation: slideUp var(--transition-normal) ease-out;
}

.register-description {
  width: 100%;
  text-align: center;
  margin-bottom: var(--spacing-lg);
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-secondary);
  animation: slideUp var(--transition-normal) ease-out;
  animation-delay: 0.1s;
}

.form-container {
  width: 100%;
  animation: slideUp var(--transition-normal) ease-out;
  animation-delay: 0.2s;
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
  transition: all var(--transition-fast);
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

.error-message {
  color: var(--error-color);
  font-size: 14px;
  margin-bottom: var(--spacing-md);
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}

.register-button {
  width: 100%;
  padding: 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-top: var(--spacing-md);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.register-button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.register-button:active {
  transform: translateY(0);
}

.register-button:disabled {
  background-color: var(--text-hint);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn var(--transition-normal) ease-out;
}

.success-modal-content {
  background-color: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-lg);
  animation: slideUp var(--transition-normal) ease-out;
}

.success-icon {
  margin-bottom: var(--spacing-lg);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.success-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--success-color);
}

.success-message {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .register-container {
    margin: 20px auto;
    padding: var(--spacing-md);
  }
  
  .register-title {
    font-size: 28px;
  }
  
  .form-input,
  .register-button {
    padding: 12px;
  }
}
</style>