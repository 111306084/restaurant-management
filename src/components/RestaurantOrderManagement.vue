<template>
  <div class="restaurant-order-management">
    <h1>訂單管理</h1>
    
    <!-- 訂單狀態過濾器 -->
    <div class="order-filters">
      <button 
        v-for="filter in statusFilters" 
        :key="filter.value" 
        :class="['filter-btn', { active: activeStatusFilter === filter.value }]"
        @click="activeStatusFilter = filter.value"
      >
        {{ filter.label }}
        <span v-if="getOrderCountByStatus(filter.value) > 0" class="count-badge">
          {{ getOrderCountByStatus(filter.value) }}
        </span>
      </button>
    </div>
    
    <!-- 訂單列表 -->
    <div class="orders-container">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>載入中...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="fetchOrders" class="retry-btn">重試</button>
      </div>
      
      <div v-else-if="filteredOrders.length === 0" class="no-orders-container">
        <p v-if="activeStatusFilter === 'pending'">目前沒有待處理訂單</p>
        <p v-else-if="activeStatusFilter === 'all'">目前沒有任何訂單</p>
        <p v-else>目前沒有{{ statusFilterLabel }}的訂單</p>
      </div>
      
      <div v-else class="order-list">
        <div 
          v-for="order in filteredOrders" 
          :key="order.order_id" 
          class="order-card"
          :class="{ 'order-pending': order.status === 'pending', 'order-confirmed': order.status === 'confirmed', 'order-preparing': order.status === 'preparing', 'order-ready': order.status === 'ready', 'order-completed': order.status === 'completed', 'order-cancelled': order.status === 'cancelled' }"
        >
          <div class="order-header">
            <div class="order-id">訂單 #{{ order.order_id }}</div>
            <div class="order-date">{{ formatDate(order.order_date) }}</div>
          </div>
          
          <div class="order-customer">
            <strong>顧客:</strong> {{ order.student_name }}
          </div>
          
          <div class="order-items">
            <div v-for="(item, index) in order.items" :key="index" class="order-item">
              <div class="item-quantity">{{ item.quantity }}x</div>
              <div class="item-name">{{ item.item_name }}</div>
              <div class="item-price">
                <span v-if="order.discount_amount > 0 && order.original_amount && order.total_amount" class="original-item-price">
                  <s>NT${{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</s>
                </span>
                <span v-else>NT${{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <div class="order-pricing">
            <div class="price-row" v-if="order.original_amount && parseFloat(order.discount_amount) > 0">
              <span>原價:</span>
              <span class="original-price"><s>NT${{ parseFloat(order.original_amount).toFixed(2) }}</s></span>
            </div>
            <div class="price-row discount" v-if="parseFloat(order.discount_amount) > 0">
              <span>折扣金額:</span>
              <span class="discount-amount">-NT${{ parseFloat(order.discount_amount).toFixed(2) }}</span>
            </div>
            <div class="price-row total">
              <strong>最終金額:</strong> 
              <strong>NT${{ parseFloat(order.total_amount).toFixed(2) }}</strong>
              <span class="discount-badge" v-if="parseFloat(order.discount_amount) > 0">已折扣</span>
            </div>
          </div>
          
          <div class="order-status">
            <span class="status-label">狀態:</span>
            <span class="status-value">{{ getStatusLabel(order.status) }}</span>
          </div>
          
          <div class="order-actions">
            <button 
              v-if="order.status === 'pending'" 
              @click="updateOrderStatus(order.order_id, 'confirmed')"
              class="action-btn confirm-btn"
            >
              確認訂單
            </button>
            
            <button 
              v-if="order.status === 'confirmed'" 
              @click="updateOrderStatus(order.order_id, 'preparing')"
              class="action-btn prepare-btn"
            >
              開始準備
            </button>
            
            <button 
              v-if="order.status === 'preparing'" 
              @click="updateOrderStatus(order.order_id, 'ready')"
              class="action-btn ready-btn"
            >
              準備完成
            </button>
            
            <button 
              v-if="order.status === 'ready'" 
              @click="updateOrderStatus(order.order_id, 'completed')"
              class="action-btn complete-btn"
            >
              完成訂單
            </button>
            
            <button 
              v-if="['pending', 'confirmed'].includes(order.status)" 
              @click="cancelOrder(order.order_id)"
              class="action-btn cancel-btn"
            >
              取消訂單
            </button>
            
            <button 
              @click="viewOrderDetails(order)"
              class="action-btn details-btn"
            >
              查看詳情
            </button>
          </div>
        </div>
      </div>
      
      <!-- 分頁 -->
      <div v-if="pagination && pagination.totalPages > 1" class="pagination">
        <button 
          class="page-btn prev" 
          :disabled="pagination.currentPage === 1"
          @click="changePage(pagination.currentPage - 1)"
        >
          上一頁
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in displayedPages" 
            :key="page" 
            class="page-number"
            :class="{ active: page === pagination.currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="page-btn next" 
          :disabled="pagination.currentPage === pagination.totalPages"
          @click="changePage(pagination.currentPage + 1)"
        >
          下一頁
        </button>
      </div>
    </div>
    
    <!-- 訂單詳情彈窗 -->
    <div v-if="selectedOrder" class="order-details-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>訂單詳情 #{{ selectedOrder.order_id }}</h2>
          <button @click="selectedOrder = null" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="detail-section">
            <h3>顧客資訊</h3>
            <p><strong>姓名:</strong> {{ selectedOrder.student_name }}</p>
            <p><strong>電話:</strong> {{ selectedOrder.student_phone }}</p>
            <p><strong>備註:</strong> {{ selectedOrder.note || '無' }}</p>
            <p><strong>支付方式:</strong> {{ selectedOrder.payment_method }}</p>
            <p><strong>訂單狀態:</strong> {{ getStatusLabel(selectedOrder.status) }}</p>
          </div>
          
          <div class="detail-section">
            <h3>訂單資訊</h3>
            <p><strong>訂單編號:</strong> #{{ selectedOrder.order_id }}</p>
            <p><strong>訂單日期:</strong> {{ formatDate(selectedOrder.order_date) }}</p>
          </div>
          
          <div class="detail-section">
            <h3>訂單項目</h3>
            <div class="detail-items">
              <div v-for="(item, index) in selectedOrder.items" :key="index" class="detail-item">
                <div class="item-quantity">{{ item.quantity }}x</div>
                <div class="item-name">{{ item.item_name }}</div>
                <div class="item-price">
                  <span v-if="selectedOrder.discount_amount > 0 && selectedOrder.original_amount && selectedOrder.total_amount" class="original-item-price">
                    <s>NT${{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</s>
                  </span>
                  <span v-else>NT${{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="detail-pricing">
            <div class="price-row" v-if="selectedOrder.original_amount">
              <span>原價總計:</span>
              <span class="original-price"><s>NT${{ parseFloat(selectedOrder.original_amount).toFixed(2) }}</s></span>
            </div>
            <div class="price-row discount" v-if="selectedOrder.discount_amount && parseFloat(selectedOrder.discount_amount) > 0">
              <span>優惠折扣:</span>
              <span class="discount-amount">-NT${{ parseFloat(selectedOrder.discount_amount).toFixed(2) }}</span>
            </div>
            <div class="price-row total">
              <strong>最終金額:</strong>
              <strong class="final-amount">NT${{ parseFloat(selectedOrder.total_amount).toFixed(2) }}</strong>
            </div>
          </div>

          <div class="coupon-info" v-if="selectedOrder.discount_amount && selectedOrder.discount_amount > 0">
            <div class="coupon-details">
              <div class="coupon-badge">
                <i class="fas fa-ticket-alt"></i> 已使用優惠券
              </div>
              <div class="coupon-id" v-if="selectedOrder.coupon_id">
                優惠券ID: {{ selectedOrder.coupon_id }}
              </div>
            </div>
          </div>
          <div class="detail-section">
            <h3>訂單操作</h3>
            <div class="detail-actions">
              <button 
                v-if="selectedOrder.status === 'pending'"
                @click="updateOrderStatus(selectedOrder.order_id, 'confirmed')"
                class="action-btn confirm-btn"
              >
                確認訂單
              </button>
              
              <button 
                v-if="selectedOrder.status === 'confirmed'"
                @click="updateOrderStatus(selectedOrder.order_id, 'preparing')"
                class="action-btn prepare-btn"
              >
                開始製作
              </button>
              
              <button 
                v-if="selectedOrder.status === 'preparing'"
                @click="updateOrderStatus(selectedOrder.order_id, 'ready')"
                class="action-btn ready-btn"
              >
                製作完成
              </button>
              
              <button 
                v-if="selectedOrder.status === 'ready'"
                @click="updateOrderStatus(selectedOrder.order_id, 'completed')"
                class="action-btn complete-btn"
              >
                訂單完成
              </button>
              
              <button 
                v-if="['pending', 'confirmed'].includes(selectedOrder.status)"
                @click="updateOrderStatus(selectedOrder.order_id, 'cancelled')"
                class="action-btn cancel-btn"
              >
                取消訂單
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { orderAPI } from '../services/api';
import axios from 'axios';

// 配置API基礎URL
const API_URL = 'http://localhost:3000/api';

export default {
  name: 'RestaurantOrderManagement',
  data() {
    return {
      orders: [],
      loading: true,
      error: null,
      activeStatusFilter: 'all', // 默認顯示全部訂單
      statusFilters: [
        { label: '全部', value: 'all' },
        { label: '待處理', value: 'pending' },
        { label: '已確認', value: 'confirmed' },
        { label: '準備中', value: 'preparing' },
        { label: '準備完成', value: 'ready' },
        { label: '已完成', value: 'completed' },
        { label: '已取消', value: 'cancelled' }
      ],
      pagination: null,
      selectedOrder: null
    };
  },
  computed: {
    statusFilterLabel() {
      const filter = this.statusFilters.find(f => f.value === this.activeStatusFilter);
      return filter ? filter.label : '';
    },
    filteredOrders() {
      return this.orders.filter(order => {
        if (this.activeStatusFilter === 'all') return true;
        return order.status === this.activeStatusFilter;
      });
    },
    displayedPages() {
      if (!this.pagination) return [];
      
      const { currentPage, totalPages } = this.pagination;
      const pages = [];
      
      // 顯示最多5個頁碼
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 當前頁在前3頁
        if (currentPage <= 3) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
        } 
        // 當前頁在後3頁
        else if (currentPage >= totalPages - 2) {
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
          }
        } 
        // 當前頁在中間
        else {
          for (let i = currentPage - 2; i <= currentPage + 2; i++) {
            pages.push(i);
          }
        }
      }
      
      return pages;
    }
  },
  mounted() {
    this.fetchOrders();
    // 每分鐘自動刷新訂單列表
    this.refreshInterval = setInterval(() => {
      this.fetchOrders();
    }, 60000);
  },
  beforeUnmount() {
    // 清除定時器
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    async fetchOrders(page = 1) {
      this.loading = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.error = '請先登入';
          this.loading = false;
          return;
        }
        
        // 檢查商家信息
        const merchantInfo = localStorage.getItem('restaurant');
        console.log('商家信息:', merchantInfo);
        
        // 使用 API 服務獲取訂單列表
        const status = this.activeStatusFilter !== 'all' ? this.activeStatusFilter : null;
        
        console.log('正在獲取訂單列表:', {
          狀態篩選: status,
          頁碼: page,
          token長度: token.length
        });
        
        // 直接使用 axios 進行訂單獲取，這樣可以看到更多的除錯信息
        const axiosResponse = await axios.get(`${API_URL}/orders/restaurant`, {
          params: {
            status: status,
            page: page,
            limit: 10
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('原始訂單列表回應:', axiosResponse);
        
        if (axiosResponse.data && axiosResponse.data.success) {
          const response = axiosResponse.data;
          
          // 直接處理 API 服務的回應
          this.orders = response.orders || [];
          this.pagination = response.pagination;
          
          console.log('訂單列表詳情:', {
            訂單數量: this.orders.length,
            分頁信息: this.pagination
          });
          
          // 確保訂單金額欄位為數字類型
          this.orders.forEach(order => {
            order.original_amount = parseFloat(order.original_amount) || 0;
            order.discount_amount = parseFloat(order.discount_amount) || 0;
            order.total_amount = parseFloat(order.total_amount) || 0;
            
            // 調試輸出
            console.log('訂單金額處理:', {
              order_id: order.order_id,
              original_amount: order.original_amount,
              discount_amount: order.discount_amount,
              total_amount: order.total_amount,
              discount_amount_type: typeof order.discount_amount,
              has_discount: order.discount_amount > 0
            });
          });
          
          console.log('處理後的訂單列表:', this.orders);
        } else {
          console.error('訂單列表回應失敗:', axiosResponse.data);
          throw new Error(axiosResponse.data?.message || '獲取訂單失敗');
        }
      } catch (error) {
        console.error('獲取訂單錯誤:', error);
        this.error = error.message || '獲取訂單時發生錯誤';
        // 嘗試使用空列表
        this.orders = [];
      } finally {
        this.loading = false;
      }
    },
    async updateOrderStatus(orderId, status) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.error = '請先登入';
          return;
        }
        
        // 使用 API 服務更新訂單狀態
        await orderAPI.updateOrderStatus(orderId, status);
        
        // 更新本地訂單狀態
        const index = this.orders.findIndex(order => order.order_id === orderId);
        if (index !== -1) {
          this.orders[index].status = status;
        }
        
        // 如果當前正在查看該訂單的詳情，也更新詳情中的狀態
        if (this.selectedOrder && this.selectedOrder.order_id === orderId) {
          this.selectedOrder.status = status;
        }
        
        // 顯示成功消息
        alert(`訂單狀態已更新為${this.getStatusLabel(status)}`);
      } catch (error) {
        console.error('更新訂單狀態錯誤:', error);
        alert(error.message || '更新訂單狀態時發生錯誤');
      }
    },
    async cancelOrder(orderId) {
      if (!confirm('確定要取消此訂單嗎？')) {
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.error = '請先登入';
          return;
        }
        
        // 使用 API 服務取消訂單
        await orderAPI.cancelOrder(orderId);
        
        // 更新本地訂單狀態
        const index = this.orders.findIndex(order => order.order_id === orderId);
        if (index !== -1) {
          this.orders[index].status = 'cancelled';
        }
        
        // 如果當前正在查看該訂單的詳情，也更新詳情中的狀態
        if (this.selectedOrder && this.selectedOrder.order_id === orderId) {
          this.selectedOrder.status = 'cancelled';
        }
        
        // 顯示成功消息
        alert('訂單已取消');
      } catch (error) {
        console.error('取消訂單錯誤:', error);
        alert(error.message || '取消訂單時發生錯誤');
      }
    },
    viewOrderDetails(order) {
      this.selectedOrder = { ...order };
    },
    changePage(page) {
      if (page !== this.pagination.currentPage) {
        this.fetchOrders(page);
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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
    getOrderCountByStatus(status) {
      if (status === 'all') {
        return this.orders.length;
      }
      return this.orders.filter(order => order.status === status).length;
    }
  }
};
</script>

<style scoped>
.restaurant-order-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 價格顯示樣式 */
.detail-pricing, .order-pricing {
  margin-top: 15px;
  border-top: 1px dashed #ddd;
  padding-top: 15px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
}

.price-row.discount {
  color: #e74c3c;
}

.price-row.total {
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
  border-top: 1px solid #eee;
  padding-top: 8px;
}

.original-price {
  text-decoration: line-through;
  color: #999;
}

.discount-badge {
  background-color: #e74c3c;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  font-weight: normal;
}

.coupon-info {
  margin-top: 15px;
}

.coupon-badge {
  display: inline-block;
  background-color: #ff9800;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.coupon-badge i {
  margin-right: 5px;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.order-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-btn {
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #495057;
  position: relative;
}

.filter-btn.active {
  background-color: #ff5722;
  color: white;
  border-color: #ff5722;
  box-shadow: 0 2px 5px rgba(255, 87, 34, 0.3);
}

.filter-btn:hover:not(.active) {
  background-color: #f0f0f0;
  border-color: #ccc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.count-badge {
  position: absolute;
  top: -8px;
  right: -8px;
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a6fa5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 40px;
  color: #e74c3c;
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty-orders {
  text-align: center;
  padding: 40px;
  color: #777;
}

.order-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.order-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.order-card.order-pending {
  border-left: 4px solid #f39c12;
}

.order-card.order-confirmed {
  border-left: 4px solid #3498db;
}

.order-card.order-preparing {
  border-left: 4px solid #9b59b6;
}

.order-card.order-ready {
  border-left: 4px solid #2ecc71;
}

.order-card.order-completed {
  border-left: 4px solid #27ae60;
}

.order-card.order-cancelled {
  border-left: 4px solid #e74c3c;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.order-id {
  font-weight: bold;
  font-size: 16px;
}

.order-date {
  color: #777;
  font-size: 14px;
}

.order-customer {
  margin-bottom: 10px;
}

.order-items {
  margin: 15px 0;
  max-height: 150px;
  overflow-y: auto;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 10px 0;
}

.order-item {
  display: flex;
  margin-bottom: 8px;
}

.item-quantity {
  width: 40px;
  font-weight: bold;
}

.item-name {
  flex: 1;
}

.item-price {
  width: 80px;
  text-align: right;
}

.original-item-price {
  font-size: 12px;
  color: #999;
}

.order-total {
  margin: 10px 0;
  text-align: right;
  font-size: 16px;
}

.order-status {
  margin: 10px 0;
}

.status-value {
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 4px;
  background-color: #f8f8f8;
}

.order-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.confirm-btn {
  background-color: #3498db;
  color: white;
}

.prepare-btn {
  background-color: #9b59b6;
  color: white;
}

.ready-btn {
  background-color: #2ecc71;
  color: white;
}

.complete-btn {
  background-color: #27ae60;
  color: white;
}

.cancel-btn {
  background-color: #e74c3c;
  color: white;
}

.details-btn {
  background-color: #4a6fa5;
  border: none;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.details-btn:hover {
  background-color: #3a5a8c;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 5px;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  border-radius: 4px;
  cursor: pointer;
}

.page-number.active {
  background-color: #4a6fa5;
  color: white;
  border-color: #4a6fa5;
}

/* 訂單詳情彈窗樣式 */
.order-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  color: #4a6fa5;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.detail-items {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.detail-item:last-child {
  border-bottom: none;
}

.item-quantity {
  width: 50px;
  color: #666;
}

.item-name {
  flex: 1;
}

.item-price {
  width: 100px;
  text-align: right;
  color: #4a6fa5;
}

.original-item-price {
  color: #999;
  margin-right: 5px;
}

.detail-pricing {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.price-row:last-child {
  margin-bottom: 0;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.original-price {
  color: #999;
}

.discount-amount {
  color: #e74c3c;
}

.final-amount {
  color: #4a6fa5;
  font-size: 1.2em;
}

.coupon-info {
  margin-top: 15px;
  background-color: #fff8e1;
  border-radius: 4px;
  padding: 10px 15px;
}

.coupon-badge {
  display: inline-flex;
  align-items: center;
  color: #f57c00;
  font-size: 0.9em;
}

.coupon-badge i {
  margin-right: 5px;
}

.coupon-id {
  margin-top: 5px;
  color: #666;
  font-size: 0.9em;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.confirm-btn {
  background-color: #4caf50;
  color: white;
}

.prepare-btn {
  background-color: #2196f3;
  color: white;
}

.ready-btn {
  background-color: #ff9800;
  color: white;
}

.complete-btn {
  background-color: #4a6fa5;
  color: white;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

.action-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.order-pricing, .detail-pricing {
  margin: 10px 0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.original-price {
  color: #999;
}

.original-price s {
  text-decoration: line-through;
}

.discount-amount {
  color: #e74c3c;
  font-weight: bold;
}

.final-amount {
  color: #2ecc71;
}

.discount-badge {
  font-size: 12px;
  background-color: #e74c3c;
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  margin-left: 5px;
}

.coupon-details {
  margin-top: 10px;
  border: 1px dashed #3498db;
  padding: 10px;
  border-radius: 5px;
  background-color: #f8f9fa;
}

.coupon-badge {
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 5px;
}

.coupon-id {
  font-size: 13px;
  color: #777;
  margin-bottom: 5px;
}

.discount-summary {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding-top: 5px;
  border-top: 1px dashed #ddd;
}

.discount-summary .original {
  text-decoration: line-through;
  color: #999;
}

.discount-summary .discount {
  color: #e74c3c;
}

.discount-summary .final {
  font-weight: bold;
  color: #2ecc71;
}

.detail-total {
  margin: 10px 0;
  text-align: right;
  font-size: 16px;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
