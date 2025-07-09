<template>
  <nav class="lyri-navigation">
    <div class="nav-container">
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          {{ siteData.title }}
        </router-link>
      </div>
      
      <div class="nav-menu">
        <router-link to="/" class="nav-link">首页</router-link>
        
        <div class="nav-language" v-if="hasMultipleLanguages">
          <select 
            :value="currentLanguage" 
            @change="handleLanguageChange"
            class="language-select"
          >
            <option 
              v-for="(lang, key) in siteData.languages" 
              :key="key" 
              :value="key"
            >
              {{ lang.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// 这里应该从虚拟模块导入，但现在先用默认值
const siteData = ref({
  title: 'Lyri',
  languages: {
    'zh-CN': { name: '普通话' },
    'zh-HK': { name: '粵語' }
  }
})

const currentLanguage = ref('zh-CN')

const hasMultipleLanguages = computed(() => {
  return Object.keys(siteData.value.languages).length > 1
})

const handleLanguageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  currentLanguage.value = target.value
  // 这里可以添加语言切换逻辑
}
</script>

<style scoped>
.lyri-navigation {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
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
  transition: color 0.2s;
}

.brand-link:hover {
  color: #007acc;
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

.nav-link.router-link-active {
  color: #007acc;
  background-color: #f0f8ff;
}

.language-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }
  
  .nav-menu {
    gap: 1rem;
  }
  
  .nav-brand {
    font-size: 1.2rem;
  }
}
</style>