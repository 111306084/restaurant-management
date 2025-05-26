# API 文檔

## 認證相關 API

### 登入
```http
POST /api/auth/login
```

**請求參數**
```json
{
  "email": "string",
  "password": "string"
}
```

**回應**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "role": "string"
  }
}
```

## 訂單相關 API

### 獲取訂單列表
```http
GET /api/orders/restaurant
```

**查詢參數**
- `limit`: 每頁數量
- `page`: 頁碼

**回應**
```json
{
  "orders": [
    {
      "id": "string",
      "status": "string",
      "total": "number",
      "items": []
    }
  ],
  "total": "number"
}
```

### 更新訂單狀態
```http
PUT /api/orders/:id/status
```

**請求參數**
```json
{
  "status": "string"
}
```

## 評價相關 API

### 獲取餐廳評分
```http
GET /api/restaurants/:id/ratings
```

**回應**
```json
{
  "restaurant_id": "string",
  "avg_food_rating": "number",
  "avg_service_rating": "number",
  "avg_environment_rating": "number",
  "avg_overall_rating": "number",
  "total_ratings": "number"
}
```

## 錯誤處理

所有 API 在發生錯誤時會返回以下格式：

```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

常見錯誤碼：
- 400: 請求參數錯誤
- 401: 未授權
- 403: 權限不足
- 404: 資源不存在
- 500: 伺服器錯誤 