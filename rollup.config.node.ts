import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'
import { resolve } from 'path'

const external = [
  'vue',
  'vue-router',
  'vite',
  '@vitejs/plugin-vue',
  'chokidar',
  'commander',
  'debug',
  'fast-glob',
  'gray-matter',
  'js-yaml',
  'picocolors',
  'fs',
  'path',
  'url',
  'module',
  'child_process',
  'stream',
  'util',
  'os',
  'crypto',
  'events',
  'buffer',
  'zlib',
  'net',
  'tls',
  'http',
  'https',
  'querystring'
]

export default defineConfig({
  input: {
    index: 'src/index.ts',
    cli: 'src/cli/index.ts',
    build: 'src/build/index.ts',
    'dev-server': 'src/dev-server/index.ts',
    config: 'src/config/index.ts',
    parser: 'src/parser/index.ts',
    plugin: 'src/plugin/index.ts',
    utils: 'src/utils/index.ts',
    virtual: 'src/virtual/index.ts'
  },
  output: {
    dir: 'dist',
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
    nodeResolve({
      preferBuiltins: true
    }),
    commonjs(),
    json(),
    esbuild({
      target: 'node18',
      platform: 'node',
      format: 'esm'
    })
  ]
})