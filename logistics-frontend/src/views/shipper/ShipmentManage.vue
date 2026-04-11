<template>
  <div class="page-inner-content">

    <div class="page-title-area">
      <h2>发运管理</h2>
      <p class="subtitle">管理待处理订单并完成车辆 VIN 码绑定</p>
    </div>

    <div class="content-layout">
      <section class="main-column">
        <div class="white-card">
          <div class="card-header">
            <h3 class="card-title">📋 待接收订单</h3>
          </div>

          <div class="empty-state" v-if="loadingOrders">
            <div class="empty-icon">⏳</div>
            <p>正在加载待接收订单...</p>
          </div>

          <div class="order-list" v-else-if="pendingOrders.length > 0">
            <div class="order-row" v-for="order in pendingOrders" :key="order.id">
              <div class="row-top">
                <span class="order-id">订单号: {{ order.id }}</span>
                <span class="order-time-inline">下单时间 {{ formatOrderTime(order.createTime) }}</span>
                <button class="btn-yellow" @click="acceptOrder(order)">接收订单</button>
              </div>
              <div class="row-details">
                <div class="detail-col">
                  <p>车型: <strong>{{ order.carModel }}</strong></p>
                  <p>数量: <strong>{{ order.quantity }} 辆</strong></p>
                  <p>运输方式: {{ order.transportType }}</p>
                </div>
                <div class="detail-col">
                  <p>起始地: <strong>{{ order.departurePoint }}</strong></p>
                  <p>目的地: <strong>{{ order.destination }}</strong></p>
                  <p>价格: <strong>¥{{ order.totalCost }}</strong></p>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else>
            <div class="empty-icon">📭</div>
            <p>{{ loadError || '暂无待接收订单' }}</p>
          </div>
        </div>

        <div class="white-card mt-24">
          <div class="card-header">
            <h3 class="card-title">📦 已发布历史</h3>
          </div>
          <div class="history-list" v-if="publishedOrders.length > 0">
            <div class="history-row" v-for="order in publishedOrders" :key="order.id">
              <div class="status-dot"></div>
              <div class="history-info">
                <span class="h-field h-id">{{ order.id }}</span>
                <span class="h-field h-desc">{{ order.carModel }} · {{ order.quantity }}辆</span>
                <span class="h-field">{{ order.departurePoint }} -> {{ order.destination }}</span>
                <span class="h-field">¥{{ order.totalCost }}</span>
                <span class="h-field">{{ order.transportType }}</span>
                <span class="h-field h-status-cell">
                  <span class="status-badge" :class="getStatusClass(order.status)">{{ order.statusText }}</span>
                </span>
                <span class="h-field h-time">{{ order.publishTime || order.createTime }}</span>
              </div>
            </div>
          </div>
          <div class="empty-state mini" v-else>
            <p>暂无历史记录</p>
          </div>
        </div>
      </section>

      <aside class="sidebar-column" v-if="selectedOrder">
        <div class="white-card sticky-panel dark-theme-card">
          <div class="binding-header-dark">
            <h3>车辆信息绑定</h3>
            <div class="progress-pill">已填写 {{ vinCount }}/{{ selectedOrder.quantity }}</div>
          </div>

          <div class="task-overview">
            <p>正在处理: <strong>{{ selectedOrder.id }}</strong></p>
            <p>需发运: {{ selectedOrder.carModel }} × {{ selectedOrder.quantity }} 辆</p>
          </div>

          <div class="form-area">
            <label>输入车身码 (VIN):</label>
            <div class="vin-input-list">
              <div class="input-with-status" v-for="(vin, index) in vinInputs" :key="index">
                <input
                  v-model="vinInputs[index]"
                  type="text"
                  placeholder="请输入车身码"
                  class="dark-input"
                />
              </div>
            </div>

            <button
              class="btn-yellow full-width mt-10"
              @click="addVinInput"
              :disabled="vinInputs.length >= selectedOrder.quantity"
              type="button"
            >
              添加车身码
            </button>
          </div>

          <button
            class="btn-dark-primary full-width mt-20"
            @click="publishOrder"
            :disabled="publishing"
          >
            {{ publishing ? '发布中...' : '完成并发布' }}
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { allOrderApi, receiveApi, bindApi } from '@/api/shipper'

