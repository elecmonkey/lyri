import type { LyriConfig } from '../config'
import type { LyricData } from '../parser'
import type { PluginManager } from '../plugin'
import { createVirtualModulePlugin } from '../virtual'
import { build as viteBuild, mergeConfig } from 'vite'
import { createRequire } from 'module'
import { resolve } from 'path'
import { writeFileSync, mkdirSync, existsSync } from 'fs'

const require = createRequire(import.meta.url)

/**
 * 构建选项
 */
export interface BuildOptions {
  /** 输出目录 */
  outDir?: string
  /** 基础路径 */
  base?: string
  /** 是否清理输出目录 */
  cleanOutDir?: boolean
  /** 是否生成站点地图 */
  sitemap?: boolean
}

/**
 * 构建结果
 */
export interface BuildResult {
  /** 客户端构建结果 */
  clientResult: any
  /** 服务端构建结果 */
  serverResult: any
  /** 构建时间 */
  buildTime: number
  /** 输出目录 */
  outDir: string
}

/**
 * Lyri 构建器
 */
export class LyriBuilder {
  constructor(
    private config: LyriConfig,
    private lyrics: LyricData[],
    private pluginManager: PluginManager
  ) {}
  
  /**
   * 执行构建
   */
  async build(options: BuildOptions = {}): Promise<BuildResult> {
    const startTime = Date.now()
    
    try {
      // 1. 构建开始钩子
      await this.pluginManager.runHook('buildStart')
      
      // 2. 准备构建环境
      const buildConfig = this.prepareBuildConfig(options)
      
      // 3. 执行 Vite 构建
      const { clientResult, serverResult } = await this.viteBuild(buildConfig)
      
      // 4. 生成静态 HTML
      await this.generateStaticPages(buildConfig, serverResult)
      
      // 5. 生成站点地图
      if (options.sitemap !== false) {
        await this.generateSitemap(buildConfig)
      }
      
      // 6. 构建结束钩子
      await this.pluginManager.runHook('generateBundle', clientResult)
      await this.pluginManager.runHook('buildEnd')
      
      const buildTime = Date.now() - startTime
      
      return {
        clientResult,
        serverResult,
        buildTime,
        outDir: buildConfig.outDir
      }
    } catch (error) {
      console.error('Build failed:', error)
      throw error
    }
  }
  
