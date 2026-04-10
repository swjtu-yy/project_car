<template>
  <div class="shipment-management">
    <h1>发运管理</h1>
    
    <div class="section">
      <h2>📋 待接收订单</h2>
      <div class="order-list" v-if="pendingOrders.length > 0">
        <div class="order-card" v-for="order in pendingOrders" :key="order.id">
          <div class="order-header">
            <span class="order-id">订单号: {{ order.id }}</span>
            <button class="accept-btn" @click="acceptOrder(order)">接收订单</button>
          </div>
          <div class="order-info">
            <p><strong>车型:</strong> {{ order.carModel }}</p>
            <p><strong>数量:</strong> {{ order.quantity }} 辆</p>
            <p><strong>目的地:</strong> {{ order.destination }}</p>
            <p><strong>运输方式:</strong> {{ order.transportType }}</p>
            <p><strong>客户:</strong> {{ order.customer }}</p>
            <p><strong>下单时间:</strong> {{ order.createTime }}</p>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else>
        <p>暂无待接收订单</p>
      </div>
    </div>

    <div class="section" v-if="selectedOrder">
      <h2>🚗 车辆信息绑定</h2>
      <div class="binding-form">
        <div class="current-order">
          <h3>当前处理订单: {{ selectedOrder.id }}</h3>
          <p>车型: {{ selectedOrder.carModel }} | 数量: {{ selectedOrder.quantity }} 辆</p>
        </div>
        
        <div class="form-group">
          <label>输入车身码 (VIN):</label>
          <input 
            v-model="vinCode" 
            type="text" 
            placeholder="请输入17位车身码"
            maxlength="17"
            class="vin-input"
            @blur="verifyVin"
          />
          <span class="vin-status" v-if="vinVerified">✅ 验证成功</span>
          <span class="vin-status error" v-if="vinError">❌ {{ vinError }}</span>
        </div>

        <div class="vehicle-info" v-if="vehicleInfo">
          <h4>车辆信息</h4>
          <p><strong>车架号:</strong> {{ vehicleInfo.vin }}</p>
          <p><strong>品牌:</strong> {{ vehicleInfo.brand }}</p>
          <p><strong>型号:</strong> {{ vehicleInfo.model }}</p>
          <p><strong>颜色:</strong> {{ vehicleInfo.color }}</p>
          <p><strong>发动机号:</strong> {{ vehicleInfo.engineNo }}</p>
        </div>

        <div class="bound-vehicles" v-if="boundVehicles.length > 0">
          <h4>已绑定车辆 ({{ boundVehicles.length }}/{{ selectedOrder.quantity }})</h4>
          <div class="vehicle-tag" v-for="(vehicle, index) in boundVehicles" :key="index">
            <span>{{ vehicle.vin }} - {{ vehicle.brand }} {{ vehicle.model }}</span>
            <button class="remove-btn" @click="removeVehicle(index)">×</button>
          </div>
        </div>

        <div class="form-actions">
          <button 
            class="bind-btn" 
            @click="bindVehicle"
            :disabled="!vinVerified || boundVehicles.length >= selectedOrder.quantity"
          >
            绑定车辆
          </button>
          <button 
            class="publish-btn" 
            @click="publishOrder"
            :disabled="boundVehicles.length < selectedOrder.quantity"
          >
            发布订单 (已绑定 {{ boundVehicles.length }}/{{ selectedOrder.quantity }} 辆)
          </button>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>📦 已发布订单</h2>
      <div class="order-list" v-if="publishedOrders.length > 0">
        <div class="order-card published" v-for="order in publishedOrders" :key="order.id">
          <div class="order-header">
            <span class="order-id">订单号: {{ order.id }}</span>
            <span class="status-badge">已发布</span>
          </div>
          <div class="order-info">
            <p><strong>车型:</strong> {{ order.carModel }}</p>
            <p><strong>数量:</strong> {{ order.quantity }} 辆</p>
            <p><strong>目的地:</strong> {{ order.destination }}</p>
            <p><strong>运输方式:</strong> {{ order.transportType }}</p>
            <p><strong>绑定车辆数:</strong> {{ order.boundVehicles?.length || 0 }} 辆</p>
            <p><strong>发布时间:</strong> {{ order.publishTime }}</p>
          </div>
          <div class="vehicle-list" v-if="order.boundVehicles">
            <h5>绑定车辆:</h5>
            <div class="vehicle-item" v-for="vehicle in order.boundVehicles" :key="vehicle.vin">
              {{ vehicle.vin }} - {{ vehicle.brand }} {{ vehicle.model }}
            </div>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else>
        <p>暂无已发布订单</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const pendingOrders = ref([
  {
    id: 'ORD20260410001',
    carModel: '轿车 A级',
    quantity: 3,
    destination: '北京',
    transportType: '铁路运输',
    customer: '成都4S店',
    createTime: '2026-04-10 10:30:00'
  },
  {
    id: 'ORD20260410002',
    carModel: 'SUV B级',
    quantity: 2,
    destination: '上海',
    transportType: '公路运输',
    customer: '广州4S店',
    createTime: '2026-04-10 11:15:00'
  },
  {
    id: 'ORD20260410003',
    carModel: '新能源车',
    quantity: 5,
    destination: '深圳',
    transportType: '公路运输',
    customer: '武汉4S店',
    createTime: '2026-04-10 12:00:00'
  }
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
  vinCode.value = ''
  vinVerified.value = false
  vinError.value = ''
  vehicleInfo.value = null
  boundVehicles.value = []
  
  const index = pendingOrders.value.findIndex(o => o.id === order.id)
  if (index > -1) {
    pendingOrders.value.splice(index, 1)
  }
  
  alert(`已接收订单 ${order.id}`)
}

const verifyVin = () => {
  vinError.value = ''
  vinVerified.value = false
  vehicleInfo.value = null
  
  if (!vinCode.value) {
    return
  }
  
  if (vinCode.value.length !== 17) {
    vinError.value = '车身码必须为17位'
    return
  }
  
  if (boundVehicles.value.some(v => v.vin === vinCode.value)) {
    vinError.value = '该车辆已绑定'
    return
  }
  
  const vehicle = vehicleDatabase[vinCode.value]
  if (vehicle) {
    vehicleInfo.value = vehicle
    vinVerified.value = true
  } else {
    vinError.value = '未找到该车辆信息'
  }
}

const bindVehicle = () => {
  if (!vinVerified.value || !vehicleInfo.value) {
    alert('请先验证车身码')
    return
  }
  
  if (boundVehicles.value.length >= selectedOrder.value.quantity) {
    alert('已达到订单数量上限')
    return
  }
  
  boundVehicles.value.push({ ...vehicleInfo.value })
  
  vinCode.value = ''
  vinVerified.value = false
  vehicleInfo.value = null
  vinError.value = ''
  
  alert('车辆绑定成功！')
}

const removeVehicle = (index) => {
  boundVehicles.value.splice(index, 1)
}

const publishOrder = () => {
  if (boundVehicles.value.length < selectedOrder.value.quantity) {
    const remaining = selectedOrder.value.quantity - boundVehicles.value.length
    alert(`请绑定所有车辆 (还需绑定 ${remaining} 辆)`)
    return
  }
  
  const publishedOrder = {
    ...selectedOrder.value,
    boundVehicles: [...boundVehicles.value],
    publishTime: new Date().toLocaleString('zh-CN'),
    status: 'published'
  }
  
  publishedOrders.value.unshift(publishedOrder)
  
  alert(`订单 ${selectedOrder.value.id} 发布成功！`)
  
  selectedOrder.value = null
  vinCode.value = ''
  vinVerified.value = false
  vehicleInfo.value = null
  boundVehicles.value = []
}
</script>

<style scoped>
.shipment-management { max-width: 1200px; margin: 0 auto; }
h1 { color: #2c3e50; margin-bottom: 30px; }
h2 { color: #34495e; margin-bottom: 20px; font-size: 22px; }
.section { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 25px; }
.order-list { display: grid; gap: 15px; }
.order-card { border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; transition: all 0.3s; }
.order-card:hover { border-color: #27ae60; box-shadow: 0 4px 12px rgba(39,174,96,0.2); }
.order-card.published { border-color: #27ae60; background: linear-gradient(135deg, #27ae6010 0%, #2ecc7110 100%); }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
.order-id { font-weight: bold; color: #333; font-size: 16px; }
.accept-btn { background: #27ae60; color: white; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background 0.3s; }
.accept-btn:hover { background: #229954; }
.order-info p { margin: 8px 0; color: #555; }
.order-info strong { color: #333; }
.empty-state { text-align: center; padding: 40px; color: #999; font-size: 16px; }
.binding-form { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px; }
.current-order { background: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #27ae60; }
.current-order h3 { margin: 0 0 10px 0; color: #27ae60; }
.current-order p { margin: 0; color: #666; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; }
.vin-input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 5px; font-size: 16px; font-family: monospace; letter-spacing: 1px; }
.vin-input:focus { outline: none; border-color: #27ae60; }
.vin-status { display: inline-block; margin-top: 8px; font-size: 14px; }
.vin-status.error { color: #e74c3c; }
.vehicle-info { background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #27ae60; }
.vehicle-info h4 { margin: 0 0 10px 0; color: #27ae60; }
.vehicle-info p { margin: 6px 0; color: #555; }
.bound-vehicles { margin-bottom: 20px; }
.bound-vehicles h4 { color: #333; margin-bottom: 10px; }
.vehicle-tag { display: inline-flex; align-items: center; gap: 10px; background: #27ae60; color: white; padding: 8px 12px; border-radius: 20px; margin: 5px; font-size: 14px; }
.remove-btn { background: rgba(255,255,255,0.3); border: none; color: white; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 18px; line-height: 1; }
.remove-btn:hover { background: rgba(255,255,255,0.5); }
.form-actions { display: flex; gap: 15px; margin-top: 20px; }
.bind-btn { flex: 1; background: #3498db; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; }
.bind-btn:hover:not(:disabled) { background: #2980b9; }
.bind-btn:disabled { background: #bdc3c7; cursor: not-allowed; }
.publish-btn { flex: 2; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; }
.publish-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(39,174,96,0.4); }
.publish-btn:disabled { background: #bdc3c7; cursor: not-allowed; }
.status-badge { background: #27ae60; color: white; padding: 5px 15px; border-radius: 15px; font-size: 14px; font-weight: bold; }
.vehicle-list { margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; }
.vehicle-list h5 { color: #555; margin-bottom: 10px; }
.vehicle-item { background: white; padding: 8px 12px; border-radius: 5px; margin-bottom: 5px; font-size: 14px; color: #666; border: 1px solid #e0e0e0; }
</style>