const pendingOrders = ref([])
const loadingOrders = ref(false)
const loadError = ref('')
const publishing = ref(false)

const publishedOrders = ref([])
const selectedOrder = ref(null)
const vinInputs = ref([''])
const vinCount = computed(() => vinInputs.value.map(v => String(v || '').trim()).filter(Boolean).length)

const extractRecords = (res) => {
  if (Array.isArray(res?.data?.records)) return res.data.records
  if (Array.isArray(res?.records)) return res.records
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res)) return res
  return []
}

const toTimestamp = (timeStr) => {
  if (!timeStr) return 0
  const normalized = String(timeStr).replace(' ', 'T')
  const timestamp = Date.parse(normalized)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const formatOrderTime = (timeStr) => {
  if (!timeStr) return '--'
  const normalized = String(timeStr).replace('T', ' ')
  return normalized.length >= 16 ? normalized.slice(0, 16) : normalized
}

const getTransportTypeText = (transportType) => {
  if (transportType === 1 || transportType === '1' || transportType === 'road') return '公路运输'
  if (transportType === 2 || transportType === '2' || transportType === 'railway') return '铁路运输'
  return transportType || '待确认'
}

const getOrderStatusText = (status) => {
  const statusMap = {
    0: '待接收',
    1: '待绑定',
    2: '待运输',
    3: '运输中',
    4: '已完成',
    pending: '待接收',
    accepted: '已接收'
  }

  return statusMap[String(status)] || statusMap[Number(status)] || '待接收'
}

const getStatusClass = (status) => {
  const key = Number(status)
  if (key === 1) return 'status-wait-bind'
  if (key === 2) return 'status-wait-transport'
  if (key === 3) return 'status-transporting'
  if (key === 4) return 'status-completed'
  return 'status-pending'
}

const normalizeOrder = (raw) => ({
  id: String(raw?.id ?? raw?.orderId ?? raw?.orderNo ?? '--'),
  orderId: Number(raw?.orderId ?? raw?.id ?? raw?.orderNo) || null,
  carModel: raw?.carModel ?? raw?.modelName ?? raw?.vehicleModel ?? raw?.model ?? '--',
  quantity: Number(raw?.quantity ?? raw?.totalQuantity ?? raw?.carQuantity ?? raw?.count) || 0,
  departurePoint: raw?.departurePoint ?? raw?.startPoint ?? raw?.fromCity ?? '--',
  destination: raw?.destination ?? raw?.arriveCity ?? raw?.toCity ?? '--',
  totalCost: Number(raw?.totalCost) || 0,
  transportType: raw?.transportTypeText ?? getTransportTypeText(raw?.transportType ?? raw?.via),
  currentLocation: raw?.via ?? raw?.currentLocation ?? '--',
  customer: raw?.customer ?? raw?.shipper ?? raw?.customerName ?? raw?.dealerName ?? '--',
  createTime: raw?.createTime ?? raw?.publishTime ?? raw?.orderTime ?? raw?.updateTime ?? '',
  updateTime: raw?.updateTime ?? raw?.publishTime ?? raw?.createTime ?? raw?.orderTime ?? '',
  publishTime: raw?.publishTime ?? raw?.updateTime ?? raw?.createTime ?? raw?.orderTime ?? '',
  status: raw?.status ?? raw?.orderStatus ?? '1',
  statusText: getOrderStatusText(raw?.status ?? raw?.orderStatus)
})

const isPendingOrder = (order) => {
  return Number(order.status) === 0
}

const loadPendingOrders = async () => {
  loadingOrders.value = true
  loadError.value = ''

  try {
    const res = await allOrderApi()
    const records = extractRecords(res)
    const normalizedOrders = records.map(normalizeOrder)

    pendingOrders.value = normalizedOrders
      .filter(isPendingOrder)
      .sort((a, b) => toTimestamp(b.createTime) - toTimestamp(a.createTime))

    publishedOrders.value = normalizedOrders
      .filter(order => Number(order.status) !== 0)
      .sort((a, b) => {
        const statusA = Number.isNaN(Number(a.status)) ? 999 : Number(a.status)
        const statusB = Number.isNaN(Number(b.status)) ? 999 : Number(b.status)
        if (statusA !== statusB) return statusA - statusB

        const timeA = toTimestamp(a.updateTime || a.publishTime || a.createTime)
        const timeB = toTimestamp(b.updateTime || b.publishTime || b.createTime)
        return timeB - timeA
      })

    if (!records.length && Number(res?.code) === 0) {
      loadError.value = res?.msg || '暂无待接收订单'
    }
  } catch (error) {
    pendingOrders.value = []
    publishedOrders.value = []
    loadError.value = '获取待接收订单失败，请稍后重试'
    console.error('Load pending orders error:', error)
  } finally {
    loadingOrders.value = false
  }
}

const acceptOrder = (order) => {
  selectedOrder.value = order
  vinInputs.value = ['']

  const index = pendingOrders.value.findIndex(o => o.id === order.id)
  if (index > -1) pendingOrders.value.splice(index, 1)
}

const addVinInput = () => {
  if (!selectedOrder.value) return
  if (vinInputs.value.length >= selectedOrder.value.quantity) return

  const lastValue = String(vinInputs.value[vinInputs.value.length - 1] || '').trim()
  if (!lastValue) {
    window.alert('请输入车身码')
    return
  }

  vinInputs.value.push('')
}

const publishOrder = async () => {
  if (!selectedOrder.value) return

  const vinList = vinInputs.value.map(v => String(v || '').trim()).filter(Boolean)
  if (vinList.length < selectedOrder.value.quantity) {
    window.alert('车身码数量不足')
    return
  }

  const orderId = selectedOrder.value.orderId ?? Number(selectedOrder.value.id)
  if (!orderId) {
    window.alert('订单ID无效，无法发布')
    return
  }

  publishing.value = true
  try {

    const receiveRes = await receiveApi({ orderId })
    if (Number(receiveRes?.code) !== 1) {
      window.alert(receiveRes?.msg || '更新订单状态失败')
      return
    }

    const bindRes = await bindApi({ orderId, vinList })
    if (Number(bindRes?.code) !== 1) {
      window.alert(bindRes?.msg || '绑定车身码失败')
      return
    }

    selectedOrder.value = null
    vinInputs.value = ['']
    await loadPendingOrders()
  } catch (error) {
    window.alert('发布失败，请稍后重试')
    console.error('Publish order error:', error)
    await loadPendingOrders()
  } finally {
    publishing.value = false
  }
}

onMounted(() => {
  loadPendingOrders()
})
</script>

<style scoped>
/* ====== 极致纯净的内部样式，没有任何外壳污染 ====== */

.page-inner-content {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.page-title-area { margin: 10px 0 30px 10px; }
.page-title-area h2 { font-size: 32px; font-weight: 900; margin: 0 0 8px 0; color: #111; letter-spacing: 1px; }
.subtitle { font-size: 14px; color: #666; margin: 0; }

/* 防挤压弹性布局 */
.content-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
}

.main-column {
  flex: 1 1 500px;
  min-width: 0;
}

.sidebar-column {
  flex: 0 0 360px;
  max-width: 100%;
}

/* 白底现代卡片 */
.white-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}
.card-header { margin-bottom: 20px; }
.card-title { font-size: 18px; font-weight: bold; margin: 0; color: #111; }
.mt-24 { margin-top: 24px; }

/* 订单行 */
.order-list { display: flex; flex-direction: column; gap: 16px; }
.order-row {
  background: #F9F8F5;
  border-radius: 16px;
  padding: 20px;
  transition: transform 0.2s;
}
.order-row:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.04); }

.row-top { display: grid; grid-template-columns: auto 1fr auto; align-items: center; border-bottom: 1px solid #EAE6DF; padding-bottom: 12px; margin-bottom: 16px; column-gap: 10px; }
.order-id { font-weight: bold; font-size: 15px; color: #111; }
.order-time-inline { justify-self: center; font-size: 12px; font-weight: 500; color: #666; }

.row-details { display: flex; flex-wrap: wrap; gap: 20px; font-size: 13px; color: #666; }
.detail-col { flex: 1; min-width: 140px; }
.detail-col p { margin: 6px 0; }
.detail-col strong { color: #111; }
/* 主按钮，禁止换行 */
.btn-yellow {
  background: #FFD23F; color: #222;
  border: none; padding: 8px 20px; border-radius: 20px;
  font-weight: bold; cursor: pointer; font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-yellow:hover:not(:disabled) { background: #F6C523; transform: scale(1.02); }
.btn-yellow:disabled { opacity: 0.5; cursor: not-allowed; background: #EAE6DF; color: #999; }

/* 历史列表 */
.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-row { display: flex; align-items: center; background: #F9F8F5; padding: 12px 12px; border-radius: 12px; }
.status-dot { width: 8px; height: 8px; background: #FFD23F; border-radius: 50%; margin-right: 8px; }
.history-info {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: 0.5fr 1.5fr 1.35fr 0.85fr 0.95fr 1fr 1.25fr;
  align-items: center;
  column-gap: 10px;
}
.h-field { min-width: 0; font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }
.h-id { font-weight: bold; font-size: 14px; color: #111; text-align: left; }
.h-desc { font-size: 13px; color: #666; }
.h-time { color: #999; text-align: right; }
.h-status-cell { overflow: visible; text-align: center; }

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3px;
  border: 1px solid transparent;
}

.status-pending {
  color: #8D6E63;
  background: #F5F1EE;
  border-color: #E4DAD2;
}

.status-wait-bind {
  color: #D17A00;
  background: #FFF4DC;
  border-color: #FFD27A;
}

.status-wait-transport {
  color: #0D6EFD;
  background: #E6F1FF;
  border-color: #9FC5FF;
}

.status-transporting {
  color: #6F42C1;
  background: #EFE7FF;
  border-color: #C7B3FF;
}

.status-completed {
  color: #1E8E3E;
  background: #E8F5E9;
  border-color: #A7D7AE;
}

/* 右侧绑定面板 (深色卡片) */
.sticky-panel { position: sticky; top: 24px; }
.dark-theme-card { background: #2D2D2D; color: #Fdfcf9; border: none; }
.binding-header-dark { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.binding-header-dark h3 { margin: 0; font-size: 16px; font-weight: bold; color: #Fdfcf9; }
.progress-pill { background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }

.task-overview { background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px; margin-bottom: 24px; font-size: 13px; color: #ccc; }
.task-overview strong { color: #FFD23F; font-size: 14px; }
.task-overview p { margin: 4px 0; }

.form-area label { display: block; margin-bottom: 8px; font-size: 12px; color: #aaa; font-weight: bold; }
.vin-input-list { display: flex; flex-direction: column; gap: 8px; }
.input-with-status { margin-bottom: 0; }
.dark-input { width: 100%; box-sizing: border-box; background: #1A1A1A; border: 1px solid #444; color: white; padding: 12px; border-radius: 12px; font-size: 13px; transition: border 0.2s; outline: none; }
.dark-input:focus { border-color: #FFD23F; }
.status-msg { margin-top: 6px; font-size: 12px; height: 16px; font-weight: bold; }
.msg-success { color: #4CAF50; }
.msg-error { color: #FF6B6B; }

.vehicle-preview { background: #3A3A3A; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; border: 1px solid #444; }
.vehicle-preview p { margin: 0 0 4px 0; font-size: 13px; color: #fff; }
.vehicle-preview .sub-text { font-size: 11px; color: #aaa; }

.tags-area { margin-top: 24px; }
.area-label { font-size: 12px; color: #888; margin-bottom: 12px; font-weight: bold; }
.dark-tag { display: flex; justify-content: space-between; align-items: center; background: #1A1A1A; padding: 10px 16px; border-radius: 10px; margin-bottom: 8px; font-size: 12px; border: 1px solid #333; font-family: monospace; }
.remove-icon { background: none; border: none; color: #888; cursor: pointer; font-size: 16px; }
.remove-icon:hover { color: #FF6B6B; }

.btn-dark-primary { background: #Fdfcf9; color: #2D2D2D; border: none; padding: 14px; border-radius: 24px; font-weight: bold; cursor: pointer; font-size: 14px; transition: transform 0.2s; }
.btn-dark-primary:hover:not(:disabled) { transform: scale(1.02); }
.btn-dark-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.full-width { width: 100%; box-sizing: border-box; }
.mt-10 { margin-top: 10px; }
.mt-20 { margin-top: 20px; }
.empty-state { text-align: center; color: #999; padding: 40px 0; }
.empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }
</style>