import type { LyriConfig } from '../config'
import type { LyricData } from '../parser'

/**
 * 虚拟模块接口
 */
export interface VirtualModule {
  /** 模块 ID */
  id: string
  /** 生成模块内容 */
  content: () => string | Promise<string>
}

/**
 * 虚拟模块系统
 */
export class VirtualModuleSystem {
  private modules = new Map<string, VirtualModule>()
  
  /**
   * 注册模块
   */
  register(module: VirtualModule): void {
    this.modules.set(module.id, module)
  }
  
  /**
   * 批量注册模块
   */
  registerAll(modules: VirtualModule[]): void {
    modules.forEach(module => this.register(module))
  }
  
  /**
   * 解析模块 ID
   */
  resolve(id: string): string | null {
    return this.modules.has(id) ? id : null
  }
  
  /**
   * 加载模块内容
   */
  async load(id: string): Promise<string | null> {
    const module = this.modules.get(id)
    if (!module) return null
    
    try {
      const content = await module.content()
      return content
    } catch (error) {
      console.error(`Failed to load virtual module ${id}:`, error)
      return null
    }
  }
  
  /**
   * 获取所有模块 ID
   */
  getModuleIds(): string[] {
    return Array.from(this.modules.keys())
  }
  
  /**
   * 清除所有模块
   */
  clear(): void {
    this.modules.clear()
  }
}

/**
 * 虚拟模块生成器
 */
export class VirtualModuleGenerator {
  constructor(
    private config: LyriConfig,
    private lyrics: LyricData[]
  ) {}
  
  /**
   * 生成所有虚拟模块
   */
  generateAll(): VirtualModule[] {
    return [
      this.generateSiteDataModule(),
      this.generateLyricsDataModule(),
      this.generateThemeConfigModule(),
      this.generateThemeModule(),
      this.generateRoutesModule(),
      this.generateLanguageModule(),
      this.generateIndexPageModule(),
      ...this.generatePageModules()
    ]
  }
  
  /**
   * 生成站点数据模块
   */
  private generateSiteDataModule(): VirtualModule {
    return {
      id: '/@lyri/site-data',
      content: () => {
        const siteData = {
          title: this.config.title,
          description: this.config.description,
          base: this.config.build.base,
          languages: this.config.languages,
          defaultLanguage: this.config.defaultLanguage
        }
        
        return `export default ${JSON.stringify(siteData, null, 2)}`
      }
    }
  }
  
  /**
   * 生成歌词数据模块
   */
  private generateLyricsDataModule(): VirtualModule {
    return {
      id: '/@lyri/lyrics-data',
      content: () => {
        const lyricsData = this.lyrics.map(lyric => ({
          slug: this.getSlug(lyric.meta.title),
          title: lyric.meta.title,
          artist: lyric.meta.artist,
          language: lyric.meta.language,
          tags: lyric.meta.tags || [],
          path: this.getPath(lyric.meta.title)
        }))
        
        return `export default ${JSON.stringify(lyricsData, null, 2)}`
      }
    }
  }
  
  /**
   * 生成主题配置模块
   */
  private generateThemeConfigModule(): VirtualModule {
    return {
      id: '/@lyri/theme-config',
      content: () => {
        return `export default ${JSON.stringify(this.config.theme, null, 2)}`
      }
    }
  }
  
  /**
   * 生成主题模块
   */
  private generateThemeModule(): VirtualModule {
    return {
      id: '/@lyri/theme',
      content: () => {
        const themeName = this.config.theme.name || 'default'
        const isDefaultTheme = themeName === 'default' || themeName === '@lyri/theme-default'
        
        return `
import { ThemeFactory } from '/src/theme/index.js'

const config = ${JSON.stringify(this.config, null, 2)}
const theme = ThemeFactory.create(config)

export default theme
export const Layout = theme.Layout
export const components = theme.components || {}
export const themeConfig = config.theme

${isDefaultTheme ? `
// 默认主题的直接导出
export { default as DefaultLayout } from '/src/theme/components/Layout.vue'
export { default as LyricContent } from '/src/theme/components/LyricContent.vue'
export { default as LyricLine } from '/src/theme/components/LyricLine.vue'
export { default as LyricChar } from '/src/theme/components/LyricChar.vue'
export { default as ToneMark } from '/src/theme/components/ToneMark.vue'
export { default as Navigation } from '/src/theme/components/Navigation.vue'
export { default as Footer } from '/src/theme/components/Footer.vue'
` : ''}
`
      }
    }
  }
  
  /**
   * 生成路由模块
   */
  private generateRoutesModule(): VirtualModule {
    return {
      id: '/@lyri/routes',
      content: () => {
        const routes = this.lyrics.map(lyric => ({
          path: this.getPath(lyric.meta.title),
          component: `() => import('/@lyri/pages/${this.getSlug(lyric.meta.title)}')`
        }))
        
        const routesCode = [
          `  { path: '/', component: () => import('/@lyri/pages/index.js') }`,
          ...routes.map(route => 
            `  { path: '${route.path}', component: ${route.component} }`
          )
        ].join(',\n')
        
        return `export default [\n${routesCode}\n]`
      }
    }
  }
  
