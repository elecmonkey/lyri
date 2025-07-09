import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

console.log('🎵 Lyri client starting...')

// 尝试加载虚拟模块
async function loadVirtualModules() {
  try {
    // 异步加载虚拟模块
    const [routesModule, siteDataModule] = await Promise.all([
      import('/@lyri/routes').catch(() => null),
      import('/@lyri/site-data').catch(() => null)
    ])
    
    const routes = routesModule?.default || []
    const siteData = siteDataModule?.default || { title: 'Lyri', description: '歌词注音静态站点生成器' }
    
    console.log('📊 Site data loaded:', siteData)
    console.log('🛣️ Routes loaded:', routes)
    
    return { routes, siteData }
  } catch (error) {
    console.warn('⚠️ Failed to load virtual modules:', error)
    return {
      routes: [],
      siteData: { title: 'Lyri', description: '歌词注音静态站点生成器' }
    }
  }
}

// 创建默认路由
const createDefaultRoutes = (siteData: any, virtualRoutes: any[] = []) => [
  {
    path: '/',
    component: {
      template: `
        <div style="padding: 2rem; font-family: system-ui; max-width: 800px; margin: 0 auto;">
          <h1 style="color: #333; margin-bottom: 1rem;">🎵 {{ siteData.title }}</h1>
          <p style="color: #666; margin-bottom: 2rem;">{{ siteData.description }}</p>
          
          <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
            <h2 style="color: #333; margin-bottom: 1rem;">✅ 系统状态</h2>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 0.5rem;">✅ Vue 3 已加载</li>
              <li style="margin-bottom: 0.5rem;">✅ Vue Router 已配置</li>
              <li style="margin-bottom: 0.5rem;">✅ Vite 开发服务器运行中</li>
              <li style="margin-bottom: 0.5rem;">✅ 虚拟模块已加载</li>
            </ul>
          </div>
          
          <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
            <h3 style="color: #333; margin-bottom: 1rem;">📄 可用路由</h3>
            <ul style="list-style: none; padding: 0;">
              <li v-for="route in availableRoutes" :key="route.path" style="margin-bottom: 0.5rem;">
                <a :href="route.path" style="color: #007acc; text-decoration: none;">{{ route.path }}</a>
              </li>
            </ul>
          </div>
          
          <div style="background: #fff3cd; padding: 1rem; border-radius: 8px;">
            <h3 style="color: #333; margin-bottom: 1rem;">🎵 歌词文件</h3>
            <p style="color: #666; margin: 0;">检测到 {{ lyricsCount }} 个歌词文件</p>
          </div>
        </div>
      `,
      data() {
        return {
          siteData,
          availableRoutes: virtualRoutes.length > 0 ? virtualRoutes : [{ path: '/', name: '首页' }],
          lyricsCount: virtualRoutes.length
        }
      }
    }
  }
]

// 启动应用
async function startApp() {
  const { routes: virtualRoutes, siteData } = await loadVirtualModules()
  
  // 如果有虚拟路由，使用它们；否则使用默认路由
  const routes = virtualRoutes.length > 0 ? virtualRoutes : createDefaultRoutes(siteData, virtualRoutes)
  
  // 创建路由器
  const router = createRouter({
    history: createWebHistory(),
    routes
  })
  
  // 创建 Vue 应用
  const app = createApp({
    template: '<router-view />',
    provide() {
      return {
        siteData
      }
    }
  })
  
  // 使用路由器
  app.use(router)
  
  // 挂载应用
  app.mount('#app')
  
  console.log('🎵 Lyri client mounted successfully!')
}

// 启动应用
startApp().catch(console.error)