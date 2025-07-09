import type { Component } from 'vue'
import type { LyriConfig } from '../config'

/**
 * 应用上下文
 */
export interface AppContext {
  app: any // Vue App instance
  config: LyriConfig
}

/**
 * 主题定义
 */
export interface ThemeDefinition {
  /** 主布局组件 */
  Layout: Component
  
  /** 额外组件 */
  components?: Record<string, Component>
  
  /** 样式文件 */
  styles?: string[]
  
  /** 应用增强函数 */
  enhanceApp?: (ctx: AppContext) => void | Promise<void>
  
  /** 主题继承 */
  extends?: ThemeDefinition
}

/**
 * 定义主题
 */
export function defineTheme(theme: ThemeDefinition): ThemeDefinition {
  return theme
}

/**
 * 主题解析器
 */
export class ThemeResolver {
  private themes = new Map<string, ThemeDefinition>()
  
  /**
   * 注册主题
   */
  register(name: string, theme: ThemeDefinition): void {
    this.themes.set(name, theme)
  }
  
  /**
   * 解析主题
   */
  resolve(name: string): ThemeDefinition {
    if (name === 'default' || name === '@lyri/theme-default') {
      return defaultTheme
    } else if (name === 'minimal' || name === '@lyri/theme-minimal') {
      return minimalTheme
    } else if (name.startsWith('@lyri/theme-')) {
      // 内置主题
      return this.resolveBuiltinTheme(name)
    } else if (name.startsWith('./') || name.startsWith('../')) {
      // 本地主题
      return this.resolveLocalTheme(name)
    } else {
      // npm 主题
      return this.resolveNpmTheme(name)
    }
  }
  
  /**
   * 解析内置主题
   */
  private resolveBuiltinTheme(name: string): ThemeDefinition {
    switch (name) {
      case '@lyri/theme-default':
        return defaultTheme
      case '@lyri/theme-minimal':
        return minimalTheme
      default:
        throw new Error(`Unknown builtin theme: ${name}`)
    }
  }
  
  /**
   * 解析本地主题
   */
  private resolveLocalTheme(_path: string): ThemeDefinition {
    // TODO: 实现本地主题加载
    throw new Error('Local theme resolution not implemented')
  }
  
  /**
   * 解析 npm 主题
   */
  private resolveNpmTheme(_name: string): ThemeDefinition {
    // TODO: 实现 npm 主题加载
    throw new Error('NPM theme resolution not implemented')
  }
}

// === 内置主题 ===

/**
 * 默认主题
 */
export const defaultTheme: ThemeDefinition = {
  Layout: () => import('./components/Layout.vue'),
  components: {
    LyricContent: () => import('./components/LyricContent.vue'),
    LyricLine: () => import('./components/LyricLine.vue'),
    LyricChar: () => import('./components/LyricChar.vue'),
    ToneMark: () => import('./components/ToneMark.vue'),
    Navigation: () => import('./components/Navigation.vue'),
    Footer: () => import('./components/Footer.vue')
  },
  styles: [
    './styles/base.css',
    './styles/components.css',
    './styles/themes.css'
  ],
  enhanceApp({ app, config }) {
    // 注册全局组件
    app.provide('lyri-config', config)
    
    // 设置全局属性
    app.config.globalProperties.$lyri = {
      config,
      version: '0.1.0'
    }
  }
}

/**
 * 极简主题
 */
export const minimalTheme: ThemeDefinition = {
  Layout: () => import('./components/MinimalLayout.vue'),
  components: {
    LyricContent: () => import('./components/MinimalLyricContent.vue')
  },
  styles: [
    './styles/minimal.css'
  ]
}

/**
 * 主题工厂
 */
export class ThemeFactory {
  /**
   * 创建主题实例
   */
  static create(config: LyriConfig): ThemeDefinition {
    const resolver = new ThemeResolver()
    const theme = resolver.resolve(config.theme.name)
    
    // 应用主题选项
    if (config.theme.options) {
      return this.applyOptions(theme, config.theme.options)
    }
    
    return theme
  }
  
  /**
   * 应用主题选项
   */
  private static applyOptions(
    theme: ThemeDefinition, 
    _options: Record<string, any>
  ): ThemeDefinition {
    // TODO: 实现主题选项应用逻辑
    return theme
  }
}

/**
 * 主题开发工具
 */
export class ThemeDevTools {
  /**
   * 验证主题
   */
  static validate(theme: ThemeDefinition): void {
    if (!theme.Layout) {
      throw new Error('Theme must have a Layout component')
    }
    
    // 验证组件是否存在
    if (theme.components) {
      for (const [name, component] of Object.entries(theme.components)) {
        if (!component) {
          throw new Error(`Component "${name}" is not defined`)
        }
      }
    }
  }
  
  /**
   * 生成主题类型定义
   */
  static generateTypes(theme: ThemeDefinition): string {
    const componentNames = Object.keys(theme.components || {})
    
    return `
declare module '@lyri/theme' {
  interface ThemeComponents {
    ${componentNames.map(name => `${name}: Component`).join('\n    ')}
  }
}
`
  }
}