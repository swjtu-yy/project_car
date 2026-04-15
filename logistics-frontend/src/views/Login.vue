<template>
  <div class="login-container">
    <div class="illustration-box">
      <div class="left-slogan">
        <h2>整车运输管理系统</h2>
        <p>高效 · 智能 · 全链路可视化</p>

        <div class="logo-group">
          <img src="@/assets/22.png" alt="校徽" class="logo-left" />
          <img src="@/assets/物流运输.png" alt="标志" class="logo-right" />
        </div>
      </div>
    </div>

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
            <el-option label="客户" :value="1" />
            <el-option label="发运商" :value="2" />
            <el-option label="承运商" :value="3" />
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

      <div class="login-footer">
        <span>忘记密码？</span>
        <a href="#">联系管理员重置</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginApi } from '@/api/login'

const router = useRouter()
const loginFormRef = ref(null)
const isLoading = ref(false)

// 表单数据
const loginForm = ref({
  username: '',
  password: '',
  role: ''
})

// 表单校验规则
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

// 登录方法
const handleLogin = async () => {
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return ElMessage.warning('请完善登录信息')

    isLoading.value = true
    try {
      const res = await loginApi({
        username: loginForm.value.username,
        password: loginForm.value.password,
        role: loginForm.value.role
      })

      const code = Number(res.code)

      if (code === 1) {
        ElMessage.success('登录成功')
        const roleMap = {
          1: 'customer',
          2: 'shipper',
          3: 'carrier'
        }
        const currentRole = roleMap[Number(loginForm.value.role)]

        localStorage.setItem('token', res.data?.token || `login-${Date.now()}`)
        localStorage.setItem('userId', res.data?.id || '')
        localStorage.setItem('userName', res.data?.name || '')
        localStorage.setItem('userRole', currentRole || '')

        const roleRoutes = {
          1: '/customer',
          2: '/shipper',
          3: '/carrier'
        }
        router.push(roleRoutes[loginForm.value.role] || '/login')
      } else if (code === 0) {
        ElMessage.error('账号或密码错误')
      }
    } catch (error) {
      ElMessage.error('登录请求失败，请检查网络连接')
      console.error('Login error:', error)
    } finally {
      isLoading.value = false
    }
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

/* 左侧图片区域 */
.illustration-box {
  flex: 1;
  background-image: url('@/assets/login.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* 半透明遮罩 */
.illustration-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.25);
  z-index: 1;
}

/* 包含文字和图片的整体容器 */
.left-slogan {
  position: relative;
  top: -230px; /* 整体高度微调，可根据视觉效果修改此负值 */
  z-index: 2;
  text-align: center;
}

/* 主标题 */
.left-slogan h2 {
  font-size: 52px;
  color: #ffffff;
  margin: 0 0 16px 0;
  font-weight: 700;
  letter-spacing: 6px;
  text-shadow: 2px 4px 10px rgba(0, 0, 0, 0.6);
}

/* 副标题 */
.left-slogan p {
  font-size: 26px;
  color: #f7fafc;
  margin: 0 0 40px 0; /* 给副标题增加底部边距（40px），拉开它和下方Logo的距离 */
  letter-spacing: 4px;
  text-shadow: 1px 2px 8px rgba(0, 0, 0, 0.6);
}

/* 两张图片的容器 */
.logo-group {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中对齐 */
  gap: 80px;               /* 两张图片之间的间距 */
}

/* === 单独控制左侧图片（校徽） === */
.logo-left {
  width: 100px;            /* 我将左侧稍微调小了点，如果想更小/更大，修改这里的数字 */
  height: auto;
  object-fit: contain;
  filter: drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.4));
}

/* === 单独控制右侧图片（物流标志） === */
.logo-right {
  width: 180px;            /* 保持相对较大，或根据实际图片比例修改 */
  height: auto;
  object-fit: contain;
  filter: drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.4));
}

/* 右侧登录框 */
.login-box {
  position: relative;
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

  .login-box {
    width: 100%;
    border-radius: 16px 16px 0 0;
    margin-top: -20px;
    padding: 40px 30px;
  }

  .left-slogan {
    top: 0;
  }
  .left-slogan h2 {
    font-size: 32px;
  }
  .left-slogan p {
    font-size: 18px;
    margin-bottom: 20px;
  }
  .logo-left, .logo-right {
    width: 80px;
  }
}
</style>