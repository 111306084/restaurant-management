<template>
  <div class="welcome-container">
    <div class="welcome-text">
      <h1>歡迎回到NCCU Food</h1>
      <h2>請問你是... ?</h2>
    </div>
    <div class="button-container">
      <router-link to="/student-login" class="router-link">
        <button class="user-button student-button">
          學生用戶
        </button>
      </router-link>
      <router-link to="/merchant-login" class="router-link">
        <button class="user-button merchant-button">
          商家管理者
        </button>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WelcomePage'
}
</script>

<style scoped>
.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-text {
  margin-bottom: 50px;
  text-align: center;
}

.welcome-text h1 {
  font-size: 32px;
  margin-bottom: 20px;
}

.welcome-text h2 {
  font-size: 28px;
  margin-bottom: 10px;
}

.button-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
}

.router-link {
  text-decoration: none;
  width: 100%;
}

.user-button {
  padding: 15px 20px;
  font-size: 20px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  width: 100%;
}

.student-button {
  background-color: #1a73e8;
  color: white;
}

.student-button:hover {
  background-color: #1557b0;
}

.merchant-button {
  background-color: white;
  color: #1a73e8;
  border-color: #1a73e8;
}

.merchant-button:hover {
  background-color: #f0f7ff;
}
</style> 