import type { LyriConfig } from '../config'
import type { LyricData } from '../parser'

/**
 * 插件接口
 */
export interface LyriPlugin {
  /** 插件名称 */
  name: string
  
  /** 配置解析完成后的钩子 */
  configResolved?: (config: LyriConfig) => void | Promise<void>
  
  /** 构建开始前的钩子 */
  buildStart?: () => void | Promise<void>
  
  /** 转换歌词数据 */
  transformLyrics?: (lyrics: LyricData) => LyricData | Promise<LyricData>
  
  /** 转换页面数据 */
  transformPage?: (page: any) => any | Promise<any>
  
  /** 生成 bundle 后的钩子 */
  generateBundle?: (bundle: any) => void | Promise<void>
  
  /** 构建完成后的钩子 */
  buildEnd?: () => void | Promise<void>
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins: LyriPlugin[] = []
  
  /**
   * 注册插件
   */
  register(plugin: LyriPlugin): void {
    this.plugins.push(plugin)
  }
  
  /**
   * 批量注册插件
   */
  registerAll(plugins: LyriPlugin[]): void {
    plugins.forEach(plugin => this.register(plugin))
  }
  
  /**
   * 运行钩子
   */
  async runHook(hook: string, ...args: any[]): Promise<void> {
    for (const plugin of this.plugins) {
      const hookFn = plugin[hook as keyof LyriPlugin]
      if (hookFn && typeof hookFn === 'function') {
        await (hookFn as any).apply(plugin, args)
      }
    }
  }
  
  /**
   * 运行转换钩子
   */
  async runTransformHook<T>(
    hook: 'transformLyrics' | 'transformPage',
    data: T
  ): Promise<T> {
    let result = data
    
    for (const plugin of this.plugins) {
      const hookFn = plugin[hook]
      if (hookFn) {
        result = await (hookFn as any).call(plugin, result)
      }
    }
    
    return result
  }
  
  /**
   * 获取所有插件
   */
  getPlugins(): LyriPlugin[] {
    return [...this.plugins]
  }
  
  /**
   * 根据名称获取插件
   */
  getPlugin(name: string): LyriPlugin | undefined {
    return this.plugins.find(plugin => plugin.name === name)
  }
}

// === 内置插件 ===

/**
 * 自动断行插件
 */
export function autoLineBreakPlugin(options: {
  maxLength?: number
  breakOnPunctuation?: boolean
} = {}): LyriPlugin {
  const { maxLength = 20, breakOnPunctuation = true } = options
  
  return {
    name: 'auto-line-break',
    transformLyrics(lyrics: LyricData): LyricData {
      return {
        ...lyrics,
        lines: lyrics.lines.flatMap(line => 
          line.text.length > maxLength 
            ? splitLine(line, maxLength, breakOnPunctuation)
            : [line]
        )
      }
    }
  }
}

/**
 * 注音格式化插件
 */
export function rubyFormatterPlugin(options: {
  removeNumbers?: boolean
  toneMarks?: boolean
} = {}): LyriPlugin {
  const { removeNumbers = false, toneMarks = true } = options
  
  return {
    name: 'ruby-formatter',
    transformLyrics(lyrics: LyricData): LyricData {
      return {
        ...lyrics,
        lines: lyrics.lines.map(line => ({
          ...line,
          ruby: line.ruby?.map(ruby => formatRuby(ruby, removeNumbers, toneMarks))
        }))
      }
    }
  }
}

/**
 * 验证插件
 */
export function validationPlugin(): LyriPlugin {
  return {
    name: 'validation',
    transformLyrics(lyrics: LyricData): LyricData {
      // 验证注音数量
      for (let i = 0; i < lyrics.lines.length; i++) {
        const line = lyrics.lines[i]
        if (line.ruby && line.ruby.length !== line.text.length) {
          console.warn(
            `第 ${i + 1} 行注音数量不匹配: "${line.text}" (${line.text.length} 字符, ${line.ruby.length} 注音)`
          )
        }
      }
      
      return lyrics
    }
  }
}

// === 辅助函数 ===

/**
 * 分割长行
 */
function splitLine(
  line: any, 
  maxLength: number, 
  breakOnPunctuation: boolean
): any[] {
  const { text, ruby = [] } = line
  const result = []
  let currentText = ''
  let currentRuby: string[] = []
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const charRuby = ruby[i]
    
    currentText += char
    if (charRuby) currentRuby.push(charRuby)
    
    // 检查是否需要断行
    const shouldBreak = 
      currentText.length >= maxLength ||
      (breakOnPunctuation && /[。！？，、；：]/.test(char))
    
    if (shouldBreak) {
      result.push({
        ...line,
        text: currentText,
        ruby: currentRuby.length > 0 ? currentRuby : undefined
      })
      currentText = ''
      currentRuby = []
    }
  }
  
  // 添加剩余部分
  if (currentText) {
    result.push({
      ...line,
      text: currentText,
      ruby: currentRuby.length > 0 ? currentRuby : undefined
    })
  }
  
  return result
}

/**
 * 格式化注音
 */
function formatRuby(ruby: string, removeNumbers: boolean, toneMarks: boolean): string {
  let result = ruby
  
  if (removeNumbers) {
    result = result.replace(/[1-6]$/, '')
  }
  
  if (toneMarks) {
    // 这里可以添加声调标记转换逻辑
    // 例如：将数字声调转换为符号
  }
  
  return result
}