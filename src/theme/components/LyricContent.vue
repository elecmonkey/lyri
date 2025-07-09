<template>
  <div class="lyric-content">
    <div class="lyric-lines">
      <LyricLine 
        v-for="(line, index) in lyrics" 
        :key="index"
        :line="line"
        :options="currentOptions"
        :language="currentLanguage"
      />
    </div>
    
    <div class="lyric-controls" v-if="showControls">
      <button @click="toggleRuby" class="control-btn">
        {{ currentOptions.showRuby ? '隐藏注音' : '显示注音' }}
      </button>
      <button @click="toggleTranslation" class="control-btn">
        {{ currentOptions.showTranslation ? '隐藏翻译' : '显示翻译' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import LyricLine from './LyricLine.vue'

const props = defineProps({
  lyrics: {
    type: Array,
    required: true
  },
  options: {
    type: Object,
    default: () => ({
      showRuby: true,
      showTranslation: true,
      fontSize: 'medium',
      lineHeight: 1.6
    })
  }
})

const currentLanguage = ref('zh-CN')
const showControls = ref(true)

// 创建响应式的选项状态
const currentOptions = reactive({
  showRuby: props.options.showRuby !== undefined ? props.options.showRuby : true,
  showTranslation: props.options.showTranslation !== undefined ? props.options.showTranslation : true,
  fontSize: props.options.fontSize || 'medium',
  lineHeight: props.options.lineHeight || 1.6
})

// 监听props变化，更新本地状态
watch(() => props.options, (newOptions) => {
  if (newOptions.showRuby !== undefined) {
    currentOptions.showRuby = newOptions.showRuby
  }
  if (newOptions.showTranslation !== undefined) {
    currentOptions.showTranslation = newOptions.showTranslation
  }
  if (newOptions.fontSize) {
    currentOptions.fontSize = newOptions.fontSize
  }
  if (newOptions.lineHeight) {
    currentOptions.lineHeight = newOptions.lineHeight
  }
}, { immediate: true, deep: true })

const toggleRuby = () => {
  currentOptions.showRuby = !currentOptions.showRuby
}

const toggleTranslation = () => {
  currentOptions.showTranslation = !currentOptions.showTranslation
}
</script>

<style scoped>
.lyric-content {
  max-width: 800px;
  margin: 0 auto;
}

.lyric-lines {
  margin-bottom: 2rem;
}

.lyric-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.control-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background: #0056b3;
}

.control-btn:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .lyric-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .control-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>