<template>
  <div class="be-run-app-fullscreen-wrapper">
    <div class="app-container">
      <aside class="white-sidebar">
        <div class="logo-area">
          <div class="logo-icon">📦</div>
          <span class="logo-text">Be.run</span>
        </div>

        <nav class="nav-menu">
          <div class="nav-item active">🏠</div>
          <div class="nav-item">📋</div>
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
              <input type="text" placeholder="搜索功能" />
            </div>
            <button class="logout-pill">退出登录</button>
          </div>
        </header>

        <div class="page-title-area">
          <h2>新建车辆运输订单</h2>
          <p class="subtitle">选择车型、目的地及运输方案，快速生成发运单</p>
        </div>

        <div class="content-layout">
          <section class="form-column">
            <div class="white-card step-card">
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
            </div>

            <div class="white-card step-card" v-if="selectedModel">
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
            </div>

            <div class="white-card step-card" v-if="selectedModel && destination">
              <div class="step-header">
                <span class="step-num">3</span>
                <h3>运输方式选择</h3>
              </div>

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
            </div>
          </section>

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
                  :disabled="!selectedTransport"
                  @click="submitOrder"
                >
                  确认并生成订单
                </button>
              </div>

              <div class="summary-empty" v-else>
                <div class="empty-icon">📝</div>
                <p>请在左侧选择车型以开始测算订单明细。</p>
              </div>
            </div>

            <div class="history-section" v-if="orders.length > 0">
              <h3 class="history-title">最近提交</h3>
              <div class="mini-order-list">
                <div class="mini-order-card" v-for="order in orders" :key="order.id">
                  <div class="mo-header">
                    <span class="mo-id">{{ order.id }}</span>
                    <span class="mo-status">{{ order.statusText }}</span>
                  </div>
                  <div class="mo-body">
                    <p><strong>{{ order.carModel }}</strong> × {{ order.quantity }}辆</p>
                    <p class="mo-sub">发往 {{ order.destination }} ({{ order.transportType }})</p>
                  </div>
                  <div class="mo-footer">
                    <span class="mo-price">¥{{ order.totalCost }}</span>
                    <span class="mo-time">{{ order.createTime.split(' ')[0] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const carModels = ref([{ id: 1, name: '轿车 A级', unitPrice: 800, image: 'https://via.placeholder.com/150?text=轿车A级' }, { id: 2, name: 'SUV B级', unitPrice: 1000, image: 'https://via.placeholder.com/150?text=SUV+B级' }, { id: 3, name: '豪华车 C级', unitPrice: 1500, image: 'https://via.placeholder.com/150?text=豪华车C级' }, { id: 4, name: '新能源车', unitPrice: 900, image: 'https://via.placeholder.com/150?text=新能源车' }])
const destinations = ref([{ id: 1, name: '北京', distance: 1500 }, { id: 2, name: '上海', distance: 1200 }, { id: 3, name: '广州', distance: 800 }, { id: 4, name: '深圳', distance: 900 }, { id: 5, name: '成都', distance: 600 }, { id: 6, name: '武汉', distance: 400 }, { id: 7, name: '西安', distance: 700 }, { id: 8, name: '杭州', distance: 1100 }])
const selectedModel = ref(null)
const quantity = ref(1)
const destination = ref(null)
const selectedTransport = ref(null)
const orders = ref([])
const railwayCost = computed(() => { if (!selectedModel.value || !destination.value) return 0; return Math.round(selectedModel.value.unitPrice * quantity.value + destination.value.distance * 0.3) })
const roadCost = computed(() => { if (!selectedModel.value || !destination.value) return 0; return Math.round(selectedModel.value.unitPrice * quantity.value + destination.value.distance * 0.5) })
const railwayTime = computed(() => destination.value ? Math.ceil(destination.value.distance / 500) : 0)
const roadTime = computed(() => destination.value ? Math.ceil(destination.value.distance / 800) : 0)
const totalCost = computed(() => { if (selectedTransport.value === 'railway') return railwayCost.value; if (selectedTransport.value === 'road') return roadCost.value; return 0 })
const selectModel = (model) => { selectedModel.value = selectedModel.value?.id === model.id ? null : model; quantity.value = 1; destination.value = null; selectedTransport.value = null }
const increaseQuantity = () => { quantity.value++ }
const decreaseQuantity = () => { if (quantity.value > 1) quantity.value-- }
const selectTransport = (type) => { selectedTransport.value = type }
const submitOrder = () => { const newOrder = { id: 'ORD' + Date.now(), carModel: selectedModel.value.name, quantity: quantity.value, destination: destination.value.name, transportType: selectedTransport.value === 'railway' ? '铁路运输' : '公路运输', totalCost: totalCost.value, status: 'pending', statusText: '待处理', createTime: new Date().toLocaleString('zh-CN') }; orders.value.unshift(newOrder); alert('订单提交成功！订单号: ' + newOrder.id + ' 总费用: ¥' + newOrder.totalCost); selectedModel.value = null; quantity.value = 1; destination.value = null; selectedTransport.value = null }
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

/* ====== 左侧胶囊侧边栏 (保持一致) ====== */
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
.form-column { flex: 1; min-width: 0; }
.sidebar-column { width: 360px; display: flex; flex-direction: column; gap: 24px; }

/* ====== 通用白卡片 ====== */
.white-card { background: #FFFFFF; border-radius: 30px; padding: 32px; box-shadow: 0 8px 30px rgba(0,0,0,0.02); }
.step-card { margin-bottom: 24px; animation: slideIn 0.4s ease-out forwards; }
@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.step-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.step-num { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #111; color: #FFD23F; border-radius: 50%; font-weight: 900; font-size: 16px; }
.step-header h3 { font-size: 20px; margin: 0; font-weight: bold; color: #111; }

/* ====== 车型网格 ====== */
.car-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
.car-tile { background: #F9F8F5; border: 2px solid transparent; border-radius: 20px; overflow: hidden; cursor: pointer; transition: all 0.2s ease; position: relative; }
.car-tile:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
.car-tile.is-selected { border-color: #FFD23F; background: #FFF; box-shadow: 0 8px 20px rgba(255, 210, 63, 0.15); }
.tile-image-wrapper { position: relative; height: 130px; background: #EAE6DF; }
.car-image { width: 100%; height: 100%; object-fit: cover; mix-blend-mode: multiply; }
.check-icon { position: absolute; top: 12px; right: 12px; background: #FFD23F; color: #111; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; }
.tile-content { padding: 20px; text-align: center; }
.car-name { margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #111; }
.car-price { margin: 0; font-size: 18px; font-weight: 900; color: #111; }
.car-price .unit { font-size: 12px; color: #888; font-weight: normal; }

/* 数量选择 */
.quantity-wrapper { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px dashed #EAE6DF; }
.qty-btn { width: 36px; height: 36px; border: none; border-radius: 12px; background: #EAE6DF; color: #111; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.qty-btn:hover:not(:disabled) { background: #FFD23F; }
.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-num { font-weight: 900; font-size: 18px; min-width: 24px; }

/* ====== 目的地选择 ====== */
.input-label { display: block; font-size: 14px; font-weight: bold; color: #555; margin-bottom: 12px; }
.select-wrapper { position: relative; }
.modern-select { width: 100%; padding: 16px 20px; appearance: none; background: #F9F8F5; border: 2px solid #EAE6DF; border-radius: 16px; font-size: 15px; font-weight: 500; color: #111; transition: all 0.2s; cursor: pointer; outline: none; }
.modern-select:focus { border-color: #FFD23F; background: #FFF; }
.select-arrow { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); color: #888; pointer-events: none; font-size: 12px; }

/* ====== 运输方式 ====== */
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

/* ====== 右侧摘要面板 ====== */
.sticky-panel { position: sticky; top: 24px; }
.panel-title { margin: 0 0 24px 0; font-size: 20px; font-weight: bold; color: #111; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px; }
.s-label { color: #666; font-weight: bold; }
.s-value { font-weight: bold; color: #111; text-align: right; }
.s-value small { color: #888; font-weight: normal; }
.divider { height: 1px; background: #EAE6DF; margin: 24px 0; }
.summary-total { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; font-size: 16px; font-weight: bold; color: #666; }
.total-price { font-size: 32px; font-weight: 900; color: #111; }

.btn-publish { background: #111; color: #FFF; border: none; padding: 18px; border-radius: 30px; font-weight: bold; cursor: pointer; font-size: 16px; transition: transform 0.2s; }
.btn-publish:hover:not(:disabled) { transform: scale(1.02); }
.btn-publish:disabled { background: #EAE6DF; color: #999; cursor: not-allowed; }
.summary-empty { text-align: center; padding: 40px 0; color: #888; }
.empty-icon { font-size: 40px; margin-bottom: 16px; opacity: 0.5; }

/* ====== 侧边历史记录 ====== */
.history-section { background: transparent; }
.history-title { font-size: 16px; font-weight: bold; color: #111; margin: 0 0 16px 10px; }
.mini-order-list { display: flex; flex-direction: column; gap: 16px; }
.mini-order-card { background: #FFFFFF; border-radius: 20px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
.mo-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
.mo-id { font-family: monospace; font-weight: bold; color: #111; font-size: 14px; }
.mo-status { background: #FFF3E0; color: #EF6C00; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
.mo-body p { margin: 0 0 6px 0; color: #111; font-size: 14px; }
.mo-body .mo-sub { color: #666; font-size: 13px; }
.mo-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #EAE6DF; }
.mo-price { font-weight: 900; color: #111; font-size: 16px; }
.mo-time { color: #888; font-size: 12px; }
.full-width { width: 100%; box-sizing: border-box; }
</style>