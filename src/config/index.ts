import type { UserConfig } from 'vite'

/**
 * 语言配置
 */
export interface LanguageConfig {
  /** 语言显示名称 */
  name: string
  /** 声调系统 */
  toneSystem: 'jyutping' | 'pinyin' | 'ipa'
  /** 文字方向 */
  direction?: 'ltr' | 'rtl'
  /** 字体配置 */
  fonts?: {
    main?: string
    ruby?: string
  }
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string
  /** 主题选项 */
  options?: Record<string, any>
}

/**
 * 构建配置
 */
export interface BuildConfig {
  /** 输出目录 */
  outDir: string
  /** 资源目录 */
  assetsDir?: string
  /** 是否生成站点地图 */
  generateSitemap: boolean
  /** 基础路径 */
  base?: string
}

/**
 * Lyri 配置接口
 */
export interface LyriConfig {
  // === 基础配置 ===
  /** 站点标题 */
  title: string
  /** 站点描述 */
  description?: string
  /** 源文件目录 */
  srcDir?: string
  /** 缓存目录 */
  cacheDir?: string
  
  // === 主题配置 ===
  /** 主题配置 */
  theme: ThemeConfig
  

  
  // === 构建配置 ===
  /** 构建配置 */
  build: BuildConfig
  
  // === Vite 配置扩展 ===
  /** Vite 配置 */
  vite?: UserConfig
  
  // === 插件配置 ===
  /** 插件列表 */
  plugins?: any[]
}

/**
 * 配置定义帮助函数
 */
export function defineConfig(config: LyriConfig): LyriConfig {
  return config
}

/**
 * 解析配置文件
 */
export async function resolveConfig(
  root: string = process.cwd(),
  _command: 'dev' | 'build' = 'dev'
): Promise<LyriConfig & { title: string; theme: ThemeConfig; build: BuildConfig }> {
  // 默认配置
  const defaultConfig: LyriConfig & { title: string; theme: ThemeConfig; build: BuildConfig } = {
    title: 'Lyri Site',
    description: '',
    srcDir: root,
    cacheDir: `${root}/.lyri`,
    
    theme: {
      name: '@lyri/theme-default',
      options: {}
    },
    
    build: {
      outDir: `${root}/.lyri/dist`,
      assetsDir: 'assets',
      generateSitemap: true,
      base: '/'
    },
    
    vite: {},
    plugins: []
  }
  
  // 尝试加载用户配置文件
  try {
    const { resolve } = await import('path')
    const { existsSync } = await import('fs')
    
    const configPath = resolve(root, 'lyri.config.ts')
    
    if (existsSync(configPath)) {
      // 动态导入配置文件
      const configModule = await import(`file://${configPath}`)
      const userConfig = configModule.default
      
      // 合并配置
      return {
        ...defaultConfig,
        ...userConfig,
        build: {
          ...defaultConfig.build,
          ...userConfig.build
        },
        theme: {
          ...defaultConfig.theme,
          ...userConfig.theme
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load config file, using defaults:', error)
  }
  
  return defaultConfig
}