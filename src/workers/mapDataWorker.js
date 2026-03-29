/**
 * 地图数据处理 Web Worker
 * 用于在后台线程处理省份天气数据，避免阻塞主线程
 */

// 缓存配置
const CACHE_KEY = 'chinaWeatherCache'
const CACHE_DURATION = 30 * 60 * 1000 // 30分钟

/**
 * 从 localStorage 加载缓存
 */
const loadCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data
      }
    }
  } catch (e) {
    console.warn('Worker: 加载缓存失败', e)
  }
  return null
}

/**
 * 保存数据到 localStorage
 */
const saveCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.warn('Worker: 保存缓存失败', e)
  }
}

/**
 * 处理省份天气数据
 * @param {Array} provinces - 省份坐标数据
 * @param {Object} existingData - 已有天气数据
 */
const processProvinceData = (provinces, existingData = {}) => {
  return provinces.map(([name, coord]) => {
    const [lng, lat] = coord
    const weatherData = existingData[name]

    return {
      name,
      value: weatherData?.value ?? null,
      coord: [lng, lat],
      weather: weatherData?.weather ?? null
    }
  })
}

/**
 * 处理地图可视化数据
 * @param {Array} mapData - 原始地图数据
 */
const processMapData = (mapData) => {
  // 计算温度统计
  const temps = mapData
    .filter(item => item.value !== null)
    .map(item => item.value)

  const stats = {
    count: temps.length,
    min: temps.length ? Math.min(...temps) : null,
    max: temps.length ? Math.max(...temps) : null,
    avg: temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : null
  }

  // 按温度范围分组
  const tempRanges = {
    cold: mapData.filter(item => item.value !== null && item.value <= 10).length,
    cool: mapData.filter(item => item.value !== null && item.value > 10 && item.value <= 20).length,
    mild: mapData.filter(item => item.value !== null && item.value > 20 && item.value <= 28).length,
    hot: mapData.filter(item => item.value !== null && item.value > 28).length
  }

  return { stats, tempRanges }
}

/**
 * 消息处理
 */
self.onmessage = (event) => {
  const { type, payload, id } = event.data

  switch (type) {
    case 'LOAD_CACHE':
      // 加载缓存
      const cachedData = loadCache()
      self.postMessage({ type: 'CACHE_LOADED', id, payload: cachedData })
      break

    case 'SAVE_CACHE':
      // 保存缓存
      saveCache(payload)
      self.postMessage({ type: 'CACHE_SAVED', id })
      break

    case 'PROCESS_PROVINCES':
      // 处理省份数据
      const processed = processProvinceData(payload.provinces, payload.existingData)
      self.postMessage({ type: 'PROVINCES_PROCESSED', id, payload: processed })
      break

    case 'PROCESS_MAP_DATA':
      // 处理地图可视化数据
      const result = processMapData(payload)
      self.postMessage({ type: 'MAP_DATA_PROCESSED', id, payload: result })
      break

    default:
      self.postMessage({ type: 'ERROR', id, payload: 'Unknown message type' })
  }
}
