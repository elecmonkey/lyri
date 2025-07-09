import { createServer as createViteServer, ViteDevServer } from 'vite'
import { resolve } from 'path'
import { LyriConfig } from '../config'
import { createVirtualModulePlugin } from '../virtual'
import { collectLyricFiles } from '../utils'
import { LyricParser } from '../parser'
import vue from '@vitejs/plugin-vue'
import chokidar from 'chokidar'

export interface DevServerOptions {
  port?: number
  host?: string
  open?: boolean
}

export async function createDevServer(
  config: LyriConfig,
  options: DevServerOptions = {}
): Promise<ViteDevServer> {
  const srcDir = resolve(config.srcDir || './lyrics')
  const root = process.cwd() // 项目根目录
  
  // 收集和解析歌词文件
  const lyricFiles = await collectLyricFiles(srcDir)
  console.log('📁 Found lyric files:', lyricFiles)
  
  const parser = new LyricParser()
  const lyrics = await Promise.all(
    lyricFiles.map(async (file) => {
      try {
        const content = await import('fs').then(fs => fs.readFileSync(file, 'utf-8'))
        const result = await parser.parse(content, file)
        console.log(`📄 Parsed file: ${file} -> ${result.meta.title}`)
        return result
      } catch (error) {
        console.error(`❌ Failed to parse ${file}:`, error)
        return null
      }
    })
  )
  
  // 过滤掉解析失败的文件
  const validLyrics = lyrics.filter(lyric => lyric !== null)
  console.log('✅ Valid lyrics:', validLyrics.length)
  
  // 创建虚拟模块插件
  const virtualModulePlugin = createVirtualModulePlugin(config, validLyrics)
  
  // 创建 Vite 开发服务器
  const server = await createViteServer({
    configFile: false,
    root, // 使用项目根目录
    server: {
      port: options.port || 5173,
      host: options.host || 'localhost',
      open: options.open || false
    },
    plugins: [
      vue(),
      virtualModulePlugin
    ],
    resolve: {
      alias: {
        '@': resolve(root, 'src'),
        'vue': 'vue/dist/vue.esm-bundler.js'
      }
    },
    optimizeDeps: {
      include: ['vue', '@vue/runtime-core']
    }
  })
  
  // 设置文件监听
  setupFileWatcher(config, server)
  
  return server
}

function setupFileWatcher(config: LyriConfig, server: ViteDevServer) {
  const srcDir = resolve(config.srcDir || 'src')
  
  const watcher = chokidar.watch([
    `${srcDir}/**/*.{yaml,yml,md}`,
    'lyri.config.{ts,js,mjs}',
    `${srcDir}/themes/**/*.{vue,css,js,ts}`
  ], {
    ignored: ['node_modules', 'dist', '.git'],
    ignoreInitial: true
  })
  
  watcher.on('change', (path) => {
    console.log(`File changed: ${path}`)
    // 重新加载虚拟模块
    const virtualModules = [
      '/@lyri/site-data',
      '/@lyri/lyrics-data', 
      '/@lyri/theme-config',
      '/@lyri/routes'
    ]
    
    virtualModules.forEach(id => {
      const module = server.moduleGraph.getModuleById(id)
      if (module) {
        server.reloadModule(module)
      }
    })
  })
  
  watcher.on('add', (path) => {
    console.log(`File added: ${path}`)
    // 重启开发服务器
    server.restart()
  })
  
  watcher.on('unlink', (path) => {
    console.log(`File removed: ${path}`)
    // 重启开发服务器
    server.restart()
  })
}

export async function startDevServer(config: LyriConfig, options: DevServerOptions = {}) {
  const server = await createDevServer(config, options)
  
  await server.listen()
  
  const info = server.config.logger.info
  const port = server.config.server.port
  const host = server.config.server.host
  
  info(`\n  🎵 Lyri dev server running at:\n`)
  info(`  ➜  Local:   http://${host}:${port}/`)
  info(`  ➜  Network: use --host to expose\n`)
  
  return server
}