import { createRouter, createWebHashHistory } from 'vue-router'
import WelcomePage from '../components/WelcomePage.vue'
import StudentLogin from '../components/StudentLogin.vue'
import MerchantLogin from '../components/MerchantLogin.vue'
import MerchantRegister from '../components/MerchantRegister.vue'
import RegisterPage from '../components/RegisterPage.vue'
import RestaurantListPage from '../components/RestaurantListPage.vue'
import RestaurantDetail from '../views/RestaurantDetail.vue'
import MenuItemDetail from '../components/MenuItemDetail.vue'
import CartPage from '../components/CartPage.vue'
import RatingPage from '../components/RatingPage.vue'
import MerchantDashboard from '../components/MerchantDashboard.vue'
import RestaurantSetup from '../components/RestaurantSetup.vue'
import RestaurantDashboard from '../components/RestaurantDashboard.vue'
import RestaurantOrderManagement from '../components/RestaurantOrderManagement.vue'
import RestaurantProfile from '../components/RestaurantProfile.vue'
import RestaurantMenuManagement from '../components/RestaurantMenuManagement.vue'
import RestaurantCouponManagement from '../components/RestaurantCouponManagement.vue'

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: WelcomePage
  },
  {
    path: '/student-login',
    name: 'StudentLogin',
    component: StudentLogin
  },
  {
    path: '/merchant-login',
    name: 'MerchantLogin',
    component: MerchantLogin
  },
  {
    path: '/merchant-register',
    name: 'MerchantRegister',
    component: MerchantRegister
  },
  {
    path: '/restaurant-setup',
    name: 'RestaurantSetup',
    component: RestaurantSetup,
    meta: { requiresAuth: true, userType: 'merchant' }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/restaurants',
    name: 'Restaurants',
    component: RestaurantListPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/restaurant/:id',
    name: 'RestaurantDetail',
    component: RestaurantDetail,
    meta: { requiresAuth: false }
  },
  {
    path: '/restaurant/:restaurantId/menu-item/:itemId',
    name: 'MenuItemDetail',
    component: MenuItemDetail,
    meta: { requiresAuth: true, userType: 'student' }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: CartPage,
    meta: { requiresAuth: true, userType: 'student' }
  },
  {
    path: '/restaurant/:restaurantId/rate',
    name: 'RatingPage',
    component: RatingPage,
    meta: { requiresAuth: true, userType: 'student' }
  },
  {
    path: '/merchant-dashboard',
    name: 'MerchantDashboard',
    component: MerchantDashboard,
    meta: { requiresAuth: true, userType: 'merchant' }
  },
  {
    path: '/restaurant-dashboard',
    name: 'RestaurantDashboard',
    component: RestaurantDashboard,
    meta: { requiresAuth: true, userType: 'restaurant' }
  },
  {
    path: '/restaurant-orders',
    name: 'RestaurantOrderManagement',
    component: RestaurantOrderManagement,
    meta: { requiresAuth: true, userType: 'restaurant' }
  },
  {
    path: '/restaurant-profile',
    name: 'RestaurantProfile',
    component: RestaurantProfile,
    meta: { requiresAuth: true, userType: 'restaurant' }
  },
  {
    path: '/restaurant-menu',
    name: 'RestaurantMenuManagement',
    component: RestaurantMenuManagement,
    meta: { requiresAuth: true, userType: 'restaurant' }
  },
  {
    path: '/restaurant-coupons',
    name: 'RestaurantCouponManagement',
    component: RestaurantCouponManagement,
    meta: { requiresAuth: true, userType: 'restaurant' }
  },
  // 學生優惠券頁面已移除
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局導航守衛
router.beforeEach((to, from, next) => {
  // 檢查路由是否需要認證
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 檢查用戶是否已登入
    const hasToken = localStorage.getItem('token') !== null;
    
    // 如果用戶沒有令牌，重定向到對應的登入頁面
    if (!hasToken) {
      if (to.meta.userType === 'student') {
        next({ name: 'StudentLogin' });
      } else if (to.meta.userType === 'merchant') {
        next({ name: 'MerchantLogin' });
      } else {
        next({ name: 'Welcome' });
      }
      return;
    }
    
    // 檢查用戶類型是否匹配
    if (to.meta.userType === 'student') {
      // 學生身份檢查
      const student = JSON.parse(localStorage.getItem('student') || 'null');
      if (!student) {
        next({ name: 'StudentLogin' });
        return;
      }
    } else if (to.meta.userType === 'merchant' || to.meta.userType === 'restaurant') {
      // 餐廳商家身份檢查
      const restaurant = JSON.parse(localStorage.getItem('restaurant') || 'null');
      if (!restaurant) {
        next({ name: 'MerchantLogin' });
        return;
      }
    }
  } else if (to.path === '/') {
    // 如果用戶已登入且嘗試訪問首頁，重定向到對應的頁面
    const hasToken = localStorage.getItem('token') !== null;
    const student = localStorage.getItem('student');
    const restaurant = localStorage.getItem('restaurant');
    
    if (hasToken && student) {
      next({ name: 'Restaurants' });
      return;
    } else if (hasToken && restaurant) {
      next({ name: 'RestaurantDashboard' });
      return;
    }
  }
  
  // 允許訪問
  next();
});

export default router 