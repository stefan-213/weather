/**
 * 增量 Markdown 渲染 Composable
 * 使用 diff-match-patch 实现增量更新，避免重建整个 DOM
 */

import { ref, nextTick } from 'vue'
import { marked } from 'marked'
import DiffMatchPatch from 'diff-match-patch'

interface RenderState {
  fullText: string        // 完整文本
  renderedHtml: string    // 已渲染的 HTML
  lastRenderedLen: number // 上次渲染的文本长度
}

const dmp = new DiffMatchPatch()

export function useIncrementalRender() {
  const renderStates = new Map<string, RenderState>()

  /**
   * HTML 转义（用于流式纯文本显示）
   */
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  /**
   * 计算增量文本差异
   */
  const getIncrementalDiff = (oldText: string, newText: string): string | null => {
    if (newText.length <= oldText.length) return null

    const diff = dmp.diff_main(oldText, newText)
    dmp.diff_cleanupSemantic(diff)

    // 只返回新增部分
    let incremental = ''
    for (const [op, text] of diff) {
      if (op === DiffMatchPatch.DIFF_INSERT) {
        incremental += text
      }
    }
    return incremental || null
  }

  /**
   * 增量渲染 Markdown
   * @param messageId 消息唯一 ID
   * @param newText 最新文本
   * @param isStreaming 是否正在流式接收
   * @returns 渲染后的 HTML
   */
  const renderIncremental = (
    messageId: string,
    newText: string,
    isStreaming: boolean
  ): string => {
    // 流式过程中使用纯文本显示，避免闪烁
    if (isStreaming) {
      return escapeHtml(newText)
    }

    // 获取或创建渲染状态
    let state = renderStates.get(messageId)
    if (!state) {
      state = {
        fullText: '',
        renderedHtml: '',
        lastRenderedLen: 0
      }
      renderStates.set(messageId, state)
    }

    // 如果文本没有增长，直接返回已渲染的 HTML
    if (newText.length <= state.lastRenderedLen) {
      return state.renderedHtml
    }

    // 如果是完全不同的内容（比如用户发送了新消息），重新渲染
    if (newText.length < state.fullText.length * 0.5) {
      state.fullText = newText
      state.lastRenderedLen = 0
    }

    // 计算增量
    const incrementalText = newText.slice(state.lastRenderedLen)
    if (!incrementalText) {
      return state.renderedHtml
    }

    try {
      // 增量渲染新增的 Markdown 部分
      const incrementalHtml = marked.parse(incrementalText)

      // 追加到已渲染内容
      // 注意：对于某些结构（如列表），直接追加可能不完整
      // 我们使用一个技巧：保持已完成的渲染 + 新增的增量渲染

      // 检测是否是列表/代码块的延续（以换行开头）
      const isContinuation = incrementalText.startsWith('\n') &&
        (incrementalText.includes('- ') || incrementalText.includes('```') || incrementalText.match(/^\d+\./))

      if (isContinuation) {
        // 对于列表/代码块延续，保持之前的完整渲染，追加新的增量
        state.renderedHtml = state.renderedHtml + incrementalHtml
      } else {
        // 完整重新渲染（因为 Markdown 结构可能改变）
        state.renderedHtml = marked.parse(newText) as string
      }

      state.fullText = newText
      state.lastRenderedLen = newText.length

      return state.renderedHtml
    } catch {
      // 解析失败，返回转义文本
      return escapeHtml(newText)
    }
  }

  /**
   * 清除某个消息的渲染状态
   */
  const clearState = (messageId: string) => {
    renderStates.delete(messageId)
  }

  /**
   * 清除所有渲染状态
   */
  const clearAllStates = () => {
    renderStates.clear()
  }

  /**
   * 获取缓存的 HTML（用于非流式消息）
   */
  const getCachedHtml = (text: string): string => {
    try {
      return marked.parse(text) as string
    } catch {
      return escapeHtml(text)
    }
  }

  return {
    renderIncremental,
    clearState,
    clearAllStates,
    getCachedHtml,
    escapeHtml
  }
}
