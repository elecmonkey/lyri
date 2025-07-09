<template>
  <div class="lyric-line" :class="{ 'has-translation': hasTranslation }">
    <div class="line-text">
      <LyricChar 
        v-for="(char, index) in processedChars" 
        :key="index"
        :char="char.text"
        :ruby="char.ruby"
        :tone="char.tone"
        :options="charOptions"
      />
    </div>
    
    <div 
      v-if="hasTranslation && options.showTranslation" 
      class="line-translation"
    >
      <span class="translation-text">{{ translation }}</span>
    </div>
    
    <div v-if="line.notes" class="line-notes">
      <span class="notes-text">{{ line.notes }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import LyricChar from './LyricChar.vue'

const props = defineProps({
  line: {
    type: Object,
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
  },
  language: {
    type: String,
    default: 'zh-CN'
  }
})

const processedChars = computed(() => {
  const chars = []
  const text = props.line.text || ''
  const ruby = props.line.ruby || []
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    
    // 跳过空白字符
    if (char.trim() === '') {
      chars.push({
        text: char,
        ruby: null,
        tone: null
      })
      continue
    }
    
    // 处理注音
    let rubyText = null
    let tone = null
    
    if (ruby[i]) {
      rubyText = ruby[i]
      
      // 简单的声调检测（这里可以根据具体需求扩展）
      if (props.language === 'zh-CN') {
        // 普通话四声
        const toneMatch = rubyText.match(/([1-4])$/)
        if (toneMatch) {
          tone = parseInt(toneMatch[1])
          rubyText = rubyText.replace(/[1-4]$/, '')
        }
      } else if (props.language === 'zh-HK') {
        // 粤语六声（简化处理）
        const toneMatch = rubyText.match(/([1-6])$/)
        if (toneMatch) {
          tone = parseInt(toneMatch[1])
          rubyText = rubyText.replace(/[1-6]$/, '')
        }
      }
    }
    
    chars.push({
      text: char,
      ruby: rubyText,
      tone: tone
    })
  }
  
  return chars
})

const hasTranslation = computed(() => {
  return props.line.translation && Object.keys(props.line.translation).length > 0
})

const translation = computed(() => {
  if (!hasTranslation.value) return ''
  
  // 优先显示当前语言的翻译，否则显示第一个可用翻译
  const translations = props.line.translation
  return translations[props.language] || 
         translations['en'] || 
         translations['zh-CN'] || 
         Object.values(translations)[0]
})

const charOptions = computed(() => ({
  ...props.options,
  showRuby: props.options.showRuby,
  language: props.language
}))
</script>

<style scoped>
.lyric-line {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.lyric-line.has-translation {
  border-left-color: #28a745;
}

.line-text {
  display: flex;
  flex-wrap: wrap;
  gap: 0.1rem;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  line-height: 2;
}

.line-translation {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
}

.translation-text {
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
}

.line-notes {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
}

.notes-text {
  color: #999;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .lyric-line {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .line-text {
    font-size: 1.25rem;
  }
}
</style>