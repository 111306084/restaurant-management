<template>
  <div>
    <h2 class="text-center my-4">優惠券管理</h2>
    
    <div class="alert alert-info mb-4">
      <i class="fas fa-info-circle me-2"></i>
      <strong>提示：</strong> 優惠券是吸引學生點餐的有效方式，可提高您的訂單量。
    </div>
    
    <div class="row mb-4">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="fas fa-plus-circle me-2"></i>新增優惠券
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveCoupon">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="couponName" class="form-label">優惠券名稱/描述 <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="couponName"
                      v-model="couponForm.description"
                      placeholder="例: 滿200元折50元、新用戶首單9折"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="couponCode" class="form-label">優惠券代碼</label>
                    <div class="input-group">
                      <input 
                        type="text" 
                        class="form-control" 
                        id="couponCode"
                        v-model="couponForm.code"
                        placeholder="留空將自動生成代碼"
                      >
                      <button 
                        class="btn btn-outline-secondary" 
                        type="button"
                        @click="generateCode"
                      >
                        生成
                      </button>
                    </div>
                    <small class="form-text text-muted">留空系統將自動生成8位代碼</small>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="discountType" class="form-label">折扣類型 <span class="text-danger">*</span></label>
                    <select 
                      class="form-select" 
                      id="discountType"
                      v-model="couponForm.discount_type"
                      required
                    >
                      <option value="">請選擇折扣類型</option>
                      <option value="percentage">百分比折扣 (%)</option>
                      <option value="fixed">固定金額折扣 (元)</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="discountValue" class="form-label">折扣值 <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <input 
                        type="number" 
                        class="form-control" 
                        id="discountValue"
                        v-model="couponForm.discount_value"
                        :placeholder="couponForm.discount_type === 'percentage' ? '例: 10 (表示9折)' : '例: 50 (表示折抵50元)'"
                        min="0"
                        :max="couponForm.discount_type === 'percentage' ? 100 : undefined"
                        step="1"
                        required
                      >
                      <span class="input-group-text">{{ couponForm.discount_type === 'percentage' ? '%' : '元' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="minOrderAmount" class="form-label">最低訂單金額</label>
                    <div class="input-group">
                      <input 
                        type="number" 
                        class="form-control" 
                        id="minOrderAmount"
                        v-model="couponForm.min_order_amount"
                        placeholder="例: 200 (不限制請留空)"
                        min="0"
                        step="10"
                      >
                      <span class="input-group-text">元</span>
                    </div>
                    <small class="form-text text-muted">學生訂單金額需達到此數值才能使用優惠券</small>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="startDate" class="form-label">開始日期 <span class="text-danger">*</span></label>
                    <input 
                      type="date" 
                      class="form-control" 
                      id="startDate"
                      v-model="couponForm.start_date"
                      :min="today"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="endDate" class="form-label">結束日期 <span class="text-danger">*</span></label>
                    <input 
                      type="date" 
                      class="form-control" 
                      id="endDate"
                      v-model="couponForm.end_date"
                      :min="couponForm.start_date || today"
                      required
                    >
                  </div>
                </div>
              </div>
              
              <div class="form-check mb-3">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="isActive"
                  v-model="couponForm.is_active"
                >
                <label class="form-check-label" for="isActive">
                  立即啟用優惠券
                </label>
              </div>
              
              <div class="d-flex justify-content-between">
                <button type="button" class="btn btn-secondary" @click="resetForm">
                  <i class="fas fa-undo me-1"></i> 重置
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <i class="fas fa-save me-1"></i> {{ editingCouponId ? '更新優惠券' : '新增優惠券' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">
          <i class="fas fa-ticket-alt me-2"></i>已發布的優惠券
        </h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">載入中...</span>
          </div>
          <p class="mt-2">正在加載優惠券資料...</p>
        </div>
        
        <div v-else-if="coupons.length === 0" class="text-center my-4">
          <div class="empty-state">
            <i class="fas fa-ticket-alt fa-4x text-muted mb-3"></i>
            <h5>暫無優惠券</h5>
            <p class="text-muted">您尚未建立任何優惠券，立即創建第一個優惠券吧！</p>
          </div>
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>優惠券代碼</th>
                <th>描述</th>
                <th>折扣</th>
                <th>使用條件</th>
                <th>有效期限</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="coupon in coupons" :key="coupon.coupon_id">
                <td><code>{{ coupon.code }}</code></td>
                <td>{{ coupon.description }}</td>
                <td>
                  <span v-if="coupon.discount_type === 'percentage'">
                    {{ coupon.discount_value }}% 折扣
                  </span>
                  <span v-else>
                    折抵 {{ coupon.discount_value }} 元
                  </span>
                </td>
                <td>
                  <span v-if="coupon.min_order_amount">
                    訂單滿 {{ coupon.min_order_amount }} 元
                  </span>
                  <span v-else class="text-muted">無限制</span>
                </td>
                <td>
                  {{ formatDate(coupon.start_date) }} 至 {{ formatDate(coupon.end_date) }}
                  <div>
                    <small :class="isExpired(coupon.end_date) ? 'text-danger' : 'text-success'">
                      {{ isExpired(coupon.end_date) ? '已過期' : '有效中' }}
                    </small>
                  </div>
                </td>
                <td>
                  <div class="btn-group">
                    <button 
                      class="btn btn-outline-primary"
                      @click="editCoupon(coupon)"
                    >
                      <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button 
                      class="btn btn-outline-danger"
                      @click="deleteCouponConfirm(coupon)"
                    >
                      <i class="fas fa-trash"></i> 刪除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 刪除確認彈窗 (使用 Vue 的方式) -->
    <div v-if="showDeleteModal" class="custom-modal-overlay">
      <div class="custom-modal">
        <div class="custom-modal-header">
          <h5>確認刪除</h5>
          <button type="button" class="close-button" @click="showDeleteModal = false">&times;</button>
        </div>
        <div class="custom-modal-body">
          <p>您確定要刪除以下優惠券嗎？此操作無法還原。</p>
          <div v-if="couponToDelete" class="alert alert-warning">
            <strong>優惠券：</strong> {{ couponToDelete.description }}<br>
            <strong>代碼：</strong> {{ couponToDelete.code }}<br>
            <strong>已領取次數：</strong> {{ couponToDelete.claimed_count || 0 }}
          </div>
        </div>
        <div class="custom-modal-footer">
          <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">取消</button>
          <button 
            type="button" 
            class="btn btn-danger" 
            @click="deleteCoupon"
            :disabled="deleteLoading"
          >
            <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-1"></span>
            確認刪除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// 不再使用 Bootstrap Modal

export default {
  name: 'RestaurantCouponManagement',
  data() {
    return {
      restaurantId: '',
      coupons: [],
      loading: false,
      deleteLoading: false,
      couponToDelete: null,
      showDeleteModal: false,
      editingCouponId: null,
      couponForm: {
        description: '',
        code: '',
        discount_type: '',
        discount_value: '',
        min_order_amount: '',
        usage_limit: '',
        start_date: this.getTodayDate(),
        end_date: this.getDefaultEndDate(),
        is_active: true
      },
      today: this.getTodayDate()
    };
  },
  mounted() {
    // 從本地存儲獲取餐廳 ID
    const restaurantData = localStorage.getItem('restaurant');
    if (restaurantData) {
      try {
        const parsedData = JSON.parse(restaurantData);
        // 根據不同的存儲結構適應取值
        this.restaurantId = parsedData.id || parsedData.restaurant_id;
        
        console.log('餐廳ID獲取結果:', this.restaurantId);
        console.log('餐廳數據:', parsedData);
        
        // 確保有有效的餐廳ID
        if (!this.restaurantId) {
          console.error('無法獲取有效的餐廳ID');
          this.showAlert('預設錯誤', '無法獲取餐廳ID，請重新登入', 'error');
          return;
        }
        
        // 加載優惠券數據
        this.loadCoupons();
      } catch (error) {
        console.error('解析餐廳數據錯誤:', error);
        this.showAlert('預設錯誤', '無法解析餐廳數據，請重新登入', 'error');
      }
    } else {
      console.log('沒有找到餐廳數據，但不會導航離開預期頁面');
      this.showAlert('預設錯誤', '無法獲取餐廳數據，請確保您已登入', 'error');
      // 不再使用路由跳轉，避免導致側邊欄消失
      // this.$router.push('/restaurant-login');
    }
  },
  methods: {
    async loadCoupons() {
      this.loading = true;
      try {
        // 確保使用正確的安全憑證
        const token = localStorage.getItem('token') || localStorage.getItem('restaurantToken');
        if (!token) {
          console.error('無法獲取有效的憑證令牌');
          this.showAlert('授權錯誤', '請重新登入以獲取有效的憑證', 'error');
          return;
        }
        
        console.log(`正在請求優惠券數據，餐廳ID: ${this.restaurantId}`);
        
        const response = await axios.get(`http://localhost:3000/api/coupons/restaurant/${this.restaurantId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          this.coupons = response.data.coupons;
        } else {
          this.showAlert('加載優惠券失敗', response.data.message, 'error');
        }
      } catch (error) {
        console.error('加載優惠券錯誤:', error);
        this.showAlert('加載優惠券失敗', error.response?.data?.message || '發生未知錯誤', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async saveCoupon() {
      this.loading = true;
      
      try {
        // 確保使用正確的安全憑證
        const token = localStorage.getItem('token') || localStorage.getItem('restaurantToken');
        if (!token) {
          console.error('無法獲取有效的憑證令牌');
          this.showAlert('授權錯誤', '請重新登入以獲取有效的憑證', 'error');
          return;
        }
        
        // 表單驗證
        const requiredFields = [
          { field: 'description', name: '優惠券描述' },
          { field: 'discount_type', name: '折扣類型' },
          { field: 'discount_value', name: '折扣值' },
          { field: 'start_date', name: '開始日期' },
          { field: 'end_date', name: '結束日期' }
        ];
        
        // 檢查必填欄位
        const missingFields = requiredFields.filter(item => {
          return !this.couponForm[item.field] && this.couponForm[item.field] !== 0;
        });
        
        if (missingFields.length > 0) {
          const fieldNames = missingFields.map(item => item.name).join(', ');
          this.showAlert('表單不完整', `請填寫以下必填欄位: ${fieldNames}`, 'error');
          this.loading = false;
          return;
        }
        
        // 檢查日期有效性
        const startDate = new Date(this.couponForm.start_date);
        const endDate = new Date(this.couponForm.end_date);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          this.showAlert('日期格式錯誤', '請確保日期格式正確', 'error');
          this.loading = false;
          return;
        }
        
        if (endDate < startDate) {
          this.showAlert('日期範圍錯誤', '結束日期不能早於開始日期', 'error');
          this.loading = false;
          return;
        }
        
        // 處理數字類型
        const formData = {
          ...this.couponForm,
          discount_value: parseFloat(this.couponForm.discount_value),
          min_order_amount: this.couponForm.min_order_amount ? parseFloat(this.couponForm.min_order_amount) : null,
          // 修改 usage_limit 處理邏輯，確保 0 值也能正確處理
          usage_limit: this.couponForm.usage_limit === '' || this.couponForm.usage_limit === undefined ? null : parseInt(this.couponForm.usage_limit),
          // 添加允許過去日期的標誌
          allowPastStartDate: true
        };
        
        console.log(`正在保存優惠券數據，餐廳ID: ${this.restaurantId}`);
        console.log('表單數據:', formData);
        
        let response;
        
        if (this.editingCouponId) {
          // 更新優惠券
          response = await axios.put(`http://localhost:3000/api/coupons/restaurant/${this.restaurantId}/${this.editingCouponId}`, formData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.success) {
            this.showAlert('優惠券更新成功', '您的優惠券已成功更新', 'success');
          }
        } else {
          // 創建新優惠券
          response = await axios.post(`http://localhost:3000/api/coupons/restaurant/${this.restaurantId}`, formData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.success) {
            this.showAlert('優惠券創建成功', '您的優惠券已發布並可供學生使用', 'success');
          }
        }
        
        this.resetForm();
        this.loadCoupons();
      } catch (error) {
        console.error('保存優惠券錯誤:', error);
        this.showAlert('保存優惠券失敗', error.response?.data?.message || '發生未知錯誤', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    editCoupon(coupon) {
      this.editingCouponId = coupon.coupon_id;
      
      // 填充表單
      this.couponForm = {
        description: coupon.description,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount || '',
        // 正確處理 usage_limit，保留原始值（包括 0）
        usage_limit: coupon.usage_limit === null || coupon.usage_limit === undefined ? null : coupon.usage_limit,
        start_date: this.formatDateForInput(coupon.start_date),
        end_date: this.formatDateForInput(coupon.end_date),
        is_active: !!coupon.is_active
      };
      
      // 滾動到表單頂部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    resetForm() {
      this.editingCouponId = null;
      this.couponForm = {
        description: '',
        code: '',
        discount_type: '',
        discount_value: '',
        min_order_amount: '',
        usage_limit: null, // 將空字串改為 null，確保後端能正確處理
        start_date: this.getTodayDate(),
        end_date: this.getDefaultEndDate(),
        is_active: true
      };
    },
    
    deleteCouponConfirm(coupon) {
      this.couponToDelete = coupon;
      this.showDeleteModal = true;
    },
    
    async deleteCoupon() {
      if (!this.couponToDelete) return;
      
      this.deleteLoading = true;
      
      try {
        // 確保使用正確的安全憑證
        const token = localStorage.getItem('token') || localStorage.getItem('restaurantToken');
        if (!token) {
          console.error('無法獲取有效的憑證令牌');
          this.showAlert('授權錯誤', '請重新登入以獲取有效的憑證', 'error');
          return;
        }
        
        console.log(`正在刪除優惠券，餐廳ID: ${this.restaurantId}, 優惠券ID: ${this.couponToDelete.coupon_id}`);
        
        const response = await axios.delete(
          `http://localhost:3000/api/coupons/restaurant/${this.restaurantId}/${this.couponToDelete.coupon_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success) {
          this.showAlert('優惠券已刪除', '您的優惠券已成功刪除', 'success');
          this.loadCoupons();
          this.showDeleteModal = false;
        } else {
          this.showAlert('刪除優惠券失敗', response.data.message, 'error');
        }
      } catch (error) {
        console.error('刪除優惠券錯誤:', error);
        this.showAlert('刪除優惠券失敗', error.response?.data?.message || '發生未知錯誤', 'error');
      } finally {
        this.deleteLoading = false;
      }
    },
    
    generateCode() {
      const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      
      for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
      }
      
      this.couponForm.code = code;
    },
    
    getTodayDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    
    getDefaultEndDate() {
      const date = new Date();
      date.setDate(date.getDate() + 30); // 預設一個月有效期
      return date.toISOString().split('T')[0];
    },
    
    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateString).toLocaleDateString('zh-TW', options);
    },
    
    formatDateForInput(dateString) {
      return dateString.split('T')[0];
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
.coupon-management {
  padding-bottom: 2rem;
  /* 確保組件在主內容區域內，不覆蓋側邊欄和頂部區域 */
  position: relative;
  width: 100%;
  box-sizing: border-box;
  margin-top: 0;
  /* 強制不覆蓋頂部區域 */
  z-index: 1;
}

.empty-state {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6c757d;
}

.table th {
  white-space: nowrap;
}

.form-label {
  font-weight: 500;
}

/* 自定義模態框樣式 */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.custom-modal {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.custom-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #dc3545;
  color: white;
}

.custom-modal-header h5 {
  margin: 0;
  font-size: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.custom-modal-body {
  padding: 1rem;
}

.custom-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}
</style>
