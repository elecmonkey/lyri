import { Command } from 'commander'
import { version } from '../../package.json'
import { resolveConfig } from '../config'
import { createParser } from '../parser'
import { PluginManager } from '../plugin'
import { build } from '../build'
import { startDevServer } from '../dev-server'
import { startPreviewServer } from '../preview'
import { collectLyricFiles } from '../utils'

const program = new Command()

/**
 * 主程序
 */
program
  .name('lyri')
  .description('A static site generator for annotated lyrics')
  .version(version)

/**
 * dev 命令
 */
program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('-h, --host <host>', 'Host to run the server on', 'localhost')
  .option('--open', 'Open browser automatically')
  .argument('[root]', 'Root directory', '.')
  .action(async (root, options) => {
    try {
      const config = await resolveConfig(root, 'dev')
      await startDevServer(config, {
        port: parseInt(options.port),
        host: options.host,
        open: options.open
      })
      
    } catch (error) {
      console.error('Failed to start dev server:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  })

/**
 * build 命令
 */
program
  .command('build')
  .description('Build the site for production')
  .option('-o, --outDir <dir>', 'Output directory')
  .option('--base <base>', 'Base URL for deployment')
  .option('--clean', 'Clean output directory before build', true)
  .option('--no-sitemap', 'Skip sitemap generation')
  .argument('[root]', 'Root directory', '.')
  .action(async (root, options) => {
    try {
      console.log('Building site...')
      
      const config = await resolveConfig(root, 'build')
      const parser = createParser()
      const pluginManager = new PluginManager()
      
      // 收集歌词文件
      const lyricFiles = await collectLyricFiles(config.srcDir)
      const lyrics = []
      
      for (const file of lyricFiles) {
        const content = await import('fs').then(fs => fs.readFileSync(file, 'utf-8'))
        const lyric = await parser.parse(content, file)
        lyrics.push(lyric)
      }
      
      // 执行构建 - 只有显式提供时才覆盖配置
      const buildOptions: any = {
        cleanOutDir: options.clean,
        sitemap: options.sitemap
      }
      
      if (options.outDir) {
        buildOptions.outDir = options.outDir
      }
      
      if (options.base) {
        buildOptions.base = options.base
      }
      
      const result = await build(config, lyrics, pluginManager, buildOptions)
      
      console.log(`\\n✅ Build completed in ${result.buildTime}ms`)
      console.log(`📁 Output: ${result.outDir}`)
      
    } catch (error) {
      console.error('Build failed:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  })

/**
 * preview 命令
 */
program
  .command('preview')
  .description('Preview the built site')
  .option('-p, --port <port>', 'Port to run the server on', '4173')
  .option('-h, --host <host>', 'Host to run the server on', 'localhost')
  .option('--open', 'Open browser automatically')
  .option('-o, --outDir <dir>', 'Output directory to serve')
  .argument('[root]', 'Root directory', '.')
  .action(async (root, options) => {
    try {
      const config = await resolveConfig(root, 'build')
      
      await startPreviewServer(config, {
        port: parseInt(options.port),
        host: options.host,
        open: options.open,
        outDir: options.outDir
      })
      
    } catch (error) {
      console.error('Failed to start preview server:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  })

/**
 * init 命令
 */
program
  .command('init')
  .description('Initialize a new Lyri project')
  .option('-t, --template <template>', 'Template to use', 'default')
  .argument('[name]', 'Project name', 'lyri-site')
  .action(async (name, options) => {
    try {
      // TODO: 实现项目初始化
      console.log(`Initializing project "${name}" with template "${options.template}"...`)
      
    } catch (error) {
      console.error('Failed to initialize project:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  })

/**
 * theme 命令组
 */
const themeCommand = program
  .command('theme')
  .description('Theme related commands')

themeCommand
  .command('list')
  .description('List available themes')
  .action(() => {
    console.log('Available themes:')
    console.log('  @lyri/theme-default - Default theme')
    console.log('  @lyri/theme-minimal - Minimal theme')
  })

themeCommand
  .command('eject')
  .description('Eject current theme to local directory')
  .option('-d, --dir <dir>', 'Output directory', 'theme')
  .argument('[theme]', 'Theme name')
  .action(async (theme, options) => {
    try {
      // TODO: 实现主题弹出
      console.log(`Ejecting theme "${theme}" to "${options.dir}"...`)
      
    } catch (error) {
      console.error('Failed to eject theme:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  })

/**
 * 错误处理
 */
program.on('command:*', () => {
  console.error('Invalid command: %s\\nSee --help for a list of available commands.', program.args.join(' '))
  process.exit(1)
})

/**
 * 解析命令行参数
 */
program.parse()

/**
 * 如果没有提供命令，显示帮助
 */
if (!process.argv.slice(2).length) {
  program.outputHelp()
}