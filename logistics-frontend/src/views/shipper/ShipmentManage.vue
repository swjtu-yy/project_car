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
                  <p>目的地: <strong>{{ order.destination }}</strong></p>
                  <p>客户: {{ order.customer }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else>
            <div class="empty-icon">📭</div>
            <p>暂无待接收订单</p>
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
                <span class="h-id">{{ order.id }}</span>
                <span class="h-desc">{{ order.carModel }} · {{ order.quantity }}辆</span>
              </div>
              <span class="h-time">{{ order.publishTime }}</span>
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
            <div class="progress-pill">已绑定 {{ boundVehicles.length }}/{{ selectedOrder.quantity }}</div>
          </div>

          <div class="task-overview">
            <p>正在处理: <strong>{{ selectedOrder.id }}</strong></p>
            <p>需发运: {{ selectedOrder.carModel }} × {{ selectedOrder.quantity }} 辆</p>
          </div>

          <div class="form-area">
            <label>输入车身码 (VIN):</label>
            <div class="input-with-status">
              <input
                v-model="vinCode"
                type="text"
                placeholder="请输入17位车身码"
                maxlength="17"
                class="dark-input"
                @blur="verifyVin"
              />
              <div class="status-msg">
                <span v-if="vinVerified" class="msg-success">✔ 验证成功</span>
                <span v-if="vinError" class="msg-error">✖ {{ vinError }}</span>
              </div>
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
              确认绑定
            </button>
          </div>

          <div class="tags-area" v-if="boundVehicles.length > 0">
            <p class="area-label">已选车辆</p>
            <div class="dark-tag" v-for="(vehicle, index) in boundVehicles" :key="index">
              <span>{{ vehicle.vin.slice(-6) }} - {{ vehicle.model }}</span>
              <button class="remove-icon" @click="removeVehicle(index)">×</button>
            </div>
          </div>

          <button
            class="btn-dark-primary full-width mt-20"
            @click="publishOrder"
            :disabled="boundVehicles.length < selectedOrder.quantity"
          >
            完成并发布
          </button>
        </div>
      </aside>
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

.row-top { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #EAE6DF; padding-bottom: 12px; margin-bottom: 16px; }
.order-id { font-weight: bold; font-size: 15px; color: #111; }

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
.history-row { display: flex; align-items: center; background: #F9F8F5; padding: 12px 20px; border-radius: 12px; }
.status-dot { width: 8px; height: 8px; background: #FFD23F; border-radius: 50%; margin-right: 16px; }
.history-info { flex: 1; display: flex; gap: 16px; align-items: center; }
.h-id { font-weight: bold; font-size: 14px; color: #111; }
.h-desc { font-size: 13px; color: #666; }
.h-time { font-size: 12px; color: #999; }

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
.input-with-status { margin-bottom: 16px; }
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