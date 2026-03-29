<template>
  <div class="heat-map-container">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import { useMapWorker } from '@/composables/useMapWorker'

const chartContainer = ref(null)
const mapWorker = useMapWorker()
const isMapRegistered = ref(false)
let chartInstance = null

// 添加当前主题的响应式变量
const currentTheme = ref('light')

// 省份坐标（省级地图的中心点）
const provinceCoordinates = {
  '北京': [116.46, 39.92],
  '天津': [117.2, 39.13],
  '上海': [121.48, 31.22],
  '重庆': [106.54, 29.59],
  '河北': [114.48, 38.03],
  '山西': [112.53, 37.87],
  '内蒙古': [111.65, 40.82],
  '辽宁': [123.38, 41.8],
  '吉林': [125.35, 43.88],
  '黑龙江': [126.63, 45.75],
  '江苏': [118.78, 32.04],
  '浙江': [120.19, 30.26],
  '安徽': [117.27, 31.86],
  '福建': [119.3, 26.08],
  '江西': [115.89, 28.68],
  '山东': [117, 36.65],
  '河南': [113.65, 34.76],
  '湖北': [114.31, 30.52],
  '湖南': [113, 28.21],
  '广东': [113.23, 23.16],
  '广西': [108.33, 22.84],
  '海南': [110.35, 20.02],
  '四川': [104.06, 30.67],
  '贵州': [106.71, 26.57],
  '云南': [102.73, 25.04],
  '西藏': [91.11, 29.97],
  '陕西': [108.95, 34.27],
  '甘肃': [103.73, 36.03],
  '青海': [101.74, 36.56],
  '宁夏': [106.27, 38.47],
  '新疆': [87.68, 43.77],
  '台湾': [121.5, 25.03],
  '香港': [114.17, 22.28],
  '澳门': [113.54, 22.19],
  '南海诸岛': [115.0, 15.0]    
}

// 存储各省份的天气数据
const provinceWeatherData = ref({})
const loading = ref(false)

// 缓存配置
const CACHE_KEY = 'chinaWeatherCache'
const CACHE_DURATION = 30 * 60 * 1000 // 30分钟

// 加载缓存数据
const loadCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_DURATION) {
        provinceWeatherData.value = data
        updateChart()
        return true
      }
    }
  } catch (e) {
    console.warn('加载缓存失败:', e)
  }
  return false
}

// 保存缓存数据
const saveCache = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: provinceWeatherData.value,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.warn('保存缓存失败:', e)
  }
}

// 根据主题获取颜色配置
const getThemeColors = () => {
  return currentTheme.value === 'dark' 
    ? {
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff',
        subTextColor: '#bdbdbd',
        areaColor: '#2d2d2d',
        borderColor: '#cccacad7',
        emphasisAreaColor: '#ff7e00',
        emphasisBorderColor: '#e65c00',
        visualMapTextColor: '#bdbdbd'
      }
    : {
        backgroundColor: '#E9E9E9',
        textColor: '#222222',
        subTextColor: '#525252',
        areaColor: '#f5f5f5',
        borderColor: '#ddd',
        emphasisAreaColor: '#ff7e00',
        emphasisBorderColor: '#e65c00',
        visualMapTextColor: '#2c3e50'
      }
}

