<template>
  <div class="login-container">
    <!-- 左侧插画区域 -->
    <div class="illustration-box" :class="{ 'is-typing-password': isPasswordFocused }">
      <Vue3Lottie
        ref="lottieRef"
        :animationData="waitingAnimation"
        :autoPlay="true"
        :loop="true"
        style="width: 480px; height: 480px;"
      />
      <!-- 新增品牌标语，强化B端系统调性 -->
      <div class="brand-slogan">
        <h2>物流协同管理系统</h2>
        <p>高效 · 智能 · 全链路可视化</p>
      </div>
    </div>

    <!-- 右侧登录表单区域 -->
    <div class="login-box">
      <div class="login-header">
        <h1>欢迎登录</h1>
        <p>请输入您的账号信息以访问系统</p>
      </div>

      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            clearable
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            clearable
            prefix-icon="Lock"
            @focus="isPasswordFocused = true"
            @blur="isPasswordFocused = false"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select
            v-model="loginForm.role"
            placeholder="请选择您的身份"
            size="large"
            style="width: 100%;"
            clearable
            prefix-icon="Avatar"
          >
            <el-option label="客户（4S店）" value="customer" />
            <el-option label="发运商 (物流公司)" value="shipper" />
            <el-option label="承运商（司机）" value="carrier" />
          </el-select>
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="login-btn"
          @click="handleLogin"
          :loading="isLoading"
        >
          {{ isLoading ? '登录中...' : '登 录' }}
        </el-button>
      </el-form>

      <!-- 新增底部辅助信息 -->
      <div class="login-footer">
        <span>忘记密码？</span>
        <a href="#">联系管理员重置</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 导入Lottie动画
import waitingAnimation from '../assets/waiting.json'

const router = useRouter()
const loginFormRef = ref(null)
const isLoading = ref(false)

// 表单数据
const loginForm = ref({
  username: '',
  password: '',
  role: ''
})

// 新增表单校验规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 密码焦点状态
const isPasswordFocused = ref(false)

// Lottie组件引用
const lottieRef = ref(null)

// 监听密码焦点，控制动画
watch(isPasswordFocused, (isFocused) => {
  if (!lottieRef.value) return
  isFocused ? lottieRef.value.pause() : lottieRef.value.play()
})

// 登录方法
const handleLogin = async () => {
  // 表单校验
  await loginFormRef.value.validate((valid) => {
    if (!valid) return ElMessage.warning('请完善登录信息')

    isLoading.value = true
    // 模拟登录请求
    setTimeout(() => {
      localStorage.setItem('token', 'mock-token-' + Date.now())
      localStorage.setItem('userRole', loginForm.value.role)

      const roleRoutes = {
        customer: '/customer',
        shipper: '/shipper',
        carrier: '/carrier'
      }
      router.push(roleRoutes[loginForm.value.role] || '/login')
      isLoading.value = false
      ElMessage.success('登录成功')
    }, 800)
  })
}
</script>

<style scoped>
/* 全局容器 */
.login-container {
  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 左侧插画区域 */
.illustration-box {
  flex: 1;
  /* 优化渐变：更符合物流系统的科技感蓝调 */
  background: linear-gradient(135deg, #66a6ff 0%, #3f51b5 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;
}

/* 密码输入时的深色遮罩效果 */
.illustration-box.is-typing-password {
  background: linear-gradient(135deg, #2c3e50 0%, #1a237e 100%);
}

/* 品牌标语 */
.brand-slogan {
  position: absolute;
  bottom: 80px;
  text-align: center;
  color: #fff;
}
.brand-slogan h2 {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.brand-slogan p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  letter-spacing: 2px;
}

/* 右侧登录框 */
.login-box {
  width: 520px;
  background: #fff;
  padding: 80px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: -12px 0 30px rgba(0,0,0,0.08);
  border-radius: 0 16px 16px 0;
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 48px;
}
.login-header h1 {
  font-size: 28px;
  color: #1a202c;
  margin: 0 0 8px 0;
  font-weight: 600;
}
.login-header p {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

/* 表单样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #2d3748;
  font-size: 15px;
  line-height: 1.5;
  padding-bottom: 8px;
}
:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 12px 16px;
}
:deep(.el-input__wrapper:hover),
:deep(.el-select__wrapper:hover) {
  box-shadow: 0 2px 6px rgba(63, 81, 181, 0.2);
}
:deep(.el-input__wrapper.is-focus),
:deep(.el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  margin-top: 24px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #3f51b5 100%);
  border: none;
  transition: all 0.3s ease;
}
.login-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
}

/* 登录底部 */
.login-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 14px;
  color: #718096;
}
.login-footer a {
  color: #3f51b5;
  text-decoration: none;
  margin-left: 8px;
}
.login-footer a:hover {
  text-decoration: underline;
}

/* 响应式适配 */
@media screen and (max-width: 1024px) {
  .login-container {
    flex-direction: column;
  }
  .illustration-box {
    flex: 0 0 300px;
    padding: 40px 0;
  }
  .illustration-box .brand-slogan {
    display: none;
  }
  .login-box {
    width: 100%;
    border-radius: 16px 16px 0 0;
    margin-top: -20px;
    padding: 40px 30px;
  }
}
</style>