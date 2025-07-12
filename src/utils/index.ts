import fastGlob from 'fast-glob'
import type { LyricData } from '../parser'

/**
 * 语言配置接口
 */
export interface DetectedLanguage {
  code: string
  name: string
  toneSystem: 'pinyin' | 'jyutping' | 'none'
  direction: 'ltr' | 'rtl'
}

/**
 * 语言映射表
 */
const LANGUAGE_MAP: Record<string, DetectedLanguage> = {
  'zh-CN': {
    code: 'zh-CN',
    name: '普通话',
    toneSystem: 'pinyin',
    direction: 'ltr'
  },
  'zh-TW': {
    code: 'zh-TW', 
    name: '繁體中文',
    toneSystem: 'pinyin',
    direction: 'ltr'
  },
  'zh-HK': {
    code: 'zh-HK',
    name: '粵語',
    toneSystem: 'jyutping',
    direction: 'ltr'
  },
  'zh-MO': {
    code: 'zh-MO',
    name: '粵語',
    toneSystem: 'jyutping', 
    direction: 'ltr'
  },
  'en': {
    code: 'en',
    name: 'English',
    toneSystem: 'none',
    direction: 'ltr'
  },
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    toneSystem: 'none',
    direction: 'ltr'
  },
  'en-GB': {
    code: 'en-GB',
    name: 'English (UK)',
    toneSystem: 'none',
    direction: 'ltr'
  }
}

/**
 * 从歌词数据中检测使用的语言
 */
export function detectLanguagesFromLyrics(lyrics: LyricData[]): Record<string, DetectedLanguage> {
  const detectedLanguages: Record<string, DetectedLanguage> = {}
  
  for (const lyric of lyrics) {
    const langCode = lyric.meta.language
    
    if (langCode && LANGUAGE_MAP[langCode]) {
      detectedLanguages[langCode] = LANGUAGE_MAP[langCode]
    } else if (langCode) {
      // 如果是未知语言代码，尝试推断
      const inferredLanguage = inferLanguageConfig(langCode)
      detectedLanguages[langCode] = inferredLanguage
    }
  }
  
  return detectedLanguages
}

/**
 * 推断语言配置
 */
function inferLanguageConfig(langCode: string): DetectedLanguage {
  // 基于语言代码推断配置
  if (langCode.startsWith('zh-')) {
    // 中文变体
    if (langCode.includes('HK') || langCode.includes('MO') || langCode.includes('yue')) {
      return {
        code: langCode,
        name: '粵語',
        toneSystem: 'jyutping',
        direction: 'ltr'
      }
    } else {
      return {
        code: langCode,
        name: '中文',
        toneSystem: 'pinyin',
        direction: 'ltr'
      }
    }
  } else if (langCode.startsWith('en')) {
    // 英文变体
    return {
      code: langCode,
      name: 'English',
      toneSystem: 'none',
      direction: 'ltr'
    }
  } else {
    // 其他语言，默认无声调
    return {
      code: langCode,
      name: langCode.toUpperCase(),
      toneSystem: 'none',
      direction: 'ltr'
    }
  }
}

/**
 * 根据语言代码获取声调系统
 */
export function getToneSystemForLanguage(langCode: string): 'pinyin' | 'jyutping' | 'none' {
  if (LANGUAGE_MAP[langCode]) {
    return LANGUAGE_MAP[langCode].toneSystem
  }
  
  return inferLanguageConfig(langCode).toneSystem
}

/**
 * 收集歌词文件
 */
export async function collectLyricFiles(srcDir: string): Promise<string[]> {
  const patterns = [
    '**/*.yaml',
    '**/*.yml', 
    '**/*.md'
  ]
  
  console.log('🔍 Searching for lyric files in:', srcDir)
  
  const files = await fastGlob(patterns, {
    cwd: srcDir,
    absolute: true,
    ignore: [
      'node_modules/**', 
      'dist/**', 
      '.git/**',
      'docs/**',
      'examples/**',
      'README.md',
      'DESIGN.md',
      'TODO.md',
      'ARCHITECTURE.md',
      'COMPLETE_DESIGN.md',
      '*.config.*',
      'pnpm-lock.yaml',
      'package.json'
    ]
  })
  
  console.log(`📁 Found ${files.length} lyric files`)
  return files
}

/**
 * 生成 slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // 移除变音符号
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化时间
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  
  return `${minutes}m ${seconds}s`
}

/**
 * 任务执行包装器
 */
export async function task<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now()
  
  try {
    console.log(`📦 ${name}...`)
    const result = await fn()
    const duration = Date.now() - start
    console.log(`✅ ${name} completed in ${formatDuration(duration)}`)
    return result
  } catch (error) {
    const duration = Date.now() - start
    console.log(`❌ ${name} failed after ${formatDuration(duration)}`)
    throw error
  }
}