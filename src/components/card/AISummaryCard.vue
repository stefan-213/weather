<template>
  <div class="ai-summary-card">
    <div class="card-header">
      <div class="header-left">
        <svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
          <path d="M12 2a10 10 0 0 1 10 10"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span class="title">AI 天气助手</span>
      </div>
      <button v-if="error" class="retry-btn" @click="handleRetry">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 4v6h6M23 20v-6h-6"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
        </svg>
      </button>
    </div>

    <div class="card-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>正在生成天气总结...</span>
      </div>

      <div v-else-if="summary" class="summary-content" v-html="formattedSummary"></div>

      <div v-else-if="error" class="error-state">
        <span class="error-icon">!</span>
        <span>{{ error }}</span>
      </div>

      <div v-else class="empty-state">
        <span>点击按钮获取 AI 天气总结</span>
      </div>
    </div>

    <button class="generate-btn" @click="handleGenerate" :disabled="loading">
      <span v-if="!loading">生成总结</span>
      <span v-else>生成中...</span>
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useAISummary } from '@/composables/useAISummary'

const props = defineProps({
  weatherData: {
    type: Object,
    default: null
  },
  location: {
    type: String,
    default: ''
  }
})

const { summary, loading, error, generateSummary } = useAISummary()

// 格式化总结内容（简单的 Markdown 到 HTML 转换）
const formattedSummary = computed(() => {
  if (!summary.value) return ''

  return summary.value
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
})

const handleGenerate = async () => {
  if (!props.weatherData) {
    error.value = '天气数据不可用'
    return
  }

  await generateSummary(props.weatherData, props.location)
}

const handleRetry = () => {
  handleGenerate()
}

// 当天气数据更新时，自动生成总结
watch(() => props.weatherData, (newData) => {
  if (newData && !summary.value) {
    handleGenerate()
  }
}, { immediate: true })
</script>

<style scoped>
.ai-summary-card {
  width: 100%;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-icon {
  width: 20px;
  height: 20px;
  color: #5fabc7;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.retry-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: rgba(95, 171, 199, 0.1);
}

.retry-btn svg {
  width: 16px;
  height: 16px;
  color: #5fabc7;
}

.card-content {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  opacity: 0.7;
  font-size: 13px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-top-color: #5fabc7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.summary-content {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-color);
  width: 100%;
}

.summary-content :deep(br) {
  display: block;
  margin: 4px 0;
}

.summary-content :deep(.emoji) {
  margin-right: 4px;
}

.error-state {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e53e3e;
  font-size: 13px;
}

.error-icon {
  width: 18px;
  height: 18px;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.empty-state {
  color: var(--text-color);
  opacity: 0.5;
  font-size: 13px;
}

.generate-btn {
  width: 100%;
  padding: 10px 16px;
  background: linear-gradient(135deg, #5fabc7 0%, #4a8da3 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(95, 171, 199, 0.3);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
