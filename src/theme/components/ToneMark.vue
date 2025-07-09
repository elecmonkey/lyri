<template>
  <span class="tone-mark" :class="toneClasses">
    {{ toneDisplay }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tone: {
    type: Number,
    required: true
  },
  system: {
    type: String,
    default: 'pinyin',
    validator: (value) => ['pinyin', 'jyutping', 'ipa'].includes(value)
  }
})

const toneClasses = computed(() => ({
  [`tone-${props.tone}`]: true,
  [`system-${props.system}`]: true
}))

const toneDisplay = computed(() => {
  if (props.system === 'pinyin') {
    // 普通话四声
    const toneMarks = ['', '¹', '²', '³', '⁴']
    return toneMarks[props.tone] || ''
  } else if (props.system === 'jyutping') {
    // 粤语六声
    const toneMarks = ['', '¹', '²', '³', '⁴', '⁵', '⁶']
    return toneMarks[props.tone] || ''
  } else if (props.system === 'ipa') {
    // IPA 声调标记
    const toneMarks = ['', '˥', '˧˥', '˨˩˦', '˥˩']
    return toneMarks[props.tone] || ''
  }
  
  return ''
})
</script>

<style scoped>
.tone-mark {
  font-size: 0.8em;
  line-height: 1;
  margin-left: 0.1em;
  vertical-align: super;
}

/* 普通话声调颜色 */
.system-pinyin.tone-1 {
  color: #e74c3c; /* 一声 - 红色 */
}

.system-pinyin.tone-2 {
  color: #f39c12; /* 二声 - 橙色 */
}

.system-pinyin.tone-3 {
  color: #27ae60; /* 三声 - 绿色 */
}

.system-pinyin.tone-4 {
  color: #3498db; /* 四声 - 蓝色 */
}

/* 粤语声调颜色 */
.system-jyutping.tone-1 {
  color: #e74c3c; /* 第一声 */
}

.system-jyutping.tone-2 {
  color: #f39c12; /* 第二声 */
}

.system-jyutping.tone-3 {
  color: #27ae60; /* 第三声 */
}

.system-jyutping.tone-4 {
  color: #3498db; /* 第四声 */
}

.system-jyutping.tone-5 {
  color: #9b59b6; /* 第五声 */
}

.system-jyutping.tone-6 {
  color: #34495e; /* 第六声 */
}

/* IPA 声调 */
.system-ipa {
  color: #666;
  font-family: 'Charis SIL', 'Doulos SIL', 'Times New Roman', serif;
}

/* 响应式 */
@media (max-width: 768px) {
  .tone-mark {
    font-size: 0.75em;
  }
}

/* 打印样式 */
@media print {
  .tone-mark {
    color: #000 !important;
  }
}
</style>