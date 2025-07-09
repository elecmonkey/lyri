import { load as yamlLoad } from 'js-yaml'
import matter from 'gray-matter'
import { extname } from 'path'

/**
 * 歌词行数据
 */
export interface LyricLine {
  /** 歌词文本 */
  text: string
  /** 注音数组 */
  ruby?: string[]
  /** 多语言翻译 */
  translation?: Record<string, string>
  /** 备注 */
  notes?: string
  /** 时间戳 */
  timing?: {
    start: number
    end: number
  }
}

/**
 * 歌词元数据
 */
export interface LyricMeta {
  /** 歌曲标题 */
  title: string
  /** 艺术家 */
  artist?: string
  /** 专辑 */
  album?: string
  /** 语言 */
  language: string
  /** 标签 */
  tags?: string[]
  /** 创建时间 */
  created?: string
  /** 更新时间 */
  updated?: string
}

/**
 * 渲染选项
 */
export interface RenderOptions {
  /** 是否显示翻译 */
  showTranslation: boolean
  /** 是否显示时间戳 */
  showTiming: boolean
  /** 布局方式 */
  layout: 'vertical' | 'horizontal'
  /** 是否显示声调标记 */
  showToneMarks: boolean
}

/**
 * 歌词数据结构
 */
export interface LyricData {
  /** 元数据 */
  meta: LyricMeta
  /** 歌词行 */
  lines: LyricLine[]
  /** 渲染选项 */
  options: RenderOptions
}

/**
 * 解析器插件接口
 */
export interface LyricPlugin {
  name: string
  transformLyrics?: (lyrics: LyricData) => LyricData | Promise<LyricData>
  transformLine?: (line: LyricLine) => LyricLine | Promise<LyricLine>
}

/**
 * 歌词解析器
 */
export class LyricParser {
  private plugins: LyricPlugin[] = []
  
  constructor(plugins: LyricPlugin[] = []) {
    this.plugins = plugins
  }
  
  /**
   * 注册插件
   */
  use(plugin: LyricPlugin): void {
    this.plugins.push(plugin)
  }
  
  /**
   * 解析歌词文件
   */
  async parse(content: string, filePath: string): Promise<LyricData> {
    // 1. 检测文件格式
    const format = this.detectFormat(filePath)
    
    // 2. 基础解析
    let data = await this.parseBasic(content, format)
    
    // 3. 插件处理链
    for (const plugin of this.plugins) {
      if (plugin.transformLyrics) {
        data = await plugin.transformLyrics(data)
      }
    }
    
    // 4. 数据验证
    this.validate(data)
    
    return data
  }
  
  /**
   * 检测文件格式
   */
  private detectFormat(filePath: string): 'yaml' | 'markdown' {
    const ext = extname(filePath).toLowerCase()
    if (ext === '.yaml' || ext === '.yml') {
      return 'yaml'
    }
    return 'markdown'
  }
  
  /**
   * 基础解析
   */
  private async parseBasic(content: string, format: 'yaml' | 'markdown'): Promise<LyricData> {
    if (format === 'yaml') {
      return this.parseYAML(content)
    } else {
      return this.parseMarkdown(content)
    }
  }
  
  /**
   * 解析 YAML 格式
   */
  private parseYAML(content: string): LyricData {
    try {
      const data = yamlLoad(content) as any
      
      return {
        meta: {
          title: data.title || 'Untitled',
          artist: data.artist,
          album: data.album,
          language: data.language || 'zh-jyut',
          tags: data.tags || [],
          created: data.created,
          updated: data.updated
        },
        lines: data.lyrics || [],
        options: {
          showTranslation: data.options?.showTranslation ?? false,
          showTiming: data.options?.showTiming ?? false,
          layout: data.options?.layout ?? 'vertical',
          showToneMarks: data.options?.showToneMarks ?? true
        }
      }
    } catch (error) {
      throw new Error(`YAML 解析失败: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * 解析 Markdown 格式
   */
  private parseMarkdown(content: string): LyricData {
    try {
      const { data, content: markdownContent } = matter(content)
      
      // 从frontmatter获取元数据
      const meta: LyricMeta = {
        title: data.title || 'Untitled',
        artist: data.artist,
        album: data.album,
        language: data.language || 'zh-CN',
        tags: data.tags || [],
        created: data.created,
        updated: data.updated
      }
      
      // 查找YAML代码块中的歌词数据
      const yamlBlockMatch = markdownContent.match(/```yaml\n([\s\S]*?)\n```/)
      let lines: LyricLine[] = []
      
      if (yamlBlockMatch) {
        try {
          const yamlContent = yamlBlockMatch[1]
          const yamlData = yamlLoad(yamlContent) as any
          lines = yamlData.lines || []
          
          console.log('✅ Parsed markdown:', { title: meta.title, linesCount: lines.length })
        } catch (e) {
          console.warn('⚠️ Failed to parse YAML in markdown:', e)
        }
      } else {
        console.warn('⚠️ No YAML block found in markdown file')
      }
      
      return {
        meta,
        lines,
        options: {
          showTranslation: data.showTranslation ?? true,
          showTiming: data.showTiming ?? false,
          layout: data.layout ?? 'vertical',
          showToneMarks: data.showToneMarks ?? true
        }
      }
    } catch (error) {
      console.error('❌ Markdown parsing error:', error)
      throw new Error(`Markdown 解析失败: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * 验证数据
   */
  private validate(data: LyricData): void {
    // 验证必要字段
    if (!data.meta.title) {
      throw new Error('歌曲标题不能为空')
    }
    
    if (!data.meta.language) {
      throw new Error('语言信息不能为空')
    }
    
    // 验证歌词行
    for (let i = 0; i < data.lines.length; i++) {
      const line = data.lines[i]
      
      if (!line.text) {
        throw new Error(`第 ${i + 1} 行歌词文本不能为空`)
      }
      
      // 验证注音数量
      if (line.ruby && line.ruby.length !== line.text.length) {
        throw new Error(
          `第 ${i + 1} 行注音数量 (${line.ruby.length}) 与文字数量 (${line.text.length}) 不匹配: "${line.text}"`
        )
      }
      
      // 验证时间戳
      if (line.timing) {
        if (line.timing.start < 0 || line.timing.end < 0) {
          throw new Error(`第 ${i + 1} 行时间戳不能为负数`)
        }
        if (line.timing.start >= line.timing.end) {
          throw new Error(`第 ${i + 1} 行开始时间不能大于或等于结束时间`)
        }
      }
    }
  }
}

/**
 * 创建解析器实例
 */
export function createParser(plugins: LyricPlugin[] = []): LyricParser {
  return new LyricParser(plugins)
}