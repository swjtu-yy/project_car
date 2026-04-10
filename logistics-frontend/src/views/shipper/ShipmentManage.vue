<template>
  <div class="be-run-app-fullscreen-wrapper">
    <div class="app-container">
      <aside class="white-sidebar">
        <div class="logo-area">
          <div class="logo-icon">📦</div>
          <span class="logo-text">Be.run</span>
        </div>

        <nav class="nav-menu">
          <div class="nav-item">🏠</div>
          <div class="nav-item active">📋</div>
          <div class="nav-item">📁</div>
          <div class="nav-item">📅</div>
          <div class="nav-item badge">🔔</div>
          <div class="nav-item">⚙️</div>
        </nav>

        <div class="sidebar-bottom">
          <div class="nav-item logout-btn-icon">🚪</div>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-header">
          <div class="header-left">
            <h1 class="system-title">发运商系统</h1>
            <span class="status-pill"><span class="dot">✔</span> 登录成功</span>
          </div>
          <div class="header-right">
            <div class="search-pill">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="搜索订单" />
            </div>
            <button class="logout-pill">退出登录</button>
          </div>
        </header>

        <div class="page-title-area">
          <h2>发运管理</h2>
        </div>

        <div class="content-layout">
          <section class="main-column">
            <div class="white-card">
              <div class="card-header">
                <h3>📋 待接收订单</h3>
              </div>

              <div class="order-list" v-if="pendingOrders.length > 0">
                <div class="order-row" v-for="order in pendingOrders" :key="order.id">
                  <div class="row-top">
                    <span class="order-id">订单号: {{ order.id }}</span>
                    <button class="btn-yellow" @click="acceptOrder(order)">接收订单</button>
                  </div>
                  <div class="row-details">
                    <div class="detail-col">
                      <p>车型: <strong>{{ order.carModel }}</strong></p>
                      <p>数量: <strong>{{ order.quantity }} 辆</strong></p>
                      <p>运输方式: {{ order.transportType }}</p>
                      <p>下单时间: {{ order.createTime }}</p>
                    </div>
                    <div class="detail-col">
                      <p>目的地: {{ order.destination }}</p>
                      <p>客户: {{ order.customer }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="empty-state" v-else>
                <p>暂无待接收订单</p>
              </div>
            </div>

            <div class="white-card mt-24">
               <div class="card-header">
                <h3>📦 已发布订单</h3>
              </div>
              <div class="order-list" v-if="publishedOrders.length > 0">
                <div class="order-row" v-for="order in publishedOrders" :key="order.id">
                  <div class="row-top">
                    <span class="order-id">订单号: {{ order.id }}</span>
                    <span class="published-badge">已发布</span>
                  </div>
                  <div class="row-details">
                    <div class="detail-col">
                      <p>车型: <strong>{{ order.carModel }}</strong></p>
                      <p>数量: <strong>{{ order.quantity }} 辆</strong></p>
                      <p>绑定数量: {{ order.boundVehicles?.length || 0 }} 辆</p>
                    </div>
                    <div class="detail-col">
                      <p>目的地: {{ order.destination }}</p>
                      <p>发布时间: {{ order.publishTime }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="empty-state" v-else>
                <p>暂无已发布订单</p>
              </div>
            </div>
          </section>

          <aside class="side-column" v-if="selectedOrder">
            <div class="white-card sticky-panel">
              <div class="binding-header">
                <h3>车辆信息绑定</h3>
                <div class="progress-pill">已绑定 {{ boundVehicles.length }}/{{ selectedOrder.quantity }}</div>
              </div>

              <div class="task-overview">
                <p>当前订单: <strong>{{ selectedOrder.id }}</strong></p>
                <p>车型: {{ selectedOrder.carModel }} | 数量: {{ selectedOrder.quantity }} 辆</p>
              </div>

              <div class="form-area">
                <label>输入车身码 (VIN):</label>
                <input
                  v-model="vinCode"
                  type="text"
                  placeholder="请输入17位车身码"
                  maxlength="17"
                  class="vin-input"
                  @blur="verifyVin"
                />
                <div class="status-msg">
                  <span v-if="vinVerified" class="msg-success">✔ 验证成功</span>
                  <span v-if="vinError" class="msg-error">✖ {{ vinError }}</span>
                </div>

                <div class="vehicle-preview" v-if="vehicleInfo">
                  <p><strong>{{ vehicleInfo.brand }} {{ vehicleInfo.model }}</strong></p>
                  <p class="sub-text">{{ vehicleInfo.color }} | {{ vehicleInfo.engineNo }}</p>
                </div>

                <button
                  class="btn-yellow full-width mt-10"
                  @click="bindVehicle"
                  :disabled="!vinVerified || boundVehicles.length >= selectedOrder.quantity"
                >
                  确认绑定该车
                </button>
              </div>

              <div class="tags-area" v-if="boundVehicles.length > 0">
                <p class="area-label">已选车辆清单</p>
                <div class="vin-tag" v-for="(vehicle, index) in boundVehicles" :key="index">
                  <span>{{ vehicle.vin.slice(-8) }} - {{ vehicle.model }}</span>
                  <button class="remove-icon" @click="removeVehicle(index)">×</button>
                </div>
              </div>

              <button
                class="btn-publish full-width mt-20"
                @click="publishOrder"
                :disabled="boundVehicles.length < selectedOrder.quantity"
              >
                完成绑定并发布
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const pendingOrders = ref([
  { id: 'ORD20260410001', carModel: '轿车 A级', quantity: 3, destination: '北京', transportType: '铁路运输', customer: '成都4S店', createTime: '2026-04-10 10:30:00' },
  { id: 'ORD20260410002', carModel: 'SUV B级', quantity: 2, destination: '上海', transportType: '公路运输', customer: '广州4S店', createTime: '2026-04-10 11:15:00' },
  { id: 'ORD20260410003', carModel: '新能源车', quantity: 5, destination: '深圳', transportType: '公路运输', customer: '武汉4S店', createTime: '2026-04-10 12:00:00' }
])

const publishedOrders = ref([])
const selectedOrder = ref(null)
const vinCode = ref('')
const vinVerified = ref(false)
const vinError = ref('')
const vehicleInfo = ref(null)
const boundVehicles = ref([])

const vehicleDatabase = {
  'LSVAA2180E2123456': { vin: 'LSVAA2180E2123456', brand: '大众', model: '帕萨特', color: '黑色', engineNo: 'ENG123456' },
  'WVWZZZ3CZWE123456': { vin: 'WVWZZZ3CZWE123456', brand: '大众', model: '途观', color: '白色', engineNo: 'ENG123457' },
  'LFV3A23C8E3123456': { vin: 'LFV3A23C8E3123456', brand: '奥迪', model: 'A4L', color: '银色', engineNo: 'ENG123458' },
  'WDD2050431F123456': { vin: 'WDD2050431F123456', brand: '奔驰', model: 'C级', color: '黑色', engineNo: 'ENG123459' },
  'BMW1234567890ABCDE': { vin: 'BMW1234567890ABCDE', brand: '宝马', model: '3系', color: '蓝色', engineNo: 'ENG123460' }
}

const acceptOrder = (order) => {
  selectedOrder.value = order
  vinCode.value = ''; vinVerified.value = false; vinError.value = ''; vehicleInfo.value = null; boundVehicles.value = []
  const index = pendingOrders.value.findIndex(o => o.id === order.id)
  if (index > -1) pendingOrders.value.splice(index, 1)
}

const verifyVin = () => {
  vinError.value = ''; vinVerified.value = false; vehicleInfo.value = null
  if (!vinCode.value) return
  if (vinCode.value.length !== 17) { vinError.value = '须为17位'; return }
  if (boundVehicles.value.some(v => v.vin === vinCode.value)) { vinError.value = '该车已绑定'; return }
  const vehicle = vehicleDatabase[vinCode.value]
  if (vehicle) { vehicleInfo.value = vehicle; vinVerified.value = true }
  else { vinError.value = '未找到车辆信息' }
}

const bindVehicle = () => {
  if (!vinVerified.value || !vehicleInfo.value) return
  if (boundVehicles.value.length >= selectedOrder.value.quantity) return
  boundVehicles.value.push({ ...vehicleInfo.value })
  vinCode.value = ''; vinVerified.value = false; vehicleInfo.value = null; vinError.value = ''
}

const removeVehicle = (index) => { boundVehicles.value.splice(index, 1) }

const publishOrder = () => {
  if (boundVehicles.value.length < selectedOrder.value.quantity) return
  const publishedOrder = {
    ...selectedOrder.value,
    boundVehicles: [...boundVehicles.value],
    publishTime: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}),
    status: 'published'
  }
  publishedOrders.value.unshift(publishedOrder)
  selectedOrder.value = null; vinCode.value = ''; vinVerified.value = false; vehicleInfo.value = null; boundVehicles.value = []
}
</script>

