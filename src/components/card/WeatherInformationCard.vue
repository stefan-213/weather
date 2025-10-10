<template>
  <div class="WeatherInformationCard">
    <div class="card">
      <div class="card-inner">
        <div class="card-front">
          <div class="front-item">
            <div class="icon">
              <svg t="1758167028146" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8538" width="32" height="32">
                <path d="M640 640a128 128 0 1 1-109.525333 194.218667 42.666667 42.666667 0 1 1 72.533333-44.842667l0.042667-0.042667a42.666667 42.666667 0 1 0 40.234666-63.872l-0.128-0.256L640 725.333333H170.666667a42.666667 42.666667 0 1 1 0-85.333333h469.333333z m-42.666667-384a128 128 0 0 1-128 128H170.666667a42.666667 42.666667 0 0 1 0-85.333333h298.666666c1.066667 0 2.133333 0 3.157334 0.128l0.128-0.256a42.666667 42.666667 0 1 0-40.234667-63.872h-0.042667a42.666667 42.666667 0 1 1-72.533333-44.885334A128 128 0 0 1 597.333333 256z m298.666667 170.666667a128 128 0 0 1-128 128H170.666667a42.666667 42.666667 0 0 1 0-85.333334h597.333333a42.666667 42.666667 0 0 1 3.157333 0.128l0.128-0.256a42.666667 42.666667 0 1 0-40.234666-63.872h-0.042667a42.666667 42.666667 0 1 1-72.533333-44.885333A128 128 0 0 1 896 426.666667z" p-id="8539" fill="#AAE9FF"></path>
              </svg>
            </div>
            <div class="text">风力:{{ windScale }}级</div>
          </div>
          <div class="front-item">
            <div class="icon">
              <svg t="1758609100915" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1629" width="32" height="32">
                <path d="M835.284 510.744c88.957-50.421 119.131-162.623 67.39-250.608-51.741-87.987-165.798-118.442-254.758-68.021-72.964 41.357-50.185 147.807-94.521 248.144 18.976-76.923-7.179-186.369-42.874-249.347-50.423-88.957-162.623-119.131-250.613-67.392-87.985 51.741-118.439 165.8-68.016 254.76 41.353 72.961 147.796 50.187 248.127 94.516-76.921-18.968-186.357 7.187-249.33 42.879-88.96 50.421-119.131 162.625-67.392 250.611 51.739 87.987 165.8 118.442 254.758 68.019 72.932-41.337 50.207-147.714 94.464-248.011-18.897 76.922 7.261 186.279 42.93 249.214 50.423 88.96 162.626 119.133 250.611 67.394 87.99-51.741 118.442-165.8 68.019-254.76-41.338-72.935-147.722-50.203-248.023-94.469 76.922 18.903 186.289-7.254 249.228-42.929z m-322.295 71.587c-38.175 0-69.122-30.945-69.122-69.12s30.947-69.12 69.122-69.12c38.173 0 69.12 30.945 69.12 69.12s-30.948 69.12-69.12 69.12z" fill="#AAE9FF" p-id="1630"></path>
              </svg>
            </div>
            <div class="text">风向：{{ windDirection }}</div>
          </div>
          <div class="front-item">
            <div class="icon">
              <svg t="1758609180187" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2962" width="32" height="32">
                <path d="M512 17.066667C419.271111 17.066667 124.586667 369.777778 124.586667 609.848889c0 218.453333 174.08 397.084444 387.413333 397.084444 213.333333 0 387.413333-178.631111 387.413333-397.084444C899.413333 369.777778 604.728889 17.066667 512 17.066667z m313.457778 592.782222c0 177.493333-140.515556 321.991111-313.457778 321.991111s-313.457778-144.497778-313.457778-321.991111C198.542222 392.533333 459.093333 117.191111 512 93.297778c52.906667 23.893333 313.457778 299.235556 313.457778 516.551111z" fill="#AAE9FF" p-id="2963"></path>
                <path d="M383.431111 621.226667c-5.12-13.653333-17.635556-23.893333-31.857778-26.168889s-29.582222 3.413333-38.684444 14.791111c-9.102222 11.377778-11.377778 27.306667-6.257778 40.96a327.111111 327.111111 0 0 0 192.284445 191.146667 41.415111 41.415111 0 0 0 54.613333-32.426667 40.96 40.96 0 0 0-26.737778-46.08c-65.991111-23.893333-117.76-76.231111-143.36-142.222222z" fill="#AAE9FF" p-id="2964"></path>
              </svg>
            </div>
            <div class="text">湿度：{{ humidity }}%</div>
          </div>
          <div class="front-item">
            <div class="icon">
              <svg t="1758609265433" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6848" width="32" height="32">
                <path d="M914.08687 503.264546c4.735704-25.5984 7.231548-51.900756 7.231548-78.971064C921.318418 190.132117 738.033873 0.063996 511.872008 0.063996S102.425598 190.004125 102.425598 424.357478c0 27.006312 2.495844 53.308668 7.167552 78.907068h804.49372z m-16.63896 91.066308H126.296106a33.661896 33.661896 0 0 0-33.085932 34.23786c0 18.942816 14.71908 34.301856 33.085932 34.301857h771.343792c18.366852 0 33.149928-15.35904 33.149928-34.301857a33.853884 33.853884 0 0 0-33.27792-34.23786z m-66.555841 157.110181h-638.040122a33.661896 33.661896 0 0 0-33.085932 34.23786c0 18.942816 14.783076 34.301856 33.149928 34.301856h638.040122c18.302856 0 33.085932-15.35904 33.085932-34.301856a33.853884 33.853884 0 0 0-33.149928-34.23786z m-185.652396 157.238173H378.504343a33.661896 33.661896 0 0 0-33.085932 34.23786c0 18.87882 14.71908 34.23786 33.085932 34.23786H645.111681c18.302856 0 33.085932-15.35904 33.085932-34.23786a33.5979 33.5979 0 0 0-32.95794-34.23786z" fill="#AAE9FF" p-id="6849"></path>
              </svg>
            </div>
            <div class="text">能见度：{{ visibility }}km</div>
          </div>
        </div>
        <div class="card-back">
          <div class="back-item">
            <div 
              v-for="index in lifeIndexes" 
              :key="index.type" 
              class="index-item"
            >
              <span class="index-name">{{ index.name }}</span>
              <span 
                class="index-value" 
                :class="getIndexValueClass(index.level)"
              >
                {{ index.category }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeatherStore } from '../../stores/weather'

