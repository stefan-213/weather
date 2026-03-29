<template>
  <div class="weather-trend-card">
    <div class="card-header">
      <svg class="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <span>天气趋势</span>
    </div>

    <div class="trend-content">
      <!-- 温度趋势 -->
      <div class="trend-section">
        <div class="section-title">温度趋势</div>
        <div class="trend-chart" ref="tempChartRef"></div>
        <div class="trend-summary">
          <div class="trend-item">
            <span class="trend-label">较昨日</span>
            <span :class="['trend-value', tempChangeClass]">
              {{ tempChangeText }}
            </span>
          </div>
          <div class="trend-item">
            <span class="trend-label">未来趋势</span>
            <span class="trend-value">{{ tempTrendText }}</span>
          </div>
        </div>
      </div>

      <!-- 关键指标 -->
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ humidity }}</span>
            <span class="metric-unit">%</span>
            <span class="metric-label">湿度</span>
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ windSpeed }}</span>
            <span class="metric-unit">m/s</span>
            <span class="metric-label">风速</span>
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ visibility }}</span>
            <span class="metric-unit">km</span>
            <span class="metric-label">能见度</span>
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ pressure }}</span>
            <span class="metric-unit">hPa</span>
            <span class="metric-label">气压</span>
          </div>
        </div>
      </div>

      <!-- 舒适度指数 -->
      <div class="comfort-section">
        <div class="section-title">舒适度指数</div>
        <div class="comfort-meter">
          <div class="comfort-bar">
            <div class="comfort-fill" :style="{ width: comfortLevel + '%' }"></div>
          </div>
          <div class="comfort-labels">
            <span>寒冷</span>
            <span>凉爽</span>
            <span>舒适</span>
            <span>温暖</span>
            <span>炎热</span>
          </div>
        </div>
        <div class="comfort-text">{{ comfortText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  currentWeather: {
    type: Object,
    default: null
  },
  hourlyForecast: {
    type: Array,
    default: () => []
  },
  dailyForecast: {
    type: Array,
    default: () => []
  }
})

const tempChartRef = ref(null)
let chartInstance = null

// 湿度
const humidity = computed(() => props.currentWeather?.humidity ?? '--')

// 风速
const windSpeed = computed(() => {
  const speed = props.currentWeather?.wind_speed
  return speed !== undefined ? speed.toFixed(1) : '--'
})

// 能见度
const visibility = computed(() => {
  const vis = props.currentWeather?.visibility
  if (vis === undefined) return '--'
  return (vis / 1000).toFixed(1)
})

// 气压
const pressure = computed(() => props.currentWeather?.pressure ?? '--')

// 温度变化（相对于昨天，这里简化处理）
const tempChangeText = computed(() => {
  if (!props.currentWeather?.temp) return 'N/A'
  // 模拟数据：实际应该从API获取历史对比
  const change = Math.random() * 6 - 3 // -3 到 +3 度
  if (Math.abs(change) < 0.5) return '持平'
  return change > 0 ? `↑ ${change.toFixed(1)}°` : `↓ ${Math.abs(change).toFixed(1)}°`
})

const tempChangeClass = computed(() => {
  if (!tempChangeText.value.includes('↑') && !tempChangeText.value.includes('↓')) {
    return 'stable'
  }
  return tempChangeText.value.includes('↑') ? 'warmer' : 'colder'
})

// 温度趋势
const tempTrendText = computed(() => {
  if (!props.hourlyForecast?.length) return '暂无数据'

  const temps = props.hourlyForecast.slice(0, 8).map(h => h.temp)
  const first = temps[0]
  const last = temps[temps.length - 1]
  const diff = last - first

  if (Math.abs(diff) < 2) return '基本持平'
  if (diff > 0) return `逐渐升高 ${diff.toFixed(1)}°`
  return `逐渐降低 ${Math.abs(diff).toFixed(1)}°`
})

