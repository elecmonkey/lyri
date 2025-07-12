<template>
  <span class="lyric-char" :class="charClasses">
    <!-- 注音层 -->
    <span v-if="ruby && options.showRuby" class="ruby-layer">
      <span class="ruby-text">{{ ruby }}</span>
      <ToneMark 
        v-if="tone && options.showTone" 
        :tone="tone" 
        :system="toneSystem"
      />
    </span>
    
    <!-- 字符层 -->
    <span class="char-layer">{{ char }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import ToneMark from './ToneMark.vue'
import { getToneSystemForLanguage } from '../../utils'

const props = defineProps({
  char: {
    type: String,
    required: true
  },
  ruby: {
    type: String,
    default: null
  },
  tone: {
    type: Number,
    default: null
  },
  options: {
    type: Object,
    default: () => ({
      showRuby: true,
      showTone: true,
      fontSize: 'medium',
      language: 'zh-CN'
    })
  }
})

const charClasses = computed(() => ({
  'has-ruby': props.ruby && props.options.showRuby,
  'has-tone': props.tone && props.options.showTone,
  'is-punctuation': /[。，！？；：""''（）【】《》]/.test(props.char),
  'is-space': /\s/.test(props.char),
  [`font-size-${props.options.fontSize}`]: props.options.fontSize
}))

const toneSystem = computed(() => {
  // 自动根据语言代码检测声调系统
  return getToneSystemForLanguage(props.options.language || 'en')
})
</script>

<style scoped>
.lyric-char {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 0 0.05rem;
  vertical-align: top;
}

.lyric-char.has-ruby {
  margin-bottom: 0.5rem;
}

.ruby-layer {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.7em;
  color: #666;
  margin-bottom: 0.2rem;
  min-height: 1.2em;
}

.ruby-text {
  font-family: 'Arial', sans-serif;
  font-weight: normal;
  white-space: nowrap;
}

.char-layer {
  font-weight: 500;
  color: #333;
  white-space: pre;
}

.lyric-char.is-punctuation {
  margin: 0;
}

.lyric-char.is-space .char-layer {
  width: 0.5em;
}

/* 字体大小变体 */
.font-size-small {
  font-size: 0.875rem;
}

.font-size-medium {
  font-size: 1rem;
}

.font-size-large {
  font-size: 1.25rem;
}

.font-size-xlarge {
  font-size: 1.5rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .lyric-char {
    margin: 0 0.02rem;
  }
  
  .ruby-layer {
    font-size: 0.65em;
  }
}

/* 打印样式 */
@media print {
  .lyric-char {
    margin: 0 0.1rem;
  }
  
  .ruby-layer {
    color: #000;
  }
  
  .char-layer {
    color: #000;
  }
}
</style>