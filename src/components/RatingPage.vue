<template>
  <div class="order-complete-container">
    <!-- 返回按鈕 -->
    <div class="back-button" @click="goBack">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    </div>

    <!-- 訂單完成圖標 -->
    <div class="success-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </div>

    <h1 class="complete-title">訂單完成！</h1>
    <p class="complete-message">感謝您的訂購，您的美食即將準備</p>
    
    <!-- 倒數計時 -->
    <div class="countdown-container">
      <p class="countdown-text">將在 <span class="countdown-number">{{ countdown }}</span> 秒後返回餐廳列表</p>
    </div>

    <!-- 立即返回按鈕 -->
    <button class="return-button" @click="returnToList">立即返回餐廳列表</button>
  </div>
</template>

<script>
export default {
  name: 'OrderCompletePage',
  data() {
    return {
      restaurantId: null,
      countdown: 15,
      countdownInterval: null
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    returnToList() {
      clearInterval(this.countdownInterval);
      this.$router.push('/restaurants');
    },
    startCountdown() {
      // 頁面加載時就自動開始倒數計時
      this.countdownInterval = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.countdownInterval);
          this.$router.push('/restaurants');
        }
      }, 1000);
    }
  },
  mounted() {
    // 从路由参数获取餐厅ID
    this.restaurantId = this.$route.params.restaurantId;
    
    // 自動開始倒數計時
    this.startCountdown();
  },
  beforeUnmount() {
    // Vue 3 的生命週期鉤子
    clearInterval(this.countdownInterval);
  }
}
</script>

<style scoped>
.order-complete-container {
  padding: 30px;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  margin-top: 40px;
}

.back-button {
  display: flex;
  align-items: center;
  width: 40px;
  height: 40px;
  color: #333;
  cursor: pointer;
  margin-bottom: 20px;
  text-align: left;
}

.success-icon {
  margin: 20px auto;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.complete-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.complete-message {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.countdown-container {
  margin: 30px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.countdown-text {
  font-size: 18px;
  color: #666;
}

.countdown-number {
  font-weight: bold;
  color: #ff5722;
  font-size: 22px;
}

.return-button {
  display: block;
  width: 100%;
  padding: 15px;
  background-color: #ff5722;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.return-button:hover {
  background-color: #e64a19;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style> 