// 注册地图数据
const registerMap = async () => {
  if (isMapRegistered.value) return
  
  try {
    // 使用正确的 echarts 地图数据 CDN 路径
    const response = await fetch('https://cdn.jsdelivr.net/npm/echarts/map/json/china.json')
    const chinaJson = await response.json()
    echarts.registerMap('china', chinaJson)
    isMapRegistered.value = true
    initChart()
  } catch (error) {
    console.error('加载地图数据失败:', error)
  }
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return
  
  chartInstance = echarts.init(chartContainer.value)
  updateChart()
  window.addEventListener('resize', handleResize)
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 直接使用axios获取天气数据，避免修改store的状态
const getProvinceWeather = async (lat, lon, provinceName) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric&lang=zh_cn`
    )
    
    if (response.ok) {
      const data = await response.json()
      return {
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon
      }
    }
  } catch (error) {
    console.error(`获取${provinceName}天气数据失败:`, error)
  }
  return null
}

// 获取所有省份的天气数据
const getAllProvinceWeather = async () => {
  if (loading.value) return

  loading.value = true

  // 初始化 Worker 并尝试从 Worker 加载缓存
  mapWorker.initWorker()
  try {
    const cachedData = await mapWorker.loadCache()
    if (cachedData) {
      provinceWeatherData.value = cachedData
      updateChart()
    }
  } catch (e) {
    // 降级到主线程缓存加载
    loadCache()
  }

  try {
    const CONCURRENCY = 5 // 最多5个并发
    const entries = Object.entries(provinceCoordinates)

    // 分批处理，每批5个
    for (let i = 0; i < entries.length; i += CONCURRENCY) {
      const batch = entries.slice(i, i + CONCURRENCY)

      await Promise.all(
        batch.map(async ([provinceName, coord]) => {
          const [lng, lat] = coord
          try {
            const weather = await getProvinceWeather(lat, lng, provinceName)
            if (weather) {
              provinceWeatherData.value[provinceName] = {
                value: weather.temp,
                weather: weather
              }
            }
          } catch (e) {
            console.warn(`${provinceName} 加载失败:`, e.message)
          }
        })
      )

      // 每批完成后立即更新图表，渐进式显示
      updateChart()
    }

    // 全部完成后通过 Worker 保存缓存（后台执行，不阻塞 UI）
    mapWorker.saveCache(provinceWeatherData.value).catch(() => {
      // 降级到主线程缓存保存
      saveCache()
    })
  } catch (error) {
    console.error('获取省份天气数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取地图数据 - 简化格式
const getMapData = () => {
  return Object.keys(provinceCoordinates).map(provinceName => {
    const weatherData = provinceWeatherData.value[provinceName]
    return {
      name: provinceName,
      value: weatherData ? weatherData.value : null
    }
  })
}

// 更新图表
const updateChart = () => {
  if (!chartInstance || !isMapRegistered.value) return
  
  const mapData = getMapData()
  const hasData = mapData.some(item => item.value !== null)
  const colors = getThemeColors()
  
  const option = {
    backgroundColor: colors.backgroundColor,
    title: {
      text: '中国各省实时气温',
      subtext: hasData ? '基于OpenWeather API实时数据' : '正在加载天气数据...',
      left: 'left',
      textStyle: { color: colors.textColor },
      subtextStyle: { color: colors.subTextColor }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      textStyle: '#ffffff',
      formatter: (params) => {
        if (params.value === null) {
          return `${params.name}<br/>加载中...`
        }
        const weatherInfo = provinceWeatherData.value[params.name]?.weather
        if (weatherInfo) {
          return `${params.name}<br/>温度: ${params.value}℃<br/>天气: ${weatherInfo.description}`
        }
        return `${params.name}<br/>温度: ${params.value}℃`
      }
    },
    visualMap: {
      type: 'piecewise',
      pieces: [
        { gte: -Infinity, lte: 0, color: 'skyblue', label: '0°C及以下' },
        { gte: 0.1, lte: 15, color: '#A8D8B9', label: '1°C至15°C' },
        { gte: 15.1, lte: 25, color: '#FAD689', label: '15°C至25°C' },
        { gte: 25.1, lte: 35, color: '#FC9F4D', label: '25°C至35°C' },
        { gte: 35.1, lte: 40, color: '#CC543A', label: '35°C至40°C' },
        { gte: 40.1, lte: Infinity, color: '#986DB2', label: '40°C以上' }
      ],
      textStyle: {
        color: colors.visualMapTextColor
      },
      left: 'right',
      show: hasData
    },
    series: [
      {
        name: '气温分布',
        type: 'map',
        map: 'china',
        roam: true,
        zoom: 1.25,
        center: [105, 36],
        scaleLimit: { min: 1, max: 3 },
        label: { 
          show: true, 
          color: '#ffffff',
          fontSize: 10
        },
        emphasis: {
          label: { 
            show: true, 
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 'bold'
          },
          itemStyle: {
            areaColor: colors.emphasisAreaColor,
            borderColor: colors.emphasisBorderColor,
            borderWidth: 2,
            shadowBlur: 6,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowOffsetX: 0,
            shadowOffsetY: 1
          }
        },
        data: mapData,
        nameMap: {
          '北京市': '北京', '天津市': '天津', '上海市': '上海', '重庆市': '重庆',
          '河北省': '河北', '山西省': '山西', '辽宁省': '辽宁', '吉林省': '吉林',
          '黑龙江省': '黑龙江', '江苏省': '江苏', '浙江省': '浙江', '安徽省': '安徽',
          '福建省': '福建', '江西省': '江西', '山东省': '山东', '河南省': '河南',
          '湖北省': '湖北', '湖南省': '湖南', '广东省': '广东', '海南省': '海南',
          '四川省': '四川', '贵州省': '贵州', '云南省': '云南', '陕西省': '陕西',
          '甘肃省': '甘肃', '青海省': '青海', '台湾省': '台湾', '内蒙古自治区': '内蒙古',
          '广西壮族自治区': '广西', '西藏自治区': '西藏', '宁夏回族自治区': '宁夏',
          '新疆维吾尔自治区': '新疆', '香港特别行政区': '香港', '澳门特别行政区': '澳门',
        },
        itemStyle: {
          areaColor: colors.areaColor,
          borderColor: colors.borderColor,
          borderWidth: 0.5
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 处理主题切换
const handleThemeChange = (event) => {
  currentTheme.value = event.detail.theme
  if (chartInstance) {
    updateChart()
  }
}

// 定时更新天气数据
let weatherUpdateInterval = null

const startWeatherUpdate = () => {
  // 立即获取一次数据
  getAllProvinceWeather()
  
  // 每30分钟更新一次数据
  weatherUpdateInterval = setInterval(() => {
    getAllProvinceWeather()
  }, 30 * 60 * 1000)
}

// 监听地图注册完成
watch(isMapRegistered, (registered) => {
  if (registered) {
    startWeatherUpdate()
  }
})

onMounted(() => {
  // 监听主题切换事件
  window.addEventListener('theme-change', handleThemeChange)
  
  // 设置初始主题
  const root = document.documentElement
  currentTheme.value = root.classList.contains('dark') ? 'dark' : 'light'
  
  registerMap()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
    window.removeEventListener('resize', handleResize)
  }
  if (weatherUpdateInterval) {
    clearInterval(weatherUpdateInterval)
  }
  // 移除主题切换事件监听
  window.removeEventListener('theme-change', handleThemeChange)
  // 销毁 Worker
  mapWorker.destroy()
})
</script>

<style scoped>
.heat-map-container {
  height: 100%;
  border-radius: 8px;
}

.chart-container {
  height: 100%;
  border-radius: 8px;
}
</style>