// 使用 WeatherStore
const weatherStore = useWeatherStore()
const { currentWeather } = storeToRefs(weatherStore)
// console.log(currentWeather.value);

// 风力等级（根据风速计算）
const windScale = computed(() => {
  if (!currentWeather.value || !currentWeather.value.wind_speed) return '1'
  
  const windSpeed = currentWeather.value.wind_speed
  if (windSpeed < 0.3) return '0'
  if (windSpeed < 1.6) return '1'
  if (windSpeed < 3.4) return '2'
  if (windSpeed < 5.5) return '3'
  if (windSpeed < 8.0) return '4'
  if (windSpeed < 10.8) return '5'
  if (windSpeed < 13.9) return '6'
  if (windSpeed < 17.2) return '7'
  if (windSpeed < 20.8) return '8'
  if (windSpeed < 24.5) return '9'
  if (windSpeed < 28.5) return '10'
  if (windSpeed < 32.7) return '11'
  return '12'
})

// 风向
const windDirection = computed(() => {
  return currentWeather.value?.wind_direction_text || '北风'
})

// 湿度
const humidity = computed(() => {
  return currentWeather.value?.humidity || '93'
})

// 能见度（转换为公里）
const visibility = computed(() => {
  if (!currentWeather.value || !currentWeather.value.visibility) return '6.0'
  return (currentWeather.value.visibility / 1000).toFixed(1)
})

