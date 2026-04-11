<template>
  <div class="page-inner-content">

    <div class="page-title-area">
      <h2>新建车辆运输订单</h2>
      <p class="subtitle">选择车型、目的地及运输方案，快速生成发运单</p>
    </div>

    <div class="content-layout">
      <main class="form-column">
        <section class="white-card step-card">
          <div class="step-header">
            <span class="step-num">1</span>
            <h3>选择车型及数量</h3>
          </div>
          <div class="car-grid">
            <div
              v-for="model in carModels"
              :key="model.id"
              class="car-tile"
              :class="{ 'is-selected': selectedModel?.id === model.id }"
              @click="selectModel(model)"
            >
              <div class="tile-image-wrapper">
                <img :src="model.image" :alt="model.name" class="car-image" />
                <div class="check-icon" v-if="selectedModel?.id === model.id">✔</div>
              </div>
              <div class="tile-content">
                <h4 class="car-name">{{ model.name }}</h4>
                <p class="car-price">¥{{ model.unitPrice }} <span class="unit">/ 辆</span></p>

                <div class="quantity-wrapper" v-if="selectedModel?.id === model.id" @click.stop>
                  <button class="qty-btn" @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
                  <span class="qty-num">{{ quantity }}</span>
                  <button class="qty-btn" @click="increaseQuantity">+</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="white-card step-card" v-if="selectedModel">
          <div class="step-header">
            <span class="step-num">2</span>
            <h3>选择目的地</h3>
          </div>
          <div class="input-group">
            <label class="input-label">收车城市</label>
            <div class="select-wrapper">
              <select v-model="destination" class="modern-select">
                <option value="" disabled>请选择目的地城市...</option>
                <option v-for="city in destinations" :key="city.id" :value="city">
                  {{ city.name }} (距离: {{ city.distance }}km)
                </option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
          </div>
        </section>

        <section class="white-card step-card" v-if="selectedModel && destination">
          <div class="step-header">
            <span class="step-num">3</span>
            <h3>运输方式选择</h3>
          </div>

          <p v-if="estimating" class="estimate-loading">正在根据目的地请求后端估算，请稍候...</p>

          <div class="transport-grid">
            <div
              class="transport-option"
              :class="{ 'is-active': selectedTransport === 'railway', 'is-recommended': railwayCost < roadCost }"
              @click="selectTransport('railway')"
            >
              <div class="rec-badge" v-if="railwayCost < roadCost">推荐选择</div>
              <div class="tp-icon">🚂</div>
              <div class="tp-details">
                <h4>铁路运输</h4>
                <p class="tp-desc">适合长途，成本更优</p>
                <div class="tp-meta">预计 {{ railwayTime }} 天</div>
              </div>
              <div class="tp-price">
                ¥{{ railwayCost }}
              </div>
            </div>

            <div
              class="transport-option"
              :class="{ 'is-active': selectedTransport === 'road', 'is-recommended': roadCost < railwayCost }"
              @click="selectTransport('road')"
            >
              <div class="rec-badge" v-if="roadCost < railwayCost">推荐选择</div>
              <div class="tp-icon">🚛</div>
              <div class="tp-details">
                <h4>公路运输</h4>
                <p class="tp-desc">门到门直达，更灵活</p>
                <div class="tp-meta">预计 {{ roadTime }} 天</div>
              </div>
              <div class="tp-price">
                ¥{{ roadCost }}
              </div>
            </div>
          </div>

          <div class="alert-savings" v-if="selectedTransport">
            <div class="alert-icon">💡</div>
            <div class="alert-text">
              <span v-if="railwayCost < roadCost">明智之选！选择铁路运输为您节省了 <strong>¥{{ roadCost - railwayCost }}</strong></span>
              <span v-else>明智之选！选择公路运输为您节省了 <strong>¥{{ railwayCost - roadCost }}</strong></span>
            </div>
          </div>
        </section>
      </main>

      <aside class="sidebar-column">
        <div class="white-card sticky-panel">
          <h3 class="panel-title">订单摘要</h3>

          <div class="summary-content" v-if="selectedModel">
            <div class="summary-row">
              <span class="s-label">发运车型</span>
              <span class="s-value">{{ selectedModel.name }}</span>
            </div>
            <div class="summary-row">
              <span class="s-label">发运数量</span>
              <span class="s-value">{{ quantity }} 辆</span>
            </div>
            <div class="summary-row" v-if="destination">
              <span class="s-label">目的地</span>
              <span class="s-value">{{ destination.name }} <small>({{ destination.distance }}km)</small></span>
            </div>
            <div class="summary-row" v-if="selectedTransport">
              <span class="s-label">运输方式</span>
              <span class="s-value">{{ selectedTransport === 'railway' ? '铁路运输' : '公路运输' }}</span>
            </div>

            <div class="divider"></div>

            <div class="summary-total">
              <span>预估总费用</span>
              <span class="total-price">¥{{ totalCost || '0' }}</span>
            </div>

            <button
              class="btn-publish full-width"
              :disabled="!selectedTransport || submitting"
              @click="submitOrder"
            >
              {{ submitting ? '提交中...' : '确认并生成订单' }}
            </button>
          </div>

          <div class="summary-empty" v-else>
            <div class="empty-icon">📝</div>
            <p>请在左侧选择车型以开始测算订单明细。</p>
          </div>
        </div>

        <div class="history-section">
          <h3 class="history-title">最近提交</h3>
          <div class="mini-order-list" v-if="sortedRecentOrders.length > 0">
            <div class="white-card mini-order-card" v-for="order in visibleRecentOrders" :key="order.id">
              <div class="mo-header">
                <span class="mo-id"><strong>订单号 {{ order.id }}</strong></span>
                <span class="mo-status">{{ order.statusText }}</span>
              </div>
              <div class="mo-body">
                <div class="mo-grid">
                  <p class="mo-sub">{{ order.departurePoint }} -> {{ order.destination }}</p>
                  <p class="mo-sub">{{ order.carModel }}</p>
                  <p class="mo-sub">数量：{{ order.totalQuantity }}</p>
                  <p class="mo-sub">{{ order.via ? `当前位置：${order.via}` : '当前位置：--' }}</p>
                </div>
              </div>
              <div class="mo-footer">
                <span class="mo-price">¥{{ order.totalCost }}</span>
                <span class="mo-time">{{ order.updateTime || order.createTime || '--' }}</span>
              </div>
            </div>
            <button
              v-if="sortedRecentOrders.length > 2"
              class="btn-history-toggle"
              @click="isRecentExpanded = !isRecentExpanded"
            >
              {{ isRecentExpanded ? '收起' : '展开更多' }}
            </button>
          </div>
          <div class="white-card mini-order-empty" v-else>
            暂无最近订单
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { estimateApi, submitApi, pageApi } from '@/api/customer'

