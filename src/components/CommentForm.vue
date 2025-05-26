<template>
  <div class="comment-form-container">
    <h3>撰寫評論</h3>
    
    <div class="rating-section">
      <div class="rating-item">
        <label>食物</label>
        <rating-component 
          :value="comment.food_rating" 
          @update:value="comment.food_rating = $event"
        />
      </div>
      
      <div class="rating-item">
        <label>服務</label>
        <rating-component 
          :value="comment.service_rating" 
          @update:value="comment.service_rating = $event"
        />
      </div>
      
      <div class="rating-item">
        <label>環境</label>
        <rating-component 
          :value="comment.environment_rating" 
          @update:value="comment.environment_rating = $event"
        />
      </div>
      
      <div class="rating-item overall">
        <label>整體評價 (系統自動計算)</label>
        <rating-component 
          :value="comment.overall_rating" 
          :disabled="true"
        />
      </div>
    </div>
    
    <div class="form-group">
      <label for="comment-content">評論內容</label>
      <textarea 
        id="comment-content"
        v-model="comment.content"
        rows="4"
        placeholder="分享您的用餐體驗..."
      ></textarea>
      <div class="char-count" :class="{ 'warning': comment.content.length > 450 }">
        {{ comment.content.length }}/500
      </div>
    </div>
    
    <div class="form-group">
      <label>上傳圖片 (最多 3 張)</label>
      <div class="image-upload-container">
        <div 
          v-for="(image, index) in previewImages" 
          :key="index" 
          class="image-preview"
        >
          <img :src="image.preview" alt="預覽圖片">
          <button type="button" class="remove-image" @click="removeImage(index)">×</button>
        </div>
        
        <label v-if="previewImages.length < 3" class="upload-button">
          <input 
            type="file" 
            accept="image/*" 
            @change="handleImageUpload" 
            multiple
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>添加圖片</span>
        </label>
      </div>
    </div>
    
    <div class="form-group checkbox">
      <input type="checkbox" id="anonymous" v-model="comment.is_anonymous">
      <label for="anonymous">匿名評論</label>
    </div>
    
    <div class="form-actions">
      <button 
        type="button" 
        class="cancel-btn" 
        @click="resetForm"
      >
        取消
      </button>
      <button 
        type="button" 
        class="submit-btn" 
        :disabled="!isFormValid || submitting"
        @click="submitComment"
      >
        {{ submitting ? '提交中...' : '提交評論' }}
      </button>
    </div>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import RatingComponent from './RatingComponent.vue';

