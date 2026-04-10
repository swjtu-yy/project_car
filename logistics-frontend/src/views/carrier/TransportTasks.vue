<template>
  <div class="transport-tasks">
    <h1>运输任务</h1>

    <div class="section">
      <h2>📋 待接收订单</h2>
      <div class="order-list" v-if="availableOrders.length > 0">
        <div class="order-card" v-for="order in availableOrders" :key="order.id">
          <div class="order-header">
            <span class="order-id">订单号: {{ order.id }}</span>
            <button class="accept-btn" @click="acceptOrder(order)">接收订单</button>
          </div>
          <div class="order-info">
            <p><strong>车型:</strong> {{ order.carModel }}</p>
            <p><strong>数量:</strong> {{ order.quantity }} 辆</p>
            <p><strong>目的地:</strong> {{ order.destination }}</p>
            <p><strong>运输方式:</strong> {{ order.transportType }}</p>
            <p><strong>发运商:</strong> {{ order.shipper }}</p>
            <p><strong>发布时间:</strong> {{ order.publishTime }}</p>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else>
        <p>暂无可接收订单</p>
      </div>
    </div>

    <div class="section" v-if="currentTask">
      <h2>🚛 当前运输任务</h2>
      <div class="task-info">
        <div class="task-header">
          <h3>订单: {{ currentTask.orderId }}</h3>
          <span class="status-badge" :class="currentTask.status">{{ getStatusText(currentTask.status) }}</span>
        </div>

        <div class="task-details">
          <p><strong>车型:</strong> {{ currentTask.carModel }}</p>
          <p><strong>数量:</strong> {{ currentTask.quantity }} 辆</p>
          <p><strong>目的地:</strong> {{ currentTask.destination }}</p>
          <p><strong>车身码列表:</strong></p>
          <div class="vin-list">
            <span class="vin-tag" v-for="(vin, index) in currentTask.vins" :key="index">{{ vin }}</span>
          </div>
        </div>

        <div class="location-section" v-if="currentTask.status === 'transporting'">
          <h4>📍 位置上报</h4>
          <div class="form-group">
            <label>输入车身码定位:</label>
            <input
              v-model="locationVin"
              type="text"
              placeholder="请输入车身码"
              class="vin-input"
            />
          </div>
          <div class="form-group">
            <label>当前位置:</label>
            <input
              v-model="currentLocation"
              type="text"
              placeholder="例如: 京港澳高速 K1234"
              class="location-input"
            />
          </div>
          <button class="report-btn" @click="reportLocation" :disabled="!locationVin || !currentLocation">
            上报位置
          </button>

          <div class="location-history" v-if="locationHistory.length > 0">
            <h5>位置记录:</h5>
            <div class="location-item" v-for="(loc, index) in locationHistory" :key="index">
              <span class="loc-vin">{{ loc.vin }}</span>
              <span class="loc-position">{{ loc.location }}</span>
              <span class="loc-time">{{ loc.time }}</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button
            v-if="currentTask.status === 'accepted'"
            class="start-btn"
            @click="startTransport"
          >
            开始运输
          </button>
          <button
            v-if="currentTask.status === 'transporting'"
            class="complete-btn"
            @click="confirmDelivery"
          >
            确认已送达
          </button>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>✅ 已完成订单</h2>
      <div class="order-list" v-if="completedTasks.length > 0">
        <div class="order-card completed" v-for="task in completedTasks" :key="task.orderId">
          <div class="order-header">
            <span class="order-id">订单号: {{ task.orderId }}</span>
            <span class="status-badge completed">已完成</span>
          </div>
          <div class="order-info">
            <p><strong>车型:</strong> {{ task.carModel }}</p>
            <p><strong>数量:</strong> {{ task.quantity }} 辆</p>
            <p><strong>目的地:</strong> {{ task.destination }}</p>
            <p><strong>完成时间:</strong> {{ task.completeTime }}</p>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else>
        <p>暂无已完成订单</p>
      </div>
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
.transport-tasks { max-width: 1200px; margin: 0 auto; }
h1 { color: #2c3e50; margin-bottom: 30px; }
h2 { color: #34495e; margin-bottom: 20px; font-size: 22px; }
.section { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 25px; }
.order-list { display: grid; gap: 15px; }
.order-card { border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; transition: all 0.3s; }
.order-card:hover { border-color: #3498db; box-shadow: 0 4px 12px rgba(52,152,219,0.2); }
.order-card.completed { border-color: #27ae60; background: linear-gradient(135deg, #27ae6010 0%, #2ecc7110 100%); }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
.order-id { font-weight: bold; color: #333; font-size: 16px; }
.accept-btn { background: #3498db; color: white; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background 0.3s; }
.accept-btn:hover { background: #2980b9; }
.order-info p { margin: 8px 0; color: #555; }
.order-info strong { color: #333; }
.empty-state { text-align: center; padding: 40px; color: #999; font-size: 16px; }
.task-info { background: #f8f9fa; padding: 20px; border-radius: 8px; }
.task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #3498db; }
.task-header h3 { margin: 0; color: #3498db; }
.task-details p { margin: 10px 0; color: #555; }
.task-details strong { color: #333; }
.vin-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.vin-tag { background: #3498db; color: white; padding: 5px 12px; border-radius: 15px; font-size: 13px; font-family: monospace; }
.location-section { margin-top: 25px; padding-top: 20px; border-top: 2px solid #e0e0e0; }
.location-section h4 { color: #34495e; margin-bottom: 15px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; }
.vin-input, .location-input { width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 5px; font-size: 14px; }
.vin-input:focus, .location-input:focus { outline: none; border-color: #3498db; }
.report-btn { width: 100%; background: #3498db; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; margin-top: 10px; }
.report-btn:hover:not(:disabled) { background: #2980b9; }
.report-btn:disabled { background: #bdc3c7; cursor: not-allowed; }
.location-history { margin-top: 20px; }
.location-history h5 { color: #555; margin-bottom: 10px; }
.location-item { display: flex; justify-content: space-between; align-items: center; background: white; padding: 10px 15px; border-radius: 5px; margin-bottom: 8px; border: 1px solid #e0e0e0; }
.loc-vin { font-family: monospace; color: #3498db; font-weight: bold; }
.loc-position { flex: 1; margin: 0 15px; color: #555; }
.loc-time { color: #999; font-size: 13px; }
.action-buttons { margin-top: 25px; display: flex; gap: 15px; }
.start-btn, .complete-btn { flex: 1; padding: 14px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; color: white; }
.start-btn { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); }
.start-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(243,156,18,0.4); }
.complete-btn { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); }
.complete-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(39,174,96,0.4); }
.status-badge { padding: 5px 15px; border-radius: 15px; font-size: 14px; font-weight: bold; color: white; }
.status-badge.accepted { background: #f39c12; }
.status-badge.transporting { background: #3498db; }
.status-badge.completed { background: #27ae60; }
</style>
