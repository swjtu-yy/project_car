<!-- <template>
  <div class="be-run-global-layout">
    <div class="app-container">
      <aside class="white-sidebar">
        <div class="logo-area">
          <div class="logo-icon">📦</div>
          <span class="logo-text">物流平台</span>
        </div>

        <nav class="nav-menu">
          <router-link to="/customer" class="nav-item" active-class="active" title="客户下单">
            🛒
          </router-link>
          <router-link to="/shipper" class="nav-item" active-class="active" title="发运调度">
            📋
          </router-link>
          <router-link to="/carrier" class="nav-item" active-class="active" title="在途承运">
            🚚
          </router-link>
        </nav>

        <div class="sidebar-bottom">
          <div class="nav-item badge" title="消息中心">🔔</div>
          <div class="nav-item" title="系统设置">⚙️</div>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-header">
          <div class="header-left">
            <h1 class="system-title">{{ currentRouteName }}</h1>
            <span class="status-pill"><span class="dot">✔</span> 系统在线</span>
          </div>

          <div class="header-right">
            <el-dropdown @command="handleDropdownCommand">
              <span class="user-profile">
                <el-avatar :size="36" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                <span class="username">当前用户</span>
                <span class="arrow">▼</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided style="color: #FF6B6B;">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 动态获取当前页面的标题 (根据路由判断)
const currentRouteName = computed(() => {
  if (route.path.includes('/customer')) return '客户下单系统'
  if (route.path.includes('/shipper')) return '发运调度系统'
  if (route.path.includes('/carrier')) return '在途承运系统'
  return '物流协同平台'
})

// 处理下拉菜单点击事件
const handleDropdownCommand = (command) => {
  if (command === 'logout') {
    // 处理退出逻辑
    // 1. 如果有 token，可以在这里清除: localStorage.removeItem('token')

    // 2. 返回上一次页面
    router.go(-1)

    /* 提示：如果你希望退出登录后直接去固定的登录页，
      请把上面的 router.go(-1) 换成：
      router.push('/login')
    */
  } else if (command === 'profile') {
    alert('点击了个人中心')
  }
}
</script>

<style scoped>
/* 全局背景和重置 */
:global(body) {
  margin: 0;
  padding: 0;
  background-color: #EAE6DF; /* Be.run 风格底色 */
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

/* 路由链接样式 */
.nav-item {
  width: 44px; height: 44px;
  display: flex; justify-content: center; align-items: center;
  border-radius: 50%; font-size: 20px; color: #555;
  cursor: pointer; transition: all 0.2s; text-decoration: none;
}
.nav-item:hover { background: #F5F5F5; }

/* vue-router 激活时的样式 */
.nav-item.active {
  background: #FFD23F;
  color: #000;
  box-shadow: 0 4px 10px rgba(255, 210, 63, 0.3);
}

.sidebar-bottom { margin-top: auto; display: flex; flex-direction: column; gap: 24px;}

/* ====== 主内容区 ====== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 全局顶部栏 */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 10px;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.system-title { font-size: 24px; font-weight: 900; margin: 0; color: #111; letter-spacing: 0.5px; }
.status-pill {
  background: #E8F5E9; color: #4CAF50;
  padding: 6px 14px; border-radius: 20px;
  font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 6px;
}
.status-pill .dot {
  background: #4CAF50; color: white; border-radius: 50%;
  width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px;
}

.header-right { display: flex; align-items: center; }

/* 用户信息下拉菜单样式 */
.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FFFFFF;
  padding: 6px 16px 6px 6px;
  border- -->