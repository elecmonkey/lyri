import type { LyriConfig } from './src/config'

export default {
  title: 'Lyri Demo',
  description: '歌词注音静态站点生成器演示',
  srcDir: './lyrics',
  
  theme: {
    name: 'default',
    options: {
      showRuby: true,
      showTranslation: true,
      fontSize: 'medium'
    }
  },
  
  build: {
    outDir: '.lyri/dist',
    base: '/',
    generateSitemap: true
  }
} as LyriConfig