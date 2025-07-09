import { preview as vitePreview } from 'vite'
import { resolve } from 'path'
import { existsSync } from 'fs'
import type { LyriConfig } from '../config'

/**
 * 预览选项
 */
export interface PreviewOptions {
  /** 端口号 */
  port?: number
  /** 主机名 */
  host?: string
  /** 是否自动打开浏览器 */
  open?: boolean
  /** 构建输出目录 */
  outDir?: string
}

/**
 * 启动预览服务器
 */
export async function startPreviewServer(
  config: LyriConfig,
  options: PreviewOptions = {}
) {
  const outDir = options.outDir || config.build.outDir
  const fullOutDir = resolve(process.cwd(), outDir)
  
  // 检查构建输出目录是否存在
  if (!existsSync(fullOutDir)) {
    throw new Error(`Build output directory not found: ${fullOutDir}\nPlease run 'lyri build' first.`)
  }
  
  // 检查是否存在 index.html
  const indexPath = resolve(fullOutDir, 'index.html')
  if (!existsSync(indexPath)) {
    throw new Error(`No index.html found in: ${fullOutDir}\nPlease run 'lyri build' first.`)
  }
  
  console.log(`📁 Serving static files from: ${fullOutDir}`)
  
  // 创建 Vite 预览服务器
  const server = await vitePreview({
    preview: {
      port: options.port || 4173,
      host: options.host || 'localhost',
      open: options.open || false
    },
    build: {
      outDir: fullOutDir
    },
    base: config.build.base || '/',
    clearScreen: false
  })
  
  const info = server.config.logger.info
  const port = server.config.preview.port
  const host = server.config.preview.host
  
  info(`\n  🎵 Lyri preview server running at:\n`)
  info(`  ➜  Local:   http://${host}:${port}${config.build.base || '/'}`)
  info(`  ➜  Network: use --host to expose\n`)
  
  return server
}