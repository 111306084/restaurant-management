<template>
  <nav class="navbar">
    <div class="container navbar-content">
      <div class="navbar-brand" @click="handleBrandClick">
        <img src="@/assets/food-order-logo.svg" alt="NCCU Eats" class="navbar-logo">
        <span class="navbar-title">政大餐廳系統</span>
      </div>
      
      <div class="navbar-menu" :class="{ 'is-active': isMobileMenuOpen }">
        <router-link to="/restaurants" class="navbar-item" active-class="is-active" v-if="shouldShowNavItems">餐廳列表</router-link>
        <router-link to="/student-login" class="navbar-item" active-class="is-active" v-if="isWelcomePage">學生登入</router-link>
        <router-link to="/merchant-login" class="navbar-item" active-class="is-active" v-if="isWelcomePage">商家登入</router-link>
        <router-link to="/merchant-register" class="navbar-item" active-class="is-active" v-if="isWelcomePage">商家註冊</router-link>
      </div>
      
      <div class="navbar-end">
        <div class="navbar-user" v-if="shouldShowNavItems">
          <button class="btn-logout" @click="logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>登出</span>
          </button>
        </div>
        
        <button class="navbar-burger" @click="toggleMobileMenu" aria-label="menu" aria-expanded="false">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      isMobileMenuOpen: false,
      loginStateHandler: null,
      loginState: false
    }
  },
  computed: {
    isLoggedIn() {
      // 更嚴格的登入檢查，確保同時存在token和student資訊
      const hasToken = localStorage.getItem('token') !== null;
      const studentData = localStorage.getItem('student');
      const merchantData = localStorage.getItem('merchant');
      
      // 學生身份檢查
      if (this.$route.meta && this.$route.meta.userType === 'student') {
        return hasToken && studentData !== null;
      }
      
      // 商家身份檢查
      if (this.$route.meta && this.$route.meta.userType === 'merchant') {
        return hasToken && merchantData !== null;
      }
      
      // 一般檢查 (如果沒有特定的userType要求)
      return hasToken && (studentData !== null || merchantData !== null);
    },
    isStudentUser() {
      // 檢查當前用戶是否為學生
      const hasToken = localStorage.getItem('token') !== null;
      const studentData = localStorage.getItem('student');
      return hasToken && studentData !== null;
    },
    isWelcomePage() {
      // 檢查當前路由是否為歡迎頁面
      return this.$route.path === '/';
    },
    isLoginPage() {
      // 檢查當前路由是否為登入頁面
      return this.$route.path === '/student-login' || 
             this.$route.path === '/merchant-login' || 
             this.$route.path === '/merchant-register' ||
             this.$route.path === '/register';
    },
    shouldShowNavItems() {
      // 如果是歡迎頁面或登入頁面，則不顯示導航元素
      return !this.isWelcomePage && !this.isLoginPage && this.isLoggedIn;
    }
  },
  methods: {
    handleBrandClick() {
      // 檢查是否已登入且是學生身份
      const hasToken = localStorage.getItem('token') !== null;
      const studentData = localStorage.getItem('student');
      
      if (hasToken && studentData !== null) {
        // 已登入且是學生身份，導向餐廳列表
        this.$router.push('/restaurants');
      } else if (hasToken && localStorage.getItem('merchant') !== null) {
        // 已登入且是商家身份，導向商家儀表板
        this.$router.push('/merchant-dashboard');
      } else {
        // 未登入，導向歡迎頁面
        this.$router.push('/');
      }
      this.closeMobileMenu();
    },
    goToRestaurantsPage() {
      this.$router.push('/restaurants');
      this.closeMobileMenu();
    },
    logout() {
      // 清空購物車 (使用本地存儲清理)
      localStorage.removeItem('cart');
      
      // 重置用戶登錄狀態
      localStorage.removeItem('user_logged_in');
      localStorage.removeItem('merchant');
      localStorage.removeItem('student');
      localStorage.removeItem('token');
      
      // 跳轉回初始頁面
      this.$router.push('/');
      this.closeMobileMenu();
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      document.body.classList.toggle('no-scroll', this.isMobileMenuOpen);
    },
    closeMobileMenu() {
      if (this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
        document.body.classList.remove('no-scroll');
      }
    }
  },
  created() {
    // 監聽登入狀態變化事件
    this.loginStateHandler = (event) => {
      if (event.key === 'user_logged_in' || 
          event.key === 'merchant' || 
          event.key === 'merchantLoggedIn' || 
          event.key === 'student' || 
          event.key === 'token') {
        this.loginState = event.newValue !== null;
      }
    };
    window.addEventListener('storage', this.loginStateHandler);
    
    // 添加自定義事件監聽
    window.addEventListener('login-state-changed', () => {
      this.loginState = true;
    });
    
    // 調試代碼：打印 localStorage 的內容和登入狀態
    console.log('localStorage 內容:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`${key}: ${localStorage.getItem(key)}`);
    }
    console.log('isLoggedIn:', this.isLoggedIn);
    console.log('user_logged_in:', localStorage.getItem('user_logged_in'));
    console.log('merchant:', localStorage.getItem('merchant'));
    console.log('merchantLoggedIn:', localStorage.getItem('merchantLoggedIn'));
    console.log('student:', localStorage.getItem('student'));
  },
  beforeUnmount() {
    // 移除事件監聽器
    if (this.loginStateHandler) {
      window.removeEventListener('storage', this.loginStateHandler);
    }
    window.removeEventListener('login-state-changed', () => {
      this.loginState = true;
    });
  }
}
</script>

<style scoped>
.navbar {
  background-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: var(--spacing-sm) 0;
  color: white;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.navbar-brand:hover {
  transform: translateY(-2px);
}

.navbar-logo {
  height: 40px;
  width: 40px;
  object-fit: cover;
  border-radius: var(--border-radius-full);
  margin-right: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
}

.navbar-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: white;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.navbar-item {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: var(--font-size-md);
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.navbar-item:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.navbar-item.is-active {
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.navbar-end {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.navbar-user {
  display: flex;
  align-items: center;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.btn-logout:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.navbar-burger {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  color: white;
  flex-direction: column;
  justify-content: space-around;
  width: 32px;
  height: 32px;
}

.navbar-burger span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: white;
  border-radius: var(--border-radius-full);
  transition: all var(--transition-fast);
}

/* 響應式樣式 */
@media (max-width: 768px) {
  .navbar-menu {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-primary-dark);
    flex-direction: column;
    align-items: flex-start;
    padding: var(--spacing-lg);
    gap: var(--spacing-lg);
    transform: translateX(100%);
    transition: transform var(--transition-normal);
    z-index: 99;
    overflow-y: auto;
  }
  
  .navbar-menu.is-active {
    transform: translateX(0);
  }
  
  .navbar-item {
    font-size: var(--font-size-lg);
    width: 100%;
    padding: var(--spacing-md);
  }
  
  .navbar-burger {
    display: flex;
  }
  
  .navbar-burger span:nth-child(1) {
    transform: translateY(0) rotate(0);
  }
  
  .navbar-burger span:nth-child(2) {
    opacity: 1;
  }
  
  .navbar-burger span:nth-child(3) {
    transform: translateY(0) rotate(0);
  }
  
  .is-active + .navbar-end .navbar-burger span:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }
  
  .is-active + .navbar-end .navbar-burger span:nth-child(2) {
    opacity: 0;
  }
  
  .is-active + .navbar-end .navbar-burger span:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }
}

/* 防止滾動 */
:global(.no-scroll) {
  overflow: hidden;
}
</style>