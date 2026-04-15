<template>
  <div class="be-run-global-layout">
    <div class="app-container">

      <aside class="white-sidebar">
        <div class="logo-area">
          <div class="logo-icon">📦</div>
          <span class="logo-text">Be.run</span>
        </div>

        <nav class="nav-menu">
          <router-link to="/customer/orders" class="nav-item" active-class="active" title="订单管理">
            🛒
          </router-link>
          <div class="nav-item" title="历史订单">📋</div>
          <div class="nav-item" title="地址管理">📍</div>
          <div class="nav-item badge" title="消息中心">🔔</div>
          <div class="nav-item" title="账号设置">⚙️</div>
        </nav>

        <div class="sidebar-bottom">
          <div class="nav-item logout-btn-icon" @click="handleLogout" title="退出登录">🚪</div>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-header">
          <div class="header-left">
            <h1 class="system-title">客户下单系统</h1>
            <span class="status-pill"><span class="dot">✔</span> 登录成功</span>
          </div>

          <div class="header-center">
            <h2 class="header-order-title">新建车辆运输订单</h2>
            <p class="header-order-subtitle">选择车型、目的地及运输方案，快速生成发运单</p>
          </div>

          <div class="header-right">
            <div class="search-pill">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="全局搜索订单..." />
            </div>
            <button class="logout-pill" @click="handleLogout">退出登录</button>
          </div>
        </header>

        <div class="page-container">
          <router-view></router-view>
        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

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
  background-color: #EAE6DF;
}

/* 覆盖全局容器的固定宽度，让客户端页面更宽、更均匀 */
:global(#app) {
  width: 100%;
  max-width: none;
  margin: 0;
  border: none;
  text-align: initial;
}

.be-run-global-layout {
  min-height: 100vh;
  background-color: #EAE6DF;
}

.app-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #111;
  padding: 24px clamp(20px, 3.2vw, 40px);
  box-sizing: border-box;
  gap: clamp(16px, 2.2vw, 32px);
}

/* ====== 左侧胶囊侧边栏 ====== */
.white-sidebar {
  width: 80px;
  background: #FFFFFF;
  border-radius: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  position: sticky;
  top: 24px;
  height: calc(100vh - 90px);
}
.logo-area { text-align: center; margin-bottom: 38px; }
.logo-icon { font-size: 28px; margin-bottom: 4px; }
.logo-text { font-size: 12px; font-weight: 800; color: #111; }

.nav-menu { flex: 1; display: flex; flex-direction: column; gap: 20px; align-items: center; }

.nav-item {
  width: 44px; height: 44px;
  display: flex; justify-content: center; align-items: center;
  border-radius: 50%; font-size: 20px; color: #555;
  cursor: pointer; transition: all 0.2s; text-decoration: none;
}
.nav-item:hover { background: #F5F5F5; }
.nav-item.active { background: #FFD23F; color: #000; box-shadow: 0 4px 10px rgba(255, 210, 63, 0.3); }

.sidebar-bottom { margin-top: auto; display: flex; flex-direction: column; gap: 16px;}
.logout-btn-icon { background: #FF8A65; color: white; }

/* ====== 主内容区 ====== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
}

.top-header {
  position: relative;
  display: flex; justify-content: space-between; align-items: center;
  min-height: 98px;
  margin-bottom: 0px;
  padding: 8px 10px 6px;
}
.header-left { display: flex; align-items: center; gap: 16px; align-self: flex-start; margin-top: -4px; }
.system-title { font-size: 22px; font-weight: bold; margin: 0; color: #111; }

.header-center {
  position: absolute;
  /* 让标题对齐到左侧主操作框的中心，而不是整行中心 */
  left: calc((100% - 360px - 24px) / 2);
  top: 2px;
  transform: translateX(-50%);
  text-align: center;
  line-height: 1.2;
}

.header-order-title {
  margin: 0;
  font-size: 46px;
  font-weight: 900;
  color: #111;
}

.header-order-subtitle {
  margin: 10px 0 0;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

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

.page-container {
  flex: 1;
  border-radius: 30px;
  width: 100%;
}

@media (max-width: 1024px) {
  .app-container {
    padding: 16px;
    gap: 16px;
  }

  .top-header {
    flex-wrap: wrap;
    gap: 12px;
    padding: 0;
    margin-bottom: 12px;
    min-height: auto;
  }

  .header-center {
    position: static;
    transform: none;
    width: 100%;
    order: 3;
    margin-top: 4px;
  }

  .header-order-title {
    font-size: 28px;
  }

  .header-order-subtitle {
    white-space: normal;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .search-pill {
    flex: 1;
  }

  .search-pill input {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
    min-height: auto;
  }

  .white-sidebar {
    width: 100%;
    height: auto;
    border-radius: 24px;
    position: static;
    padding: 16px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .logo-area {
    margin-bottom: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-icon {
    margin-bottom: 0;
  }

  .nav-menu {
    flex: 1;
    flex-direction: row;
    justify-content: center;
    gap: 12px;
  }

  .sidebar-bottom {
    margin-top: 0;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .system-title {
    font-size: 20px;
  }

  .header-order-title {
    font-size: 24px;
  }

  .header-order-subtitle {
    font-size: 13px;
  }
}
</style>