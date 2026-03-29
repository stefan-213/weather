<template>
  <div class="ai-chat-container">
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.role]"
      >
        <div class="message-avatar">
          <svg v-if="message.role === 'user'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <img v-else class="avatar-img" src="@/assets/img/ai助手.png" alt="AI" />
        </div>
        <div class="message-content">
          <div class="message-text" v-html="renderMarkdown(message.content)"></div>
          <div v-if="message.isStreaming" class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
          <div class="message-time">{{ message.time }}</div>
        </div>
      </div>
    </div>

    <div class="quick-questions">
      <button
        v-for="q in quickQuestions"
        :key="q.text"
        class="quick-btn"
        @click="askQuestion(q.text)"
        :disabled="loading"
      >
        {{ q.text }}
      </button>
    </div>

    <div class="chat-input-container">
      <button
        v-if="loading"
        class="stop-btn"
        @click="stopGeneration"
        title="停止生成"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2"/>
        </svg>
      </button>
      <input
        v-model="userInput"
        type="text"
        class="chat-input"
        placeholder="输入天气问题..."
        @keyup.enter="sendMessage"
        :disabled="loading"
      />
      <button class="send-btn" @click="sendMessage" :disabled="loading || !userInput.trim()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import { marked } from 'marked'
import { useStreamChat } from '@/composables/useStreamChat'
import { useWeatherStore } from '@/stores/weather'

const weatherStore = useWeatherStore()

const {
  messages,
  loading,
  error,
  sendMessage: streamSendMessage,
  stopGeneration,
  clearMessages
} = useStreamChat()

const userInput = ref('')
const messagesContainer = ref(null)

// 配置 marked 选项
marked.setOptions({
  breaks: true,
  gfm: true
})

// 快捷问题
const quickQuestions = [
  { text: '今天适合跑步吗？', intent: 'running' },
  { text: '明天要不要带伞？', intent: 'rain' },
  { text: '周末穿什么合适？', intent: 'clothing' },
  { text: '这周哪天最适合出门？', intent: 'outing' }
]

// 快捷问题点击
const askQuestion = (question) => {
  userInput.value = question
  sendMessage()
}

// 发送消息
const sendMessage = async () => {
  const content = userInput.value.trim()
  if (!content || loading.value) return

  userInput.value = ''
  await streamSendMessage(content)
  scrollToBottom()
}

// 渲染 Markdown
const renderMarkdown = (text) => {
  if (!text) return ''
  try {
    return marked.parse(text)
  } catch {
    return text
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化自动滚动
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 初始化欢迎消息
onMounted(() => {
  const weather = weatherStore.currentWeather
  const location = weatherStore.location?.chineseName || '当前位置'

  if (weather) {
    const temp = weather.temp
    const desc = weather.description || ''
    const humidity = weather.humidity
    const windSpeed = weather.wind_speed

    // 生成基础总结
    let summary = `${location}\n\n`
    summary += `当前天气：${desc}\n`
    summary += `温度：${temp}°C`
    if (weather.feels_like) {
      summary += `（体感 ${weather.feels_like}°C）`
    }
    summary += `\n湿度：${humidity}%\n`
    summary += `风速：${windSpeed} m/s`

    messages.value.push({
      role: 'assistant',
      content: summary + '\n\n有什么想了解的吗？可以问我："今天适合跑步吗？"、"明天要不要带伞？"等',
      time: formatTime()
    })
  } else {
    messages.value.push({
      role: 'assistant',
      content: '你好！有什么天气相关的问题都可以问我！',
      time: formatTime()
    })
  }
})

// 格式化时间
const formatTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.ai-chat-container {
  width: 100%;
  height: 100%;
  background: var(--card-bg);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  gap: 10px;
  max-width: 85%;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.assistant {
  align-self: flex-start;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.message-avatar svg {
  width: 18px;
  height: 18px;
  color: #5fabc7;
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #5fabc7 0%, #4a8da3 100%);
}

.message.user .message-avatar svg {
  color: white;
}

.message.assistant .message-avatar {
  background:#5fabc7;
  border-radius: 50%;
  padding: 0;
}

.avatar-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message.user .message-content {
  align-items: flex-end;
}

.message-text {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
  background: var(--bg-color);
  word-break: break-word;
}

.message.user .message-text {
  background: linear-gradient(135deg, #5fabc7 0%, #4a8da3 100%);
  color: white;
}

/* Markdown 样式 */
.message-text :deep(p) {
  margin: 0 0 8px 0;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(ul),
.message-text :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.message-text :deep(li) {
  margin: 4px 0;
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.message.user .message-text :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}

.message-text :deep(strong) {
  font-weight: 600;
}

.message-text :deep(em) {
  font-style: italic;
}

.message-text :deep(h1),
.message-text :deep(h2),
.message-text :deep(h3) {
  margin: 12px 0 8px 0;
  font-weight: 600;
}

.message.user .message-text :deep(h1),
.message.user .message-text :deep(h2),
.message.user .message-text :deep(h3) {
  color: white;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5fabc7;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.message-time {
  font-size: 10px;
  opacity: 0.5;
  color: var(--text-color);
  padding: 0 4px;
}

.quick-questions {
  padding: 8px 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-top: 1px solid var(--border-color);
}

.quick-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  font-size: 12px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover:not(:disabled) {
  background: #5fabc7;
  color: white;
  border-color: #5fabc7;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-input-container {
  padding: 12px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  border-top: 1px solid var(--border-color);
}

.chat-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 14px;
  background: var(--bg-color);
  color: var(--text-color);
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #5fabc7;
}

.chat-input::placeholder {
  color: var(--text-color);
  opacity: 0.4;
}

.chat-input:disabled {
  opacity: 0.7;
}

.send-btn,
.stop-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn {
  background: linear-gradient(135deg, #5fabc7 0%, #4a8da3 100%);
  color: white;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stop-btn {
  background: #e53e3e;
  color: white;
  flex-shrink: 0;
}

.stop-btn:hover {
  transform: scale(1.05);
}

.send-btn svg,
.stop-btn svg {
  width: 18px;
  height: 18px;
}
</style>
