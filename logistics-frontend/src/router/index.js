import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/customer',
    name: 'CustomerLayout',
    component: () => import('../views/customer/Dashboard.vue'),
    meta: { title: '客户（4S店）', requiresAuth: true, role: 'customer' },
    children: [
      {
        path: '',
        redirect: '/customer/orders'
      },
      {
        path: 'orders',
        name: 'CustomerOrders',
        component: () => import('../views/customer/OrderList.vue'),
        meta: { title: '订单管理' }
      }
    ]
  },
  {
    path: '/shipper',
    name: 'ShipperLayout',
    component: () => import('../views/shipper/Dashboard.vue'),
    meta: { title: '发运商', requiresAuth: true, role: 'shipper' },
    children: [
      {
        path: '',
        redirect: '/shipper/shipments'
      },
      {
        path: 'shipments',
        name: 'ShipperShipments',
        component: () => import('../views/shipper/ShipmentManage.vue'),
        meta: { title: '发运管理' }
      }
    ]
  },
  {
    path: '/carrier',
    name: 'CarrierLayout',
    component: () => import('../views/carrier/Dashboard.vue'),
    meta: { title: '承运商（司机）', requiresAuth: true, role: 'carrier' },
    children: [
      {
        path: '',
        redirect: '/carrier/tasks'
      },
      {
        path: 'tasks',
        name: 'CarrierTasks',
        component: () => import('../views/carrier/TransportTasks.vue'),
        meta: { title: '运输任务' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: { template: '<div>404 - 页面不存在</div>' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '物流管理系统'

  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.role && to.meta.role !== userRole) {
    next('/login')
  } else {
    next()
  }
})

export default router