const carModels = ref([
  { id: 1, name: '轿车 A级', unitPrice: 800, image: '/images/car-a.png' },
  { id: 2, name: 'SUV B级', unitPrice: 1000, image: '/images/car-suv.png' },
  { id: 3, name: '豪华车 C级', unitPrice: 1500, image: '/images/car-c.png' },
  { id: 4, name: '新能源车', unitPrice: 900, image: '/images/car-ev.png' }
])
const destinations = ref([{ id: 1, name: '北京', distance: 1500 }, { id: 2, name: '上海', distance: 1200 }, { id: 3, name: '广州', distance: 800 }, { id: 4, name: '深圳', distance: 900 }, { id: 5, name: '成都', distance: 600 }, { id: 6, name: '武汉', distance: 400 }, { id: 7, name: '西安', distance: 700 }, { id: 8, name: '杭州', distance: 1100 }])
const selectedModel = ref(null)
const quantity = ref(1)
const destination = ref(null)
const selectedTransport = ref(null)
const orders = ref([])
const isRecentExpanded = ref(false)
const estimating = ref(false)
const submitting = ref(false)
const estimateResult = ref({
  recommendType: null,
  roadCost: 0,
  railCost: 0
})

const railwayCost = computed(() => Number(estimateResult.value.railCost) || 0)
const roadCost = computed(() => Number(estimateResult.value.roadCost) || 0)
const railwayTime = computed(() => destination.value ? Math.ceil(destination.value.distance / 500) : 0)
const roadTime = computed(() => destination.value ? Math.ceil(destination.value.distance / 800) : 0)
const totalCost = computed(() => { if (selectedTransport.value === 'railway') return railwayCost.value; if (selectedTransport.value === 'road') return roadCost.value; return 0 })

