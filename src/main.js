import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import * as echarts from 'echarts';
import '@/assets/style/main.css'
import { inject } from '@vercel/analytics';

const app = createApp(App)

// 先创建Pinia实例
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.config.globalProperties.$echarts = echarts;
inject();

console.log('应用初始化中...')

// 直接挂载应用
app.mount('#app')
