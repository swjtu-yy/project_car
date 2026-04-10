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
          <div class="nav-item">📋</div>
          <div class="nav-item active">🚚</div> <div class="nav-item">📅</div>
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
              <input type="text" placeholder="搜索任务或车身码" />
            </div>
            <button class="logout-pill">退出登录</button>
          </div>
        </header>

        <div class="page-title-area">
          <h2>运输任务执行</h2>
          <p class="subtitle">接单、上报车辆位置及确认送达状态</p>
        </div>

        <div class="content-layout">
          <section class="main-column">
            <div class="white-card">
              <div class="card-header">
                <h3>📋 待接收订单</h3>
              </div>
              <div class="order-list" v-if="availableOrders.length > 0">
                <div class="order-row" v-for="order in availableOrders" :key="order.id">
                  <div class="row-top">
                    <span class="order-id">订单号: {{ order.id }}</span>
                    <button class="btn-yellow" @click="acceptOrder(order)" :disabled="currentTask">
                      {{ currentTask ? '请先完成当前任务' : '接收订单' }}
                    </button>
                  </div>
                  <div class="row-details">
                    <div class="detail-col">
                      <p>车型: <strong>{{ order.carModel }}</strong></p>
                      <p>数量: <strong>{{ order.quantity }} 辆</strong></p>
                      <p>运输方式: {{ order.transportType }}</p>
                    </div>
                    <div class="detail-col">
                      <p>目的地: <strong>{{ order.destination }}</strong></p>
                      <p>发运商: {{ order.shipper }}</p>
                      <p>发布时间: {{ order.publishTime }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="empty-state" v-else>
                <div class="empty-icon">📭</div>
                <p>暂无可接收订单</p>
              </div>
            </div>

            <div class="white-card mt-24">
              <div class="card-header">
                <h3>✅ 已完成订单</h3>
              </div>
              <div class="order-list" v-if="completedTasks.length > 0">
                <div class="order-row completed-row" v-for="task in completedTasks" :key="task.orderId">
                  <div class="row-top">
                    <span class="order-id">订单号: {{ task.orderId }}</span>
                    <span class="published-badge">已完成</span>
                  </div>
                  <div class="row-details">
                    <div class="detail-col">
                      <p>车型: <strong>{{ task.carModel }}</strong></p>
                      <p>数量: <strong>{{ task.quantity }} 辆</strong></p>
                    </div>
                    <div class="detail-col">
                      <p>目的地: <strong>{{ task.destination }}</strong></p>
                      <p>完成时间: {{ task.completeTime }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="empty-state" v-else>
                <p>暂无已完成订单记录</p>
              </div>
            </div>
          </section>

          <aside class="sidebar-column">
            <div class="white-card sticky-panel" v-if="currentTask">
              <div class="binding-header">
                <h3>🚛 当前运输任务</h3>
                <span class="task-status-pill" :class="currentTask.status">
                  {{ getStatusText(currentTask.status) }}
                </span>
              </div>

              <div class="task-overview">
                <p>订单号: <strong>{{ currentTask.orderId }}</strong></p>
                <p>承运: {{ currentTask.carModel }} × {{ currentTask.quantity }} 辆</p>
                <p>发往: <strong>{{ currentTask.destination }}</strong></p>
              </div>

              <div class="vins-container">
                <p class="area-label">车身码清单</p>
                <div class="vin-tag-list">
                  <span class="vin-tag-mini" v-for="(vin, index) in currentTask.vins" :key="index">{{ vin }}</span>
                </div>
              </div>

              <div class="location-section" v-if="currentTask.status === 'transporting'">
                <h4 class="sub-title">📍 位置上报</h4>
                <div class="form-area">
                  <label>输入车身码定位</label>
                  <input
                    v-model="locationVin"
                    type="text"
                    placeholder="请输入需定位的车身码"
                    class="modern-input"
                  />

                  <label class="mt-12">当前位置</label>
                  <input
                    v-model="currentLocation"
                    type="text"
                    placeholder="例如: 京港澳高速 K1234"
                    class="modern-input"
                  />

                  <button
                    class="btn-yellow full-width mt-16"
                    @click="reportLocation"
                    :disabled="!locationVin || !currentLocation"
                  >
                    确认上报
                  </button>
                </div>

                <div class="history-timeline" v-if="locationHistory.length > 0">
                  <p class="area-label mt-24">位置打卡记录</p>
                  <div class="timeline-item" v-for="(loc, index) in locationHistory" :key="index">
                    <div class="tl-dot"></div>
                    <div class="tl-content">
                      <p class="tl-vin">{{ loc.vin }}</p>
                      <p class="tl-loc">{{ loc.location }}</p>
                      <p class="tl-time">{{ loc.time }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="action-footer mt-24">
                <button
                  v-if="currentTask.status === 'accepted'"
                  class="btn-publish full-width"
                  @click="startTransport"
                >
                  开始发车运输
                </button>
                <button
                  v-if="currentTask.status === 'transporting'"
                  class="btn-publish success-bg full-width"
                  @click="confirmDelivery"
                >
                  确认所有车辆已送达
                </button>
              </div>
            </div>

            <div class="white-card sticky-panel" v-else>
              <div class="summary-empty">
                <div class="empty-icon">🚚</div>
                <h3 class="panel-title">当前无进行中的任务</h3>
                <p>请从左侧订单列表中接收新的运输任务以开始工作。</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const availableOrders = ref([
  {
    id: 'ORD20260410001',
    carModel: '轿车 A级',
    quantity: 3,
    destination: '北京',
    transportType: '铁路运输',
    shipper: '成都物流中心',
    publishTime: '2026-04-10 10:30:00',
    vins: ['LSVAA2180E2123456', 'WVWZZZ3CZWE123456', 'LFV3A23C8E3123456']
  },
  {
    id: 'ORD20260410002',
    carModel: 'SUV B级',
    quantity: 2,
    destination: '上海',
    transportType: '公路运输',
    shipper: '广州物流中心',
    publishTime: '2026-04-10 11:15:00',
    vins: ['WDD2050431F123456', 'BMW1234567890ABCDE']
  }
])

const currentTask = ref(null)
const completedTasks = ref([])
const locationVin = ref('')
const currentLocation = ref('')
const locationHistory = ref([])

const acceptOrder = (order) => {
  currentTask.value = {
    orderId: order.id,
    carModel: order.carModel,
    quantity: order.quantity,
    destination: order.destination,
    status: 'accepted',
    vins: order.vins
  }

  const index = availableOrders.value.findIndex(o => o.id === order.id)
  if (index > -1) {
    availableOrders.value.splice(index, 1)
  }

  locationHistory.value = []
  alert(`已接收订单 ${order.id}`)
}

const startTransport = () => {
  currentTask.value.status = 'transporting'
  alert('运输已开始，请按时上报位置信息')
}

const reportLocation = () => {
  if (!currentTask.value.vins.includes(locationVin.value)) {
    alert('车身码不在当前订单中')
    return
  }

  locationHistory.value.unshift({
    vin: locationVin.value,
    location: currentLocation.value,
    time: new Date().toLocaleString('zh-CN')
  })

  locationVin.value = ''
  currentLocation.value = ''
  alert('位置上报成功')
}

const confirmDelivery = () => {
  if (!confirm('确认所有车辆已送达？')) {
    return
  }

  completedTasks.value.unshift({
    ...currentTask.value,
    completeTime: new Date().toLocaleString('zh-CN'),
    status: 'completed'
  })

  currentTask.value = null
  locationVin.value = ''
  currentLocation.value = ''
  locationHistory.value = []

  alert('订单已完成！')
}

const getStatusText = (status) => {
  const statusMap = {
    accepted: '已接收',
    transporting: '运输中',
    completed: '已完成'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
/* ====== 核心覆盖逻辑 ====== */
.be-run-app-fullscreen-wrapper {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 9999; background-color: #EAE6DF; overflow-y: auto;
}

.app-container {
  display: flex; min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #111; padding: 24px; box-sizing: border-box; gap: 24px;
}

/* ====== 左侧胶囊侧边栏 ====== */
.white-sidebar {
  width: 80px; background: #FFFFFF; border-radius: 40px;
  display: flex; flex-direction: column; align-items: center; padding: 30px 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); position: sticky; top: 24px; height: calc(100vh - 48px);
}
.logo-area { text-align: center; margin-bottom: 50px; }
.logo-icon { font-size: 28px; margin-bottom: 4px; }
.logo-text { font-size: 12px; font-weight: 800; }
.nav-menu { flex: 1; display: flex; flex-direction: column; gap: 24px; align-items: center; }
.nav-item { width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; border-radius: 50%; font-size: 20px; color: #555; cursor: pointer; transition: all 0.2s; }
.nav-item:hover { background: #F5F5F5; }
.nav-item.active { background: #FFD23F; color: #000; box-shadow: 0 4px 10px rgba(255, 210, 63, 0.3); }
.sidebar-bottom { margin-top: auto; }
.logout-btn-icon { background: #FF8A65; color: white; }

/* ====== 主内容区 ====== */
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }

/* 顶部栏 */
.top-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 0 10px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.system-title { font-size: 22px; font-weight: bold; margin: 0; color: #111; }
.status-pill { background: #E8F5E9; color: #4CAF50; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 6px; }
.status-pill .dot { background: #4CAF50; color: white; border-radius: 50%; width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }
.header-right { display: flex; align-items: center; gap: 16px; }
.search-pill { background: #FFFFFF; border-radius: 30px; padding: 10px 20px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
.search-pill input { border: none; outline: none; background: transparent; width: 160px; font-size: 14px; color: #333; }
.logout-pill { background: #FFFFFF; border: none; padding: 10px 24px; border-radius: 30px; font-weight: bold; color: #F44336; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }

/* 标题区 */
.page-title-area { margin: 10px 0 30px 10px; }
.page-title-area h2 { font-size: 36px; font-weight: 900; margin: 0 0 8px 0; color: #111; letter-spacing: 1px; }
.subtitle { font-size: 15px; color: #666; margin: 0; }

/* 布局 */
.content-layout { display: flex; gap: 24px; align-items: flex-start; }
.main-column { flex: 1; min-width: 0; }
.sidebar-column { width: 380px; }

/* ====== 通用白卡片 ====== */
.white-card { background: #FFFFFF; border-radius: 30px; padding: 32px; box-shadow: 0 8px 30px rgba(0,0,0,0.02); }
.card-header { margin-bottom: 24px; }
.card-header h3 { font-size: 20px; font-weight: bold; margin: 0; color: #111; }
.mt-24 { margin-top: 24px; }

/* 订单行 */
.order-list { display: flex; flex-direction: column; gap: 16px; }
.order-row { background: #F9F8F5; border-radius: 20px; padding: 24px; transition: transform 0.2s; }
.order-row:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.04); }
.completed-row { border: 1px solid #E8F5E9; background: #FAFAFA; }

.row-top { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #EAE6DF; padding-bottom: 16px; margin-bottom: 16px; }
.order-id { font-weight: bold; font-size: 16px; color: #111; }

.row-details { display: flex; gap: 40px; font-size: 14px; color: #666; }
.detail-col p { margin: 8px 0; }
.detail-col strong { color: #111; }

/* ====== 右侧操作面板 ====== */
.sticky-panel { position: sticky; top: 24px; }
.binding-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.binding-header h3 { margin: 0; font-size: 18px; font-weight: bold; }

.task-status-pill { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; }
.task-status-pill.accepted { background: #FFF3E0; color: #E65100; }
.task-status-pill.transporting { background: #E3F2FD; color: #1565C0; }

.task-overview { background: #F9F8F5; padding: 16px; border-radius: 16px; margin-bottom: 24px; font-size: 14px; color: #555; }
.task-overview p { margin: 6px 0; }
.task-overview strong { color: #111; font-size: 15px; }

.area-label { font-size: 13px; color: #888; margin-bottom: 12px; font-weight: bold; }
.vin-tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.vin-tag-mini { background: #111; color: #FFF; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-family: monospace; letter-spacing: 0.5px; }

/* 定位上报表单 */
.location-section { border-top: 1px dashed #EAE6DF; padding-top: 24px; }
.sub-title { font-size: 16px; font-weight: bold; color: #111; margin: 0 0 16px 0; }
.form-area label { display: block; margin-bottom: 8px; font-size: 13px; color: #555; font-weight: bold; }
.modern-input { width: 100%; box-sizing: border-box; background: #F9F8F5; border: 2px solid #EAE6DF; color: #111; padding: 14px; border-radius: 16px; font-size: 14px; transition: border 0.2s; outline: none; }
.modern-input:focus { border-color: #FFD23F; background: #FFF; }

/* 历史记录时间轴 */
.history-timeline { margin-top: 24px; }
.timeline-item { display: flex; gap: 16px; margin-bottom: 16px; }
.tl-dot { width: 10px; height: 10px; background: #FFD23F; border-radius: 50%; margin-top: 6px; box-shadow: 0 0 0 3px rgba(255,210,63,0.2); }
.tl-content { background: #F9F8F5; padding: 12px 16px; border-radius: 12px; flex: 1; }
.tl-content p { margin: 0 0 4px 0; font-size: 13px; }
.tl-vin { font-weight: bold; color: #111; font-family: monospace; }
.tl-loc { color: #555; }
.tl-time { color: #999; font-size: 12px; margin-bottom: 0 !important; }

/* 按钮与通用类 */
.btn-yellow { background: #FFD23F; color: #222; border: none; padding: 10px 24px; border-radius: 24px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.btn-yellow:hover:not(:disabled) { background: #F6C523; transform: scale(1.02); }
.btn-yellow:disabled { opacity: 0.5; cursor: not-allowed; background: #EAE6DF; color: #999; }

.btn-publish { background: #111; color: #FFF; border: none; padding: 16px; border-radius: 30px; font-weight: bold; cursor: pointer; font-size: 15px; transition: transform 0.2s; }
.btn-publish:hover:not(:disabled) { transform: scale(1.02); }
.success-bg { background: #4CAF50; }
.success-bg:hover:not(:disabled) { background: #43A047; }

.published-badge { background: #E8F5E9; color: #4CAF50; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; }
.panel-title { margin: 0 0 8px 0; font-size: 20px; font-weight: bold; color: #111; }
.summary-empty { text-align: center; padding: 60px 0; color: #888; }
.empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }

.full-width { width: 100%; box-sizing: border-box; }
.mt-12 { margin-top: 12px; }
.mt-16 { margin-top: 16px; }
.mt-24 { margin-top: 24px; }
</style>