export default {
  name: 'CommentForm',
  components: {
    RatingComponent
  },
  props: {
    restaurantId: {
      type: String,
      required: true
    },
    editingComment: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      comment: {
        food_rating: 0,
        service_rating: 0,
        environment_rating: 0,
        overall_rating: 0,
        content: '',
        is_anonymous: false
      },
      previewImages: [],
      uploadedImages: [],
      submitting: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  computed: {
    isFormValid() {
      return (
        this.comment.food_rating > 0 &&
        this.comment.service_rating > 0 &&
        this.comment.environment_rating > 0 &&
        this.comment.overall_rating > 0 &&
        this.comment.content.trim().length > 0 &&
        this.comment.content.length <= 500
      );
    },
    isEditing() {
      return !!this.editingComment;
    }
  },
  watch: {
    editingComment: {
      immediate: true,
      handler(newVal) {
        if (newVal) this.initEditForm();
      }
    },
    'comment.food_rating': {
      handler() {
        this.calculateOverallRating();
      }
    },
    'comment.service_rating': {
      handler() {
        this.calculateOverallRating();
      }
    },
    'comment.environment_rating': {
      handler() {
        this.calculateOverallRating();
      }
    }
  },
  methods: {
    calculateOverallRating() {
      // 加權計算整體評分：食物 50%、服務 30%、環境 20%
      const foodWeight = 0.5;
      const serviceWeight = 0.3;
      const environmentWeight = 0.2;
      
      // 檢查是否所有評分都已填寫
      if (this.comment.food_rating && this.comment.service_rating && this.comment.environment_rating) {
        const weightedAverage = (
          this.comment.food_rating * foodWeight +
          this.comment.service_rating * serviceWeight +
          this.comment.environment_rating * environmentWeight
        );
        
        // 四捨五入到最接近的整數
        this.comment.overall_rating = Math.round(weightedAverage);
      } else {
        // 如果有評分未填寫，整體評分設為0
        this.comment.overall_rating = 0;
      }
    },
    initEditForm() {
      if (!this.editingComment) return;
      
      this.comment = {
        food_rating: this.editingComment.food_rating,
        service_rating: this.editingComment.service_rating,
        environment_rating: this.editingComment.environment_rating,
        overall_rating: this.editingComment.overall_rating,
        content: this.editingComment.content,
        is_anonymous: this.editingComment.is_anonymous
      };
      
      // 如果有圖片，加載已有的圖片
      if (this.editingComment.images && this.editingComment.images.length > 0) {
        this.uploadedImages = this.editingComment.images.map(img => ({
          image_id: img.image_id,
          image_url: img.image_url
        }));
        
        this.previewImages = this.editingComment.images.map(img => ({
          preview: img.image_url,
          existing: true,
          image_id: img.image_id
        }));
      }
    },
    
    handleImageUpload(event) {
      const files = event.target.files;
      
      if (!files.length) return;
      
      // 檢查總數量限制
      if (this.previewImages.length + files.length > 3) {
        this.errorMessage = '最多只能上傳 3 張圖片';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
        return;
      }
      
      // 處理每個選擇的文件
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 檢查文件類型
        if (!file.type.match('image.*')) {
          this.errorMessage = '請上傳圖片文件';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
          continue;
        }
        
        // 檢查文件大小 (最大 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.errorMessage = '圖片大小不能超過 5MB';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
          continue;
        }
        
        // 創建預覽
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImages.push({
            file: file,
            preview: e.target.result,
            existing: false
          });
        };
        reader.readAsDataURL(file);
      }
      
      // 重置 input 以便可以再次選擇相同的文件
      event.target.value = '';
    },
    
    removeImage(index) {
      this.previewImages.splice(index, 1);
    },
    
    resetForm() {
      this.comment = {
        food_rating: 0,
        service_rating: 0,
        environment_rating: 0,
        overall_rating: 0,
        content: '',
        is_anonymous: false
      };
      this.previewImages = [];
      this.uploadedImages = [];
      this.errorMessage = '';
      this.successMessage = '';
      
      if (this.isEditing) {
        this.$emit('cancel-edit');
      }
    },
    
    async submitComment() {
      if (!this.isFormValid) {
        this.errorMessage = '請填寫所有必填欄位並評分';
        return;
      }
      
      this.submitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      console.log('\n==== 開始提交評論 ====')
      console.log('表單數據:', this.comment);
      console.log('餐廳ID:', this.restaurantId);
      
      try {
        // 獲取用戶資訊
        const token = localStorage.getItem('token');
        if (!token) {
          this.errorMessage = '您需要登入才能發表評論';
          this.submitting = false;
          return;
        }
        
        const studentData = JSON.parse(localStorage.getItem('student') || '{}');
        if (!studentData || !studentData.student_id) {
          this.errorMessage = '無法獲取學生資訊，請重新登入';
          this.submitting = false;
          return;
        }
        
        // 構建評論數據
        const commentData = {
          food_rating: parseInt(this.comment.food_rating),
          service_rating: parseInt(this.comment.service_rating),
          environment_rating: parseInt(this.comment.environment_rating),
          overall_rating: parseInt(this.comment.overall_rating),
          content: this.comment.content,
          is_anonymous: this.comment.is_anonymous || false,
          is_verified_purchase: false,
          restaurant_id: String(this.restaurantId), // 確保 restaurant_id 是字符串類型
          student_id: studentData.student_id
        };
        
        console.log('提交評論數據:', commentData);
        
        // 設置請求頭
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
          // 使用全局 API 配置的超時設置，不再硬編碼
        };
        
        console.log('請求頭:', config.headers);
        
        // 確保 restaurant_id 是字符串類型
        commentData.restaurant_id = String(this.restaurantId);
        
        try {
          // 提交評論
          console.log('提交評論數據:', JSON.stringify(commentData, null, 2));
          console.log('提交URL:', `http://localhost:3000/api/restaurants/${this.restaurantId}/comments`);
          
          // 導入 API 服務
          const apiService = require('@/services/api').default;
          
          // 使用 API 服務發送請求
          const response = await apiService.post(
            `/restaurants/${this.restaurantId}/comments`,
            commentData,
            config
          );
          
          console.log('評論提交響應:', response);
          
          // 上傳圖片
          if (this.previewImages.length > 0 && response && response.comment) {
            const commentId = response.comment.comment_id;
            
            for (const image of this.previewImages) {
              if (!image.file) continue;
              
              const formData = new FormData();
              formData.append('image', image.file);
              
              try {
                console.log(`正在上傳圖片到評論 ${commentId}`);
                
                // 使用帶認證的完整URL
                console.log(`正在上傳圖片到評論 ${commentId}，圖片大小: ${image.file.size} bytes`);
                
                // 使用與評論提交相同的 API 服務
                const apiService = require('@/services/api').default;
                
                // 注意：formData 是 FormData 物件，不是 JSON，需要特殊處理
                const imageResponse = await apiService.post(
                  `/comments/${commentId}/images`, 
                  formData, 
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'multipart/form-data'
                    }
                  }
                );
                
                console.log('圖片上傳回應:', JSON.stringify(imageResponse, null, 2));
                
                console.log('圖片上傳成功:', imageResponse);
                
                // 將新上傳的圖片添加到評論中
                if (response.comment.images) {
                  response.comment.images.push(imageResponse.image);
                } else {
                  response.comment.images = [imageResponse.image];
                }
                
                console.log('更新後的評論數據:', response.comment);
              } catch (imgError) {
                console.error('上傳圖片錯誤:', imgError);
                // 繼續執行其他圖片上傳，不中斷流程
              }
            }
          }
          
          this.successMessage = '評論已成功提交！';
          
          // 通知父組件評論已提交，並傳送新評論的數據
          if (response && response.comment) {
            console.log('發送評論提交事件，數據:', response.comment);
            this.$emit('comment-submitted', response.comment);
            
            // 立即通知父組件更新評論列表，不使用延時
            console.log('立即觸發 reload-comments 事件');
            this.$emit('reload-comments');
          } else {
            console.error('響應中缺少評論數據:', response);
            this.$emit('comment-submitted', {
              ...commentData,
              comment_date: new Date().toISOString(),
              student_name: JSON.parse(localStorage.getItem('student') || '{}').student_name || '未知用戶'
            });
            
            // 即使沒有評論數據，也立即觸發重新加載評論
            console.log('響應中缺少評論數據，但仍觸發 reload-comments 事件');
            this.$emit('reload-comments');
          }
        } catch (error) {
          console.error('提交評論錯誤:', error);
          
          let errorMsg = '提交評論失敗，請稍後再試';
          
          if (error.response) {
            console.error('錯誤響應狀態碼:', error.response.status);
            console.error('錯誤響應數據:', error.response.data);
            errorMsg = error.response.data.message || errorMsg;
            
            if (error.response.status === 401) {
              errorMsg = '您需要重新登入才能提交評論';
            } else if (error.response.status === 400) {
              errorMsg = '評論數據不完整或無效: ' + (error.response.data.message || '請檢查所有評分欄位');
            }
          } else if (error.request) {
            console.error('沒有收到響應:', error.request);
            errorMsg = '伺服器沒有回應，請檢查網絡連接';
          } else {
            console.error('請求設置錯誤:', error.message);
            errorMsg = error.message;
          }
          
          this.errorMessage = errorMsg;
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        } finally {
          // 立即設置 submitting 為 false
          this.submitting = false;
          console.log('評論提交過程完成\n');
        }
      } catch (error) {
        console.error('提交評論錯誤:', error);
        const errorMessage = error.response?.data?.message || error.message || '提交評論失敗，請稍後再試';
        this.errorMessage = errorMessage;
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    }
  }
}
</script>

<style scoped>
.comment-form-container {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.rating-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.rating-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rating-item label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.rating-item.overall {
  grid-column: span 2;
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px dashed #eee;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.char-count.warning {
  color: #ff5722;
}

.image-upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.image-preview {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
}

.upload-button {
  width: 100px;
  height: 100px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
}

.upload-button:hover {
  border-color: #ff5722;
  color: #ff5722;
}

.upload-button input {
  display: none;
}

.upload-button span {
  margin-top: 5px;
  font-size: 12px;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
}

.form-group.checkbox input {
  margin-right: 10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
}

.cancel-btn, .submit-btn {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
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

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  color: #d32f2f;
  border-radius: 4px;
}

.success-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
  color: #2e7d32;
  border-radius: 4px;
}
</style>
