import api from './api';

// 餐廳相關 API 服務
export const restaurantAPI = {
  // 獲取餐廳資料
  getProfile(restaurantId) {
    return api.get(`/restaurants/${restaurantId}`);
  },
  
  // 更新餐廳資料
  updateProfile(restaurantId, profileData) {
    return api.put(`/restaurants/${restaurantId}`, profileData);
  },
  
  // 上傳餐廳圖片
  uploadImage(formData) {
    return api.post('/restaurants/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // 獲取餐廳菜單
  getMenu(restaurantId) {
    return api.get(`/restaurants/${restaurantId}/menu`);
  },
  
  // 添加菜單項目
  addMenuItem(restaurantId, menuItem) {
    return api.post(`/restaurants/${restaurantId}/menu`, menuItem);
  },
  
  // 更新菜單項目
  updateMenuItem(restaurantId, menuItemId, menuItem) {
    return api.put(`/restaurants/${restaurantId}/menu/${menuItemId}`, menuItem);
  },
  
  // 刪除菜單項目
  deleteMenuItem(restaurantId, menuItemId) {
    return api.delete(`/restaurants/${restaurantId}/menu/${menuItemId}`);
  },
  
  // 切換菜單項目可用狀態
  toggleMenuItemAvailability(restaurantId, menuItemId) {
    return api.patch(`/restaurants/${restaurantId}/menu/${menuItemId}/toggle-availability`);
  }
};

export default restaurantAPI;
