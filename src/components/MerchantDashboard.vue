<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>您的訂單</h1>
      <div class="merchant-info">
        <span class="merchant-name">{{ merchantInfo.name }}</span>
        <button class="logout-btn" @click="handleLogout">登出</button>
      </div>
    </header>
    
    <div class="subtitle">
      Set your restaurant to get started
    </div>

    <div class="orders-container">
      <div class="orders-list">
        <div 
          v-for="order in orders" 
          :key="order.id" 
          class="order-item"
          :class="{ 'selected': selectedOrder && selectedOrder.id === order.id }"
          @click="selectOrder(order)"
        >
          <div class="avatar-container">
            <img :src="order.avatar" alt="User" class="avatar">
            <span v-if="order.unread" class="unread-badge">{{ order.unread }}</span>
          </div>
          <div class="order-info">
            <div class="order-header">
              <span class="customer-name">{{ order.customerName }}</span>
            </div>
            <div class="order-message">{{ order.description }}</div>
          </div>
        </div>
      </div>
      
      <div class="order-detail" v-if="selectedOrder">
        <div class="detail-header">
          <div class="customer-profile">
            <img :src="selectedOrder.avatar" alt="User" class="detail-avatar">
            <div class="customer-detail">
              <h3>{{ selectedOrder.customerName }}</h3>
              <p>訂單 #{{ selectedOrder.id }}</p>
            </div>
          </div>
          <div class="action-buttons" v-if="selectedOrder.status === 'pending'">
            <button class="accept-btn" @click="acceptOrder(selectedOrder.id)">接受訂單</button>
            <button class="reject-btn" @click="rejectOrder(selectedOrder.id)">拒絕訂單</button>
          </div>
          <div class="action-buttons" v-else-if="selectedOrder.status === 'processing'">
            <button class="complete-btn" @click="completeOrder(selectedOrder.id)">完成訂單</button>
          </div>
          <div class="status-badge" :class="selectedOrder.status">
            {{ getStatusText(selectedOrder.status) }}
          </div>
        </div>
        
        <div class="items-container">
          <div class="item-card" v-for="(item, index) in selectedOrder.items" :key="index">
            <div class="item-details">
              <h4>{{ item.name }}</h4>
              <div class="item-info">
                <span class="quantity">x{{ item.quantity }}</span>
                <span class="price">${{ item.price }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="order-summary">
          <div class="summary-row">
            <span>小計</span>
            <span>${{ calculateSubtotal(selectedOrder.items) }}</span>
          </div>
          <div class="summary-row">
            <span>運費</span>
            <span>${{ selectedOrder.deliveryFee || 0 }}</span>
          </div>
          <div class="summary-row total">
            <span>總計</span>
            <span>${{ calculateTotal(selectedOrder.items, selectedOrder.deliveryFee) }}</span>
          </div>
        </div>
      </div>
      
      <div class="empty-detail" v-else>
        <div class="empty-message">選擇一個訂單查看詳情</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MerchantDashboard',
  data() {
    return {
      merchantInfo: {
        name: '示例商家',
        id: ''
      },
      selectedOrder: null,
      orders: [
        {
          id: '111',
          customerName: 'Stand up for what you believe in',
          description: 'Stand up for what you believe in',
          avatar: 'https://i.pravatar.cc/100?img=1',
          status: 'pending',
          unread: 9,
          items: [
            { id: 1, name: '炒飯', quantity: 2, price: 80 },
            { id: 2, name: '可樂', quantity: 2, price: 30 }
          ],
          deliveryFee: 20
        },
        {
          id: '112',
          customerName: 'Nathan Scott',
          description: 'One day you\'re seventeen and planning for someday. And then quietly and without...',
          avatar: 'https://i.pravatar.cc/100?img=2',
          status: 'processing',
          unread: 0,
          items: [
            { id: 3, name: '牛肉麵', quantity: 1, price: 120 },
            { id: 4, name: '餃子', quantity: 6, price: 60 }
          ],
          deliveryFee: 30
        },
        {
          id: '113',
          customerName: 'Brooke Davis',
          description: 'I am who I am. No excuses.',
          avatar: 'https://i.pravatar.cc/100?img=3',
          status: 'completed',
          unread: 2,
          items: [
            { id: 5, name: '炸雞', quantity: 1, price: 140 },
            { id: 6, name: '薯條', quantity: 1, price: 50 }
          ],
          deliveryFee: 20
        },
        {
          id: '114',
          customerName: 'Jamie Scott',
          description: 'Some people are a little different. I think that\'s cool.',
          avatar: 'https://i.pravatar.cc/100?img=4',
          status: 'pending',
          unread: 0,
          items: [
            { id: 7, name: '漢堡', quantity: 2, price: 110 },
            { id: 8, name: '沙拉', quantity: 1, price: 70 }
          ],
          deliveryFee: 25
        },
        {
          id: '115',
          customerName: 'Marvin McFadden',
          description: 'Last night in the NBA the Charlotte Bobcats quietly made a move that most sports fans...',
          avatar: 'https://i.pravatar.cc/100?img=5',
          status: 'processing',
          unread: 0,
          items: [
            { id: 9, name: '披薩', quantity: 1, price: 200 },
            { id: 10, name: '烤翅', quantity: 6, price: 180 }
          ],
          deliveryFee: 0
        },
        {
          id: '116',
          customerName: 'Antwon Taylor',
          description: 'Meet me at the Rivercourt',
          avatar: 'https://i.pravatar.cc/100?img=6',
          status: 'pending',
          unread: 0,
          items: [
            { id: 11, name: '義大利麵', quantity: 1, price: 160 },
            { id: 12, name: '麵包', quantity: 2, price: 40 }
          ],
          deliveryFee: 30
        },
        {
          id: '117',
          customerName: 'Jake Jagielski',
          description: 'In your life, you\'re gonna go to some great places, and do some wonderful things.',
          avatar: 'https://i.pravatar.cc/100?img=7',
          status: 'completed',
          unread: 0,
          items: [
            { id: 13, name: '壽司', quantity: 2, price: 220 },
            { id: 14, name: '味噌湯', quantity: 2, price: 60 }
          ],
          deliveryFee: 25
        }
      ]
    }
  },
  methods: {
    handleLogout() {
      // 清除所有登入相關的存儲資訊
      localStorage.removeItem('token');
      localStorage.removeItem('restaurant');
      localStorage.removeItem('merchant');
      localStorage.removeItem('merchantLoggedIn');
      localStorage.removeItem('merchantInfo');
      localStorage.removeItem('user_logged_in');
      
      // 顯示登出成功訊息
      this.$toast?.success?.('登出成功') || alert('登出成功');
      
      // 觸發自定義事件，通知 NavBar 組件登入狀態已經改變
      window.dispatchEvent(new Event('login-state-changed'));
      
      // 跳轉到商家登入頁面
      this.$router.push('/merchant-login');
    },
    selectOrder(order) {
      this.selectedOrder = order;
      if (order.unread) {
        order.unread = 0;
      }
    },
    calculateSubtotal(items) {
      return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    calculateTotal(items, deliveryFee = 0) {
      const subtotal = this.calculateSubtotal(items);
      return subtotal + (deliveryFee || 0);
    },
    getStatusText(status) {
      const statusMap = {
        pending: '待處理',
        processing: '處理中',
        completed: '已完成',
        cancelled: '已取消'
      };
      return statusMap[status] || status;
    },
    acceptOrder(orderId) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'processing';
      }
    },
    rejectOrder(orderId) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'cancelled';
      }
    },
    completeOrder(orderId) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'completed';
      }
    }
  },
  created() {
    // 获取商家信息
    const merchantInfo = localStorage.getItem('merchantInfo');
    if (merchantInfo) {
      const { accountId } = JSON.parse(merchantInfo);
      this.merchantInfo.id = accountId;
    }
    
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('merchantLoggedIn');
    if (!isLoggedIn) {
      this.$router.push('/merchant-login');
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
  font-size: 16px;
}

.merchant-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.merchant-name {
  font-size: 16px;
  color: #666;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: #e5e5e5;
}

.orders-container {
  display: flex;
  flex: 1;
  gap: 20px;
  height: calc(100vh - 150px);
  overflow: hidden;
}

.orders-list {
  width: 35%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow-y: auto;
  background-color: #fff;
}

.order-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.order-item:hover {
  background-color: #f5f5f5;
}

.order-item.selected {
  background-color: #e3f2fd;
}

.avatar-container {
  position: relative;
  margin-right: 15px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #0078ff;
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.order-info {
  flex: 1;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.customer-name {
  font-weight: bold;
  color: #333;
}

.order-message {
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-detail, .empty-detail {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.customer-profile {
  display: flex;
  align-items: center;
}

.detail-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
}

.customer-detail h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.customer-detail p {
  margin: 0;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}

.accept-btn {
  background-color: #1a73e8;
  color: white;
}

.reject-btn {
  background-color: #dc3545;
  color: white;
}

.complete-btn {
  background-color: #28a745;
  color: white;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.processing {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.completed {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.items-container {
  padding: 20px;
  flex: 1;
}

.item-card {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 15px;
}

.item-details h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.item-info {
  display: flex;
  justify-content: space-between;
  color: #666;
}

.order-summary {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background-color: #f9f9f9;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-row.total {
  font-weight: bold;
  font-size: 18px;
  margin-top: 15px;
  border-top: 1px solid #e0e0e0;
  padding-top: 15px;
}

.empty-detail {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-message {
  color: #666;
  font-size: 16px;
}

@media (max-width: 768px) {
  .orders-container {
    flex-direction: column;
    height: auto;
  }
  
  .orders-list, .order-detail {
    width: 100%;
    height: 50vh;
  }
}
</style> 