<template>
  <div class="example-component">
    <h2>错误处理演示</h2>
    
    <!-- 错误信息显示区域 -->
    <div v-if="hasError" class="error-banner">
      <div class="error-content">
        <div class="error-header">
          <h3>发生错误</h3>
          <button @click="clearError" class="error-close-btn">×</button>
        </div>
        <div class="error-body">
          <p><strong>错误信息:</strong> {{ currentError.message }}</p>
          <p><strong>来源:</strong> {{ currentError.source }}</p>
          <p><strong>时间:</strong> {{ formatTime(currentError.timestamp) }}</p>
        </div>
      </div>
    </div>
    
    <!-- 功能区 -->
    <div class="action-buttons">
      <button 
        @click="triggerError" 
        class="action-button error-button">
        触发错误
      </button>
      
      <button 
        @click="triggerAsyncError" 
        class="action-button async-button">
        触发异步错误
      </button>
      
      <button 
        @click="triggerComponentError" 
        class="action-button component-button">
        触发组件错误
      </button>
    </div>
    
    <!-- 错误历史记录 -->
    <div class="error-history-section">
      <h3>错误历史记录</h3>
      <div v-if="errorHistory.length === 0" class="no-errors">
        暂无错误记录
      </div>
      <ul v-else class="error-list">
        <li v-for="error in errorHistory" :key="error.id" class="error-item">
          <div class="error-time">{{ formatTime(error.timestamp) }}</div>
          <div class="error-msg">{{ error.message }}</div>
          <div class="error-src">来源: {{ error.source }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import errorHandler from '../utils/ErrorHandler';

export default {
  name: 'ExampleComponent',
  
  setup() {
    const currentError = ref(null);
    const hasError = ref(false);
    const errorHistory = ref([]);
    
    // 错误处理回调函数
    const handleError = (errorInfo) => {
      currentError.value = errorInfo;
      hasError.value = true;
      updateErrorHistory();
    };
    
    // 初始化
    onMounted(() => {
      // 初始化错误处理器
      errorHandler.init(handleError, {
        enableLogging: true,
        enableReporting: false,
        maxHistoryLength: 5
      });
      
      // 更新错误历史
      updateErrorHistory();
    });
    
    // 组件销毁时清理
    onUnmounted(() => {
      // 注销错误回调
      errorHandler.unregisterCallback(handleError);
    });
    
    // 更新错误历史记录
    const updateErrorHistory = () => {
      errorHistory.value = errorHandler.getHistory();
    };
    
    // 触发一个普通错误
    const triggerError = () => {
      try {
        // 故意引发错误
        const obj = null;
        obj.nonExistentMethod();
      } catch (error) {
        errorHandler.handleError(error, '普通错误', { 
          component: 'ExampleComponent',
          method: 'triggerError'
        });
      }
    };
    
    // 触发一个异步错误
    const triggerAsyncError = () => {
      // 模拟异步操作
      setTimeout(() => {
        try {
          // 故意抛出错误
          throw new Error('异步操作中的错误');
        } catch (error) {
          errorHandler.handleError(error, '异步错误', {
            component: 'ExampleComponent',
            method: 'triggerAsyncError',
            async: true
          });
        }
      }, 1000);
    };
    
    // 触发一个组件错误
    const triggerComponentError = () => {
      try {
        // 模拟渲染错误
        throw new Error('组件渲染过程中发生错误');
      } catch (error) {
        errorHandler.handleError(error, '组件错误', {
          component: 'ExampleComponent',
          method: 'render',
          critical: true
        });
      }
    };
    
    // 清除当前错误
    const clearError = () => {
      hasError.value = false;
      currentError.value = null;
    };
    
    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleString();
    };
    
    return {
      currentError,
      hasError,
      errorHistory,
      triggerError,
      triggerAsyncError,
      triggerComponentError,
      clearError,
      formatTime
    };
  }
};
</script>

<style scoped>
.example-component {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.error-banner {
  margin-bottom: 20px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #fff;
  border: 1px solid #f56c6c;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.error-content {
  padding: 0;
}

.error-header {
  background-color: #f56c6c;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-header h3 {
  margin: 0;
  font-size: 16px;
}

.error-close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0 5px;
}

.error-body {
  padding: 15px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.action-button {
  flex: 1;
  min-width: 150px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.error-button {
  background-color: #f56c6c;
  color: white;
}

.error-button:hover {
  background-color: #e64545;
}

.async-button {
  background-color: #e6a23c;
  color: white;
}

.async-button:hover {
  background-color: #d6901c;
}

.component-button {
  background-color: #409eff;
  color: white;
}

.component-button:hover {
  background-color: #2080ff;
}

.error-history-section {
  margin-top: 30px;
}

.error-history-section h3 {
  color: #333;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}

.no-errors {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.error-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-item {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  background-color: white;
  margin-bottom: 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.error-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.error-msg {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.error-src {
  font-size: 13px;
  color: #666;
}
</style> 