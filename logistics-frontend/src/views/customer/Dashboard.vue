NEW_FILE_CODE
<template>
  <div class="dashboard">
    <nav class="sidebar">
      <h2>客户系统</h2>
      <router-link to="/customer/orders">订单管理</router-link>
      <button @click="handleLogout" class="logout-btn">退出登录</button>
    </nav>
    <main class="content">
      <router-view />
    </main>
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
.dashboard {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  padding: 20px;
}

.sidebar h2 {
  margin-bottom: 30px;
}

.sidebar a {
  display: block;
  color: white;
  text-decoration: none;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.sidebar a.router-link-active {
  background: #34495e;
}

.logout-btn {
  margin-top: 30px;
  width: 100%;
  padding: 10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.content {
  flex: 1;
  padding: 30px;
  background: #f5f5f5;
}
</style>