  /**
   * 生成语言模块
   */
  private generateLanguageModule(): VirtualModule {
    return {
      id: '/@lyri/languages',
      content: () => {
        return `export default ${JSON.stringify(this.config.languages, null, 2)}`
      }
    }
  }
  
  /**
   * 生成首页模块
   */
  private generateIndexPageModule(): VirtualModule {
    return {
      id: '/@lyri/pages/index.js',
      content: () => {
        const themeName = this.config.theme.name || 'default'
        const isDefaultTheme = themeName === 'default' || themeName === '@lyri/theme-default'
        
        return `
import { defineComponent, h } from 'vue'
${isDefaultTheme ? 
  `import LyricLayout from '/src/theme/components/Layout.vue'` : 
  `import { ThemeFactory } from '/src/theme/index.js'
const theme = ThemeFactory.create(${JSON.stringify(this.config)})
const LyricLayout = theme.Layout`
}

export default defineComponent({
  name: 'IndexPage',
  ${isDefaultTheme ? 'components: { LyricLayout },' : ''}
  setup() {
    const siteData = ${JSON.stringify({
      title: this.config.title,
      description: this.config.description
    }, null, 4)}
    
    const lyricsData = ${JSON.stringify(this.lyrics.map(lyric => ({
      slug: this.getSlug(lyric.meta.title),
      title: lyric.meta.title,
      artist: lyric.meta.artist,
      language: lyric.meta.language,
      tags: lyric.meta.tags || [],
      path: this.getPath(lyric.meta.title)
    })), null, 4)}
    
    return {
      siteData,
      lyricsData
    }
  },
  render() {
    return h(${isDefaultTheme ? 'LyricLayout' : 'LyricLayout'}, {}, {
      default: () => h('div', { class: 'home', style: 'padding: 2rem;' }, [
        h('h1', { style: 'text-align: center; margin-bottom: 2rem;' }, this.siteData.title),
        h('p', { style: 'text-align: center; margin-bottom: 3rem; color: #666;' }, this.siteData.description),
        h('div', { 
          class: 'lyrics-list', 
          style: 'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;' 
        }, this.lyricsData.map(lyric => 
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
`
      }
    }
  }
  
  /**
   * 生成页面模块
   */
  private generatePageModules(): VirtualModule[] {
    return this.lyrics.map(lyric => ({
      id: `/@lyri/pages/${this.getSlug(lyric.meta.title)}`,
      content: () => this.generatePageContent(lyric)
    }))
  }
  
  /**
   * 生成页面内容
   */
  private generatePageContent(lyric: LyricData): string {
    const themeName = this.config.theme.name || 'default'
    const isDefaultTheme = themeName === 'default' || themeName === '@lyri/theme-default'
    
    const template = `
// Auto-generated page component
import { defineComponent } from 'vue'
${isDefaultTheme ? 
  `import LyricLayout from '/src/theme/components/Layout.vue'
import LyricContent from '/src/theme/components/LyricContent.vue'` : 
  `import { ThemeFactory } from '/src/theme/index.js'
const theme = ThemeFactory.create(${JSON.stringify(this.config)})
const LyricLayout = theme.Layout
const LyricContent = theme.components?.LyricContent || (() => null)`
}

export default defineComponent({
  name: 'LyricPage',
  ${isDefaultTheme ? 'components: { LyricLayout, LyricContent },' : ''}
  setup() {
    const meta = ${JSON.stringify(lyric.meta, null, 4)}
    const lyrics = ${JSON.stringify(lyric.lines, null, 4)}
    const options = ${JSON.stringify(lyric.options, null, 4)}
    const themeConfig = ${JSON.stringify(this.config.theme.options, null, 4)}
    
    return {
      meta,
      lyrics,
      options,
      themeConfig
    }
  },
  template: \`
    <LyricLayout :meta="meta" :config="themeConfig">
      <LyricContent :lyrics="lyrics" :options="options" />
    </LyricLayout>
  \`
})
`
    return template.trim()
  }
  
  /**
   * 生成数据模块
   */
  generateDataModule(lyric: LyricData): VirtualModule {
    return {
      id: `/@lyri/page-data/${this.getSlug(lyric.meta.title)}`,
      content: () => {
        return `
export const meta = ${JSON.stringify(lyric.meta, null, 2)}
export const lyrics = ${JSON.stringify(lyric.lines, null, 2)}
export const options = ${JSON.stringify(lyric.options, null, 2)}
export const themeConfig = ${JSON.stringify(this.config.theme.options, null, 2)}
`
      }
    }
  }
  
  /**
   * 获取 slug
   */
  private getSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      || 'untitled'
  }
  
  /**
   * 获取路径
   */
  private getPath(title: string): string {
    return `/${encodeURIComponent(this.getSlug(title))}`
  }
}

/**
 * Vite 插件工厂
 */
export function createVirtualModulePlugin(
  config: LyriConfig,
  lyrics: LyricData[]
) {
  const generator = new VirtualModuleGenerator(config, lyrics)
  const system = new VirtualModuleSystem()
  
  // 注册所有虚拟模块
  system.registerAll(generator.generateAll())
  
  return {
    name: 'lyri:virtual-modules',
    resolveId(id: string) {
      return system.resolve(id)
    },
    async load(id: string) {
      return await system.load(id)
    }
  }
}