<style scoped>
/* ====== 核心覆盖逻辑 ====== */
/* 强制全屏覆盖，防止被原有的绿色外壳组件包裹 */
.be-run-app-fullscreen-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: #EAE6DF; /* 图二背景色：暖灰米色 */
  overflow-y: auto;
}

/* 全局字体和布局 */
.app-container {
  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #2D2D2D;
  padding: 24px;
  box-sizing: border-box;
  gap: 24px;
}

/* ====== 左侧胶囊形侧边栏 ====== */
.white-sidebar {
  width: 80px;
  background: #FFFFFF;
  border-radius: 40px; /* 图二的大圆角胶囊状 */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  position: sticky;
  top: 24px;
  height: calc(100vh - 48px); /* 视口高度减去上下padding */
}

.logo-area { text-align: center; margin-bottom: 50px; }
.logo-icon { font-size: 28px; margin-bottom: 4px; }
.logo-text { font-size: 12px; font-weight: 800; }

.nav-menu { flex: 1; display: flex; flex-direction: column; gap: 24px; align-items: center; }
.nav-item {
  width: 44px; height: 44px;
  display: flex; justify-content: center; align-items: center;
  border-radius: 50%;
  font-size: 20px; color: #555; cursor: pointer;
  transition: all 0.2s;
}
.nav-item:hover { background: #F5F5F5; }
.nav-item.active { background: #FFD23F; color: #000; box-shadow: 0 4px 10px rgba(255, 210, 63, 0.3); }

.sidebar-bottom { margin-top: auto; }
.logout-btn-icon { background: #FF8A65; color: white; }

/* ====== 右侧主内容区 ====== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 顶部栏 */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 10px;
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
}

.page-title-area h2 { font-size: 36px; font-weight: 900; margin: 10px 0 30px 10px; color: #111; letter-spacing: 1px; }

/* 内容布局 */
.content-layout { display: flex; gap: 24px; align-items: flex-start; }
.main-column { flex: 1; min-width: 0; }
.side-column { width: 380px; }
.mt-24 { margin-top: 24px; }

/* ====== 图二中的白色主卡片 ====== */
.white-card {
  background: #FFFFFF;
  border-radius: 30px; /* 大圆角 */
  padding: 32px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.02);
}

.card-header { margin-bottom: 24px; }
.card-header h3 { font-size: 20px; font-weight: bold; margin: 0; color: #111; }

/* 订单行 (浅灰底色) */
.order-list { display: flex; flex-direction: column; gap: 16px; }
.order-row {
  background: #F9F8F5; /* 图二中订单的淡灰/米白色背景 */
  border-radius: 20px;
  padding: 24px;
  transition: transform 0.2s;
}
.order-row:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.04); }

.row-top {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #EAE6DF; /* 柔和的分割线 */
  padding-bottom: 16px; margin-bottom: 16px;
}
.order-id { font-weight: bold; font-size: 16px; color: #111; }

/* 黄色主按钮 */
.btn-yellow {
  background: #FFD23F; color: #222;
  border: none; padding: 10px 24px; border-radius: 24px; /* 胶囊按钮 */
  font-weight: bold; cursor: pointer; font-size: 14px;
  transition: all 0.2s;
}
.btn-yellow:hover:not(:disabled) { background: #F6C523; transform: scale(1.02); }
.btn-yellow:disabled { opacity: 0.5; cursor: not-allowed; }

.row-details { display: flex; gap: 40px; font-size: 14px; color: #666; }
.detail-col p { margin: 8px 0; }
.detail-col strong { color: #111; }

/* ====== 右侧操作面板 (根据图二风格适配) ====== */
.sticky-panel { position: sticky; top: 24px; }
.binding-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.binding-header h3 { margin: 0; font-size: 18px; font-weight: bold; }
.progress-pill { background: #F9F8F5; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; color: #666; }

.task-overview {
  background: #F9F8F5; padding: 16px; border-radius: 16px;
  margin-bottom: 24px; font-size: 14px; color: #555;
}
.task-overview strong { color: #111; font-size: 16px; }
.task-overview p { margin: 4px 0; }

.form-area label { display: block; margin-bottom: 8px; font-size: 14px; color: #555; font-weight: bold; }
.vin-input {
  width: 100%; box-sizing: border-box;
  background: #F9F8F5; border: 2px solid #EAE6DF;
  color: #111; padding: 14px; border-radius: 16px;
  font-size: 15px; transition: border 0.2s; outline: none;
}
.vin-input:focus { border-color: #FFD23F; background: #FFF; }
.status-msg { margin-top: 8px; font-size: 13px; height: 18px; font-weight: bold; }
.msg-success { color: #4CAF50; }
.msg-error { color: #F44336; }

.vehicle-preview { background: #E8F5E9; padding: 14px 16px; border-radius: 12px; margin: 12px 0; border: 1px solid #C8E6C9; }
.vehicle-preview p { margin: 0 0 4px 0; font-size: 14px; color: #2E7D32; }
.vehicle-preview .sub-text { font-size: 12px; color: #4CAF50; }

.tags-area { margin-top: 24px; }
.area-label { font-size: 13px; color: #888; margin-bottom: 12px; font-weight: bold; }
.vin-tag {
  display: flex; justify-content: space-between; align-items: center;
  background: #F9F8F5; padding: 12px 16px; border-radius: 16px;
  margin-bottom: 10px; font-size: 14px; font-weight: 500;
}
.remove-icon { background: none; border: none; color: #999; cursor: pointer; font-size: 18px; line-height: 1; }
.remove-icon:hover { color: #F44336; }

.btn-publish {
  background: #111; color: #FFF;
  border: none; padding: 16px; border-radius: 30px;
  font-weight: bold; cursor: pointer; font-size: 16px;
  transition: transform 0.2s;
}
.btn-publish:hover:not(:disabled) { transform: scale(1.02); }
.btn-publish:disabled { opacity: 0.5; cursor: not-allowed; }
.published-badge { background: #E8F5E9; color: #4CAF50; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; }

/* 实用类 */
.full-width { width: 100%; box-sizing: border-box; }
.mt-10 { margin-top: 10px; }
.mt-20 { margin-top: 20px; }
.empty-state { text-align: center; color: #999; padding: 40px 0; }
</style>