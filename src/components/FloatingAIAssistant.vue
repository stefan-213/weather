<template>
  <div class="floating-assistant" :class="{ expanded: isExpanded, maximized: isMaximized }">
    <!-- 展开状态的背景遮罩 -->
    <div v-if="isExpanded" class="overlay" @click="toggleExpand"></div>

    <!-- 主内容区域 -->
    <div class="assistant-content">
      <!-- 展开后的头部 -->
      <div v-if="isExpanded" class="assistant-header">
        <div class="header-left">
          <div class="ai-icon-wrapper">
            <img class="ai-icon" src="@/assets/img/ai助手.png" alt="AI" />
          </div>
          <span class="header-title">天气助手</span>
        </div>
        <div class="header-actions">
          <button v-if="isExpanded && !isMaximized" class="action-btn" @click="toggleMaximize" title="最大化">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
              <path d="M16 3h3a2 2 0 0 1 2 2v3"/>
              <path d="M8 21H5a2 2 0 0 1-2-2v-3"/>
              <path d="M16 21h3a2 2 0 0 1 2-2v-3"/>
            </svg>
          </button>
          <button v-if="isMaximized" class="action-btn" @click="toggleMaximize" title="还原">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3"/>
              <path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
              <path d="M3 16h3a2 2 0 0 1 2 2v3"/>
              <path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
            </svg>
          </button>
          <button class="close-btn" @click="toggleExpand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 聊天内容 -->
      <div v-if="isExpanded" class="chat-body">
        <AIChat></AIChat>
      </div>
    </div>

    <!-- 悬浮按钮 -->
    <button class="fab-button" @click="toggleExpand">
      <img class="fab-icon" src="@/assets/img/ai助手.png" alt="AI" />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AIChat from './AIChat.vue'

const isExpanded = ref(false)
const isMaximized = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  if (!isExpanded.value) {
    isMaximized.value = false
  }
}

const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
}
</script>

<style scoped>
.floating-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.floating-assistant.expanded {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 20px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: -1;
}

.assistant-content {
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s ease;
}

.floating-assistant:not(.expanded) .assistant-content {
  display: none;
}

.floating-assistant.expanded {
  gap: 16px;
}

.floating-assistant.expanded .assistant-content {
  width: 380px;
  height: 550px;
  display: flex;
  flex-direction: column;
}

.assistant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--card-bg);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #5fabc7 0%, #4a8da3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.ai-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}
.close-btn,
.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.close-btn:hover,
.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.close-btn svg,
.action-btn svg {
  width: 18px;
  height: 18px;
  color: var(--text-color);
}

.chat-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.chat-body :deep(.ai-chat-container) {
  height: 100%;
  border-radius: 0;
  background: transparent;
}

/* 悬浮按钮 */
.fab-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #5fabc7 0%, #4a8da3 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(95, 171, 199, 0.4);
  transition: all 0.3s ease;
  margin-left: auto;
}

.fab-button:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(95, 171, 199, 0.5);
}

.fab-button:active {
  transform: scale(0.95);
}

.fab-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

/* 展开动画 */
.floating-assistant:not(.expanded) .fab-button {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 16px rgba(95, 171, 199, 0.4);
  }
  50% {
    box-shadow: 0 4px 24px rgba(95, 171, 199, 0.6);
  }
  100% {
    box-shadow: 0 4px 16px rgba(95, 171, 199, 0.4);
  }
}

/* 最大化状态 */
.floating-assistant.maximized .assistant-content {
  width: 90vw;
  height: 85vh;
  max-width: 1200px;
  border-radius: 20px;
}

.floating-assistant.maximized .overlay {
  background: rgba(0, 0, 0, 0.5);
}

.floating-assistant.maximized .assistant-header {
  padding: 18px 20px;
}

.floating-assistant.maximized .header-title {
  font-size: 17px;
}

.floating-assistant.maximized .chat-body {
  padding: 0;
}

.floating-assistant.maximized .chat-body :deep(.ai-chat-container) {
  border-radius: 0;
}

.floating-assistant.maximized .fab-button {
  display: none;
}

/* 响应式 */
@media (max-width: 480px) {
  .floating-assistant.expanded .assistant-content {
    width: 100%;
    height: 100%;
    max-height: 100%;
    min-height: unset;
    border-radius: 0;
  }

  .floating-assistant.maximized .assistant-content {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .floating-assistant {
    padding: 16px;
  }

  .fab-button {
    width: 50px;
    height: 50px;
  }

  .fab-icon {
    width: 24px;
    height: 24px;
  }
}
</style>
