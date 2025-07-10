import { resolve } from 'path'
import { existsSync, readFileSync, statSync } from 'fs'
import { createServer } from 'http'
import { extname } from 'path'
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
 * 获取 MIME 类型
 */
function getMimeType(filepath: string): string {
  const ext = extname(filepath).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  }
  return mimeTypes[ext] || 'application/octet-stream'
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
  
  const port = options.port || 4173
  const host = options.host || 'localhost'
  
  console.log(`📁 Serving static files from: ${fullOutDir}`)
  
  // 创建 HTTP 服务器
  const server = createServer((req, res) => {
    try {
      let requestPath = req.url || '/'
      
      // 解码URL中的中文字符
      requestPath = decodeURIComponent(requestPath)
      
      // 移除查询参数
      const urlPath = requestPath.split('?')[0]
      
      let filePath: string
      
      if (urlPath === '/') {
        // 首页
        filePath = indexPath
      } else if (urlPath.startsWith('/assets/')) {
        // 静态资源
        filePath = resolve(fullOutDir, urlPath.substring(1))
      } else {
        // 歌词页面，查找对应的 index.html
        filePath = resolve(fullOutDir, urlPath.substring(1), 'index.html')
      }
      
      // 检查文件是否存在
      if (!existsSync(filePath)) {
        // 404 页面
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(`
          <html>
            <head><title>404 - Page Not Found</title></head>
            <body>
              <h1>404 - Page Not Found</h1>
              <p>The page <code>${urlPath}</code> could not be found.</p>
              <p>File path: <code>${filePath}</code></p>
            </body>
          </html>
        `)
        return
      }
      
      // 检查是否为目录
      const stats = statSync(filePath)
      if (stats.isDirectory()) {
        // 如果是目录，尝试查找 index.html
        const indexInDir = resolve(filePath, 'index.html')
        if (existsSync(indexInDir)) {
          filePath = indexInDir
        } else {
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(`
            <html>
              <head><title>404 - No Index Found</title></head>
              <body>
                <h1>404 - No Index Found</h1>
                <p>Directory <code>${urlPath}</code> has no index.html file.</p>
              </body>
            </html>
          `)
          return
        }
      }
      
      // 读取文件内容
      const content = readFileSync(filePath)
      const mimeType = getMimeType(filePath)
      
      // 设置响应头
      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Length', content.length)
      
      // 发送内容
      res.end(content)
      
    } catch (error) {
      console.error('Error serving file:', error)
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end('Internal Server Error')
    }
  })
  
  // 启动服务器
  server.listen(port, host, () => {
    console.log(`\n  🎵 Lyri preview server running at:\n`)
    console.log(`  ➜  Local:   http://${host}:${port}${config.build.base || '/'}`)
    console.log(`  ➜  Network: use --host to expose\n`)
  })
  
  return server
}