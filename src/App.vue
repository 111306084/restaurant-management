<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="app-footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} 政大餐廳系統 | 版權所有</p>
      </div>
    </footer>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
import '@/assets/css/design-system.css';

export default {
  name: 'App',
  components: {
    NavBar
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: var(--spacing-xl) 0;
  background-color: var(--color-surface);
}

.app-footer {
  background-color: var(--color-primary-dark);
  color: white;
  padding: var(--spacing-lg) 0;
  text-align: center;
  font-size: var(--font-size-sm);
}

/* 頁面過渡動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.cart-icon {
  color: #ff5722;
  cursor: pointer;
  transition: transform 0.2s;
}

.cart-icon:hover {
  transform: scale(1.1);
}

.navbar-cart {
  position: relative;
  cursor: pointer;
}
</style>
