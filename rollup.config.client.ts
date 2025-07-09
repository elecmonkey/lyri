import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'
import vue from 'rollup-plugin-vue'
import css from 'rollup-plugin-css-only'
import { resolve } from 'path'

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
    vue(),
    css({
      output: 'theme.css'
    }),
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