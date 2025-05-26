<template>
  <div class="student-coupons">
    <h2 class="text-center my-4">我的優惠券</h2>
    
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'available' }" 
          @click.prevent="activeTab = 'available'"
          href="#"
        >
          <i class="fas fa-ticket-alt me-1"></i>可用優惠券
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'my-coupons' }" 
          @click.prevent="activeTab = 'my-coupons'"
          href="#"
        >
          <i class="fas fa-wallet me-1"></i>我的優惠券
        </a>
      </li>
    </ul>
    
    <!-- 加載中提示 -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-2">正在載入優惠券資料...</p>
    </div>
    
    <!-- 可用優惠券標籤內容 -->
    <div v-else-if="activeTab === 'available'" class="tab-content">
      <div v-if="availableCoupons.length === 0" class="empty-state">
        <i class="fas fa-ticket-alt fa-4x text-muted mb-3"></i>
        <h5>暫無可用優惠券</h5>
        <p class="text-muted">目前沒有可領取的優惠券，請稍後再查看。</p>
      </div>
      
      <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="coupon in availableCoupons" :key="coupon.coupon_id" class="col">
          <div class="coupon-card" :class="{ 'claimed': coupon.is_claimed, 'expired': isExpired(coupon.end_date) }">
            <div class="coupon-header d-flex align-items-center">
              <div class="restaurant-logo">
                <img :src="coupon.restaurant_image || '/img/default-restaurant.png'" :alt="coupon.restaurant_name">
              </div>
              <div class="restaurant-info ms-2">
                <h5 class="mb-0">{{ coupon.restaurant_name }}</h5>
                <small class="text-muted">優惠券代碼: {{ coupon.code }}</small>
              </div>
            </div>
            
            <div class="coupon-body">
              <div class="discount-info">
                <span v-if="coupon.discount_type === 'percentage'" class="discount-value">
                  {{ coupon.discount_value }}
                  <small>%</small>
                </span>
                <span v-else class="discount-value">
                  {{ coupon.discount_value }}
                  <small>元</small>
                </span>
                <span class="discount-type">
                  {{ coupon.discount_type === 'percentage' ? '折扣' : '折抵' }}
                </span>
              </div>
              
              <div class="coupon-description">
                {{ coupon.description }}
              </div>
              
              <div class="coupon-details">
                <div class="detail-item" v-if="coupon.min_order_amount">
                  <i class="fas fa-shopping-cart me-2"></i>
                  <span>訂單滿 {{ coupon.min_order_amount }} 元可使用</span>
                </div>
                <div class="detail-item">
                  <i class="far fa-calendar-alt me-2"></i>
                  <span>{{ formatDate(coupon.start_date) }} - {{ formatDate(coupon.end_date) }}</span>
                </div>
                <div class="detail-item" v-if="coupon.usage_limit">
                  <i class="fas fa-users me-2"></i>
                  <span>已領取: {{ coupon.claimed_count }}/{{ coupon.usage_limit }}</span>
                </div>
              </div>
            </div>
            
            <div class="coupon-footer">
              <button 
                v-if="!coupon.is_claimed && !isExpired(coupon.end_date) && !coupon.limit_reached" 
                class="btn btn-primary w-100"
                @click="claimCoupon(coupon)"
                :disabled="claimLoading === coupon.coupon_id"
              >
                <span v-if="claimLoading === coupon.coupon_id" class="spinner-border spinner-border-sm me-1"></span>
                立即領取
              </button>
              <button 
                v-else-if="coupon.is_claimed && !coupon.is_used" 
                class="btn btn-success w-100"
                disabled
              >
                <i class="fas fa-check-circle me-1"></i>
                已領取
              </button>
              <button 
                v-else-if="coupon.is_used" 
                class="btn btn-secondary w-100"
                disabled
              >
                <i class="fas fa-check-double me-1"></i>
                已使用
              </button>
              <button 
                v-else-if="isExpired(coupon.end_date)" 
                class="btn btn-secondary w-100"
                disabled
              >
                <i class="fas fa-times-circle me-1"></i>
                已過期
              </button>
              <button 
                v-else-if="coupon.limit_reached" 
                class="btn btn-secondary w-100"
                disabled
              >
                <i class="fas fa-times-circle me-1"></i>
                已領完
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 我的優惠券標籤內容 -->
    <div v-else-if="activeTab === 'my-coupons'" class="tab-content">
      <div v-if="myCoupons.length === 0" class="empty-state">
        <i class="fas fa-wallet fa-4x text-muted mb-3"></i>
        <h5>暫無優惠券</h5>
        <p class="text-muted">您尚未領取任何優惠券，去「可用優惠券」頁面領取吧！</p>
      </div>
      
      <div v-else>
        <div class="coupon-categories mb-4">
          <span 
            class="coupon-category" 
            :class="{ active: myCouponFilter === 'all' }"
            @click="myCouponFilter = 'all'"
          >
            全部 ({{ myCoupons.length }})
          </span>
          <span 
            class="coupon-category" 
            :class="{ active: myCouponFilter === 'unused' }"
            @click="myCouponFilter = 'unused'"
          >
            未使用 ({{ getFilteredCoupons('unused').length }})
          </span>
          <span 
            class="coupon-category" 
            :class="{ active: myCouponFilter === 'used' }"
            @click="myCouponFilter = 'used'"
          >
            已使用 ({{ getFilteredCoupons('used').length }})
          </span>
          <span 
            class="coupon-category" 
            :class="{ active: myCouponFilter === 'expired' }"
            @click="myCouponFilter = 'expired'"
          >
            已過期 ({{ getFilteredCoupons('expired').length }})
          </span>
        </div>
        
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          <div v-for="coupon in filteredMyCoupons" :key="coupon.user_coupon_id" class="col">
            <div class="coupon-card my-coupon" :class="{
              'used': coupon.is_used,
              'expired': !coupon.is_used && isExpired(coupon.end_date)
            }">
              <div class="coupon-header d-flex align-items-center">
                <div class="restaurant-logo">
                  <img :src="coupon.restaurant_image || '/img/default-restaurant.png'" :alt="coupon.restaurant_name">
                </div>
                <div class="restaurant-info ms-2">
                  <h5 class="mb-0">{{ coupon.restaurant_name }}</h5>
                  <small>{{ formatClaimedDate(coupon.claimed_at) }}</small>
                </div>
                <div class="coupon-status ms-auto">
                  <span v-if="coupon.is_used" class="badge bg-secondary">已使用</span>
                  <span v-else-if="isExpired(coupon.end_date)" class="badge bg-danger">已過期</span>
                  <span v-else class="badge bg-success">可使用</span>
                </div>
              </div>
              
              <div class="coupon-body">
                <div class="discount-info">
                  <span v-if="coupon.discount_type === 'percentage'" class="discount-value">
                    {{ coupon.discount_value }}
                    <small>%</small>
                  </span>
                  <span v-else class="discount-value">
                    {{ coupon.discount_value }}
                    <small>元</small>
                  </span>
                  <span class="discount-type">
                    {{ coupon.discount_type === 'percentage' ? '折扣' : '折抵' }}
                  </span>
                </div>
                
                <div class="coupon-description">
                  {{ coupon.description }}
                </div>
                
                <div class="coupon-details">
                  <div class="detail-item" v-if="coupon.min_order_amount">
                    <i class="fas fa-shopping-cart me-2"></i>
                    <span>訂單滿 {{ coupon.min_order_amount }} 元可使用</span>
                  </div>
                  <div class="detail-item">
                    <i class="far fa-calendar-alt me-2"></i>
                    <span>{{ formatDate(coupon.start_date) }} - {{ formatDate(coupon.end_date) }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-ticket-alt me-2"></i>
                    <span>優惠券代碼: {{ coupon.code }}</span>
                  </div>
                </div>
              </div>
              
              <div class="coupon-footer">
                <button 
                  v-if="!coupon.is_used && !isExpired(coupon.end_date)" 
                  class="btn btn-primary w-100"
                  @click="useInCheckout(coupon)"
                >
                  <i class="fas fa-shopping-cart me-1"></i>
                  去購物使用
                </button>
                <button 
                  v-else-if="coupon.is_used" 
                  class="btn btn-secondary w-100"
                  disabled
                >
                  <i class="fas fa-check-double me-1"></i>
                  {{ coupon.used_at ? formatUsedDate(coupon.used_at) : '已使用' }}
                </button>
                <button 
                  v-else-if="isExpired(coupon.end_date)" 
                  class="btn btn-secondary w-100"
                  disabled
                >
                  <i class="fas fa-times-circle me-1"></i>
                  已過期
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'StudentCoupons',
  data() {
    return {
      activeTab: 'available',
      loading: false,
      claimLoading: null,
      availableCoupons: [],
      myCoupons: [],
      myCouponFilter: 'all',
      studentId: ''
    };
  },
  computed: {
    filteredMyCoupons() {
      return this.getFilteredCoupons(this.myCouponFilter);
    }
  },
  mounted() {
    // 檢查學生登入狀態
    const studentData = localStorage.getItem('student');
    const token = localStorage.getItem('token');
    
    if (!studentData || !token) {
      this.showAlert('需要登入', '請先登入學生帳號才能查看優惠券', 'warning');
      this.$router.push('/student-login');
      return;
    }
    
    // 存儲學生資訊
    this.studentId = JSON.parse(studentData).student_id;
    console.log('學生ID:', this.studentId);
    console.log('學生數據:', JSON.parse(studentData));
    
    this.loadCoupons();
  },
  methods: {
    async loadCoupons() {
      this.loading = true;
      
      try {
        // 確保使用正確的安全憑證
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('無法獲取有效的憑證令牌');
          this.showAlert('授權錯誤', '請重新登入以獲取有效的憑證', 'error');
          this.$router.push('/student-login');
          return;
        }
        
        console.log('正在請求可用優惠券數據，學生ID:', this.studentId);
        
        // 加载可用優惠券
        const availableResponse = await axios.get('/api/coupons/available', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (availableResponse.data.success) {
          this.availableCoupons = availableResponse.data.coupons;
          console.log('已加載', this.availableCoupons.length, '個可用優惠券');
        }
        
        console.log('正在請求學生優惠券數據');
        
        // 加载我的優惠券
        const myResponse = await axios.get('/api/coupons/student', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (myResponse.data.success) {
          this.myCoupons = myResponse.data.coupons;
          console.log('已加載', this.myCoupons.length, '個學生優惠券');
        }
      } catch (error) {
        console.error('載入優惠券錯誤:', error);
        this.showAlert('載入優惠券失敗', error.response?.data?.message || '發生未知錯誤', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async claimCoupon(coupon) {
      this.claimLoading = coupon.coupon_id;
      
      try {
        // 確保使用正確的安全憑證
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('無法獲取有效的憑證令牌');
          this.showAlert('授權錯誤', '請重新登入以獲取有效的憑證', 'error');
          this.$router.push('/student-login');
          return;
        }
        
        console.log(`正在領取優惠券，優惠券ID: ${coupon.coupon_id}，學生ID: ${this.studentId}`);
        
        const response = await axios.post(`/api/coupons/claim/${coupon.coupon_id}`, {
          studentId: this.studentId  // 明確傳遞學生ID
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          console.log('優惠券領取成功:', response.data);
          this.showAlert('優惠券領取成功', '優惠券已成功添加到您的帳戶', 'success');
          
          // 重新加載優惠券數據
          this.loadCoupons();
          
          // 切換到「我的優惠券」標籤
          this.activeTab = 'my-coupons';
        } else {
          console.warn('優惠券領取回應不成功:', response.data);
          this.showAlert('優惠券領取失敗', response.data.message || '無法領取此優惠券', 'warning');
        }
      } catch (error) {
        console.error('領取優惠券錯誤:', error);
        this.showAlert('領取優惠券發生錯誤', error.response?.data?.message || '發生未知錯誤', 'error');
      } finally {
        this.claimLoading = null;
      }
    },
    
    useInCheckout(coupon) {
      // 跳轉到相應餐廳的點餐頁面
      this.$router.push(`/restaurant/${coupon.restaurant_id}`);
    },
    
    getFilteredCoupons(filter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (filter) {
        case 'unused':
          return this.myCoupons.filter(coupon => !coupon.is_used && !this.isExpired(coupon.end_date));
        case 'used':
          return this.myCoupons.filter(coupon => coupon.is_used);
        case 'expired':
          return this.myCoupons.filter(coupon => !coupon.is_used && this.isExpired(coupon.end_date));
        case 'all':
        default:
          return this.myCoupons;
      }
    },
    
    formatDate(dateString) {
      const options = { month: '2-digit', day: '2-digit' };
      return new Date(dateString).toLocaleDateString('zh-TW', options);
    },
    
    formatClaimedDate(dateString) {
      const options = { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return `領取於 ${new Date(dateString).toLocaleDateString('zh-TW', options)}`;
    },
    
    formatUsedDate(dateString) {
      const options = { month: '2-digit', day: '2-digit' };
      return `已於 ${new Date(dateString).toLocaleDateString('zh-TW', options)} 使用`;
    },
    
    isExpired(endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDateObj = new Date(endDate);
      return endDateObj < today;
    },
    
    showAlert(title, message, type) {
      // 如果有 alert 組件，可以使用，否則用 console
      if (this.$swal) {
        this.$swal.fire({
          title,
          text: message,
          icon: type,
          confirmButtonText: '確定'
        });
      } else {
        alert(`${title}: ${message}`);
      }
    }
  }
};
</script>

<style scoped>
.student-coupons {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.nav-tabs {
  border-bottom: 2px solid #f0f0f0;
}

.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  margin-right: 1rem;
}

.nav-tabs .nav-link.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
  background: transparent;
}

.empty-state {
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  margin: 2rem 0;
}

.coupon-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.coupon-category {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  background-color: #f0f0f0;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.coupon-category.active {
  background-color: #007bff;
  color: white;
}

.coupon-card {
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: white;
  transition: transform 0.2s;
}

.coupon-card:hover {
  transform: translateY(-5px);
}

.coupon-card.claimed {
  opacity: 0.7;
}

.coupon-card.expired {
  opacity: 0.6;
}

.coupon-card.expired::after {
  content: "已過期";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  background-color: rgba(220, 53, 69, 0.8);
  color: white;
  padding: 0.25rem 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  z-index: 1;
}

.coupon-card.used::after {
  content: "已使用";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  background-color: rgba(108, 117, 125, 0.8);
  color: white;
  padding: 0.25rem 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  z-index: 1;
}

.coupon-header {
  padding: 1rem;
  border-bottom: 1px dashed #dee2e6;
  background-color: #f8f9fa;
}

.restaurant-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.restaurant-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.coupon-body {
  padding: 1rem;
  flex-grow: 1;
}

.discount-info {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.discount-value {
  font-size: 2rem;
  font-weight: bold;
  color: #dc3545;
  line-height: 1;
}

.discount-value small {
  font-size: 1rem;
  font-weight: normal;
}

.discount-type {
  margin-left: 0.5rem;
  font-size: 1rem;
  color: #6c757d;
}

.coupon-description {
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.coupon-details {
  font-size: 0.85rem;
  color: #6c757d;
}

.detail-item {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.coupon-footer {
  padding: 1rem;
  border-top: 1px dashed #dee2e6;
  background-color: #f8f9fa;
}

.my-coupon .coupon-status {
  margin-left: auto;
}
</style>