const sortedRecentOrders = computed(() => {
  return [...orders.value]
    .sort((a, b) => toTimestamp(b.updateTime || b.createTime) - toTimestamp(a.updateTime || a.createTime))
    .slice(0, 5)
})

const visibleRecentOrders = computed(() => {
  return isRecentExpanded.value ? sortedRecentOrders.value : sortedRecentOrders.value.slice(0, 2)
})

const orderStatusMap = {
  0: '待处理',
  1: '待绑定',
  2: '待运输',
  3: '运输中',
  4: '已完成'
}

const getOrderStatusText = (status) => orderStatusMap[Number(status)] || '未知状态'

const normalizeOrder = (raw) => ({
  id: raw?.id ?? '--',
  status: Number(raw?.status),
  statusText: getOrderStatusText(raw?.status),
  totalCost: Number(raw?.totalCost) || 0,
  carModel: raw?.carModel || raw?.details?.[0]?.carModel || '--',
  departurePoint: raw?.departurePoint || '--',
  destination: raw?.destination || '--',
  totalQuantity: Number(raw?.totalQuantity ?? raw?.quantity) || 0,
  createTime: raw?.createTime || '',
  updateTime: raw?.updateTime || '',
  via: raw?.via || ''
})

const toTimestamp = (timeStr) => {
  if (!timeStr) return 0
  const normalized = String(timeStr).replace(' ', 'T')
  const ts = Date.parse(normalized)
  return Number.isNaN(ts) ? 0 : ts
}

const loadRecentOrders = async () => {
  const userId = Number(localStorage.getItem('userId'))
  if (!userId) {
    orders.value = []
    return
  }

  try {
    let res = await pageApi(userId)
    let records =
      Array.isArray(res?.data?.records) ? res.data.records :
      Array.isArray(res?.records) ? res.records :
      Array.isArray(res?.data) ? res.data :
      Array.isArray(res) ? res : []

    let success = Number(res?.code) === 1 || records.length > 0

    if (!success) {
      res = await pageApi(userId, true)
      records =
        Array.isArray(res?.data?.records) ? res.data.records :
        Array.isArray(res?.records) ? res.records :
        Array.isArray(res?.data) ? res.data :
        Array.isArray(res) ? res : []
      success = Number(res?.code) === 1 || records.length > 0
    }

    if (success) {
      orders.value = records
        .map(normalizeOrder)
      isRecentExpanded.value = false
    } else {
      orders.value = []
      ElMessage.error(res.msg || '获取最近订单失败')
    }
  } catch (error) {
    orders.value = []
    ElMessage.error('获取最近订单失败，请稍后重试')
    console.error('Load recent orders error:', error)
  }
}

const resetEstimate = () => {
  estimateResult.value = {
    recommendType: null,
    roadCost: 0,
    railCost: 0
  }
}

const fetchEstimate = async () => {
  if (!selectedModel.value || !destination.value || quantity.value < 1) {
    resetEstimate()
    return
  }

  estimating.value = true
  try {
    const res = await estimateApi({
      destination: destination.value.name
    })

    if (Number(res.code) === 1 && res.data) {
      estimateResult.value = {
        recommendType: Number(res.data.recommendType),
        roadCost: Number(res.data.roadCost) || 0,
        railCost: Number(res.data.railCost) || 0
      }

      if (!selectedTransport.value) {
        selectedTransport.value = Number(res.data.recommendType) === 2 ? 'railway' : 'road'
      }
    } else if (Number(res.code) === 0) {
      resetEstimate()
      ElMessage.error(res.msg || '运输估算失败')
    }
  } catch (error) {
    resetEstimate()
    ElMessage.error('估算请求失败，请稍后重试')
    console.error('Estimate error:', error)
  } finally {
    estimating.value = false
  }
}

watch([selectedModel, quantity, destination], () => {
  selectedTransport.value = null
  fetchEstimate()
})

const selectModel = (model) => { selectedModel.value = selectedModel.value?.id === model.id ? null : model; quantity.value = 1; destination.value = null; selectedTransport.value = null; resetEstimate() }
const increaseQuantity = () => { quantity.value++ }
const decreaseQuantity = () => { if (quantity.value > 1) quantity.value-- }
const selectTransport = (type) => { selectedTransport.value = type }

