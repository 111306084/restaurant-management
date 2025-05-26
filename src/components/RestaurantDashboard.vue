<template>
  <div class="restaurant-dashboard">
    <div class="sidebar">
      <div class="restaurant-info">
        <img src="@/assets/food-order-logo.svg" alt="NCCU Eats" class="restaurant-logo">
        <h2>{{ restaurantName }}</h2>
      </div>
      
      <nav class="sidebar-nav">
        <div 
          v-for="item in navItems" 
          :key="item.id"
          :class="['nav-item', { active: activeNavItem === item.id }]"
          @click="activeNavItem = item.id"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
          <span v-if="item.id === 'orders' && pendingOrdersCount > 0" class="badge">{{ pendingOrdersCount }}</span>
        </div>
      </nav>
      
      <div class="sidebar-footer">
        <div class="delete-account-btn" @click="showDeleteAccountConfirm">
          <i class="fas fa-user-times"></i>
          <span>註銷帳號</span>
        </div>
      </div>
    </div>
    
    <div class="main-content">
      <div class="header">
        <h1>{{ getActiveNavTitle() }}</h1>
        <div class="user-info">
          <span>{{ restaurantName }}</span>
          <img src="@/assets/food-order-logo.svg" alt="NCCU Eats" class="user-avatar">
          <button class="logout-button" @click="logout">
            <i class="fas fa-sign-out-alt"></i> 登出
          </button>
          <button class="delete-account-button" @click="showDeleteAccountConfirm">
            <i class="fas fa-user-times"></i> 註銷帳號
          </button>
        </div>
      </div>
      
      <div class="content-container">
        <!-- 儀表板概覽 -->
        <div v-if="activeNavItem === 'dashboard'" class="dashboard-overview">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon pending-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ pendingOrdersCount }}</div>
                <div class="stat-label">待處理訂單</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon today-icon">
                <i class="fas fa-calendar-day"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ todayOrdersCount }}</div>
                <div class="stat-label">今日訂單</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon revenue-icon">
                <i class="fas fa-dollar-sign"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">NT${{ todayRevenue }}</div>
                <div class="stat-label">今日營收</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon rating-icon">
                <i class="fas fa-star"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ averageRating }}</div>
                <div class="stat-label">平均評分</div>
              </div>
            </div>
          </div>
          
          <div class="recent-orders">
            <div class="section-header">
              <h2>最近訂單</h2>
              <button @click="activeNavItem = 'orders'" class="view-all-btn">查看全部</button>
            </div>
            
            <div v-if="recentOrders.length === 0" class="empty-state">
              <p>目前沒有訂單</p>
            </div>
            
            <div v-else class="order-list">
              <div 
                v-for="order in recentOrders" 
                :key="order.order_id" 
                class="order-item"
                :class="{ 'order-pending': order.status === 'pending' }"
              >
                <div class="order-info">
                  <div class="order-id">#{{ order.order_id }}</div>
                  <div class="order-customer">{{ order.student_name }}</div>
                  <div class="order-time">{{ formatDate(order.order_date) }}</div>
                </div>
                <div class="order-status">
                  <span :class="['status-badge', `status-${order.status}`]">
                    {{ getStatusLabel(order.status) }}
                  </span>
                </div>
                <div class="order-amount">
                  <div v-if="order.discount_amount && order.discount_amount > 0" class="price-details">
                    <span class="original-price"><s>NT${{ order.original_amount }}</s></span>
                    <span class="discount-badge">-{{ order.discount_amount }}</span>
                  </div>
                  <div class="final-amount">NT${{ order.total_amount }}</div>
                </div>
                <div class="order-actions">
                  <button @click="viewOrderDetails(order)" class="action-btn">查看</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 訂單管理 -->
        <restaurant-order-management v-if="activeNavItem === 'orders'" @update-pending-count="updatePendingOrdersCount" />
        
        <!-- 菜單管理 -->
        <restaurant-menu-management v-if="activeNavItem === 'menu'" />
        
        <!-- 優惠券管理 -->
        <restaurant-coupon-management v-if="activeNavItem === 'coupons'" />
        
        <!-- 餐廳資料 -->
        <restaurant-profile v-if="activeNavItem === 'profile'" />
        
        <!-- 評論管理 -->
        <restaurant-review-management v-if="activeNavItem === 'reviews'" />
        
        <!-- 設定 - 顯示餐廳資料設定功能 -->
        <div v-if="activeNavItem === 'settings'" class="settings-container">
          <h2>帳號設定</h2>
          <!-- 這裡可以添加更多設定選項 -->
        </div>
        
        <!-- 註銷帳號確認彈窗 -->
        <div v-if="showDeleteConfirm" class="modal">
          <div class="modal-content">
            <h2>確認註銷帳號</h2>
            <p>註銷帳號後，您的所有資料將被永久刪除，且無法恢復。您確定要繼續嗎？</p>
            <div class="modal-actions">
              <button class="cancel-btn" @click="showDeleteConfirm = false">取消</button>
              <button class="delete-btn" @click="deleteAccount" :disabled="isDeleting">
                {{ isDeleting ? '處理中...' : '確認註銷' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RestaurantOrderManagement from './RestaurantOrderManagement.vue';
import RestaurantMenuManagement from './RestaurantMenuManagement.vue';
import RestaurantProfile from './RestaurantProfile.vue';
import RestaurantReviewManagement from './RestaurantReviewManagement.vue';
import RestaurantCouponManagement from './RestaurantCouponManagement.vue';
import axios from 'axios';

export default {
  name: 'RestaurantDashboard',
  components: {
    RestaurantOrderManagement,
    RestaurantMenuManagement,
    RestaurantProfile,
    RestaurantReviewManagement,
    RestaurantCouponManagement
  },
  data() {
    return {
      restaurantId: '',
      restaurantName: '',
      activeNavItem: 'dashboard',
      navItems: [
        { id: 'dashboard', label: '儀表板', icon: 'fas fa-tachometer-alt' },
        { id: 'orders', label: '訂單管理', icon: 'fas fa-clipboard-list' },
        { id: 'menu', label: '菜單管理', icon: 'fas fa-utensils' },
        { id: 'coupons', label: '優惠券管理', icon: 'fas fa-ticket-alt' },
        { id: 'profile', label: '餐廳資料', icon: 'fas fa-store' },
        { id: 'reviews', label: '評論管理', icon: 'fas fa-comments' }
      ],
      pendingOrdersCount: 0,
      todayOrdersCount: 0,
      todayRevenue: 0,
      averageRating: 0,
      recentOrders: [],
      refreshInterval: null,
      showDeleteConfirm: false,
      isDeleting: false
    };
  },
  mounted() {
    this.loadRestaurantInfo();
    this.loadDashboardData();
    
    // 每分鐘自動刷新數據
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 60000);
  },
  beforeUnmount() {
    // 清除定時器
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  
  watch: {
    activeNavItem(newValue) {
      console.log(`切換導航項目到: ${newValue}`);
    }
  },
  methods: {
    async loadRestaurantInfo() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$router.push('/restaurant/login');
          return;
        }
        
        // 解析 JWT token 獲取餐廳信息
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          this.restaurantId = payload.id;
          this.restaurantName = payload.name || '未命名餐廳';
        }
        
        // 從 API 獲取餐廳詳細信息
        const response = await axios.get(`http://localhost:3000/api/restaurants/${this.restaurantId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.restaurant) {
          this.restaurantName = response.data.restaurant.restaurant_name || this.restaurantName;
        }
      } catch (error) {
        console.error('獲取餐廳信息錯誤:', error);
        // 如果獲取失敗，保持從 JWT 獲取的名稱
        // 不做任何操作，保留之前從 JWT 獲取的餐廳名稱
      }
    },
    async loadDashboardData() {
      try {
        console.log('開始載入儀表板數據...');
        
        // 先載入訂單統計資料，確保有正確的訂單數量和營收
        await this.loadOrderStats();
        
        // 然後載入最近訂單，如果統計數據載入失敗，也可以從訂單列表計算
        await this.loadRecentOrders();
        
        // 如果訂單統計和最近訂單都加載成功，但訂單數量為0，嘗試使用最近訂單計算
        if (this.todayOrdersCount === 0 && this.recentOrders && this.recentOrders.length > 0) {
          this.calculateStatsFromRecentOrders();
        }
        
        // 載入評分數據
        try {
          if (typeof this.loadRatingData === 'function') {
            await this.loadRatingData();
          } else {
            console.log('評分載入函數不存在，使用預設值');
            this.averageRating = '2.9'; // 使用預設值
          }
        } catch (ratingError) {
          console.error('載入評分數據錯誤:', ratingError);
          this.averageRating = '2.9'; // 出錯時使用預設值
        }
        
        console.log('儀表板數據載入完成:', {
          今日訂單數: this.todayOrdersCount,
          今日營收: this.todayRevenue,
          待處理訂單數: this.pendingOrdersCount,
          最近訂單數: this.recentOrders?.length || 0
        });
      } catch (error) {
        console.error('載入儀表板資料時發生錯誤:', error);
      }
    },
    async loadRecentOrders() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // 使用正確的 API 端點，帶限制參數
        const response = await axios.get('http://localhost:3000/api/orders/restaurant?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          this.recentOrders = response.data.orders;
          // 計算待處理訂單數量
          this.pendingOrdersCount = this.recentOrders.filter(order => order.status === 'pending').length;
        }
      } catch (error) {
        console.error('獲取最近訂單錯誤:', error);
      }
    },
    // 從最近訂單計算今日統計數據
    calculateStatsFromRecentOrders() {
      console.log('從最近訂單計算今日統計數據');
      
      // 獲取今天的日期字符串 (YYYY-MM-DD 格式)
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // 確保有訂單數據
      if (!this.recentOrders || this.recentOrders.length === 0) {
        console.log('沒有可用的訂單數據');
        return;
      }
      
      // 過濾今日訂單(非取消)
      const todayOrders = this.recentOrders.filter(order => {
        // 只比較日期部分，忽略時間
        const orderDate = new Date(order.order_date);
        const orderDateStr = orderDate.toISOString().split('T')[0];
        return orderDateStr === todayStr && order.status !== 'cancelled';
      });
      
      console.log(`找到 ${todayOrders.length} 筆今日訂單`);
      
      // 計算今日訂單數量
      this.todayOrdersCount = todayOrders.length;
      
      // 計算今日營收
      let totalRevenue = 0;
      
      todayOrders.forEach(order => {
        // 確保 total_amount 是數字
        const amount = parseFloat(order.total_amount || 0);
        if (!isNaN(amount)) {
          totalRevenue += amount;
        }
      });
      
      // 格式化營收為兩位小數
      this.todayRevenue = parseFloat(totalRevenue.toFixed(2));
      
      console.log('從訂單列表計算的統計結果:', {
        今日訂單數: this.todayOrdersCount,
        今日營收: this.todayRevenue,
        訂單詳情: todayOrders.map(o => ({
          id: o.order_id,
          金額: parseFloat(o.total_amount),
          狀態: o.status,
          日期: o.order_date
        }))
      });
    },
    
    async loadOrderStats() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('無法獲取token，跳過統計載入');
          return;
        }
        
        // 獲取餐廳信息
        const restaurantInfo = JSON.parse(localStorage.getItem('restaurant') || '{}');
        console.log('餐廳信息:', restaurantInfo);
        
        // 獲取今日訂單統計
        const today = new Date().toISOString().split('T')[0];
        console.log('正在獲取訂單統計，日期:', today);
        
        const response = await axios.get(`http://localhost:3000/api/orders/restaurant/stats?date=${today}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('訂單統計API回應:', response);
        console.log('訂單統計數據:', response.data);
        
        if (response.data && response.data.success) {
          // 輸出原始統計數據以進行調試
          console.log('原始統計數據:', {
            count: response.data.stats.count,
            count_type: typeof response.data.stats.count,
            revenue: response.data.stats.revenue,
            revenue_type: typeof response.data.stats.revenue
          });
          
          // 確保數值類型正確
          const count = parseInt(response.data.stats.count || '0');
          const revenue = parseFloat(response.data.stats.revenue || '0');
          
          // 強制轉換為數字並更新數據
          this.todayOrdersCount = isNaN(count) ? 0 : count;
          this.todayRevenue = isNaN(revenue) ? 0 : parseFloat(revenue.toFixed(2));
          
          console.log('處理後的訂單統計:', {
            訂單數量: this.todayOrdersCount,
            訂單數量類型: typeof this.todayOrdersCount,
            原始營收: response.data.stats.revenue,
            處理後營收: this.todayRevenue,
            營收類型: typeof this.todayRevenue
          });
          
          // 確認數據是否已正確轉換
          if (this.todayOrdersCount === 0 && this.todayRevenue === 0) {
            console.log('警告: 統計數據為零，將嘗試從訂單列表計算');
          } else {
            return; // 如果API成功返回有效數據，就不使用本地計算
          }
        } else {
          console.log('無法從API獲取有效的統計數據');
        }
      } catch (error) {
        console.error('獲取訂單統計錯誤:', error);
        console.error('錯誤詳情:', error.response || error.message || error);
      }

      // 使用本地計算今日訂單和營收
      console.log('從最近訂單列表計算統計數據');
      this.calculateStatsFromRecentOrders();
    },
    async loadRatingData() {
      try {
        const response = await axios.get(`http://localhost:3000/api/restaurants/${this.restaurantId}/ratings`);
        
        if (response.data.success && response.data.ratingSummary) {
          this.averageRating = response.data.ratingSummary.avg_overall_rating || 0;
          // 格式化為一位小數
          this.averageRating = parseFloat(this.averageRating).toFixed(1);
        }
      } catch (error) {
        console.error('獲取評分數據錯誤:', error);
        this.averageRating = '2.9'; // 默認值
      }
    },
    getActiveNavTitle() {
      const activeItem = this.navItems.find(item => item.id === this.activeNavItem);
      return activeItem ? activeItem.label : '';
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    getStatusLabel(status) {
      const statusMap = {
        'pending': '待處理',
        'confirmed': '已確認',
        'preparing': '準備中',
        'ready': '準備完成',
        'completed': '已完成',
        'cancelled': '已取消'
      };
      return statusMap[status] || status;
    },
    viewOrderDetails(order) {
      this.activeNavItem = 'orders';
      // 通知訂單管理組件顯示訂單詳情
      this.$nextTick(() => {
        this.$refs.orderManagement?.viewOrderDetails(order);
      });
    },
    updatePendingOrdersCount(count) {
      this.pendingOrdersCount = count;
    },
    showDeleteAccountConfirm() {
      this.showDeleteConfirm = true;
    },
    async deleteAccount() {
      if (this.isDeleting) return;
      
      this.isDeleting = true;
      console.log('得到的餐廳 ID:', this.restaurantId);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('您的登入狀態已過期，請重新登入');
          this.logout();
          return;
        }
        
        // 確保 restaurantId 不為空
        if (!this.restaurantId) {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              this.restaurantId = payload.id;
              console.log('從 token 解析得到的餐廳 ID:', this.restaurantId);
            } catch (parseError) {
              console.error('Token 解析錯誤:', parseError);
            }
          }
          
          if (!this.restaurantId) {
            alert('無法獲取餐廳 ID，請重新登入');
            this.logout();
            return;
          }
        }
        
        // 發送刪除請求到後端
        console.log('發送刪除請求到:', `http://localhost:3000/api/restaurants/${this.restaurantId}`);
        const response = await axios.delete(`http://localhost:3000/api/restaurants/${this.restaurantId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('刪除餐廳帳號響應:', response.data);
        
        if (response.data.success) {
          alert('您的帳號已成功註銷');
          // 清除本地存儲並返回登入頁面
          localStorage.removeItem('token');
          localStorage.removeItem('restaurant');
          this.$router.push('/merchant/login');
        } else {
          alert(response.data.message || '註銷帳號失敗，請稍後再試');
        }
      } catch (error) {
        console.error('註銷帳號錯誤:', error);
        alert('註銷帳號時發生錯誤，請稍後再試');
      } finally {
        this.isDeleting = false;
        this.showDeleteConfirm = false;
      }
    },
    logout() {
      // 清除所有登入相關的存儲資訊
      localStorage.removeItem('token');
      localStorage.removeItem('restaurant');
      localStorage.removeItem('user_logged_in');
      
      // 顯示登出成功訊息
      this.$toast?.success?.('登出成功') || alert('登出成功');
      
      // 觸發自定義事件，通知 NavBar 組件登入狀態已經改變
      window.dispatchEvent(new Event('login-state-changed'));
      
      // 跳轉到商家登入頁面
      this.$router.push('/merchant-login');
    }
  }
};
</script>

<style scoped>
.restaurant-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.restaurant-info {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.restaurant-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-left: 4px solid #e74c3c;
}

.nav-item i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.badge {
  position: absolute;
  right: 15px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.sidebar-footer {
  padding: 10px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
}

.logout-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
  margin-left: 10px;
}

.logout-button:hover {
  background-color: #c0392b;
}

.content-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

/* 儀表板概覽 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
  color: white;
}

.pending-icon {
  background-color: #f39c12;
}

.today-icon {
  background-color: #3498db;
}

.revenue-icon {
  background-color: #2ecc71;
}

.rating-icon {
  background-color: #9b59b6;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  color: #777;
  font-size: 14px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.view-all-btn {
  padding: 6px 12px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #777;
}

.order-list {
  border: 1px solid #eee;
  border-radius: 8px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item.order-pending {
  background-color: rgba(243, 156, 18, 0.05);
}

.order-info {
  flex: 1;
}

.order-id {
  font-weight: bold;
  margin-bottom: 5px;
}

.order-customer {
  color: #555;
}

.order-time {
  font-size: 12px;
  color: #777;
  margin-top: 5px;
}

.order-status {
  margin: 0 15px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.status-pending {
  background-color: #f39c12;
}

.status-confirmed {
  background-color: #3498db;
}

.status-preparing {
  background-color: #9b59b6;
}

.status-ready {
  background-color: #2ecc71;
}

.status-completed {
  background-color: #27ae60;
}

.status-cancelled {
  background-color: #e74c3c;
}

.order-amount {
  min-width: 100px;
  text-align: right;
}

.price-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 4px;
}

.original-price {
  font-size: 12px;
  color: #999;
}

.discount-badge {
  font-size: 11px;
  color: #e74c3c;
  font-weight: bold;
}

.final-amount {
  font-weight: bold;
  color: #2ecc71;
}

.order-actions {
  margin-left: 15px;
}

.action-btn {
  padding: 6px 12px;
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }
  
  .sidebar .restaurant-info h2,
  .sidebar .nav-item span {
    display: none;
  }
  
  .main-content {
    margin-left: 70px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-status,
  .order-amount,
  .order-actions {
    margin-left: 0;
    margin-top: 10px;
  }
}
.delete-account-btn {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin: 10px 0;
  background-color: #e74c3c;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-account-btn:hover {
  background-color: #c0392b;
}

.delete-account-btn i {
  margin-right: 10px;
  font-size: 16px;
}

.delete-account-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
  margin-left: 10px;
  font-weight: bold;
}

.delete-account-button:hover {
  background-color: #c0392b;
}

/* 註銷帳號彈窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin-top: 0;
  color: #e74c3c;
}

.modal-content p {
  line-height: 1.6;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #f1f1f1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.view-all-btn {
  background-color: #4a6fa5;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  transition: background-color 0.3s;
}

.view-all-btn:hover {
  background-color: #3a5a8c;
}

.delete-btn {
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.delete-btn:disabled {
  background-color: #e57373;
  cursor: not-allowed;
}
</style>
