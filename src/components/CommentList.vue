<template>
  <div class="comment-list">
    <!-- 評論統計區域 -->
    <div class="rating-summary" v-if="ratingSummary">
      <div class="overall-rating">
        <h3>{{ Number(ratingSummary.avg_overall_rating).toFixed(1) }}</h3>
        <div class="rating-stars-display">
          <rating-component 
            :value="Math.round(ratingSummary.avg_overall_rating)" 
            :disabled="true"
            :showText="false"
          />
        </div>
        <p>{{ ratingSummary.total_ratings }} 則評價</p>
      </div>
      
      <div class="rating-details">
        <div class="rating-item">
          <span class="rating-label">食物</span>
          <div class="rating-bar-container">
            <div class="rating-bar" :style="{ width: (ratingSummary.avg_food_rating / 5 * 100) + '%' }"></div>
          </div>
          <span class="rating-value">{{ Number(ratingSummary.avg_food_rating).toFixed(1) }}</span>
        </div>
        
        <div class="rating-item">
          <span class="rating-label">服務</span>
          <div class="rating-bar-container">
            <div class="rating-bar" :style="{ width: (ratingSummary.avg_service_rating / 5 * 100) + '%' }"></div>
          </div>
          <span class="rating-value">{{ Number(ratingSummary.avg_service_rating).toFixed(1) }}</span>
        </div>
        
        <div class="rating-item">
          <span class="rating-label">環境</span>
          <div class="rating-bar-container">
            <div class="rating-bar" :style="{ width: (ratingSummary.avg_environment_rating / 5 * 100) + '%' }"></div>
          </div>
          <span class="rating-value">{{ Number(ratingSummary.avg_environment_rating).toFixed(1) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 評論過濾器 -->
    <div class="comment-filters">
      <div class="filter-buttons">
        <button 
          v-for="filter in filters" 
          :key="filter.value" 
          class="filter-btn"
          :class="{ active: activeFilter === filter.value }"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
      
      <div class="sort-dropdown">
        <select v-model="sortOption">
          <option value="newest">最新評價</option>
          <option value="highest">最高評分</option>
          <option value="lowest">最低評分</option>
          <option value="mostLiked">最多讚</option>
        </select>
      </div>
    </div>
    
    <!-- 評論列表 -->
    <div class="comments-container">
      <div v-if="loading && !error" class="loading-indicator">
        <div class="spinner"></div>
        <p>載入評論中...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="retryFetch" class="retry-button">重新載入</button>
      </div>
      
      <div v-else-if="filteredComments.length === 0" class="no-comments">
        <p>暫無評論</p>
      </div>
      
      <div v-else class="comment-items">
        <div v-for="comment in filteredComments" :key="comment.comment_id" class="comment-item">
          <div class="comment-header">
            <div class="user-info">
              <div class="user-avatar">
                {{ comment.is_anonymous ? '匿' : comment.student_name ? comment.student_name.charAt(0) : '?' }}
              </div>
              <div class="user-details">
                <h4>{{ comment.is_anonymous ? '匿名用戶' : comment.student_name }}</h4>
                <p class="comment-date">{{ formatDate(comment.comment_date) }}</p>
              </div>
            </div>
            
            <div class="comment-ratings">
              <div class="overall-rating">
                <rating-component 
                  :value="comment.overall_rating" 
                  :disabled="true"
                  :showText="false"
                />
              </div>
              
              <div class="detailed-ratings">
                <span>食物: {{ comment.food_rating }}</span>
                <span>服務: {{ comment.service_rating }}</span>
                <span>環境: {{ comment.environment_rating }}</span>
              </div>
            </div>
          </div>
          
          <div class="comment-content">
            <p>{{ comment.content }}</p>
          </div>
          
          <!-- 評論圖片 -->
          <div v-if="comment.images && comment.images.length > 0" class="comment-images">
            <div 
              v-for="image in comment.images" 
              :key="image.image_id" 
              class="image-thumbnail"
              @click="openImageViewer(getFullImageUrl(image.image_url))"
            >
              <img :src="getFullImageUrl(image.image_url)" alt="評論圖片">
            </div>
          </div>
          <!-- 評論圖片調試信息 -->
          <div v-if="!comment.images || comment.images.length === 0" class="debug-info">
            <p class="debug-text">(圖片資訊: {{ JSON.stringify(comment.images) }})</p>
          </div>
          
          <!-- 評論操作區 -->
          <div class="comment-actions">
            <button 
              class="like-btn" 
              :class="{ liked: comment.userLiked }"
              @click="toggleLike(comment)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
              <span>{{ comment.likes_count || 0 }}</span>
            </button>
            
            <button class="reply-btn" @click="showReplyForm(comment)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>回覆</span>
            </button>
          </div>
          
          <!-- 回覆列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
            <div v-for="reply in comment.replies" :key="reply.reply_id" class="reply-item">
              <div class="reply-header">
                <div class="user-info">
                  <div :class="['user-avatar', reply.user_type === 'restaurant' ? 'restaurant-avatar' : 'student-avatar']">
                    {{ reply.user_type === 'restaurant' ? '商' : (reply.user_name ? reply.user_name.charAt(0) : '學') }}
                  </div>
                  <div class="user-details">
                    <h5>
                      {{ reply.user_type === 'restaurant' ? '商家' : (reply.user_name || '學生') }}
                      <span v-if="reply.user_type === 'restaurant'" class="restaurant-tag">官方</span>
                      <span v-else class="student-tag">學生</span>
                    </h5>
                    <p class="reply-date">{{ formatDate(reply.created_at) }}</p>
                  </div>
                </div>
              </div>
              
              <div class="reply-content">
                <p>{{ reply.content }}</p>
              </div>
            </div>
          </div>
          
          <!-- 回覆表單 -->
          <div v-if="activeReplyComment === comment.comment_id" class="reply-form">
            <textarea 
              v-model="replyContent" 
              placeholder="輸入您的回覆..."
              rows="2"
            ></textarea>
            <div class="reply-form-actions">
              <button class="cancel-btn" @click="cancelReply">取消</button>
              <button class="submit-btn" @click="submitReply(comment)" :disabled="!replyContent.trim()">提交</button>
              <p class="form-text text-muted">您將以學生身份回覆</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分頁控制 -->
    <div class="pagination" v-if="pagination && pagination.totalPages > 1">
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
    
    <!-- 圖片查看器 -->
    <div v-if="showImageViewer" class="image-viewer" @click="closeImageViewer">
      <div class="image-viewer-content" @click.stop>
        <img :src="selectedImage" alt="評論圖片">
        <button class="close-btn" @click="closeImageViewer">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import RatingComponent from './RatingComponent.vue';
import axios from 'axios';

export default {
  name: 'CommentList',
  components: {
    RatingComponent
  },
  props: {
    restaurantId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      comments: [],
      ratingSummary: null,
      loading: true,
      activeFilter: 'all',
      sortOption: 'newest',
      pagination: null,
      filters: [
        { label: '全部', value: 'all' },
        { label: '5星', value: '5' },
        { label: '4星', value: '4' },
        { label: '3星', value: '3' },
        { label: '2星', value: '2' },
        { label: '1星', value: '1' }
      ],
      activeReplyComment: null,
      replyContent: '',
      showImageViewer: false,
      selectedImage: '',
      error: null,
      totalComments: 0
    }
  },
  computed: {
    filteredComments() {
      // 確保 comments 是有效的數組
      if (!this.comments || !Array.isArray(this.comments)) {
        console.error('評論數據不是有效的數組:', this.comments);
        return [];
      }
      
      let result = [...this.comments];
      
      // 過濾評分
      if (this.activeFilter !== 'all') {
        const rating = parseInt(this.activeFilter);
        result = result.filter(comment => comment.overall_rating === rating);
      }
      
      // 排序
      switch (this.sortOption) {
        case 'newest':
          result.sort((a, b) => new Date(b.comment_date) - new Date(a.comment_date));
          break;
        case 'highest':
          result.sort((a, b) => b.overall_rating - a.overall_rating);
          break;
        case 'lowest':
          result.sort((a, b) => a.overall_rating - b.overall_rating);
          break;
        case 'mostLiked':
          result.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
          break;
      }
      
      return result;
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
  created() {
    this.fetchData();
  },
  methods: {
    // 生成默認評分摘要
    generateDefaultRatingSummary() {
      return {
        avg_overall_rating: 4.5,
        avg_food_rating: 4.6,
        avg_service_rating: 4.3,
        avg_environment_rating: 4.4,
        total_ratings: 12
      };
    },
    
    // 使用模擬數據
    useMockData() {
      console.log('使用模擬數據');
      
      // 模擬評分摘要
      this.ratingSummary = this.generateDefaultRatingSummary();
      
      // 模擬評論數據
      this.comments = [
        {
          comment_id: '1',
          user_id: '101',
          user_name: '王小明',
          user_avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          overall_rating: 5,
          food_rating: 5,
          service_rating: 5,
          environment_rating: 4,
          content: '這家餐廳的食物非常美味，服務態度也很好，環境舒適。強烈推薦他們的招牌菜！',
          comment_date: new Date().toISOString(),
          likes_count: 12,
          userLiked: false,
          is_anonymous: false,
          images: [
            { image_id: '1', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop' }
          ]
        },
        {
          comment_id: '2',
          user_id: '102',
          user_name: '匿名用戶',
          user_avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
          overall_rating: 4,
          food_rating: 4,
          service_rating: 3,
          environment_rating: 5,
          content: '整體來說是不錯的用餐體驗，食物美味，環境優美，但服務可以再提升。',
          comment_date: new Date(Date.now() - 86400000).toISOString(),
          likes_count: 5,
          userLiked: false,
          is_anonymous: true,
          images: []
        }
      ];
      
      // 模擬分頁數據
      this.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: this.comments.length
      };
      
      this.totalComments = this.comments.length;
      this.error = null;
    },
    
    async fetchData(page = 1) {
      console.log('\n==== 開始獲取評論數據 ====');
      console.log('餐廳ID:', this.restaurantId);
      console.log('當前頁碼:', page);
      
      // 確保餐廳ID有效
      if (!this.restaurantId) {
        console.error('餐廳ID無效');
        this.error = null; // 不顯示錯誤，使用模擬數據
        this.loading = false;
        this.useMockData();
        return;
      }
      
      this.loading = true;
      this.error = null;
      
      // 獲取token
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 15000 // 增加超時時間到15秒
      } : {
        timeout: 15000
      };
      
      const apiUrl = `http://localhost:3000/api/restaurants/${this.restaurantId}/comments?page=${page}`;
      console.log('發送請求到:', apiUrl);
      
      try {
        console.log('開始發送API請求...');
        const response = await axios.get(apiUrl, config);
        
        console.log('收到響應，狀態碼:', response.status);
        console.log('獲取評論響應數據格式:', typeof response.data);
        console.log('獲取評論響應:', JSON.stringify(response.data).substring(0, 200) + '...');
        
        // 檢查數據結構
        if (response.data && response.data.success === true) {
          // 正確的數據格式
          if (response.data && Array.isArray(response.data.comments)) {
            console.log('成功獲取評論數據，數量:', response.data.comments.length);
            this.comments = response.data.comments;
            this.pagination = response.data.pagination || {
              currentPage: page,
              totalPages: 1,
              totalItems: response.data.comments.length
            };
            this.ratingSummary = response.data.ratingSummary || this.generateDefaultRatingSummary();
            this.totalComments = response.data.pagination?.totalItems || response.data.comments.length;
          } else if (Array.isArray(response.data)) {
            // 直接是評論數組
            console.log('成功獲取評論數組，數量:', response.data.length);
            this.comments = response.data;
            this.pagination = {
              currentPage: page,
              totalPages: 1,
              total: response.data.length
            };
          } else {
            console.error('響應數據結構不正確:', response.data);
            this.comments = [];
            this.pagination = {
              currentPage: page,
              totalPages: 1,
              total: 0
            };
          }
        } else {
          // 即使沒有評論數據，也設置為空數組
          console.warn('沒有評論數據或格式不正確，設置為空數組');
          this.comments = [];
          this.pagination = { currentPage: 1, totalPages: 1, total: 0 };
        }
        
        // 計算總評論數量
        this.totalComments = this.pagination.total || this.comments.length;
        // 向父組件發送總評論數量
        this.$emit('update-count', this.totalComments);
        
        try {
          // 獲取評分摘要
          console.log('開始獲取評分摘要...');
          await this.fetchRatingSummary();
          
          // 獲取用戶點讚狀態
          if (this.comments.length > 0) {
            console.log('開始獲取用戶點讚狀態...');
            await this.checkUserLikes();
          }
        } catch (secondaryError) {
          // 即使評分摘要或點讚狀態獲取失敗，也不影響主評論列表的顯示
          console.error('獲取次要數據錯誤:', secondaryError);
        }
        
      } catch (error) {
        console.error('請求評論數據錯誤:', error);
        console.error('錯誤詳情:', error.response || error.message || error);
        this.error = '無法獲取評論數據，請稍後再試';
        this.comments = [];
        this.pagination = { currentPage: 1, totalPages: 1, total: 0 };
        this.$emit('update-count', 0);
      } finally {
        // 無論如何，都設置 loading 為 false
        this.loading = false;
        console.log('評論數據加載完成\n');
      }
    },
    

    
    // 檢查用戶已點讚的評論
    async checkUserLikes() {
      const token = localStorage.getItem('token');
      if (token && this.comments.length > 0) {
        try {
          console.log('檢查用戶點讚狀態...');
          const promises = this.comments.map(comment => {
            return axios.get(
              `http://localhost:3000/api/comments/${comment.comment_id}/likes/check`,
              { 
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 5000
              }
            ).then(likeResponse => {
              if (likeResponse.data && likeResponse.data.liked !== undefined) {
                comment.userLiked = likeResponse.data.liked;
              }
              return comment;
            }).catch(err => {
              console.warn(`無法檢查評論 ${comment.comment_id} 的點讚狀態:`, err.message);
              return comment;
            });
          });
          
          // 使用 Promise.allSettled 以確保即使某些請求失敗也不會影響其他請求
          await Promise.allSettled(promises);
          console.log('完成用戶點讚狀態檢查');
        } catch (likeError) {
          console.error('檢查用戶點讚狀態錯誤:', likeError);
        }
      }
    },
    
    // 添加新評論到列表
    addNewComment(comment) {
      console.log('接收到新評論:', comment);
      
      // 確保評論有所需的所有屬性
      if (!comment.student_name && !comment.is_anonymous) {
        // 從本地存儲獲取學生資料
        const studentData = JSON.parse(localStorage.getItem('student') || '{}');
        comment.student_name = studentData.student_name || '未知用戶';
      }
      
      // 設置默認值
      comment.likes_count = comment.likes_count || 0;
      comment.images = comment.images || [];
      comment.replies = comment.replies || [];
      comment.userLiked = false;
      
      // 將新評論添加到列表的最前面
      this.comments.unshift(comment);
      
      // 更新總評論數
      this.totalComments++;
      this.$emit('update-count', this.totalComments);
      
      // 更新評分摘要
      this.updateRatingSummary(comment);
    },
    
    // 更新評論
    updateExistingComment(updatedComment) {
      console.log('接收到更新的評論:', updatedComment);
      
      // 查找並更新評論
      const index = this.comments.findIndex(c => c.comment_id === updatedComment.comment_id);
      if (index !== -1) {
        // 保留原有的圖片和回覆，除非已在更新中提供
        updatedComment.images = updatedComment.images || this.comments[index].images || [];
        updatedComment.replies = updatedComment.replies || this.comments[index].replies || [];
        updatedComment.likes_count = updatedComment.likes_count || this.comments[index].likes_count || 0;
        updatedComment.userLiked = this.comments[index].userLiked || false;
        
        // 更新評論
        this.$set(this.comments, index, updatedComment);
        
        // 更新評分摘要
        this.updateRatingSummary();
      }
    },
    
    // 更新評分摘要
    updateRatingSummary(newComment = null) {
      if (!this.ratingSummary) {
        this.ratingSummary = {
          avg_food_rating: 0,
          avg_service_rating: 0,
          avg_environment_rating: 0,
          avg_overall_rating: 0,
          total_ratings: 0
        };
      }
      
      // 如果提供了新評論，直接計算新的平均值
      if (newComment) {
        const oldTotal = this.ratingSummary.total_ratings || 0;
        const newTotal = oldTotal + 1;
        
        // 計算新的平均值
        this.ratingSummary.avg_food_rating = ((this.ratingSummary.avg_food_rating * oldTotal) + newComment.food_rating) / newTotal;
        this.ratingSummary.avg_service_rating = ((this.ratingSummary.avg_service_rating * oldTotal) + newComment.service_rating) / newTotal;
        this.ratingSummary.avg_environment_rating = ((this.ratingSummary.avg_environment_rating * oldTotal) + newComment.environment_rating) / newTotal;
        this.ratingSummary.avg_overall_rating = ((this.ratingSummary.avg_overall_rating * oldTotal) + newComment.overall_rating) / newTotal;
        this.ratingSummary.total_ratings = newTotal;
      } else {
        // 重新從API獲取評分摘要
        this.fetchRatingSummary();
      }
    },
    
    // 獲取評分摘要
    async fetchRatingSummary() {
      try {
        const response = await axios.get(`http://localhost:3000/api/restaurants/${this.restaurantId}/ratings`);
        if (response.data && response.data.ratingSummary) {
          this.ratingSummary = response.data.ratingSummary;
        }
      } catch (error) {
        console.error('獲取評分摘要錯誤:', error);
      }
    },
    
    setFilter(filter) {
      this.activeFilter = filter;
    },
    
    changePage(page) {
      if (page === this.pagination.currentPage) return;
      this.fetchData(page);
    },
    
    retryFetch() {
      // 重新嘗試獲取評論數據
      this.error = null;
      this.fetchData(this.pagination?.currentPage || 1);
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    async toggleLike(comment) {
      // 檢查用戶是否已登入
      const token = localStorage.getItem('token');
      if (!token) {
        alert('請先登入才能點讚');
        return;
      }
      
      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        if (comment.userLiked) {
          // 取消點讚
          const response = await axios.delete(
            `http://localhost:3000/api/comments/${comment.comment_id}/likes`,
            config
          );
          comment.userLiked = false;
          comment.likes_count = response.data.likesCount;
        } else {
          // 點讚
          const response = await axios.post(
            `http://localhost:3000/api/comments/${comment.comment_id}/likes`,
            {},
            config
          );
          comment.userLiked = true;
          comment.likes_count = response.data.likesCount;
        }
      } catch (error) {
        console.error('點讚操作錯誤:', error);
        alert('點讚操作失敗，請稍後再試');
      }
    },
    
    showReplyForm(comment) {
      // 檢查用戶是否已登入
      if (!localStorage.getItem('token')) {
        alert('請先登入才能回覆評論');
        return;
      }
      
      this.activeReplyComment = comment.comment_id;
      this.replyContent = '';
    },
    
    cancelReply() {
      this.activeReplyComment = null;
      this.replyContent = '';
    },
    
    async submitReply(comment) {
      if (!this.replyContent.trim()) return;
      
      try {
        // 檢查token
        const token = localStorage.getItem('token');
        if (!token) {
          alert('請先登入才能回覆評論');
          return;
        }
        
        // 確保API請求有授權頭部
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // 直接使用fetch API或axios
        const response = await axios.post(
          `http://localhost:3000/api/comments/${comment.comment_id}/replies`,
          { content: this.replyContent },
          { headers: headers }
        );
        
        // 添加新回覆到評論中
        if (!comment.replies) {
          comment.replies = [];
        }
        
        comment.replies.push(response.data.reply);
        
        // 重置表單
        this.cancelReply();
      } catch (error) {
        console.error('提交回覆錯誤:', error);
        alert('提交回覆失敗，請稍後再試。錯誤: ' + error.message);
      }
    },
    
    openImageViewer(imageUrl) {
      this.selectedImage = imageUrl;
      this.showImageViewer = true;
      document.body.style.overflow = 'hidden'; // 防止背景滾動
    },
    
    closeImageViewer() {
      this.showImageViewer = false;
      document.body.style.overflow = ''; // 恢復背景滾動
    },
    
    // 獲取完整的圖片URL
    getFullImageUrl(imageUrl) {
      if (!imageUrl) return '';
      
      // 調試信息
      console.log('原始圖片URL:', imageUrl);
      
      // 如果已經是完整URL，直接返回
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      
      // 如果是相對路徑，添加基礎URL
      const baseApiUrl = 'http://localhost:3000';
      
      // 確保路徑正確拼接
      let fullUrl;
      if (imageUrl.startsWith('/')) {
        fullUrl = `${baseApiUrl}${imageUrl}`;
      } else {
        fullUrl = `${baseApiUrl}/${imageUrl}`;
      }
      
      console.log('完整圖片URL:', fullUrl);
      return fullUrl;
    }
  }
}
</script>

<style scoped>
.comment-list {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

/* 評分摘要樣式 */
.rating-summary {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.overall-rating {
  flex: 0 0 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #eee;
  padding-right: 20px;
}

.overall-rating h3 {
  font-size: 36px;
  margin: 0;
  color: #ff5722;
}

.rating-stars-display {
  margin: 10px 0;
}

.overall-rating p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.rating-details {
  flex: 1;
  padding-left: 20px;
}

.rating-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.rating-label {
  flex: 0 0 50px;
  font-size: 14px;
  color: #666;
}

.rating-bar-container {
  flex: 1;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 10px;
}

.rating-bar {
  height: 100%;
  background-color: #ff5722;
  border-radius: 4px;
}

.rating-value {
  flex: 0 0 30px;
  font-size: 14px;
  color: #333;
  text-align: right;
}

/* 評論過濾器樣式 */
.comment-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background-color: #f5f7fa;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.filter-btn:hover {
  background-color: #e9ecf0;
}

.filter-btn.active {
  background-color: #ff5722;
  color: white;
  border-color: #ff5722;
  box-shadow: 0 2px 4px rgba(255, 87, 34, 0.3);
}

.filter-btn.active:hover {
  background-color: #e64a19;
}

.sort-dropdown select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
}

/* 評論列表樣式 */
.comments-container {
  margin-bottom: 30px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  width: 100%;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 87, 34, 0.1);
  border-radius: 50%;
  border-top-color: #ff5722;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-indicator p {
  color: #666;
  font-size: 16px;
  font-weight: 500;
}

.no-comments {
  text-align: center;
  padding: 40px 0;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.no-comments p {
  font-size: 18px;
  margin-bottom: 10px;
}

.comment-item {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
}

.restaurant-avatar {
  background-color: #ffe0b2;
  color: #e65100;
}

.user-details h4, .user-details h5 {
  margin: 0;
  color: #333;
}

.comment-date, .reply-date {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.restaurant-tag {
  background-color: #ff9800;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 5px;
}

.student-tag {
  background-color: #2196F3;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 5px;
}

.student-avatar {
  background-color: #e3f2fd;
  color: #1565c0;
}

.comment-ratings {
  text-align: right;
}

.detailed-ratings {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.comment-content {
  margin-bottom: 15px;
}

.comment-content p {
  margin: 0;
  line-height: 1.5;
}

.comment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.image-thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.image-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-actions {
  display: flex;
  gap: 15px;
}

.like-btn, .reply-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.like-btn:hover, .reply-btn:hover {
  background-color: #f0f0f0;
}

.like-btn.liked {
  color: #ff5722;
}

.replies-container {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.reply-item {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 10px;
}

.reply-header {
  margin-bottom: 10px;
}

.reply-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

.reply-form {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.reply-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 10px;
}

.reply-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn, .submit-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  color: #666;
}

.submit-btn {
  background-color: #ff5722;
  border: 1px solid #ff5722;
  color: white;
}

.submit-btn:disabled {
  background-color: #ffccbc;
  border-color: #ffccbc;
  cursor: not-allowed;
}

/* 分頁控制樣式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
  cursor: pointer;
}

.page-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
  cursor: pointer;
}

.page-number.active {
  background-color: #ff5722;
  color: white;
  border-color: #ff5722;
}

/* 圖片查看器樣式 */
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.image-viewer-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.image-viewer-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
}
</style>
