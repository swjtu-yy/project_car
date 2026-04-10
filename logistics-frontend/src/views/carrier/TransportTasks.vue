<template>
  <div class="page-inner-content">

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
                  {{ currentTask ? '请先完成任务' : '接收订单' }}
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
/* ====== 仅保留内容区样式，无全局覆盖 ====== */
.page-inner-content {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.page-title-area { margin: 10px 0 30px 10px; }
.page-title-area h2 { font-size: 32px; font-weight: 900; margin: 0 0 8px 0; color: #111; letter-spacing: 1px; }
.subtitle { font-size: 14px; color: #666; margin: 0; }

/* 响应式布局：加入 flex-wrap，空间不够时自动换行，防止无限挤压卡片 */
.content-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
}

/* 左侧给一个基础最小宽度 */
.main-column {
  flex: 1 1 500px;
  min-width: 0;
}

/* 右侧保持固定宽度，但极小屏幕时自动占满100% */
.sidebar-column {
  flex: 0 0 360px;
  max-width: 100%;
}

.white-card { background: #FFFFFF; border-radius: 24px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
.card-header { margin-bottom: 20px; }
.card-header h3 { font-size: 18px; font-weight: bold; margin: 0; color: #111; }
.mt-24 { margin-top: 24px; }

.order-list { display: flex; flex-direction: column; gap: 16px; }
.order-row { background: #F9F8F5; border-radius: 16px; padding: 20px; transition: transform 0.2s; }
.order-row:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.04); }
.completed-row { border: 1px solid #E8F5E9; background: #FAFAFA; }

.row-top { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #EAE6DF; padding-bottom: 12px; margin-bottom: 16px; }
.order-id { font-weight: bold; font-size: 15px; color: #111; }

.row-details { display: flex; flex-wrap: wrap; gap: 20px; font-size: 13px; color: #666; }
.detail-col { flex: 1; min-width: 140px; }
.detail-col p { margin: 6px 0; }
.detail-col strong { color: #111; }

.sticky-panel { position: sticky; top: 24px; }
.binding-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.binding-header h3 { margin: 0; font-size: 16px; font-weight: bold; }

.task-status-pill { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; white-space: nowrap; }
.task-status-pill.accepted { background: #FFF3E0; color: #E65100; }
.task-status-pill.transporting { background: #E3F2FD; color: #1565C0; }

.task-overview { background: #F9F8F5; padding: 16px; border-radius: 12px; margin-bottom: 24px; font-size: 13px; color: #555; }
.task-overview p { margin: 6px 0; }
.task-overview strong { color: #111; font-size: 14px; }

.area-label { font-size: 12px; color: #888; margin-bottom: 12px; font-weight: bold; }
.vin-tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.vin-tag-mini { background: #111; color: #FFF; padding: 6px 10px; border-radius: 10px; font-size: 11px; font-family: monospace; letter-spacing: 0.5px; }

.location-section { border-top: 1px dashed #EAE6DF; padding-top: 20px; }
.sub-title { font-size: 15px; font-weight: bold; color: #111; margin: 0 0 16px 0; }
.form-area label { display: block; margin-bottom: 8px; font-size: 12px; color: #555; font-weight: bold; }
.modern-input { width: 100%; box-sizing: border-box; background: #F9F8F5; border: 2px solid transparent; color: #111; padding: 12px; border-radius: 12px; font-size: 13px; transition: border 0.2s; outline: none; }
.modern-input:focus { border-color: #FFD23F; background: #FFF; }

.history-timeline { margin-top: 24px; }
.timeline-item { display: flex; gap: 12px; margin-bottom: 12px; }
.tl-dot { width: 8px; height: 8px; background: #FFD23F; border-radius: 50%; margin-top: 6px; box-shadow: 0 0 0 3px rgba(255,210,63,0.2); }
.tl-content { background: #F9F8F5; padding: 10px 14px; border-radius: 10px; flex: 1; }
.tl-content p { margin: 0 0 4px 0; font-size: 12px; }
.tl-vin { font-weight: bold; color: #111; font-family: monospace; }
.tl-loc { color: #555; }
.tl-time { color: #999; font-size: 11px; margin-bottom: 0 !important; }

/* 关键修复：white-space: nowrap 防止按钮被挤压换行 */
.btn-yellow {
  background: #FFD23F; color: #222; border: none;
  padding: 8px 20px; border-radius: 20px;
  font-weight: bold; cursor: pointer; font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-yellow:hover:not(:disabled) { background: #F6C523; transform: scale(1.02); }
.btn-yellow:disabled { opacity: 0.5; cursor: not-allowed; background: #EAE6DF; color: #999; }

.btn-publish {
  background: #111; color: #FFF; border: none;
  padding: 14px; border-radius: 24px;
  font-weight: bold; cursor: pointer; font-size: 14px;
  transition: transform 0.2s;
}
.btn-publish:hover:not(:disabled) { transform: scale(1.02); }
.success-bg { background: #4CAF50; }
.success-bg:hover:not(:disabled) { background: #43A047; }

.published-badge { background: #E8F5E9; color: #4CAF50; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; white-space: nowrap; }
.panel-title { margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #111; }
.summary-empty { text-align: center; padding: 40px 0; color: #888; }
.empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }

.full-width { width: 100%; box-sizing: border-box; }
.mt-12 { margin-top: 12px; }
.mt-16 { margin-top: 16px; }
.mt-24 { margin-top: 24px; }
</style>