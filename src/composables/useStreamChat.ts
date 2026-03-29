/**
 * 流式聊天 Composable - 工业级版本
 * 特性：正则缓冲区解析 + 超时感知 + 错误兜底
 */

import { ref, onUnmounted } from 'vue'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  time?: string
}

export function useStreamChat() {
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let abortController: AbortController | null = null
  let timeoutChecker: ReturnType<typeof setInterval> | null = null
  let lastChunkTime = 0

  // API 基础 URL
  const API_BASE = import.meta.env.VITE_AI_API_URL || 'http://localhost:3001'

  // 格式化时间
  const formatTime = () => {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  }

  /**
   * 发送消息并流式接收响应
   */
  const sendMessage = async (content: string) => {
    if (loading.value) return

    // 添加用户消息
    messages.value.push({
      role: 'user',
      content,
      time: formatTime()
    })

    loading.value = true
    error.value = null
    lastChunkTime = Date.now()

    // 添加助手消息占位
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      isStreaming: true,
      time: formatTime()
    }
    messages.value.push(assistantMessage)

    try {
      abortController = new AbortController()

      const response = await fetch(`${API_BASE}/api/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content,
          history: messages.value
            .filter(m => !m.isStreaming)
            .slice(-20)
            .map(m => ({ role: m.role, content: m.content }))
        }),
        signal: abortController.signal
      })

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`)
      }

      // 流式读取
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      // 超时感知：每 5 秒检查一次，15 秒无响应则中断
      timeoutChecker = setInterval(() => {
        if (Date.now() - lastChunkTime > 15000) {
          abortController?.abort()
          assistantMessage.content += '\n\n⚠️ 响应超时，请重试'
          assistantMessage.isStreaming = false
          loading.value = false
          clearInterval(timeoutChecker!)
        }
      }, 5000)

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        lastChunkTime = Date.now()
        buffer += decoder.decode(value, { stream: true })

        // 按 SSE 格式解析：每条数据以 "data: xxx\n\n" 结尾
        // 持续处理完整的 data: 行，直到遇到不完整的行（留在 buffer）
        while (true) {
          const lineEnd = buffer.indexOf('\n')
          if (lineEnd === -1) break

          const line = buffer.slice(0, lineEnd).trim()
          buffer = buffer.slice(lineEnd + 1)

          if (!line.startsWith('data: ')) continue

          const data = line.slice(6)

          if (data === '[DONE]') {
            break
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              assistantMessage.content += parsed.content
              messages.value = [...messages.value]
            }
            if (parsed.error) {
              throw new Error(parsed.error)
            }
          } catch {
            // 忽略解析错误
          }
        }
      }

      assistantMessage.isStreaming = false
      messages.value = [...messages.value]

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        if (assistantMessage.content && !assistantMessage.content.includes('超时')) {
          assistantMessage.content += '\n\n[已停止生成]'
        }
      } else {
        error.value = err instanceof Error ? err.message : '发送失败'
        assistantMessage.content = '抱歉，发生了错误，请稍后重试。'
      }
      assistantMessage.isStreaming = false
      messages.value = [...messages.value]
    } finally {
      loading.value = false
      abortController = null
      if (timeoutChecker) {
        clearInterval(timeoutChecker)
        timeoutChecker = null
      }
    }
  }

  /**
   * 停止生成
   */
  const stopGeneration = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    const streamingMsg = messages.value.find(m => m.isStreaming)
    if (streamingMsg) {
      streamingMsg.isStreaming = false
    }
    loading.value = false
    if (timeoutChecker) {
      clearInterval(timeoutChecker)
      timeoutChecker = null
    }
  }

  /**
   * 清除对话历史
   */
  const clearMessages = () => {
    messages.value = []
  }

  /**
   * 删除最后一条消息
   */
  const removeLastMessage = () => {
    if (messages.value.length > 0) {
      messages.value.pop()
    }
  }

  onUnmounted(() => {
    if (abortController) {
      abortController.abort()
    }
    if (timeoutChecker) {
      clearInterval(timeoutChecker)
    }
  })

  return {
    messages,
    loading,
    error,
    sendMessage,
    stopGeneration,
    clearMessages,
    removeLastMessage
  }
}
