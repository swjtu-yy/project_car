<template>
  <div class="be-run-global-layout">
    <div class="app-container">
      <aside class="white-sidebar">
        <div class="logo-area">
          <div class="logo-icon">📦</div>
          <span class="logo-text">Be.run</span>
        </div>
        
        <nav class="nav-menu">
          <router-link to="/customer" class="nav-item" active-class="active" title="客户下单">🏠</router-link>
          <router-link to="/shipper/shipments" class="nav-item" active-class="active" title="发运管理">📋</router-link>
          <router-link to="/carrier/tasks" class="nav-item" active-class="active" title="运输任务">🚚</router-link>
          <div class="nav-item" title="日历">📅</div>
          <div class="nav-item badge" title="消息中心">🔔</div>
          <div class="nav-item" title="系统设置">⚙️</div>
        </nav>
        
        <div class="sidebar-bottom">
          <div class="nav-item logout-btn-icon" @click="handleLogout" title="退出登录">🚪</div>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-header">
          <div class="header-left">
            <h1 class="system-title">{{ systemName }}</h1>
            <span class="status-pill"><span class="dot">✔</span> 登录成功</span>
          </div>

          <div class="header-right">
            <div class="search-pill">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="全局搜索..." />
            </div>
            
            <button class="logout-pill" @click="handleLogout">退出登录</button>
          </div>
        </header>

        <div class="page-container">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 动态判断左上角的系统标题
const systemName = computed(() => {
  if (route.path.includes('/shipper')) return '发运商系统'
  if (route.path.includes('/carrier')) return '承运商系统'
  if (route.path.includes('/customer')) return '客户下单系统'
  return '物流协同平台'
})

// 你原本的退出登录逻辑
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  router.push('/login')
}
</script>

<style scoped>
/* ====== 覆盖全局背景 ====== */
:global(body) {
  margin: 0;
  padding: 0;
  background-color: #EAE6DF; /* 核心：暖灰米色底色 */
}

.be-run-global-layout {
  min-height: 100vh;
  background-color: #EAE6DF;
}

.app-container {
  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #111;
  padding: 24px;
  box-sizing: border-box;
  gap: 24px;
}

/* ====== 左侧胶囊侧边栏 ====== */
.white-sidebar {
  width: 80px;
  background: #FFFFFF;
  border-radius: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  position: sticky;
  top: 24px;
  height: calc(100vh - 48px);
}
.logo-area { text-align: center; margin-bottom: 50px; }
.logo-icon { font-size: 28px; margin-bottom: 4px; }
.logo-text { font-size: 12px; font-weight: 800; color: #111; }

.nav-menu { flex: 1; display: flex; flex-direction: column; gap: 24px; align-items: center; }

/* 侧边栏按钮样式 */
.nav-item {
  width: 44px; height: 44px;
  display: flex; justify-content: center; align-items: center;
  border-radius: 50%; font-size: 20px; color: #555;
  cursor: pointer; transition: all 0.2s; text-decoration: none;
}
.nav-item:hover { background: #F5F5F5; }

/* Vue-router 匹配到当前路径时的激活样式（亮黄） */
.nav-item.active {
  background: #FFD23F; color: #000; box-shadow: 0 4px 10px rgba(255, 210, 63, 0.3);
}

.sidebar-bottom { margin-top: auto; display: flex; flex-direction: column; gap: 24px;}
.logout-btn-icon { background: #FF8A65; color: white; }

/* ====== 主内容区 ====== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 顶部栏 */
.top-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; padding: 0 10px;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.system-title { font-size: 22px; font-weight: bold; margin: 0; color: #111; }

.status-pill {
  background: #E8F5E9; color: #4CAF50;
  padding: 6px 14px; border-radius: 20px;
  font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 6px;
}
.status-pill .dot { background: #4CAF50; color: white; border-radius: 50%; width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }

.header-right { display: flex; align-items: center; gap: 16px; }
.search-pill {
  background: #FFFFFF; border-radius: 30px;
  padding: 10px 20px; display: flex; align-items: center; gap: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}
.search-pill input { border: none; outline: none; background: transparent; width: 160px; font-size: 14px; color: #333; }

.logout-pill {
  background: #FFFFFF; border: none; padding: 10px 24px;
  border-radius: 30px; font-weight: bold; color: #F44336;
  cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  transition: transform 0.2s;
}
.logout-pill:hover { transform: translateY(-2px); }

/* 子页面容器 */
.page-container {
  flex: 1;
  border-radius: 30px;
}
</style>