// 根据天气数据计算生活指数
const lifeIndexes = computed(() => {
  if (!currentWeather.value) return []
  
  const temp = currentWeather.value.temp
  const humidity = currentWeather.value.humidity
  const windSpeed = currentWeather.value.wind_speed
  const visibility = currentWeather.value.visibility
  
  // 穿衣指数
  let clothesIndex = {
    type: 'clothes',
    name: '穿衣指数',
    level: 3,
    category: '舒适'
  }
  
  if (temp < 0) {
    clothesIndex.level = 5
    clothesIndex.category = '严寒'
  } else if (temp < 10) {
    clothesIndex.level = 4
    clothesIndex.category = '寒冷'
  } else if (temp < 15) {
    clothesIndex.level = 3
    clothesIndex.category = '凉爽'
  } else if (temp < 25) {
    clothesIndex.level = 2
    clothesIndex.category = '舒适'
  } else if (temp < 35) {
    clothesIndex.level = 1
    clothesIndex.category = '较热'
  } else {
    clothesIndex.level = 1
    clothesIndex.category = '酷热'
  }
  
  // 运动指数
  let sportsIndex = {
    type: 'sports',
    name: '运动指数',
    level: 3,
    category: '适宜'
  }
  
  // 综合考虑温度、湿度、风速和能见度
  if (temp < -5 || temp > 38 || humidity > 85 || windSpeed > 10 || visibility < 1000) {
    sportsIndex.level = 5
    sportsIndex.category = '不适宜'
  } else if (temp < 0 || temp > 35 || humidity > 70 || windSpeed > 7 || visibility < 2000) {
    sportsIndex.level = 4
    sportsIndex.category = '较不适宜'
  } else if (temp < 5 || temp > 30 || humidity > 60 || windSpeed > 5) {
    sportsIndex.level = 3
    sportsIndex.category = '一般'
  } else if (temp >= 15 && temp <= 25 && humidity < 60 && windSpeed < 3) {
    sportsIndex.level = 1
    sportsIndex.category = '很适宜'
  } else {
    sportsIndex.level = 2
    sportsIndex.category = '适宜'
  }
  
  // 感冒指数
  let fluIndex = {
    type: 'flu',
    name: '感冒指数',
    level: 3,
    category: '较易发'
  }
  
  // 温度变化大、湿度高、风力大时容易感冒
  if (temp < 5 || (temp >= 5 && temp < 15 && humidity > 70) || windSpeed > 8) {
    fluIndex.level = 5
    fluIndex.category = '极易发'
  } else if ((temp >= 5 && temp < 15) || humidity > 60 || windSpeed > 5) {
    fluIndex.level = 4
    fluIndex.category = '易发'
  } else if ((temp >= 15 && temp < 20) || humidity > 50 || windSpeed > 3) {
    fluIndex.level = 3
    fluIndex.category = '较易发'
  } else {
    fluIndex.level = 2
    fluIndex.category = '少发'
  }
  
  // 旅游指数
  let travelIndex = {
    type: 'travel',
    name: '旅游指数',
    level: 3,
    category: '适宜'
  }
  
  // 综合考虑温度、湿度、风速和能见度
  if (temp < -5 || temp > 38 || humidity > 90 || windSpeed > 12 || visibility < 1000) {
    travelIndex.level = 5
    travelIndex.category = '不适宜'
  } else if (temp < 0 || temp > 35 || humidity > 80 || windSpeed > 8 || visibility < 2000) {
    travelIndex.level = 4
    travelIndex.category = '较不适宜'
  } else if (temp < 5 || temp > 30 || humidity > 70 || windSpeed > 5 || visibility < 5000) {
    travelIndex.level = 3
    travelIndex.category = '一般'
  } else if (temp >= 15 && temp <= 25 && humidity < 60 && windSpeed < 3 && visibility > 10000) {
    travelIndex.level = 1
    travelIndex.category = '很适宜'
  } else {
    travelIndex.level = 2
    travelIndex.category = '适宜'
  }
  
  // 洗车指数
  let carIndex = {
    type: 'car',
    name: '洗车指数',
    level: 3,
    category: '较适宜'
  }
  
  // 湿度高、降水概率大时不适宜洗车
  if (humidity > 80 || visibility < 2000) {
    carIndex.level = 5
    carIndex.category = '不适宜'
  } else if (humidity > 60 || windSpeed > 8) {
    carIndex.level = 4
    carIndex.category = '较不适宜'
  } else if (humidity > 40 || windSpeed > 5) {
    carIndex.level = 3
    carIndex.category = '一般'
  } else {
    carIndex.level = 1
    carIndex.category = '很适宜'
  }
  
  // 紫外线指数（简化计算，实际应该根据天气状况和季节计算）
  let uvIndex = {
    type: 'uv',
    name: '紫外线指数',
    level: 3,
    category: '中等'
  }
  
  // 简化计算：温度越高，紫外线越强
  if (temp > 30) {
    uvIndex.level = 5
    uvIndex.category = '很强'
  } else if (temp > 25) {
    uvIndex.level = 4
    uvIndex.category = '强'
  } else if (temp > 20) {
    uvIndex.level = 3
    uvIndex.category = '中等'
  } else if (temp > 10) {
    uvIndex.level = 2
    uvIndex.category = '弱'
  } else {
    uvIndex.level = 1
    uvIndex.category = '很弱'
  }
  
  return [
    uvIndex,
    fluIndex,
    sportsIndex,
    carIndex,
    travelIndex,
    clothesIndex
  ]
})

