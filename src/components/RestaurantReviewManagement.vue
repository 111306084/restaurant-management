<template>
  <div class="review-management">
    <div class="section-header">
      <h2>評論管理</h2>
      <div class="filter-controls">
        <select v-model="sortBy" class="sort-select">
          <option value="newest">最新評論</option>
          <option value="oldest">最舊評論</option>
          <option value="highest">最高評分</option>
          <option value="lowest">最低評分</option>
          <option value="unreplied">未回覆評論</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>載入評論中...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadComments" class="retry-btn">重試</button>
    </div>

    <div v-else-if="comments.length === 0" class="empty-state">
      <i class="fas fa-comment-slash empty-icon"></i>
      <p>目前沒有評論</p>
    </div>

    <div v-else class="comments-list">
      <div v-for="comment in filteredComments" :key="comment.comment_id" class="comment-card">
        <div class="comment-header">
          <div class="user-info">
            <i class="fas fa-user-circle user-icon"></i>
            <span class="user-name">{{ comment.is_anonymous ? '匿名用戶' : comment.student_name }}</span>
            <span class="comment-date">{{ formatDate(comment.comment_date) }}</span>
          </div>
          <div class="rating-info">
            <div class="rating-item">
              <span class="rating-label">食物</span>
              <div class="stars">
                <i v-for="n in 5" :key="`food-${n}`" 
                   :class="['fas', n <= comment.food_rating ? 'fa-star' : 'fa-star-o']"></i>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">服務</span>
              <div class="stars">
                <i v-for="n in 5" :key="`service-${n}`" 
                   :class="['fas', n <= comment.service_rating ? 'fa-star' : 'fa-star-o']"></i>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">環境</span>
              <div class="stars">
                <i v-for="n in 5" :key="`env-${n}`" 
                   :class="['fas', n <= comment.environment_rating ? 'fa-star' : 'fa-star-o']"></i>
              </div>
            </div>
            <div class="rating-item">
              <span class="rating-label">整體</span>
              <div class="stars">
                <i v-for="n in 5" :key="`overall-${n}`" 
                   :class="['fas', n <= comment.overall_rating ? 'fa-star' : 'fa-star-o']"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="comment-content">
          <p>{{ comment.content }}</p>
          <div v-if="comment.images && comment.images.length > 0" class="comment-images">
            <div 
              v-for="(image, imgIndex) in comment.images" 
              :key="`img-${comment.comment_id}-${imgIndex}`"
              class="comment-image"
              @click="showImagePreview(getImageUrl(image.image_url))"
            >
              <img 
                :src="getImageUrl(image.image_url)" 
                :alt="`評論圖片 ${imgIndex+1}`"
                @error="handleImageError($event, image)"
              >
              <div class="image-debug-info" v-if="showDebugInfo">
                {{ image.image_url }}
              </div>
            </div>
            <p class="debug-text">(圖片資訊: {{ JSON.stringify(comment.images) }})</p>
          </div>
        </div>

        <div class="comment-replies">
          <div v-for="reply in comment.replies" :key="reply.reply_id" class="reply-item">
            <div class="reply-header">
              <div class="user-info">
                <i :class="['fas', reply.user_type === 'restaurant' ? 'fa-store' : 'fa-user-circle']"></i>
                <span class="user-name">{{ reply.user_name }}</span>
                <span v-if="reply.user_type === 'restaurant'" class="restaurant-badge">餐廳</span>
                <span class="reply-date">{{ formatDate(reply.created_at) }}</span>
              </div>
            </div>
            <div class="reply-content">
              <p>{{ reply.content }}</p>
            </div>
          </div>
        </div>

        <div class="reply-form">
          <textarea 
            v-model="replyContents[comment.comment_id]" 
            placeholder="回覆此評論..." 
            rows="2"
            class="reply-input"
          ></textarea>
          <div class="reply-actions">
            <button 
              @click="submitReply(comment.comment_id)" 
              class="reply-btn"
              :disabled="!replyContents[comment.comment_id] || replyLoading[comment.comment_id]"
            >
              {{ replyLoading[comment.comment_id] ? '發送中...' : '發送回覆' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="comments.length > 0 && !loading" class="pagination">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- 圖片預覽彈窗 -->
    <div v-if="previewImage" class="image-preview-modal" @click="previewImage = null">
      <div class="image-preview-content" @click.stop>
        <img :src="getImageUrl(previewImage)" alt="預覽圖片" class="preview-image" />
        <button @click="previewImage = null" class="close-preview-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'RestaurantReviewManagement',
  data() {
    return {
      comments: [],
      loading: true,
      error: null,
      sortBy: 'newest',
      currentPage: 1,
      limit: 10,
      totalPages: 1,
      replyContents: {},
      replyLoading: {},
      previewImage: null,
      showDebugInfo: true,
      imageErrors: {},
      restaurantId: null
    };
  },
  computed: {
    filteredComments() {
      let result = [...this.comments];
      
      switch(this.sortBy) {
        case 'newest':
          result.sort((a, b) => new Date(b.comment_date) - new Date(a.comment_date));
          break;
        case 'oldest':
          result.sort((a, b) => new Date(a.comment_date) - new Date(b.comment_date));
          break;
        case 'highest':
          result.sort((a, b) => b.overall_rating - a.overall_rating);
          break;
        case 'lowest':
          result.sort((a, b) => a.overall_rating - b.overall_rating);
          break;
        case 'unreplied':
          result = result.filter(comment => {
            const restaurantReplies = comment.replies.filter(reply => reply.user_type === 'restaurant');
            return restaurantReplies.length === 0;
          });
          break;
      }
      
      return result;
    }
  },
  mounted() {
    this.restaurantId = this.getRestaurantId();
    this.loadComments();
  },
  methods: {
    getRestaurantId() {
      const restaurantData = localStorage.getItem('restaurant');
      if (restaurantData) {
        try {
          const restaurant = JSON.parse(restaurantData);
          return restaurant.restaurant_id;
        } catch (e) {
          console.error('無法解析餐廳資料:', e);
        }
      }
      return null;
    },
    
    async loadComments() {
      if (!this.restaurantId) {
        this.error = '無法獲取餐廳ID';
        this.loading = false;
        return;
      }
      this.loading = true;
      this.error = null;

      try {
        const responseData = await api.get(
          `/restaurants/${this.restaurantId}/comments`,
          {
            params: {
              page: this.currentPage,
              limit: this.limit
            }
          }
        );
        
        if (responseData && responseData.success) {
          this.comments = responseData.comments || [];
          this.totalPages = responseData.pagination?.totalPages || 1;
          
          // 初始化回覆內容和載入狀態
          this.comments.forEach(comment => {
            this.replyContents[comment.comment_id] = '';
            this.replyLoading[comment.comment_id] = false;
          });
        } else {
          console.error('API 返回成功但數據無效:', responseData);
          this.error = '獲取評論失敗，返回數據無效';
        }
      } catch (err) {
        console.error('獲取評論錯誤:', err);
        let errorMessage = '獲取評論時發生錯誤';
        if (err && typeof err === 'object') {
          if (err.response && err.response.status) {
            errorMessage += `: ${err.response.status}`;
          } else if (err.message) {
            errorMessage += `: ${err.message}`;
          }
        }
        
        this.error = errorMessage;
      } finally {
        this.loading = false;
      }
    },
    
    async submitReply(commentId) {
      if (!this.replyContents[commentId] || this.replyLoading[commentId]) {
        return;
      }

      this.replyLoading[commentId] = true;

      try {
        const responseData = await api.post(
          `/comments/${commentId}/replies`,
          {
            content: this.replyContents[commentId],
            user_type: 'restaurant',
            user_id: this.restaurantId
          }
        );

        if (responseData && responseData.success) {
          // 清空回覆輸入框
          const replyContent = this.replyContents[commentId];
          this.replyContents[commentId] = '';
          
          // 手動將回覆添加到評論中，避免重新載入所有評論
          const comment = this.comments.find(c => c.comment_id === commentId);
          if (comment) {
            if (!comment.replies) {
              comment.replies = [];
            }
            
            // 添加新回覆
            comment.replies.push({
              reply_id: responseData.reply?.reply_id || Date.now(), // 使用返回的回覆ID
              comment_id: commentId,
              user_id: this.restaurantId,
              user_type: 'restaurant',
              content: replyContent,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_name: localStorage.getItem('restaurant') ? 
                        JSON.parse(localStorage.getItem('restaurant')).restaurant_name : 
                        '商家回覆'
            });
          } else {
            console.warn('找不到評論，重新載入所有評論');
            await this.loadComments();
          }
        } else {
          console.error('回覆發送失敗:', responseData);
          alert('回覆發送失敗: ' + (responseData?.message || '未知錯誤'));
        }
      } catch (error) {
        console.error('發送回覆錯誤:', error);
        alert(`發送回覆時發生錯誤: ${error?.message || '未知錯誤'}`);
      } finally {
        this.replyLoading[commentId] = false;
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.loadComments();
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    getImageUrl(imageUrl) {
      console.log('處理評論圖片URL:', imageUrl);
      
      if (!imageUrl) {
        console.warn('圖片URL為空');
        return ''; // 返回空字符串，避免無效圖片請求
      }
      
      // 如果已經是完整的 URL，直接返回
      if (imageUrl.startsWith('http')) {
        console.log('已是完整URL，直接返回:', imageUrl);
        return imageUrl;
      }
      
      // 如果是以 /uploads 開頭，添加基礎 URL
      if (imageUrl.startsWith('/uploads')) {
        const fullUrl = `http://localhost:3000${imageUrl}`;
        console.log('完整圖片URL:', fullUrl);
        return fullUrl;
      }
      
      // 如果是以 uploads/ 開頭，添加基礎 URL 和斜線
      if (imageUrl.startsWith('uploads/')) {
        const fullUrl = `http://localhost:3000/${imageUrl}`;
        console.log('完整圖片URL:', fullUrl);
        return fullUrl;
      }
      
      // 其他情況，添加基礎 URL
      const fullUrl = `http://localhost:3000${imageUrl}`;
      console.log('完整圖片URL:', fullUrl);
      return fullUrl;
    },
    showImagePreview(imageUrl) {
      this.previewImage = imageUrl;
    },
    
    // 處理圖片載入錯誤
    handleImageError(event, image) {
      console.error(`圖片載入錯誤: ${image.image_url}`);
      
      // 記錄錯誤
      this.imageErrors[image.image_id] = {
        url: image.image_url,
        error: '圖片載入失敗'
      };
      
      // 嘗試使用替代URL格式
      const imgElement = event.target;
      const currentSrc = imgElement.src;
      
      console.log(`嘗試修復圖片: ${currentSrc}`);
      
      // 如果當前URL格式不正確，嘗試其他格式
      if (currentSrc.includes('/uploads/') && !currentSrc.includes('/uploads/comments/')) {
        // 嘗試使用 /uploads/comments/ 路徑
        const newSrc = currentSrc.replace('/uploads/', '/uploads/comments/');
        console.log(`嘗試替代URL (添加comments): ${newSrc}`);
        imgElement.src = newSrc;
      } else if (currentSrc.includes('/uploads/comments/')) {
        // 如果已經嘗試了 /uploads/comments/ 路徑，再嘗試 /uploads/ 路徑
        const newSrc = currentSrc.replace('/uploads/comments/', '/uploads/');
        console.log(`嘗試替代URL (移除comments): ${newSrc}`);
        imgElement.src = newSrc;
      }
      
      // 切換調試模式以顯示URL信息
      this.showDebugInfo = true;
      
      // 如果圖片仍然無法載入，使用替代圖片
      imgElement.onerror = () => {
        console.log('替代URL也失敗，使用預設圖片');
        imgElement.src = 'https://via.placeholder.com/80?text=圖片載入失敗';
        imgElement.onerror = null; // 防止無限循環
      };
    }
  }
};
</script>

<style scoped>
.review-management {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 30px;
  color: #e74c3c;
}

.retry-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #bdc3c7;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.comment-header {
  padding: 15px;
  border-bottom: 1px solid #f1f1f1;
  background-color: #f8f9fa;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-icon {
  font-size: 18px;
  color: #7f8c8d;
  margin-right: 8px;
}

.user-name {
  font-weight: 600;
  margin-right: 10px;
}

.comment-date {
  color: #95a5a6;
  font-size: 12px;
}

.rating-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.rating-item {
  display: flex;
  align-items: center;
}

.rating-label {
  margin-right: 5px;
  color: #7f8c8d;
  font-size: 13px;
}

.stars {
  display: flex;
  color: #f39c12;
}

.stars i {
  margin-right: 2px;
}

.comment-content {
  padding: 15px;
}

.comment-content p {
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.comment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.comment-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #ddd;
  position: relative;
}

.comment-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 調試模式樣式 */
.image-debug-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 8px;
  padding: 2px;
  word-break: break-all;
  max-height: 40px;
  overflow: hidden;
}

.comment-replies {
  padding: 0 15px;
}

.reply-item {
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 10px;
}

.reply-header {
  margin-bottom: 8px;
}

.restaurant-badge {
  background-color: #3498db;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-right: 8px;
}

.reply-date {
  color: #95a5a6;
  font-size: 12px;
}

.reply-content p {
  margin: 0;
  line-height: 1.4;
}

.reply-form {
  padding: 15px;
  border-top: 1px solid #f1f1f1;
}

.reply-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 10px;
  font-family: inherit;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
}

.reply-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reply-btn:hover {
  background-color: #2980b9;
}

.reply-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 15px;
}

.page-btn {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}

.page-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-info {
  color: #7f8c8d;
}

.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.image-preview-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 4px;
}

.close-preview-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .rating-info {
    flex-direction: column;
    gap: 5px;
  }
  
  .comment-images {
    justify-content: center;
  }
}
</style>
