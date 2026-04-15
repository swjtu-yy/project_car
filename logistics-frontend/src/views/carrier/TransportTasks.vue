<template>
  <div class="page-inner-content">
    <div class="content-layout">
      <section class="main-column">
        <div class="white-card">
          <div class="card-header">
            <h3>📋 待接收订单</h3>
          </div>
          <div class="order-list" v-if="availableOrders.length > 0">
            <div class="order-row" v-for="order in pagedAvailableOrders" :key="order.id">
              <div class="row-top">
                <span class="order-id">订单号: {{ order.id }}</span>
                <button class="btn-yellow" @click="acceptOrder(order)" :disabled="currentTask">
                  {{ currentTask ? '请先完成任务' : '接收订单' }}
                </button>
              </div>
              <div class="row-details available-details">
                <p class="detail-item">车型: <strong>{{ order.carModel }}</strong></p>
                <p class="detail-item">数量: <strong>{{ order.quantity }} 辆</strong></p>
                <p class="detail-item">运输方式: {{ order.transportType }}</p>
                <p class="detail-item">目的地: <strong>{{ order.destination }}</strong></p>
                <p class="detail-item">发运商: {{ order.shipper }}</p>
                <p class="detail-item">发布时间: {{ order.publishTime }}</p>
              </div>
            </div>
            <el-pagination
              v-if="availableOrders.length > availablePageSize"
              class="available-pagination"
              background
              layout="prev, pager, next"
              :current-page="availableCurrentPage"
              :page-size="availablePageSize"
              :total="availableOrders.length"
              @current-change="availableCurrentPage = $event"
            />
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
            <div class="order-row completed-row" v-for="task in visibleCompletedTasks" :key="task.orderId">
              <div class="row-top">
                <span class="order-id">订单号: {{ task.orderId }}</span>
                <span class="published-badge">已完成</span>
              </div>
              <div class="row-details completed-details">
                <p class="detail-item">车型: <strong>{{ task.carModel }}</strong></p>
                <p class="detail-item">数量: <strong>{{ task.quantity }} 辆</strong></p>
                <p class="detail-item">目的地: <strong>{{ task.destination }}</strong></p>
                <p class="detail-item">完成时间: {{ task.completeTime }}</p>
              </div>
            </div>
            <button
              v-if="completedTasks.length > 2"
              class="btn-history-toggle"
              @click="isCompletedExpanded = !isCompletedExpanded"
            >
              {{ isCompletedExpanded ? '收起' : '展开更多' }}
            </button>
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
            <div class="overview-grid">
              <p>订单号: <strong>{{ currentTask.orderId }}</strong></p>
              <p>车型: <strong>{{ currentTask.carModel }}</strong></p>
              <p>数量: <strong>{{ currentTask.quantity }} 辆</strong></p>
              <p>运输方式: <strong>{{ currentTask.transportType }}</strong></p>
              <p>发往: <strong>{{ currentTask.destination }}</strong></p>
              <p>运途位置: <strong>{{ currentTask.via }}</strong></p>
              <p>总费用: <strong>{{ currentTask.totalCost }}</strong></p>
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

              <p class="location-text">当前位置：{{ locationStatus || '点击上报时自动获取位置' }}</p>

              <button
                class="btn-yellow full-width mt-16"
                @click="reportLocation"
                :disabled="!canReportLocation"
              >
                {{ isReporting ? '定位中...' : '确认上报' }}
              </button>
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
import { computed, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { allOrderApi, receiveApi, locationApi, arriveApi } from '@/api/carrier'

const availableOrders = ref([])
const availableCurrentPage = ref(1)
const availablePageSize = 2

const currentTask = ref(null)
const completedTasks = ref([])
const locationVin = ref('')
const locationStatus = ref('')
const isReporting = ref(false)
const isCompletedExpanded = ref(false)

const canReportLocation = computed(() => {
  return locationVin.value.trim().length > 0 && !isReporting.value
})

const pagedAvailableOrders = computed(() => {
  const start = (availableCurrentPage.value - 1) * availablePageSize
  return availableOrders.value.slice(start, start + availablePageSize)
})

const visibleCompletedTasks = computed(() => {
  return isCompletedExpanded.value ? completedTasks.value : completedTasks.value.slice(0, 2)
})

const mapOrder = (order) => ({
  id: order.id,
  carModel: order.carModel || '车型未知',
  quantity: order.totalQuantity || 0,
  destination: order.destination || '',
  departurePoint: order.departurePoint || '暂无',
  via: order.via || '暂无',
  transportType: order.transportType === 1 ? '公路' : order.transportType === 2 ? '铁路' : '运输方式未知',
  shipper: order.shipper || '发运商未知',
  publishTime: order.createTime || order.publishTime || '',
  updateTime: order.updateTime || '',
  totalCost: order.totalCost ?? '暂无',
  vins: order.vins || [],
  status: order.status
})

const fetchLatestOrders = async () => {
  const res = await allOrderApi()
  let orders = res.data?.records || res.records || res.data || res
  orders = Array.isArray(orders) ? orders : []

  const status2Orders = orders.filter(order => order.status === 2).map(mapOrder)
  const status3Orders = orders.filter(order => order.status === 3).map(mapOrder)
  const status4Orders = orders.filter(order => order.status === 4).map(mapOrder)

  availableOrders.value = status2Orders

  if (status3Orders.length > 0) {
    currentTask.value = {
      ...status3Orders[0],
      orderId: status3Orders[0].id,
      status: 'transporting'
    }
  } else {
    currentTask.value = null
  }

  completedTasks.value = status4Orders.map(order => ({
    ...order,
    orderId: order.id,
    completeTime: order.updateTime || '',
    status: 'completed'
  }))
}

const getReadableLocation = async (latitude, longitude) => {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh-CN`,
    { method: 'GET' }
  )

  if (!response.ok) {
    throw new Error('reverse geocode failed')
  }

  const data = await response.json()
  const city = data.city || data.locality || data.localityInfo?.administrative?.[0]?.name || ''
  return city || data.displayName || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}

const updateCurrentLocation = () => {
  if (!navigator.geolocation) {
    locationStatus.value = '浏览器不支持定位'
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords

      try {
        locationStatus.value = await getReadableLocation(latitude, longitude)
      } catch (error) {
        console.error('自动获取位置失败:', error)
        locationStatus.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      }
    },
    (error) => {
      console.error('自动定位失败:', error)
      locationStatus.value = '获取位置失败'
    }
  )
}

onMounted(async () => {
  updateCurrentLocation()

  try {
    await fetchLatestOrders()
  } catch (error) {
    console.error('获取订单失败:', error)
    availableOrders.value = []
    currentTask.value = null
    completedTasks.value = []
  }
})

const acceptOrder = async (order) => {
  try {
    const carrierId = localStorage.getItem('userId')
    const res = await receiveApi({
      orderId: order.id,
      carrierId: Number(carrierId)
    })

    if (Number(res.code) === 1) {
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

      ElMessage.success(`已接收订单 ${order.id}`)
    } else {
      ElMessage.error(res.msg || '接收订单失败')
    }
  } catch (error) {
    console.error('接收订单出错:', error)
    ElMessage.error('接收订单失败，请稍后重试')
  }
}

const startTransport = () => {
  currentTask.value.status = 'transporting'
  ElMessage.success('运输已开始，请按时上报位置信息')
}

const reportLocation = async () => {
  isReporting.value = true
  locationStatus.value = '正在获取位置...'

  try {
    if (!navigator.geolocation) {
      locationStatus.value = '浏览器不支持定位'
      ElMessage.error('浏览器不支持定位')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        let viaLocation = '未知位置'
        try {
          viaLocation = await getReadableLocation(latitude, longitude)
        } catch (locationError) {
          console.error('反查位置失败:', locationError)
          viaLocation = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }

        locationStatus.value = viaLocation

        try {
          const res = await locationApi({
            vin: locationVin.value,
            via: viaLocation
          })

          if (Number(res.code) === 1) {
            locationVin.value = ''
            await fetchLatestOrders()
            ElMessage.success('位置上报成功')
          } else {
            ElMessage.error(res.msg || '位置上报失败')
          }
        } catch (error) {
          console.error('上报位置出错:', error)
          ElMessage.error('位置上报失败，请稍后重试')
        } finally {
          isReporting.value = false
        }
      },
      (error) => {
        isReporting.value = false
        console.error('获取位置失败:', error)
        if (error.code === error.PERMISSION_DENIED) {
          locationStatus.value = '定位权限被拒绝'
          ElMessage.error('请授予浏览器定位权限')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          locationStatus.value = '定位服务不可用'
          ElMessage.error('定位服务不可用')
        } else {
          locationStatus.value = '获取位置失败'
          ElMessage.error('获取位置失败')
        }
      }
    )
  } catch (error) {
    isReporting.value = false
    console.error('位置上报异常:', error)
    ElMessage.error('位置上报失败')
  }
}

const confirmDelivery = async () => {
  try {
    await ElMessageBox.confirm('确认所有车辆已送达？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  try {
    const res = await arriveApi({
      orderId: currentTask.value.orderId
    })

    if (Number(res.code) === 1) {
      completedTasks.value.unshift({
        ...currentTask.value,
        completeTime: new Date().toLocaleString('zh-CN'),
        status: 'completed'
      })

      currentTask.value = null
      locationVin.value = ''
      locationStatus.value = ''

      ElMessage.success('订单已完成！')
    } else {
      ElMessage.error(res.msg || '确认送达失败')
    }
  } catch (error) {
    console.error('确认送达出错:', error)
    ElMessage.error('确认送达失败，请稍后重试')
  }
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
  padding: 0 10px 8px;
  box-sizing: border-box;
}

/* 响应式布局：加入 flex-wrap，空间不够时自动换行，防止无限挤压卡片 */
.content-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: flex-start;
  margin-top: -6px;
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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.white-card { background: #FFFFFF; border-radius: 30px; padding: 28px; box-shadow: 0 8px 30px rgba(0,0,0,0.02); }
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

.available-details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 20px;
}

.detail-item {
  margin: 0;
  line-height: 1.5;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.detail-item strong {
  color: #111;
  font-weight: 700;
}

.available-pagination {
  align-self: center;
  margin-top: 8px;
  margin-bottom: 0px;
}

:deep(.available-pagination .el-pager li) {
  border-radius: 10px;
}

:deep(.available-pagination .btn-prev),
:deep(.available-pagination .btn-next) {
  border-radius: 10px;
}

.completed-details {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px 20px;
}

@media (max-width: 900px) {
  .available-details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .completed-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .available-details {
    grid-template-columns: 1fr;
  }
  
  .completed-fields {
    grid-template-columns: 1fr;
  }
}

.sticky-panel { position: sticky; top: 24px; padding: 20px 22px; }
.binding-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.binding-header h3 { margin: 0; font-size: 16px; font-weight: bold; }

.task-status-pill { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; white-space: nowrap; }
.task-status-pill.accepted { background: #FFF3E0; color: #E65100; }
.task-status-pill.transporting { background: #E3F2FD; color: #1565C0; }

.task-overview { background: #F9F8F5; padding: 16px; border-radius: 12px; margin-bottom: 24px; font-size: 13px; color: #555; }
.overview-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 16px; }
.task-overview p { margin: 0; line-height: 1.5; }
.task-overview strong { color: #111; font-size: 14px; }

.location-section { border-top: 1px dashed #EAE6DF; padding-top: 20px; }
.sub-title { font-size: 15px; font-weight: bold; color: #111; margin: 0 0 16px 0; }
.form-area label { display: block; margin-bottom: 8px; font-size: 12px; color: #555; font-weight: bold; }
.modern-input { width: 100%; box-sizing: border-box; background: #F9F8F5; border: 2px solid transparent; color: #111; padding: 12px; border-radius: 12px; font-size: 13px; transition: border 0.2s; outline: none; }
.modern-input:focus { border-color: #FFD23F; background: #FFF; }
.location-text { margin: 12px 0 0; font-size: 13px; color: #666; }

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
  padding: 12px; border-radius: 30px;
  font-weight: bold; cursor: pointer; font-size: 15px;
  transition: transform 0.2s;
  white-space: nowrap;
}
.btn-publish:hover:not(:disabled) { transform: scale(1.02); }
.btn-publish:disabled { background: #EAE6DF; color: #999; cursor: not-allowed; }
.success-bg { background: #4CAF50; }
.success-bg:hover:not(:disabled) { background: #43A047; }

.published-badge { background: #E8F5E9; color: #4CAF50; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; white-space: nowrap; }
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
.panel-title { margin: 0 0 6px 0; font-size: 20px; font-weight: bold; color: #111; }
.summary-empty {
  text-align: center;
  padding: 32px 0;
  min-height: 160px;
  color: #888;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.empty-icon { font-size: 34px; margin-bottom: 10px; opacity: 0.5; }

.full-width { width: 100%; box-sizing: border-box; }
.mt-12 { margin-top: 12px; }
.mt-16 { margin-top: 16px; }
.mt-24 { margin-top: 24px; }
</style>