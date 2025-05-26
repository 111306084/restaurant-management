import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/global.css'
import api from './services/api'

const app = createApp(App)

// 註冊全局 API 服務
app.config.globalProperties.$http = api

app.use(router).mount('#app')
