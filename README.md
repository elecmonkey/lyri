# Lyri

> A Static Site Generator.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/elecmonkey/lyri)

## 愿景

快速构建自己的私人歌词本。

## 构建流

```mermaid
graph LR
    A[Lyrics] --> B[Parser]
    B --> C[Data]
    C --> D[Virtual Modules]
    T[Theme System] --> D
    T --> E[Vue Components]
    D --> E
    E --> F[Vite Build]
    
    style T fill:#e1f5fe
    style E fill:#f3e5f5
```

```mermaid
graph LR
    F[Vite Build] --> G[Client Bundle]
    F --> H[Server Bundle]
    H --> I[SSR Static Render]
    I --> J[Static HTML + CSS]
    G --> K[Client Hydration]
    J --> K
    K --> L[Interactive Web App]
    
    style J fill:#e8f5e8
```

## 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/elecmonkey/lyri
cd lyri

# 安装依赖
pnpm install

# 构建工具
pnpm build:node
```

### 开发

```bash
# 启动开发服务器
node bin/lyri.js dev
```

### 构建

```bash
# 构建静态网站
node bin/lyri.js build

# 预览构建结果
node bin/lyri.js preview
```

## 当前状态

Demo，开发中。

## 许可证

MIT License