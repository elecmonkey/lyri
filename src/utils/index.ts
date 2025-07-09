import fastGlob from 'fast-glob'

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