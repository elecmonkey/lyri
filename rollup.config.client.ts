import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'
import { resolve } from 'path'

// 一个简单的Vue插件来处理.vue文件
// 应该由Vite处理
const vuePlugin = () => ({
  name: 'vue-simple',
  transform(code: string, id: string) {
    if (id.endsWith('.vue')) {
      return `export default { name: '${id.split('/').pop()?.replace('.vue', '')}' }`
    }
    return null
  }
})

const external = [
  'vue',
  'vue-router',
  'vite',
  '@vitejs/plugin-vue'
]

export default defineConfig({
  input: {
    index: 'src/client/index.ts',
    theme: 'src/theme/index.ts'
  },
  output: {
    dir: 'dist/client',
    format: 'es',
    sourcemap: true,
    chunkFileNames: 'shared/[name]-[hash].js'
  },
  external,
  plugins: [
    alias({
      entries: [
        { find: '@', replacement: resolve('src') }
      ]
    }),
    vuePlugin(),
    nodeResolve({
      preferBuiltins: false
    }),
    commonjs(),
    json(),
    esbuild({
      target: 'es2020',
      platform: 'browser',
      format: 'esm'
    })
  ]
})