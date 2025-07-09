<template>
  <div class="minimal-layout">
    <main class="minimal-main">
      <div class="minimal-container">
        <div class="minimal-header" v-if="meta">
          <h1 class="minimal-title">{{ meta.title }}</h1>
          <p class="minimal-artist" v-if="meta.artist">{{ meta.artist }}</p>
        </div>
        
        <div class="minimal-content">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  meta: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.minimal-layout {
  min-height: 100vh;
  background: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.minimal-main {
  padding: 2rem;
}

.minimal-container {
  max-width: 800px;
  margin: 0 auto;
}

.minimal-header {
  text-align: center;
  margin-bottom: 3rem;
}

.minimal-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 300;
}

.minimal-artist {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.minimal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .minimal-main {
    padding: 1rem;
  }
  
  .minimal-content {
    padding: 1rem;
  }
  
  .minimal-title {
    font-size: 1.5rem;
  }
}
</style>