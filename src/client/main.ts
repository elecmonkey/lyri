import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

// 虚拟模块导入（这些会在构建时被替换）
let routes: any[] = []
let siteData: any = {}

// 在开发环境中，这些模块可能不存在，所以使用 try-catch
try {
  // @ts-ignore
  const routesModule = await import('/@lyri/routes')
  routes = routesModule.default || []
  console.log('Routes module imported successfully:', routes)
} catch (e) {
  console.warn('Routes module not found, using empty routes:', e)
}

try {
  // @ts-ignore
  const siteDataModule = await import('/@lyri/site-data')
  siteData = siteDataModule.default || {}
  console.log('Site data module imported successfully:', siteData)
} catch (e) {
  console.warn('Site data module not found, using empty site data:', e)
}

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 调试信息
console.log('Routes loaded:', routes)
console.log('Site data loaded:', siteData)
console.log('Router created:', router)

// 创建应用
const app = createApp({
  template: '<router-view />'
})

// 使用路由器
app.use(router)

// 提供全局数据
app.provide('siteData', siteData)

// 调试信息
console.log('App created:', app)
console.log('About to mount app...')

// 挂载应用
app.mount('#app')

console.log('App mounted successfully!')

// 调试路由
router.isReady().then(() => {
  console.log('Router is ready')
  console.log('Current route:', router.currentRoute.value)
  
  // 测试当前路由的组件
  const currentRoute = router.currentRoute.value
  if (currentRoute.matched.length > 0) {
    console.log('Route matched:', currentRoute.matched[0])
    const component = currentRoute.matched[0].components?.default
    if (component) {
      console.log('Component found:', component)
      console.log('Component type:', typeof component)
      
      // 检查组件是否有render函数
      if ((component as any).render) {
        console.log('Component has render function')
      } else {
        console.log('Component does NOT have render function')
      }
      
      // 检查组件是否有setup函数
      if ((component as any).setup) {
        console.log('Component has setup function')
      } else {
        console.log('Component does NOT have setup function')
      }
    } else {
      console.error('No component found in route')
    }
  } else {
    console.error('No routes matched')
  }
}).catch(err => {
  console.error('Router ready error:', err)
})

// 监听路由变化
router.afterEach((to, from) => {
  console.log('Route changed from', from, 'to', to)
})

// 添加错误处理
router.onError((error) => {
  console.error('Router error:', error)
})

// 添加全局错误处理
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error)
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason)
})

export { app, router }