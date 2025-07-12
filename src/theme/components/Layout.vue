<template>
  <div class="lyric-layout">
    <header class="lyric-header">
      <nav class="lyric-nav">
        <div class="nav-brand">
          <a href="/" class="brand-link">{{ siteData.title }}</a>
        </div>
        <div class="nav-menu">
          <a href="/" class="nav-link">首页</a>
        </div>
      </nav>
    </header>

    <main class="lyric-main">
      <div class="lyric-container">
        <div class="lyric-meta" v-if="meta">
          <h1 class="lyric-title">{{ meta.title }}</h1>
          <p class="lyric-artist" v-if="meta.artist">{{ meta.artist }}</p>
          <div class="lyric-tags" v-if="meta.tags && meta.tags.length">
            <span v-for="tag in meta.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        
        <div class="lyric-content">
          <slot />
        </div>
      </div>
    </main>

    <footer class="lyric-footer">
      <p>&copy; 2024 {{ siteData.title }}. Powered by Lyri.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import siteData from '/@lyri/site-data'

const props = defineProps({
  meta: {
    type: Object,
    default: null
  },
  config: {
    type: Object,
    default: () => ({})
  }
})

// 语言检测已移至自动化处理，无需手动选择
</script>

<style scoped>
.lyric-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.lyric-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.lyric-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.brand-link {
  color: #333;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #f5f5f5;
}



.lyric-main {
  flex: 1;
  padding: 2rem;
}

.lyric-container {
  max-width: 1200px;
  margin: 0 auto;
}

.lyric-meta {
  margin-bottom: 2rem;
  text-align: center;
}

.lyric-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.lyric-artist {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1rem;
}

.lyric-tags {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
}

.lyric-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.lyric-footer {
  background: #f8f9fa;
  padding: 2rem;
  text-align: center;
  color: #666;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 768px) {
  .lyric-nav {
    padding: 0 1rem;
  }
  
  .nav-menu {
    gap: 1rem;
  }
  
  .lyric-main {
    padding: 1rem;
  }
  
  .lyric-content {
    padding: 1rem;
  }
  
  .lyric-title {
    font-size: 2rem;
  }
}
</style>