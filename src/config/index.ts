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
  assetsDir: string
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
  
  // === 语言配置 ===
  /** 支持的语言 */
  languages: Record<string, LanguageConfig>
  /** 默认语言 */
  defaultLanguage?: string
  
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
): Promise<Required<LyriConfig>> {
  // 默认配置
  const defaultConfig: Required<LyriConfig> = {
    title: 'Lyri Site',
    description: '',
    srcDir: root,
    cacheDir: `${root}/.lyri`,
    
    theme: {
      name: '@lyri/theme-default',
      options: {}
    },
    
    languages: {
      'zh-jyut': {
        name: '粵語',
        toneSystem: 'jyutping'
      }
    },
    defaultLanguage: 'zh-jyut',
    
    build: {
      outDir: `${root}/dist`,
      assetsDir: 'assets',
      generateSitemap: true,
      base: '/'
    },
    
    vite: {},
    plugins: []
  }
  
  // TODO: 实际的配置文件加载逻辑
  // 1. 查找配置文件 (lyri.config.ts, lyri.config.js)
  // 2. 使用 Vite 的 loadConfigFromFile 加载
  // 3. 合并用户配置和默认配置
  
  return defaultConfig
}