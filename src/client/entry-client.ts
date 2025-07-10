import { createSSRApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

// 虚拟模块导入
let routes: any[] = []
let siteData: any = {}

// 在客户端环境中，这些模块应该已经被构建好了
try {
  // @ts-ignore
  const routesModule = await import('/@lyri/routes')
  routes = routesModule.default || []
  console.log('Client: Routes loaded for hydration:', routes.length)
} catch (e) {
  console.warn('Client: Routes module not found:', e)
}

try {
  // @ts-ignore
  const siteDataModule = await import('/@lyri/site-data')
  siteData = siteDataModule.default || {}
  console.log('Client: Site data loaded for hydration:', siteData)
} catch (e) {
  console.warn('Client: Site data module not found:', e)
}

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 创建SSR应用（用于水合）
const app = createSSRApp({
  template: '<router-view />'
})

// 使用路由器和提供全局数据
app.use(router)
app.provide('siteData', siteData)

// 等待路由就绪后执行水合
router.isReady().then(() => {
  console.log('Client: Router ready, starting hydration...')
  
  // 检查当前URL路径，如果是编码的，需要解码后重新导航
  const currentPath = window.location.pathname
  const decodedPath = decodeURIComponent(currentPath)
  
  if (currentPath !== decodedPath) {
    console.log('Client: Redirecting from encoded path:', currentPath, 'to decoded path:', decodedPath)
    // 使用replace避免在历史记录中留下编码的URL
    router.replace(decodedPath).then(() => {
      // 开启水合模式 - 第二个参数true表示水合现有DOM
      app.mount('#app', true)
      console.log('Client: App hydrated successfully!')
    }).catch(err => {
      console.error('Client: Router replace error:', err)
      // 如果重定向失败，仍然尝试水合
      app.mount('#app', true)
    })
  } else {
    // 开启水合模式 - 第二个参数true表示水合现有DOM
    app.mount('#app', true)
    console.log('Client: App hydrated successfully!')
  }
}).catch(err => {
  console.error('Client: Router ready error:', err)
})

// 添加全局错误处理
app.config.errorHandler = (err, _instance, info) => {
  console.error('Client: Vue error during hydration:', err, info)
}

// 监听路由变化（用于调试）
router.afterEach((to, from) => {
  console.log('Client: Route changed from', from.path, 'to', to.path)
})

export { app, router }