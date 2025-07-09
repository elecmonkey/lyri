import type { LyriConfig } from '../config'
import type { LyricData } from '../parser'
import type { PluginManager } from '../plugin'
import { createVirtualModulePlugin } from '../virtual'
import { build as viteBuild, mergeConfig } from 'vite'
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
      build: {
        outDir: resolve(buildConfig.outDir, 'assets'),
        rollupOptions: {
          input: this.getClientEntries()
        }
      }
    })
    
    // 服务端构建
    const serverConfig = mergeConfig(baseViteConfig, {
      build: {
        ssr: true,
        outDir: resolve(buildConfig.outDir, 'server'),
        rollupOptions: {
          input: this.getServerEntry()
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
      clearScreen: false
    }, this.config.vite || {})
  }
  
  /**
   * 获取客户端入口
   */
  private getClientEntries() {
    const entries: Record<string, string> = {}
    
    // 主入口 - 使用相对于项目根目录的路径
    entries['main'] = resolve(process.cwd(), 'src/client/main.ts')
    
    // 页面入口
    this.lyrics.forEach(lyric => {
      const slug = this.getSlug(lyric.meta.title)
      entries[slug] = `/@lyri/pages/${slug}`
    })
    
    return entries
  }
  
  /**
   * 获取服务端入口
   */
  private getServerEntry() {
    // 创建一个简单的 SSR 入口，如果不存在的话
    return resolve(process.cwd(), 'src/client/main.ts') // 临时使用相同入口
  }
  
  /**
   * 生成静态页面
   */
  private async generateStaticPages(buildConfig: any, _serverResult: any) {
    // TODO: 实现 SSR 渲染
    // 1. 加载服务端构建结果
    // 2. 为每个页面执行 SSR
    // 3. 生成 HTML 文件
    
    console.log('Generating static pages...')
    
    // 生成首页
    this.generateIndexPage(buildConfig)
    
    // 生成歌词页面
    for (const lyric of this.lyrics) {
      this.generateLyricPage(lyric, buildConfig)
    }
  }
  
  /**
   * 生成首页
   */
  private generateIndexPage(buildConfig: any) {
    const html = this.generateHTML({
      title: this.config.title,
      description: this.config.description,
      content: '<div id="app"></div>',
      scripts: ['assets/main.js'],
      styles: ['assets/main.css']
    })
    
    writeFileSync(resolve(buildConfig.outDir, 'index.html'), html)
  }
  
  /**
   * 生成歌词页面
   */
  private generateLyricPage(lyric: LyricData, buildConfig: any) {
    const slug = this.getSlug(lyric.meta.title)
    const html = this.generateHTML({
      title: `${lyric.meta.title} - ${this.config.title}`,
      description: `${lyric.meta.artist ? `${lyric.meta.artist} - ` : ''}${lyric.meta.title}`,
      content: '<div id="app"></div>',
      scripts: [`assets/${slug}.js`],
      styles: ['assets/main.css']
    })
    
    const dir = resolve(buildConfig.outDir, slug)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    
    writeFileSync(resolve(dir, 'index.html'), html)
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
  }) {
    const { title, description, content, scripts, styles } = options
    
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
  ${content}
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
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
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