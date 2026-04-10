import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// 1. 引入 Element Plus 的核心库和全局样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 2. 引入 Element Plus 的图标库
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 【重点新增 1】引入 Vue3Lottie 动画库
import Vue3Lottie from 'vue3-lottie'

// 创建 Vue 应用实例
const app = createApp(App)

// 3. 全局注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 4. 依次挂载路由、Element Plus 组件库
app.use(router)
app.use(ElementPlus)

// 【重点新增 2】把 Lottie 注册为全局组件，这样你的 Login.vue 才能渲染出动画
app.use(Vue3Lottie)

// 最后渲染到页面的 #app 节点上
app.mount('#app')