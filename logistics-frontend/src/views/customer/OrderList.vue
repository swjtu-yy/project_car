<template>
  <div class="order-list">
    <h1>订单管理</h1>
    <p>这里是4S店订单列表页面</p>
  </div>
</template>
<template>
  <div class="order-management">
    <h1>订单管理</h1>

    <!-- 新建订单表单 -->
    <div class="order-form">
      <h2>新建订单</h2>

      <!-- 选择车型及数量 -->
      <div class="form-section">
        <h3>1. 选择车型及数量</h3>
        <div class="car-models">
          <div
            v-for="model in carModels"
            :key="model.id"
            class="car-model-card"
            :class="{ selected: selectedModel?.id === model.id }"
            @click="selectModel(model)"
          >
            <img :src="model.image" :alt="model.name" class="car-image" />
            <h4>{{ model.name }}</h4>
            <p class="price">单价: ¥{{ model.unitPrice }}/辆</p>
            <div class="quantity-control" v-if="selectedModel?.id === model.id">
              <button @click.stop="decreaseQuantity" :disabled="quantity <= 1">-</button>
              <span>{{ quantity }}</span>
              <button @click.stop="increaseQuantity">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 选择目的地 -->
      <div class="form-section" v-if="selectedModel">
        <h3>2. 选择目的地</h3>
        <select v-model="destination" class="destination-select">
          <option value="">请选择目的地城市</option>
          <option v-for="city in destinations" :key="city.id" :value="city">
            {{ city.name }} (距离: {{ city.distance }}km)
          </option>
        </select>
      </div>

      <!-- 运输方式推荐 -->
      <div class="form-section" v-if="selectedModel && destination">
        <h3>3. 运输方式选择</h3>

        <div class="cost-calculation">
          <p><strong>订单信息：</strong></p>
          <p>车型: {{ selectedModel.name }}</p>
          <p>数量: {{ quantity }} 辆</p>
          <p>目的地: {{ destination.name }}</p>
          <p>距离: {{ destination.distance }} km</p>
        </div>

        <div class="transport-options">
          <div
            class="transport-card"
            :class="{
              selected: selectedTransport === 'railway',
              recommended: railwayCost < roadCost
            }"
            @click="selectTransport('railway')"
          >
            <div class="transport-header">
              <h4>🚂 铁路运输</h4>
              <span v-if="railwayCost < roadCost" class="recommended-badge">推荐</span>
            </div>
            <p class="transport-price">¥{{ railwayCost }}</p>
            <p class="transport-time">预计时间: {{ railwayTime }} 天</p>
            <p class="transport-desc">适合长途运输，成本较低</p>
          </div>

          <div
            class="transport-card"
            :class="{
              selected: selectedTransport === 'road',
              recommended: roadCost < railwayCost
            }"
            @click="selectTransport('road')"
          >
            <div class="transport-header">
              <h4>🚛 公路运输</h4>
              <span v-if="roadCost < railwayCost" class="recommended-badge">推荐</span>
            </div>
            <p class="transport-price">¥{{ roadCost }}</p>
            <p class="transport-time">预计时间: {{ roadTime }} 天</p>
            <p class="transport-desc">灵活快捷，门到门服务</p>
          </div>
        </div>

        <div v-if="selectedTransport" class="savings-tip">
          <p v-if="railwayCost < roadCost">
            💡 选择铁路运输可节省 ¥{{ roadCost - railwayCost }}
          </p>
          <p v-else>
            💡 选择公路运输可节省 ¥{{ railwayCost - roadCost }}
          </p>
        </div>
      </div>

      <!-- 提交订单按钮 -->
      <div class="form-actions" v-if="selectedTransport">
        <button class="submit-btn" @click="submitOrder">
          确认下单 (总计: ¥{{ totalCost }})
        </button>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list" v-if="orders.length > 0">
      <h2>我的订单</h2>
      <div class="order-card" v-for="order in orders" :key="order.id">
        <div class="order-header">
          <span class="order-id">订单号: {{ order.id }}</span>
          <span class="order-status" :class="order.status">{{ order.statusText }}</span>
        </div>
        <div class="order-details">
          <p>车型: {{ order.carModel }}</p>
          <p>数量: {{ order.quantity }} 辆</p>
          <p>目的地: {{ order.destination }}</p>
          <p>运输方式: {{ order.transportType }}</p>
          <p>总费用: ¥{{ order.totalCost }}</p>
          <p>下单时间: {{ order.createTime }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 车型数据
const carModels = ref([
  {
    id: 1,
    name: '轿车 A级',
    unitPrice: 800,
    image: 'https://via.placeholder.com/150?text=轿车A级'
  },
  {
    id: 2,
    name: 'SUV B级',
    unitPrice: 1000,
    image: 'https://via.placeholder.com/150?text=SUV+B级'
  },
  {
    id: 3,
    name: '豪华车 C级',
    unitPrice: 1500,
    image: 'https://via.placeholder.com/150?text=豪华车C级'
  },
  {
    id: 4,
    name: '新能源车',
    unitPrice: 900,
    image: 'https://via.placeholder.com/150?text=新能源车'
  }
])

// 目的地数据
const destinations = ref([
  { id: 1, name: '北京', distance: 1500 },
  { id: 2, name: '上海', distance: 1200 },
  { id: 3, name: '广州', distance: 800 },
  { id: 4, name: '深圳', distance: 900 },
  { id: 5, name: '成都', distance: 600 },
  { id: 6, name: '武汉', distance: 400 },
  { id: 7, name: '西安', distance: 700 },
  { id: 8, name: '杭州', distance: 1100 }
])

// 表单状态
const selectedModel = ref(null)
const quantity = ref(1)
const destination = ref(null)
const selectedTransport = ref(null)

// 订单列表
const orders = ref([])

// 计算铁路运输成本
const railwayCost = computed(() => {
  if (!selectedModel.value || !destination.value) return 0
  const baseCost = selectedModel.value.unitPrice * quantity.value
  const distanceFactor = destination.value.distance * 0.3
  return Math.round(baseCost + distanceFactor)
})

// 计算公路运输成本
const roadCost = computed(() => {
  if (!selectedModel.value || !destination.value) return 0
  const baseCost = selectedModel.value.unitPrice * quantity.value
  const distanceFactor = destination.value.distance * 0.5
  return Math.round(baseCost + distanceFactor)
})

// 铁路运输时间
const railwayTime = computed(() => {
  if (!destination.value) return 0
  return Math.ceil(destination.value.distance / 500)
})

// 公路运输时间
const roadTime = computed(() => {
  if (!destination.value) return 0
  return Math.ceil(destination.value.distance / 800)
})

// 总费用
const totalCost = computed(() => {
  if (selectedTransport.value === 'railway') {
    return railwayCost.value
  } else if (selectedTransport.value === 'road') {
    return roadCost.value
  }
  return 0
})

// 选择车型
const selectModel = (model) => {
  if (selectedModel.value?.id === model.id) {
    selectedModel.value = null
    quantity.value = 1
  } else {
    selectedModel.value = model
    quantity.value = 1
  }
  destination.value = null
  selectedTransport.value = null
}

// 增加数量
const increaseQuantity = () => {
  quantity.value++
}

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 选择运输方式
const selectTransport = (type) => {
  selectedTransport.value = type
}

// 提交订单
const submitOrder = () => {
  const newOrder = {
    id: 'ORD' + Date.now(),
    carModel: selectedModel.value.name,
    quantity: quantity.value,
    destination: destination.value.name,
    transportType: selectedTransport.value === 'railway' ? '铁路运输' : '公路运输',
    totalCost: totalCost.value,
    status: 'pending',
    statusText: '待处理',
    createTime: new Date().toLocaleString('zh-CN')
  }

  orders.value.unshift(newOrder)

  alert(`订单提交成功！\n订单号: ${newOrder.id}\n总费用: ¥${newOrder.totalCost}`)

  // 重置表单
  selectedModel.value = null
  quantity.value = 1
  destination.value = null
  selectedTransport.value = null
}
</script>

<style scoped>
.order-management {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}

h2 {
  color: #34495e;
  margin-bottom: 20px;
}

.order-form {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section h3 {
  color: #555;
  margin-bottom: 15px;
  font-size: 18px;
}

/* 车型选择 */
.car-models {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.car-model-card {
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.car-model-card:hover {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.car-model-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.car-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 10px;
}

.car-model-card h4 {
  margin: 10px 0;
  color: #333;
}

.price {
  color: #e74c3c;
  font-weight: bold;
  font-size: 16px;
}

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

.quantity-control button {
  width: 35px;
  height: 35px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 5px;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.quantity-control button:hover:not(:disabled) {
  background: #5568d3;
}

.quantity-control button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.quantity-control span {
  font-size: 20px;
  font-weight: bold;
  min-width: 40px;
}

/* 目的地选择 */
.destination-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.destination-select:focus {
  outline: none;
  border-color: #667eea;
}

/* 成本计算展示 */
.cost-calculation {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.cost-calculation p {
  margin: 5px 0;
  color: #555;
}

/* 运输方式选择 */
.transport-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.transport-card {
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.transport-card:hover {
  border-color: #667eea;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.transport-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.transport-card.recommended {
  border-color: #27ae60;
  border-width: 3px;
}

.transport-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.transport-header h4 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.recommended-badge {
  background: #27ae60;
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.transport-price {
  font-size: 32px;
  font-weight: bold;
  color: #e74c3c;
  margin: 15px 0;
}

.transport-time {
  color: #666;
  margin: 10px 0;
}

.transport-desc {
  color: #999;
  font-size: 14px;
}

.savings-tip {
  background: linear-gradient(135deg, #27ae6020 0%, #2ecc7120 100%);
  border-left: 4px solid #27ae60;
  padding: 15px;
  border-radius: 5px;
  margin-top: 15px;
}

.savings-tip p {
  margin: 0;
  color: #27ae60;
  font-weight: bold;
  font-size: 16px;
}

/* 提交按钮 */
.form-actions {
  margin-top: 30px;
  text-align: center;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 50px;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  font-weight: bold;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

/* 订单列表 */
.orders-list {
  margin-top: 30px;
}

.order-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.order-id {
  font-weight: bold;
  color: #333;
}

.order-status {
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: bold;
}

.order-status.pending {
  background: #fff3cd;
  color: #856404;
}

.order-details p {
  margin: 8px 0;
  color: #666;
}
</style>

<script setup>
</script><template>
  <div class="order-management">
    <h1>订单管理</h1>

    <!-- 新建订单表单 -->
    <div class="order-form">
      <h2>新建订单</h2>

      <!-- 选择车型及数量 -->
      <div class="form-section">
        <h3>1. 选择车型及数量</h3>
        <div class="car-models">
          <div
            v-for="model in carModels"
            :key="model.id"
            class="car-model-card"
            :class="{ selected: selectedModel?.id === model.id }"
            @click="selectModel(model)"
          >
            <img :src="model.image" :alt="model.name" class="car-image" />
            <h4>{{ model.name }}</h4>
            <p class="price">单价: ¥{{ model.unitPrice }}/辆</p>
            <div class="quantity-control" v-if="selectedModel?.id === model.id">
              <button @click.stop="decreaseQuantity" :disabled="quantity <= 1">-</button>
              <span>{{ quantity }}</span>
              <button @click.stop="increaseQuantity">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 选择目的地 -->
      <div class="form-section" v-if="selectedModel">
        <h3>2. 选择目的地</h3>
        <select v-model="destination" class="destination-select">
          <option value="">请选择目的地城市</option>
          <option v-for="city in destinations" :key="city.id" :value="city">
            {{ city.name }} (距离: {{ city.distance }}km)
          </option>
        </select>
      </div>

      <!-- 运输方式推荐 -->
      <div class="form-section" v-if="selectedModel && destination">
        <h3>3. 运输方式选择</h3>

        <div class="cost-calculation">
          <p><strong>订单信息：</strong></p>
          <p>车型: {{ selectedModel.name }}</p>
          <p>数量: {{ quantity }} 辆</p>
          <p>目的地: {{ destination.name }}</p>
          <p>距离: {{ destination.distance }} km</p>
        </div>

        <div class="transport-options">
          <div
            class="transport-card"
            :class="{
              selected: selectedTransport === 'railway',
              recommended: railwayCost < roadCost
            }"
            @click="selectTransport('railway')"
          >
            <div class="transport-header">
              <h4>🚂 铁路运输</h4>
              <span v-if="railwayCost < roadCost" class="recommended-badge">推荐</span>
            </div>
            <p class="transport-price">¥{{ railwayCost }}</p>
            <p class="transport-time">预计时间: {{ railwayTime }} 天</p>
            <p class="transport-desc">适合长途运输，成本较低</p>
          </div>

          <div
            class="transport-card"
            :class="{
              selected: selectedTransport === 'road',
              recommended: roadCost < railwayCost
            }"
            @click="selectTransport('road')"
          >
            <div class="transport-header">
              <h4>🚛 公路运输</h4>
              <span v-if="roadCost < railwayCost" class="recommended-badge">推荐</span>
            </div>
            <p class="transport-price">¥{{ roadCost }}</p>
            <p class="transport-time">预计时间: {{ roadTime }} 天</p>
            <p class="transport-desc">灵活快捷，门到门服务</p>
          </div>
        </div>

        <div v-if="selectedTransport" class="savings-tip">
          <p v-if="railwayCost < roadCost">
            💡 选择铁路运输可节省 ¥{{ roadCost - railwayCost }}
          </p>
          <p v-else>
            💡 选择公路运输可节省 ¥{{ railwayCost - roadCost }}
          </p>
        </div>
      </div>

      <!-- 提交订单按钮 -->
      <div class="form-actions" v-if="selectedTransport">
        <button class="submit-btn" @click="submitOrder">
          确认下单 (总计: ¥{{ totalCost }})
        </button>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list" v-if="orders.length > 0">
      <h2>我的订单</h2>
      <div class="order-card" v-for="order in orders" :key="order.id">
        <div class="order-header">
          <span class="order-id">订单号: {{ order.id }}</span>
          <span class="order-status" :class="order.status">{{ order.statusText }}</span>
        </div>
        <div class="order-details">
          <p>车型: {{ order.carModel }}</p>
          <p>数量: {{ order.quantity }} 辆</p>
          <p>目的地: {{ order.destination }}</p>
          <p>运输方式: {{ order.transportType }}</p>
          <p>总费用: ¥{{ order.totalCost }}</p>
          <p>下单时间: {{ order.createTime }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 车型数据
const carModels = ref([
  {
    id: 1,
    name: '轿车 A级',
    unitPrice: 800,
    image: 'https://via.placeholder.com/150?text=轿车A级'
  },
  {
    id: 2,
    name: 'SUV B级',
    unitPrice: 1000,
    image: 'https://via.placeholder.com/150?text=SUV+B级'
  },
  {
    id: 3,
    name: '豪华车 C级',
    unitPrice: 1500,
    image: 'https://via.placeholder.com/150?text=豪华车C级'
  },
  {
    id: 4,
    name: '新能源车',
    unitPrice: 900,
    image: 'https://via.placeholder.com/150?text=新能源车'
  }
])

// 目的地数据
const destinations = ref([
  { id: 1, name: '北京', distance: 1500 },
  { id: 2, name: '上海', distance: 1200 },
  { id: 3, name: '广州', distance: 800 },
  { id: 4, name: '深圳', distance: 900 },
  { id: 5, name: '成都', distance: 600 },
  { id: 6, name: '武汉', distance: 400 },
  { id: 7, name: '西安', distance: 700 },
  { id: 8, name: '杭州', distance: 1100 }
])

// 表单状态
const selectedModel = ref(null)
const quantity = ref(1)
const destination = ref(null)
const selectedTransport = ref(null)

// 订单列表
const orders = ref([])

// 计算铁路运输成本
const railwayCost = computed(() => {
  if (!selectedModel.value || !destination.value) return 0
  const baseCost = selectedModel.value.unitPrice * quantity.value
  const distanceFactor = destination.value.distance * 0.3
  return Math.round(baseCost + distanceFactor)
})

// 计算公路运输成本
const roadCost = computed(() => {
  if (!selectedModel.value || !destination.value) return 0
  const baseCost = selectedModel.value.unitPrice * quantity.value
  const distanceFactor = destination.value.distance * 0.5
  return Math.round(baseCost + distanceFactor)
})

// 铁路运输时间
const railwayTime = computed(() => {
  if (!destination.value) return 0
  return Math.ceil(destination.value.distance / 500)
})

// 公路运输时间
const roadTime = computed(() => {
  if (!destination.value) return 0
  return Math.ceil(destination.value.distance / 800)
})

// 总费用
const totalCost = computed(() => {
  if (selectedTransport.value === 'railway') {
    return railwayCost.value
  } else if (selectedTransport.value === 'road') {
    return roadCost.value
  }
  return 0
})

// 选择车型
const selectModel = (model) => {
  if (selectedModel.value?.id === model.id) {
    selectedModel.value = null
    quantity.value = 1
  } else {
    selectedModel.value = model
    quantity.value = 1
  }
  destination.value = null
  selectedTransport.value = null
}

// 增加数量
const increaseQuantity = () => {
  quantity.value++
}

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 选择运输方式
const selectTransport = (type) => {
  selectedTransport.value = type
}

// 提交订单
const submitOrder = () => {
  const newOrder = {
    id: 'ORD' + Date.now(),
    carModel: selectedModel.value.name,
    quantity: quantity.value,
    destination: destination.value.name,
    transportType: selectedTransport.value === 'railway' ? '铁路运输' : '公路运输',
    totalCost: totalCost.value,
    status: 'pending',
    statusText: '待处理',
    createTime: new Date().toLocaleString('zh-CN')
  }

  orders.value.unshift(newOrder)

  alert(`订单提交成功！\n订单号: ${newOrder.id}\n总费用: ¥${newOrder.totalCost}`)

  // 重置表单
  selectedModel.value = null
  quantity.value = 1
  destination.value = null
  selectedTransport.value = null
}
</script>

<style scoped>
.order-management {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}

h2 {
  color: #34495e;
  margin-bottom: 20px;
}

.order-form {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section h3 {
  color: #555;
  margin-bottom: 15px;
  font-size: 18px;
}

/* 车型选择 */
.car-models {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.car-model-card {
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.car-model-card:hover {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.car-model-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.car-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 10px;
}

.car-model-card h4 {
  margin: 10px 0;
  color: #333;
}

.price {
  color: #e74c3c;
  font-weight: bold;
  font-size: 16px;
}

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

.quantity-control button {
  width: 35px;
  height: 35px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 5px;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.quantity-control button:hover:not(:disabled) {
  background: #5568d3;
}

.quantity-control button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.quantity-control span {
  font-size: 20px;
  font-weight: bold;
  min-width: 40px;
}

/* 目的地选择 */
.destination-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.destination-select:focus {
  outline: none;
  border-color: #667eea;
}

/* 成本计算展示 */
.cost-calculation {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.cost-calculation p {
  margin: 5px 0;
  color: #555;
}

/* 运输方式选择 */
.transport-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.transport-card {
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.transport-card:hover {
  border-color: #667eea;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.transport-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.transport-card.recommended {
  border-color: #27ae60;
  border-width: 3px;
}

.transport-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.transport-header h4 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.recommended-badge {
  background: #27ae60;
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.transport-price {
  font-size: 32px;
  font-weight: bold;
  color: #e74c3c;
  margin: 15px 0;
}

.transport-time {
  color: #666;
  margin: 10px 0;
}

.transport-desc {
  color: #999;
  font-size: 14px;
}

.savings-tip {
  background: linear-gradient(135deg, #27ae6020 0%, #2ecc7120 100%);
  border-left: 4px solid #27ae60;
  padding: 15px;
  border-radius: 5px;
  margin-top: 15px;
}

.savings-tip p {
  margin: 0;
  color: #27ae60;
  font-weight: bold;
  font-size: 16px;
}

/* 提交按钮 */
.form-actions {
  margin-top: 30px;
  text-align: center;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 50px;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  font-weight: bold;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

/* 订单列表 */
.orders-list {
  margin-top: 30px;
}

.order-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.order-id {
  font-weight: bold;
  color: #333;
}

.order-status {
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: bold;
}

.order-status.pending {
  background: #fff3cd;
  color: #856404;
}

.order-details p {
  margin: 8px 0;
  color: #666;
}
</style>


<style scoped>
.order-list {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
