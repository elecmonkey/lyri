<template>
  <div class="minimal-lyric-content">
    <div class="lyric-lines">
      <div 
        v-for="(line, index) in lyrics" 
        :key="index" 
        class="minimal-lyric-line"
      >
        <div class="line-content">
          <span 
            v-for="(char, charIndex) in line.text" 
            :key="charIndex"
            class="minimal-char"
          >
            <span v-if="line.ruby && line.ruby[charIndex]" class="ruby">
              {{ line.ruby[charIndex] }}
            </span>
            <span class="char">{{ char }}</span>
          </span>
        </div>
        
        <div v-if="line.translation && showTranslation" class="translation">
          <span v-for="(trans, lang) in line.translation" :key="lang">
            {{ trans }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface LyricLine {
  text: string
  ruby?: string[]
  translation?: Record<string, string>
}

const props = defineProps<{
  lyrics: LyricLine[]
  options?: {
    showTranslation?: boolean
  }
}>()

const showTranslation = computed(() => {
  return props.options?.showTranslation ?? true
})
</script>

<style scoped>
.minimal-lyric-content {
  line-height: 1.8;
}

.lyric-lines {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.minimal-lyric-line {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.line-content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.minimal-char {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.2rem;
}

.ruby {
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 0.2rem;
  white-space: nowrap;
}

.char {
  font-size: 1.2rem;
  color: #333;
}

.translation {
  font-size: 0.9rem;
  color: #888;
  font-style: italic;
  margin-left: 1rem;
}

@media (max-width: 768px) {
  .char {
    font-size: 1.1rem;
  }
  
  .ruby {
    font-size: 0.65rem;
  }
}
</style>