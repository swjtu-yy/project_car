<template>
  <div class="login-container">
    <div class="illustration-box" :class="{ 'is-typing-password': isPasswordFocused }">

      <Vue3Lottie
        ref="lottieRef"
        :animationData="waitingAnimation"
        :autoPlay="true"
        :loop="true"
        style="width: 400px; height: 400px;"
      />

    </div>

    <div class="login-box">
      <h1>物流协同管理系统</h1>

      <el-form :model="loginForm" label-position="top" @submit.prevent="handleLogin">
        <el-form-item label="用户名">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
          />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            @focus="isPasswordFocused = true"
            @blur="isPasswordFocused = false"
          />
        </el-form-item>

        <el-form-item label="角色">
          <el-select v-model="loginForm.role" placeholder="请选择您的身份" size="large" style="width: 100%;">
            <el-option label="客户（4S店）" value="customer" />
            <el-option label="发运商 (物流公司)" value="shipper" />
            <el-option label="承运商（司机）" value="carrier" />
          </el-select>
        </el-form-item>

        <el-button type="primary" size="large" class="login-btn" @click="handleLogin">
          登 录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

// 1. 导入你刚才下载的 JSON 动画文件
// 注意：如果你的文件直接放在了 src 目录下，请用 '../waiting.json'
// 如果你建了一个 assets 文件夹放在里面，请用 '../assets/waiting.json'
import waitingAnimation from '../assets/waiting.json'

const router = useRouter()

// 表单数据
const loginForm = ref({
  username: '',
  password: '',
  role: ''
})

// 核心动画状态控制：是否正在输入密码
const isPasswordFocused = ref(false)

// 2. 获取 Lottie 组件的控制权，名字必须和 template 里的 ref="lottieRef" 一致
const lottieRef = ref(null)

// 3. 监听密码框的焦点状态，控制动画暂停和播放
watch(isPasswordFocused, (isFocused) => {
  if (!lottieRef.value) return // 确保组件已经加载完毕

  if (isFocused) {
    // 鼠标点进密码框：动画暂停 (假装不看)
    lottieRef.value.pause()
  } else {
    // 鼠标离开密码框：动画恢复播放
    lottieRef.value.play()
  }
})

const handleLogin = () => {
  if (!loginForm.value.role) {
    alert("请先选择角色！")
    return
  }

  // 模拟登录成功
  localStorage.setItem('token', 'mock-token-' + Date.now())
  localStorage.setItem('userRole', loginForm.value.role)

  const roleRoutes = {
    customer: '/customer',
    shipper: '/shipper',
    carrier: '/carrier'
  }
  router.push(roleRoutes[loginForm.value.role] || '/login')
}
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background-color: #f3f4f6;
}

/* 左侧插画区域样式 */
.illustration-box {
  flex: 1;
  background: linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.5s ease;
}

/* 当输入密码时，左侧背景颜色变深，模拟关灯效果 */
.illustration-box.is-typing-password {
  background: linear-gradient(135deg, #2b3240 0%, #1a1a24 100%);
}

/* 右侧登录框区域样式 */
.login-box {
  width: 450px;
  background: white;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: -10px 0 20px rgba(0,0,0,0.05);
}

h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 40px;
  text-align: center;
}

.login-btn {
  width: 100%;
  margin-top: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.login-btn:hover {
  opacity: 0.9;
}
</style>