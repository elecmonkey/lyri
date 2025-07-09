import type { LyriConfig, LanguageConfig, ThemeConfig } from './config'

// Re-export core types
export type { LyriConfig, LanguageConfig, ThemeConfig }

// Configuration helpers
export { defineConfig } from './config'

// Core APIs
export { build } from './build'
export { createDevServer } from './dev-server'
export { LyricParser } from './parser'

// Plugin system
export type { LyriPlugin } from './plugin'
export { PluginManager } from './plugin'

// Theme system (types only for Node.js builds)
export type { ThemeDefinition } from './theme'

// Theme helpers (conditional export)
export const defineTheme = (theme: any) => theme