// 根据指数等级获取样式类
const getIndexValueClass = (level) => {
  const levelClassMap = {
    1: 'level-1',
    2: 'level-2',
    3: 'level-3',
    4: 'level-4',
    5: 'level-5'
  }
  return levelClassMap[level] || 'level-3'
}
</script>

<style scoped>
.WeatherInformationCard {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.card {
  width: 100%;
  height: 100%;
  perspective: 1000px;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.999s;
}

.card:hover .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  color: var(--text-color);
  padding: 15px;
  box-sizing: border-box;
}

.card-front {
  flex-direction: column;
  align-items: center;
  justify-content:space-around;
  transform: rotateY(0deg);
}

.card-back {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: rotateY(180deg);
}

/* 天气信息项样式 */
.front-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 10px;
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.front-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateX(5px);
}

.icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  background-color: var(--card-border);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-right: 15px;
  flex-shrink: 0;
}

.text {
  font-size: 24px;
  font-weight: 500;
  color: var(--text-color);
}

/* 为不同的天气信息项设置独特的图标背景色 */
.front-item:nth-child(1) .icon {
  background-color: #E3F2FD;
}

.front-item:nth-child(2) .icon {
  background-color: #E8F5E9;
}

.front-item:nth-child(3) .icon {
  background-color: #FFF3E0;
}

.front-item:nth-child(4) .icon {
  background-color: #F3E5F5;
}

/* 生活指数项样式 */
.back-item {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.index-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;
  padding: 10px 14px;
  background-color: var(--card-bg);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.index-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.index-name {
  font-weight: 500;
  color: var(--text-color);
  font-size: 20px;
  min-width: 110px;
}

.index-value {
  font-weight: 600;
  font-size: 20px;
  padding: 3px 10px;
  border-radius: 14px;
  color: var(--card-bg);
}

/* 为不同等级的指数值设置不同的颜色 */
.level-1 {
  background-color: #28a745; /* 很适宜/很好 */
}

.level-2 {
  background-color: rgb(81, 225, 182); /* 适宜/好 */
}

.level-3 {
  background-color: #45B7D1; /* 一般/中等 */
}

.level-4 {
  background-color: #4ECDC4; /* 较不适宜/较差 */
}

.level-5 {
  background-color: #FF6B6B; /* 不适宜/很差 */
}
</style>