  /**
   * 准备构建配置
   */
  private prepareBuildConfig(options: BuildOptions) {
    const outDir = options.outDir || this.config.build.outDir
    const base = options.base || this.config.build.base || '/'
    
    // 确保输出目录存在
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true })
    }
    
    return {
      outDir,
      base,
      cleanOutDir: options.cleanOutDir ?? true,
      sitemap: options.sitemap ?? this.config.build.generateSitemap
    }
  }
  
  /**
   * 执行 Vite 构建
   */
  private async viteBuild(buildConfig: any) {
    const baseViteConfig = this.getBaseViteConfig(buildConfig)
    
    // 客户端构建
    const clientConfig = mergeConfig(baseViteConfig, {
      base: '/assets/',  // 设置正确的基础路径
      build: {
        outDir: resolve(buildConfig.outDir, 'assets'),
        assetsDir: '',  // 不要嵌套 assets 目录
        rollupOptions: {
          input: this.getClientEntries()
        }
      },
      resolve: {
        alias: {
          'vue': 'vue/dist/vue.esm-bundler.js'  // 客户端使用包含模板编译器的版本
        }
      }
    })
    
    // 服务端构建
    const serverConfig = mergeConfig(baseViteConfig, {
      build: {
        ssr: true,
        outDir: resolve(buildConfig.outDir, 'server'),
        rollupOptions: {
          input: this.getServerEntry(),
          output: {
            format: 'esm', // 使用ESM格式便于动态导入
            entryFileNames: '[name].js' // 固定文件名便于后续引用
          }
        }
      }
    })
    
    // 执行构建
    const [clientResult, serverResult] = await Promise.all([
      viteBuild(clientConfig),
      viteBuild(serverConfig)
    ])
    
    return { clientResult, serverResult }
  }
  
  /**
   * 获取基础 Vite 配置
   */
  private getBaseViteConfig(buildConfig: any) {
    const virtualModulePlugin = createVirtualModulePlugin(this.config, this.lyrics)
    
    return mergeConfig({
      plugins: [
        virtualModulePlugin,
        // Vue 插件
        require('@vitejs/plugin-vue')(),
        // 其他插件...
      ],
      base: buildConfig.base,
      clearScreen: false,
      define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
      }
    }, this.config.vite || {})
  }
  
  /**
   * 获取客户端入口
   */
  private getClientEntries() {
    const entries: Record<string, string> = {}
    
    // 使用新的客户端入口（支持水合）
    entries['main'] = resolve(process.cwd(), 'src/client/entry-client.ts')
    
    return entries
  }
  
  /**
   * 获取服务端入口
   */
  private getServerEntry() {
    // 使用新的服务端入口（支持SSR）
    return resolve(process.cwd(), 'src/client/entry-server.ts')
  }
  
  /**
   * 生成静态页面（使用SSR）
   */
  private async generateStaticPages(buildConfig: any, _serverResult: any) {
    console.log('Generating static pages with SSR...')
    
    try {
      // 1. 加载服务端构建的render函数
      const serverEntryPath = resolve(buildConfig.outDir, 'server/entry-server.js')
      console.log('Loading SSR module from:', serverEntryPath)
      
      const { render } = await import(`file://${serverEntryPath}`)
      console.log('SSR render function loaded successfully')
      
      // 2. 准备虚拟模块数据（模拟运行时环境）
      const virtualModuleContext = await this.prepareVirtualModuleContext()
      
      // 3. 获取所有需要渲染的路由
      const routesToRender = [
        { url: '/', type: 'index' },
        ...this.lyrics.map(lyric => ({
          url: this.getPath(lyric.meta.title),
          type: 'lyric',
          lyric
        }))
      ]
      
      console.log(`Rendering ${routesToRender.length} pages...`)
      
      // 4. 为每个页面执行SSR
      for (const route of routesToRender) {
        try {
          console.log(`Rendering page: ${route.url}`)
          
          // 执行SSR渲染
          const { html, initialState, status } = await render(route.url, virtualModuleContext)
          
          if (status && status !== 200) {
            console.warn(`Warning: Page ${route.url} returned status ${status}`)
          }
          
          // 生成完整的HTML页面
          await this.generatePageHTML(route, html, initialState, buildConfig)
          
          console.log(`✓ Generated: ${route.url}`)
          
        } catch (error) {
          console.error(`Failed to render page ${route.url}:`, error)
          // 生成错误页面而不是中断整个构建
          await this.generateErrorPage(route, error, buildConfig)
        }
      }
      
      console.log('✅ All static pages generated successfully')
      
    } catch (error) {
      console.error('Failed to generate static pages:', error)
      throw error
    }
  }
  
  /**
   * 准备虚拟模块上下文（为SSR提供数据）
   */
  private async prepareVirtualModuleContext() {
    // 直接准备SSR需要的数据，不依赖虚拟模块的复杂生成逻辑
    const siteData = {
      title: this.config.title,
      description: this.config.description,
      base: this.config.build.base,
      languages: this.config.languages,
      defaultLanguage: this.config.defaultLanguage
    }
    
    // 准备歌词数据，包含完整的歌词内容
    const lyrics = this.lyrics.map(lyric => ({
      slug: this.getSlug(lyric.meta.title),
      title: lyric.meta.title,
      artist: lyric.meta.artist,
      language: lyric.meta.language,
      tags: lyric.meta.tags || [],
      path: this.getPath(lyric.meta.title),
      lines: lyric.lines,  // 完整的歌词内容
      options: lyric.options,  // 歌词选项
      meta: lyric.meta  // 完整的元数据
    }))
    
    // 生成路由数据
    const routes = [
      { path: '/', component: 'IndexPage' },
      ...lyrics.map(lyric => ({
        path: lyric.path,
        component: 'LyricPage',
        lyric: lyric.slug
      }))
    ]
    
    return {
      siteData,
      routes,
      lyrics  // 提供完整的歌词数据给SSR
    }
  }
  
  /**
   * 生成页面HTML
   */
  private async generatePageHTML(route: any, ssrHtml: string, initialState: any, buildConfig: any) {
    const { readdirSync } = await import('fs')
    
    // 获取资源文件
    const assetsDir = resolve(buildConfig.outDir, 'assets')
    const files = readdirSync(assetsDir)
    
    // 查找主要的 JS 和 CSS 文件
    const mainJs = files.find(f => f.startsWith('main-') && f.endsWith('.js'))
    // 查找所有CSS文件，确保包含routes样式和组件样式
    const allCssFiles = files.filter(f => f.endsWith('.css'))
    
    // 计算相对路径，确保CSS和JS文件在子目录中能正确加载
    const isRootPage = route.url === '/'
    const assetPrefix = isRootPage ? 'assets/' : '../assets/'
    
    const scripts = mainJs ? [`${assetPrefix}${mainJs}`] : []
    const styles = allCssFiles.map(css => `${assetPrefix}${css}`)
    
    // 确定页面标题
    let pageTitle = this.config.title
    if (route.type === 'lyric' && route.lyric) {
      pageTitle = `${route.lyric.meta.title} - ${this.config.title}`
    }
    
    // 生成完整HTML
    const html = this.generateHTML({
      title: pageTitle,
      description: route.lyric?.meta.artist 
        ? `${route.lyric.meta.artist} - ${route.lyric.meta.title}`
        : this.config.description,
      content: ssrHtml, // 使用SSR渲染的HTML
      scripts,
      styles,
      initialState // 注入初始状态供水合使用
    })
    
    // 写入文件
    // const fileName = route.url === '/' ? 'index.html' : `${route.url.substring(1)}/index.html`
    // 对于中文路径，使用解码后的路径作为目录名
    const decodedFileName = route.url === '/' ? 'index.html' : `${decodeURIComponent(route.url.substring(1))}/index.html`
    const filePath = resolve(buildConfig.outDir, decodedFileName)
    
    // 确保目录存在
    const { dirname: pathDirname } = await import('path')
    const dir = pathDirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    
    writeFileSync(filePath, html)
  }
  
  /**
   * 生成错误页面
   */
  private async generateErrorPage(route: any, error: any, buildConfig: any) {
    console.log(`Generating error page for ${route.url}`)
    
    const errorHtml = `
      <div class="error-page" style="padding: 2rem; text-align: center;">
        <h1>页面生成错误</h1>
        <p>路径: ${route.url}</p>
        <p>错误: ${error instanceof Error ? error.message : String(error)}</p>
      </div>
    `
    
    await this.generatePageHTML(route, errorHtml, {}, buildConfig)
  }
  
  /**
   * 生成 HTML 模板
   */
  private generateHTML(options: {
    title: string
    description?: string
    content: string
    scripts: string[]
    styles: string[]
    initialState?: any
  }) {
    const { title, description, content, scripts, styles, initialState } = options
    
    // 注入初始状态到页面中（供客户端水合使用）
    const stateScript = initialState 
      ? `<script>window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};</script>`
      : ''
    
    return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${description ? `<meta name="description" content="${description}">` : ''}
  ${styles.map(style => `<link rel="stylesheet" href="${style}">`).join('\n  ')}
</head>
<body>
  <div id="app">${content}</div>
  ${stateScript}
  ${scripts.map(script => `<script type="module" src="${script}"></script>`).join('\n  ')}
</body>
</html>`
  }
  
  /**
   * 生成站点地图
   */
  private async generateSitemap(buildConfig: any) {
    const urls = [
      { url: '/', changefreq: 'weekly', priority: 1.0 },
      ...this.lyrics.map(lyric => ({
        url: `/${this.getSlug(lyric.meta.title)}/`,
        changefreq: 'monthly',
        priority: 0.8
      }))
    ]
    
    const sitemap = this.generateSitemapXML(urls, buildConfig.base)
    writeFileSync(resolve(buildConfig.outDir, 'sitemap.xml'), sitemap)
  }
  
  /**
   * 生成站点地图 XML
   */
  private generateSitemapXML(urls: any[], base: string) {
    const urlEntries = urls.map(url => `
  <url>
    <loc>${base}${url.url.replace(/^\//, '')}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('')
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
  }
  
  /**
   * 获取 slug
   */
  private getSlug(title: string): string {
    // 直接使用标题作为slug，保留中文字符
    // 只替换一些特殊字符，但保留中文
    return title
      .replace(/[/\\:*?"<>|]/g, '-') // 只替换文件系统不允许的字符
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .trim()
  }
  
  /**
   * 获取路径
   */
  private getPath(title: string): string {
    return `/${this.getSlug(title)}`
  }
}

/**
 * 构建入口函数
 */
export async function build(
  config: LyriConfig,
  lyrics: LyricData[],
  pluginManager: PluginManager,
  options: BuildOptions = {}
): Promise<BuildResult> {
  const builder = new LyriBuilder(config, lyrics, pluginManager)
  return await builder.build(options)
}