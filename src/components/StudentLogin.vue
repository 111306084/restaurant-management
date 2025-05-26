<template>
  <div class="login-container">
    <div class="logo-container">
      <img src="@/assets/student-login-banner.svg" alt="政治大學學生點餐系統" class="school-logo">
    </div>
    <h1 class="welcome-text">歡迎回來！</h1>
    
    <div class="form-container">
      <div class="input-group">
        <input 
          type="text" 
          placeholder="請輸入學生證號碼" 
          class="form-input" 
          v-model="studentId"
          @keyup.enter="handleLogin"
        >
      </div>
      
      <div class="input-group">
        <input 
          :type="showPassword ? 'text' : 'password'" 
          placeholder="請輸入密碼" 
          class="form-input" 
          v-model="password"
          @keyup.enter="handleLogin"
        >
        <span class="password-toggle" @click="togglePasswordVisibility">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </span>
      </div>
      
      <div class="forgot-password">
        <a href="#">忘記密碼？</a>
      </div>
      
      <button 
        class="login-button" 
        @click="handleLogin"
        :class="{ 'error-btn': loginError }"
        :disabled="isLoading"
      >
        <span v-if="isLoading">
          <svg class="loading-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="30 60" stroke-linecap="round">
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </circle>
          </svg>
          登入中...
        </span>
        <span v-else-if="loginError">{{ errorMessage }}</span>
        <span v-else>登入</span>
      </button>
      
      <div class="register-now">
        <span>還沒有帳號？</span>
        <router-link to="/register">立即註冊</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI, testApiConnection } from '@/services/api';

export default {
  name: 'StudentLogin',
  data() {
    return {
      studentId: '',
      password: '',
      loginError: false,
      errorMessage: '',
      showPassword: false,
      isLoading: false,
      apiConnected: true
    }
  },
  mounted() {
    // 測試API連接，但不阻止用戶操作
    this.testServerConnection().catch(err => console.error('後台測試連接失敗:', err));
  },
  methods: {
    async testServerConnection() {
      try {
        const connected = await testApiConnection();
        this.apiConnected = connected;
        if (!connected) {
          this.loginError = true;
          this.errorMessage = '無法連接到伺服器，請確認後端伺服器是否運行';
        }
      } catch (error) {
        console.error('伺服器連接測試失敗:', error);
        this.apiConnected = false;
        this.loginError = true;
        this.errorMessage = '伺服器連接測試失敗';
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async handleLogin() {
      // 驗證表單
      if (!this.studentId || !this.password) {
        this.loginError = true;
        this.errorMessage = '請填寫學生ID和密碼';
        return;
      }
      
      // 即使前面的測試失敗，也嘗試登入
      // 因為測試可能失敗，但實際登入可能成功
      
      this.isLoading = true;
      this.loginError = false;
      
      try {
        console.log('嘗試學生登入:', { student_id: this.studentId });
        
        // 調用登入 API
        const response = await authAPI.login({
          student_id: this.studentId,
          password: this.password
        });
        
        console.log('登入響應:', response); // 調試用
        
        // 儲存令牌和學生資料
        if (response && response.token) {
          console.log('登入成功，保存Token:', response.token.substring(0, 10) + '...');
          localStorage.setItem('token', response.token);
          localStorage.setItem('student', JSON.stringify(response.student));
          localStorage.setItem('user_logged_in', 'true');
          
          // 觸發自定義事件，通知 NavBar 組件登入狀態已經改變
          window.dispatchEvent(new Event('login-state-changed'));
          
          // 登入成功，導航到餐廳列表頁面
          console.log('重定向到餐廳列表頁面');
          this.$router.push('/restaurants');
        } else {
          console.error('回應缺少有效令牌:', response);
          throw new Error('伺服器響應缺少有效的令牌');
        }
      } catch (error) {
        console.error('登入錯誤:', error);
        this.loginError = true;
        
        if (error.code === 'ERR_NETWORK') {
          this.errorMessage = '網絡連接錯誤，請確認後端伺服器已啟動';
          this.apiConnected = false;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = '找不到此ID與Password';
        }
      } finally {
        this.isLoading = false;
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
}

.login-button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.login-button:active {
  transform: translateY(0);
}

.login-button:disabled {
  background-color: var(--text-hint);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-button.error-btn {
  background-color: var(--error-color);
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}

.register-now {
  text-align: center;
  color: var(--text-secondary);
  margin-top: var(--spacing-md);
  font-size: 16px;
  animation: slideUp var(--transition-normal) ease-out;
  animation-delay: 0.2s;
  opacity: 0;
  animation-fill-mode: forwards;
}

.register-now span {
  color: var(--text-secondary);
}

.register-now a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  transition: color var(--transition-fast);
}

.register-now a:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .login-container {
    margin: 20px auto;
    padding: var(--spacing-md);
  }
  
  .welcome-text {
    font-size: 28px;
  }
  
  .form-input,
  .login-button {
    padding: 12px;
  }
}
</style> 