/**
 * Web Worker 管理 Hook
 * 用于在后台线程处理地图数据，避免阻塞 UI
 */

import { ref, onUnmounted } from 'vue'

export function useMapWorker() {
  const worker = ref(null)
  const isReady = ref(false)
  const pendingRequests = new Map()
  let requestId = 0

  // 初始化 Worker
  const initWorker = () => {
    if (worker.value) return

    try {
      worker.value = new Worker(
        new URL('../workers/mapDataWorker.js', import.meta.url),
        { type: 'module' }
      )

      worker.value.onmessage = (event) => {
        const { type, id, payload } = event.data

        // 处理响应
        if (pendingRequests.has(id)) {
          const { resolve, reject } = pendingRequests.get(id)
          pendingRequests.delete(id)

          if (type === 'ERROR') {
            reject(new Error(payload))
          } else {
            resolve(payload)
          }
        }
      }

      worker.value.onerror = (error) => {
        console.error('Worker 错误:', error)
        isReady.value = false
      }

      isReady.value = true
    } catch (error) {
      console.error('创建 Worker 失败:', error)
    }
  }

  // 发送消息到 Worker
  const postMessage = (type, payload) => {
    return new Promise((resolve, reject) => {
      if (!worker.value) {
        reject(new Error('Worker 未初始化'))
        return
      }

      const id = ++requestId
      pendingRequests.set(id, { resolve, reject })
      worker.value.postMessage({ type, payload, id })
    })
  }

  // 加载缓存
  const loadCache = () => {
    return postMessage('LOAD_CACHE', null)
  }

  // 保存缓存
  const saveCache = (data) => {
    return postMessage('SAVE_CACHE', data)
  }

  // 处理省份数据
  const processProvinces = (provinces, existingData) => {
    return postMessage('PROCESS_PROVINCES', { provinces, existingData })
  }

  // 处理地图数据
  const processMapData = (mapData) => {
    return postMessage('PROCESS_MAP_DATA', mapData)
  }

  // 销毁 Worker
  const destroy = () => {
    if (worker.value) {
      worker.value.terminate()
      worker.value = null
      isReady.value = false
      pendingRequests.clear()
    }
  }

  onUnmounted(() => {
    destroy()
  })

  return {
    isReady,
    initWorker,
    loadCache,
    saveCache,
    processProvinces,
    processMapData,
    destroy
  }
}
