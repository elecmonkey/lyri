import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'

/**
 * SSR渲染函数
 * @param url 要渲染的URL路径
 * @param context 渲染上下文（包含siteData、routes等）
 */
export async function render(url: string, context: any = {}) {
  console.log('Server: Starting SSR for URL:', url)
  
  try {
    const siteData = context.siteData || {}
    
    console.log('Server: Using site data:', siteData.title)
    
    // 动态导入主题组件（在SSR环境中）
    const { default: Layout } = await import('../theme/components/Layout.vue')
    const { default: LyricContent } = await import('../theme/components/LyricContent.vue')
    
    // 创建和客户端虚拟模块完全相同的路由配置
    const ssrRoutes = [
      {
        path: '/',
        component: defineComponent({
          name: 'IndexPage',
          setup() {
            // 使用和虚拟模块完全相同的数据结构
            const lyricsData = context.lyrics.map((lyric: any) => ({
              slug: lyric.slug,
              title: lyric.title,
              artist: lyric.artist,
              language: lyric.language,
              tags: lyric.tags || [],
              path: lyric.path
            }))
            
            return {
              siteData,
              lyricsData
            }
          },
          render() {
            // 使用和虚拟模块完全相同的渲染逻辑
            return h(Layout, {}, {
              default: () => h('div', { class: 'home', style: 'padding: 2rem;' }, [
                h('h1', { style: 'text-align: center; margin-bottom: 2rem;' }, this.siteData.title),
                h('p', { style: 'text-align: center; margin-bottom: 3rem; color: #666;' }, this.siteData.description),
                h('div', { 
                  class: 'lyrics-list', 
                  style: 'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;' 
                }, this.lyricsData.map((lyric: any) => 
                  h('div', { 
                    key: lyric.slug, 
                    class: 'lyric-item',
                    style: 'border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; transition: box-shadow 0.2s; cursor: pointer;'
                  }, [
                    h('a', { 
                      href: lyric.path, 
                      style: 'text-decoration: none; color: inherit;' 
                    }, [
                      h('h3', { style: 'margin: 0 0 0.5rem 0; color: #333;' }, lyric.title),
                      lyric.artist ? h('p', { style: 'margin: 0 0 0.5rem 0; color: #666;' }, lyric.artist) : null,
                      h('span', { 
                        style: 'display: inline-block; background: #f0f0f0; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem;' 
                      }, lyric.language)
                    ])
                  ])
                ))
              ])
            })
          }
        })
      },
      {
        path: '/:pathMatch(.*)*',
        component: defineComponent({
          name: 'LyricPage',
          setup() {
            // 根据URL查找对应的歌词数据，需要解码URL
            const decodedUrl = decodeURIComponent(url)
            const slug = decodedUrl.substring(1) // 去掉开头的 '/'
            const lyricData = context.lyrics?.find((l: any) => l.slug === slug)
            
            if (!lyricData) {
              return {
                meta: { title: '页面未找到' },
                themeConfig: siteData
              }
            }
            
            // 返回和客户端虚拟模块完全相同的数据结构
            return {
              meta: lyricData.meta,
              lyrics: lyricData.lines,
              options: lyricData.options || {},
              themeConfig: siteData
            }
          },
          render() {
            // 使用和客户端虚拟模块完全相同的渲染逻辑
            if (!this.meta || this.meta.title === '页面未找到') {
              return h(Layout, { meta: this.meta, config: this.themeConfig }, {
                default: () => h('div', { style: 'padding: 2rem; text-align: center;' }, [
                  h('h1', '404 - 页面未找到'),
                  h('p', `找不到页面: ${url}`)
                ])
              })
            }
            
            return h(Layout, { meta: this.meta, config: this.themeConfig }, {
              default: () => h(LyricContent, {
                lyrics: this.lyrics,
                options: this.options
              })
            })
          }
        })
      }
    ]
    
    // 创建路由器
    const router = createRouter({
      history: createMemoryHistory(),
      routes: ssrRoutes
    })
    
    // 创建SSR应用
    const app = createSSRApp({
      template: '<router-view />'
    })
    
    // 使用路由器和提供全局数据
    app.use(router)
    app.provide('siteData', siteData)
    
    // 导航到指定URL
    await router.push(url)
    await router.isReady()
    
    console.log('Server: Router ready for URL:', url)
    console.log('Server: Route matched:', router.currentRoute.value.path)
    
    // 渲染应用为HTML字符串
    const html = await renderToString(app)
    
    console.log('Server: SSR completed, HTML length:', html.length)
    
    return {
      html,
      initialState: {
        siteData,
        currentRoute: {
          path: router.currentRoute.value.path,
          params: router.currentRoute.value.params,
          query: router.currentRoute.value.query
        }
      },
      status: 200
    }
    
  } catch (error) {
    console.error('Server: SSR error:', error)
    
    return {
      html: `<div class="error">SSR Error: ${error instanceof Error ? error.message : String(error)}</div>`,
      initialState: { error: true },
      status: 500
    }
  }
}