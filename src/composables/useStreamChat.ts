/**
 * 流式聊天 Composable
 * 支持 SSE 流式输出 + Markdown 渲染
 */

import { ref, onUnmounted, nextTick } from 'vue'

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

  // API 基础 URL（开发环境指向后端服务）
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
            .slice(-20) // 只传最近 20 条对话
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

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // 处理 SSE 数据
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)

            if (data === '[DONE]') {
              break
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                // 更新内容
                assistantMessage.content += parsed.content
                // 强制 Vue 更新 DOM
                nextTick(() => {
                  messages.value = [...messages.value]
                })
              }
              if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch (e) {
              // 忽略解析错误（可能是不完整的 JSON）
            }
          }
        }
      }

      assistantMessage.isStreaming = false
      messages.value = [...messages.value]

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('请求已取消')
      } else {
        error.value = err instanceof Error ? err.message : '发送失败'
        assistantMessage.content = '抱歉，发生了错误，请稍后重试。'
        assistantMessage.isStreaming = false
        messages.value = [...messages.value]
      }
    } finally {
      loading.value = false
      abortController = null
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
    // 标记正在流式的消息为已完成
    const streamingMsg = messages.value.find(m => m.isStreaming)
    if (streamingMsg) {
      streamingMsg.isStreaming = false
    }
    loading.value = false
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
