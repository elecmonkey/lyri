<template>
  <footer class="lyri-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h4>{{ siteData.title }}</h4>
          <p>{{ siteData.description }}</p>
        </div>
        
        <div class="footer-section">
          <h4>链接</h4>
          <ul class="footer-links">
            <li><router-link to="/">首页</router-link></li>
            <li><a href="#" @click.prevent>关于</a></li>
            <li><a href="#" @click.prevent>帮助</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>语言</h4>
          <ul class="footer-links">
            <li v-for="(lang, key) in siteData.languages" :key="key">
              <a href="#" @click.prevent="switchLanguage(key)">
                {{ lang.name }}
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 {{ siteData.title }}. Powered by Lyri.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 这里应该从虚拟模块导入，但现在先用默认值
const siteData = ref({
  title: 'Lyri',
  description: '歌词注音静态站点生成器',
  languages: {
    'zh-CN': { name: '普通话' },
    'zh-HK': { name: '粵語' }
  }
})

const switchLanguage = (languageKey: string) => {
  // 这里可以添加语言切换逻辑
  console.log('Switch to language:', languageKey)
}
</script>

<style scoped>
.lyri-footer {
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
}

.footer-section p {
  color: #666;
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #007acc;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
  color: #666;
}

@media (max-width: 768px) {
  .footer-container {
    padding: 1rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>