const submitOrder = async () => {
  if (!selectedModel.value || !destination.value || !selectedTransport.value) {
    ElMessage.warning('请先选择车型、数量、目的地和运输方式')
    return
  }

  const userId = Number(localStorage.getItem('userId'))
  if (!userId) {
    ElMessage.error('未获取到用户信息，请重新登录')
    return
  }

  const payload = {
    userId,
    destination: destination.value.name,
    transportType: selectedTransport.value === 'road' ? 1 : 2,
    totalCost: Number(totalCost.value),
    details: [
      {
        carModel: selectedModel.value.name,
        quantity: Number(quantity.value)
      }
    ]
  }

  submitting.value = true
  try {
    const res = await submitApi(payload)

    if (Number(res.code) === 1) {
      ElMessage.success(res.msg || '订单提交成功')
      await loadRecentOrders()

      selectedModel.value = null
      quantity.value = 1
      destination.value = null
      selectedTransport.value = null
      resetEstimate()
    } else {
      ElMessage.error(res.msg || '订单提交失败')
    }
  } catch (error) {
    ElMessage.error('订单提交失败，请稍后重试')
    console.error('Submit order error:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadRecentOrders()
})
</script>

<style scoped>
/* ====== 仅保留页面内部样式，无外部背景 ====== */
.page-inner-content {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.page-title-area { margin: 10px 0 30px 10px; }
.page-title-area h2 { font-size: 32px; font-weight: 900; margin: 0 0 8px 0; color: #111; letter-spacing: 1px; }
.subtitle { font-size: 14px; color: #666; margin: 0; }

.content-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
}
.form-column { flex: 1 1 500px; min-width: 0; }
.sidebar-column { flex: 0 0 360px; max-width: 100%; display: flex; flex-direction: column; gap: 24px; }

/* ====== 通用白卡片 ====== */
.white-card {
  background: #FFFFFF;
  border-radius: 30px;
  padding: 32px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.02);
}
.step-card { margin-bottom: 24px; animation: slideIn 0.4s ease-out forwards; }
@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.step-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.step-num { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #111; color: #FFD23F; border-radius: 50%; font-weight: 900; font-size: 16px; }
.step-header h3 { font-size: 20px; margin: 0; font-weight: bold; color: #111; }

.car-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
.car-tile { background: #F9F8F5; border: 2px solid transparent; border-radius: 20px; overflow: hidden; cursor: pointer; transition: all 0.2s ease; position: relative; }
.car-tile:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
.car-tile.is-selected { border-color: #FFD23F; background: #FFF; box-shadow: 0 8px 20px rgba(255, 210, 63, 0.15); }
/* 优化图片外层容器，加入居中对齐和内边距留白 */
.tile-image-wrapper {
  position: relative;
  height: 140px;
  background: #F4F2EC; /* 换一个更柔和的米色底 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px; /* 让汽车图片四周留出空间，不要贴边 */
  box-sizing: border-box;
}

/* 核心修复：保持比例，绝不拉伸 */
.car-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 保证图片完整显示，不被裁剪 */
  /* 如果你的图片已经是透明背景了，不需要加 mix-blend-mode */
}
.check-icon { position: absolute; top: 12px; right: 12px; background: #FFD23F; color: #111; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; }
.tile-content { padding: 20px; text-align: center; }
.car-name { margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #111; }
.car-price { margin: 0; font-size: 18px; font-weight: 900; color: #111; }
.car-price .unit { font-size: 12px; color: #888; font-weight: normal; }

.quantity-wrapper { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px dashed #EAE6DF; }
.qty-btn { width: 36px; height: 36px; border: none; border-radius: 12px; background: #EAE6DF; color: #111; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.qty-btn:hover:not(:disabled) { background: #FFD23F; }
.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-num { font-weight: 900; font-size: 18px; min-width: 24px; }

.input-label { display: block; font-size: 14px; font-weight: bold; color: #555; margin-bottom: 12px; }
.select-wrapper { position: relative; }
.modern-select { width: 100%; padding: 16px 20px; appearance: none; background: #F9F8F5; border: 2px solid transparent; border-radius: 16px; font-size: 14px; font-weight: 500; color: #111; transition: all 0.2s; cursor: pointer; outline: none; }
.modern-select:focus { border-color: #FFD23F; background: #FFF; }
.select-arrow { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); color: #888; pointer-events: none; font-size: 12px; }

.estimate-loading {
  margin: 0 0 16px;
  font-size: 13px;
  color: #666;
}

.transport-grid { display: flex; flex-direction: column; gap: 16px; }
.transport-option { display: flex; align-items: center; padding: 24px; background: #F9F8F5; border: 2px solid transparent; border-radius: 20px; cursor: pointer; transition: all 0.2s; position: relative; }
.transport-option:hover { transform: translateY(-2px); }
.transport-option.is-active { border-color: #FFD23F; background: #FFF; box-shadow: 0 8px 20px rgba(255, 210, 63, 0.1); }
.rec-badge { position: absolute; top: -12px; right: 24px; background: #4CAF50; color: white; padding: 6px 14px; border-radius: 16px; font-size: 12px; font-weight: bold; }
.tp-icon { font-size: 36px; margin-right: 20px; background: #EAE6DF; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 16px; }
.tp-details { flex: 1; }
.tp-details h4 { margin: 0 0 6px 0; font-size: 18px; font-weight: bold; color: #111; }
.tp-desc { margin: 0 0 8px 0; font-size: 13px; color: #666; }
.tp-meta { font-size: 12px; font-weight: bold; color: #D84315; background: #FFCCBC; display: inline-block; padding: 4px 10px; border-radius: 8px; }
.tp-price { font-size: 26px; font-weight: 900; color: #111; }

.alert-savings { display: flex; align-items: center; gap: 12px; margin-top: 20px; padding: 16px 20px; background: #E8F5E9; border-radius: 16px; color: #2E7D32; }
.alert-icon { font-size: 20px; }
.alert-text { font-size: 14px; }
.alert-text strong { font-size: 16px; }

.sticky-panel { position: sticky; top: 24px; }
.panel-title { margin: 0 0 24px 0; font-size: 20px; font-weight: bold; color: #111; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px; }
.s-label { color: #666; font-weight: bold; }
.s-value { font-weight: bold; color: #111; text-align: right; }
.s-value small { color: #888; font-weight: normal; }
.divider { height: 1px; background: #EAE6DF; margin: 24px 0; }
.summary-total { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; font-size: 16px; font-weight: bold; color: #666; }
.total-price { font-size: 32px; font-weight: 900; color: #111; }

.btn-publish { background: #111; color: #FFF; border: none; padding: 18px; border-radius: 30px; font-weight: bold; cursor: pointer; font-size: 15px; transition: transform 0.2s; white-space: nowrap; }
.btn-publish:hover:not(:disabled) { transform: scale(1.02); }
.btn-publish:disabled { background: #EAE6DF; color: #999; cursor: not-allowed; }
.summary-empty { text-align: center; padding: 40px 0; color: #888; }
.empty-icon { font-size: 40px; margin-bottom: 16px; opacity: 0.5; }

.history-section { background: transparent; }
.history-title { font-size: 16px; font-weight: bold; color: #111; margin: 0 0 16px 10px; }
.mini-order-list { display: flex; flex-direction: column; gap: 16px; }
.mini-order-empty { padding: 18px; border-radius: 16px; text-align: center; color: #999; font-size: 14px; }
.mini-order-card { padding: 20px; border-radius: 20px; }
.btn-history-toggle {
  border: none;
  background: #111;
  color: #FFF;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  align-self: center;
}
.btn-history-toggle:hover { opacity: 0.9; }
.mo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.mo-id { color: #111; font-size: 15px; }
.mo-status { background: #FFF3E0; color: #EF6C00; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
.mo-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 12px; }
.mo-body p { margin: 0; color: #111; font-size: 14px; }
.mo-body .mo-sub { color: #666; font-size: 13px; line-height: 1.45; }
.mo-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #EAE6DF; }
.mo-price { font-weight: 900; color: #111; font-size: 16px; }
.mo-time { color: #888; font-size: 12px; }
.full-width { width: 100%; box-sizing: border-box; }
</style>