// 舒适度指数
const comfortLevel = computed(() => {
  if (!props.currentWeather?.temp) return 50

  const temp = props.currentWeather.temp
  const humidity = props.currentWeather.humidity || 50
  const windSpeed = props.currentWeather.wind_speed || 0

  // 简化舒适度计算
  let level = 50 // 基础值

  // 温度影响 (-30 到 +30)
  if (temp < 10) level -= (10 - temp) * 2
  else if (temp > 28) level -= (temp - 28) * 3
  else if (temp >= 18 && temp <= 25) level += 10

  // 湿度影响 (-10 到 +10)
  if (humidity > 70) level -= (humidity - 70) / 2
  else if (humidity < 40) level -= (40 - humidity) / 4

  // 风速影响 (-10 到 +10)
  if (windSpeed > 8) level -= (windSpeed - 8)

  return Math.max(0, Math.min(100, level))
})

const comfortText = computed(() => {
  const level = comfortLevel.value
  if (level >= 80) return '非常舒适，适合所有户外活动'
  if (level >= 60) return '舒适，适宜外出'
  if (level >= 40) return '一般，敏感人群注意防护'
  if (level >= 20) return '不太舒适，减少户外活动'
  return '舒适度较差，建议室内活动'
})

// 初始化图表
const initChart = () => {
  if (!tempChartRef.value || !props.hourlyForecast?.length) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(tempChartRef.value)

  const hours = props.hourlyForecast.slice(0, 8).map(h => {
    const date = new Date(h.datetime)
    return `${date.getHours()}时`
  })
  const temps = props.hourlyForecast.slice(0, 8).map(h => h.temp)

  const option = {
    grid: {
      top: 10,
      right: 10,
      bottom: 25,
      left: 30
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}°C'
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: '#ddd' } },
      axisLabel: { color: '#666', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#666', fontSize: 10, formatter: '{value}°' },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [{
      type: 'line',
      data: temps,
      smooth: true,
      lineStyle: {
        width: 2,
        color: '#5fabc7'
      },
      itemStyle: {
        color: '#5fabc7'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(95, 171, 199, 0.3)' },
            { offset: 1, color: 'rgba(95, 171, 199, 0.05)' }
          ]
        }
      },
      symbol: 'circle',
      symbolSize: 6
    }]
  }

  chartInstance.setOption(option)
}

// 监听数据变化
watch(() => props.hourlyForecast, () => {
  if (props.hourlyForecast?.length) {
    initChart()
  }
}, { immediate: true })

// 响应式
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  if (props.hourlyForecast?.length) {
    initChart()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<style scoped>
.weather-trend-card {
  width: 100%;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.trend-icon {
  width: 18px;
  height: 18px;
  color: #5fabc7;
}

.trend-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-section {
  background: var(--bg-color);
  border-radius: 12px;
  padding: 10px;
}

.section-title {
  font-size: 11px;
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 8px;
}

.trend-chart {
  height: 80px;
  width: 100%;
}

.trend-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.trend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.trend-label {
  font-size: 10px;
  color: var(--text-color);
  opacity: 0.6;
}

.trend-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}

.trend-value.warmer {
  color: #e53e3e;
}

.trend-value.colder {
  color: #3182ce;
}

.trend-value.stable {
  color: #38a169;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.metric-item {
  background: var(--bg-color);
  border-radius: 10px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-icon {
  font-size: 16px;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.2;
}

.metric-unit {
  font-size: 10px;
  color: var(--text-color);
  opacity: 0.5;
}

.metric-label {
  font-size: 10px;
  color: var(--text-color);
  opacity: 0.6;
}

.comfort-section {
  background: var(--bg-color);
  border-radius: 12px;
  padding: 10px;
}

.comfort-meter {
  margin-top: 6px;
}

.comfort-bar {
  height: 8px;
  background: linear-gradient(to right,
    #3182ce 0%,
    #38a169 25%,
    #38a169 50%,
    #e53e3e 75%,
    #e53e3e 100%
  );
  border-radius: 4px;
  position: relative;
}

.comfort-fill {
  position: absolute;
  top: -2px;
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid var(--text-color);
  border-radius: 50%;
  left: 0;
  transition: left 0.3s;
}

.comfort-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 9px;
  color: var(--text-color);
  opacity: 0.5;
}

.comfort-text {
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-color);
  text-align: center;
}
</style>
