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
} catch (e) {
  console.warn('Routes module not found, using empty routes')
}

try {
  // @ts-ignore
  const siteDataModule = await import('/@lyri/site-data')
  siteData = siteDataModule.default || {}
} catch (e) {
  console.warn('Site data module not found, using empty site data')
}

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 创建应用
const app = createApp({
  template: '<router-view />'
})

// 使用路由器
app.use(router)

// 提供全局数据
app.provide('siteData', siteData)

// 挂载应用
app.mount('#app')

export { app, router }