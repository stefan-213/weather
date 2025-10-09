<template>
    <div class="weathercard">
        <div class="container">
            <div class="wc-l">
                <div class="city">{{ locationInfo.chineseName || '未知城市' }}</div>
                <div class="date">{{ currentDate }}</div>
                <div class="temperature">{{ currentTemp }}℃</div>
            </div>
            <div class="wc-r">
                <div class="icon">
                    <img :src="weatherIcon" :alt="weatherDescription" class="weather-icon">
                </div>
                <div class="weather">{{ weatherDescription }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWeatherStore } from '../../stores/weather'
import { useWeatherIcons } from '../../composables/useWeatherIcons'

const weatherStore = useWeatherStore()
const { getWeatherIcon, getWeatherDescription } = useWeatherIcons()

// 计算属性 - 位置信息
const locationInfo = computed(() => {
    return weatherStore.location || {};
})
console.log('位置信息:', locationInfo.value);


// 计算属性 - 当前天气数据
const currentWeather = computed(() => {
    return weatherStore.currentWeather || {}
})

// 计算属性 - 当前温度
const currentTemp = computed(() => {
    return currentWeather.value.temp?.toFixed(0) || '--'
})

// 计算属性 - 天气图标
const weatherIcon = computed(() => {
    return getWeatherIcon(currentWeather.value.icon) || getWeatherIcon('01d')
})

// 计算属性 - 天气描述
const weatherDescription = computed(() => {
    return getWeatherDescription(currentWeather.value.icon) || '未知天气'
})

// 计算属性 - 当前日期
const currentDate = computed(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    return `${year}年${month}月${day}日`
})

// 监听天气数据变化
watch(() => weatherStore.currentWeather, (newVal) => {
    console.log('天气数据已更新:', newVal)
})

// 监听位置数据变化
watch(() => weatherStore.location, (newVal) => {
    console.log('位置数据已更新:', newVal)
})

// 组件挂载时检查数据
onMounted(() => {
    // 如果当前没有天气数据，尝试获取
    if (!weatherStore.currentWeather && !weatherStore.loading) {
        console.log('组件挂载，检查天气数据...')
    }
})
</script>

<style scoped>
.weathercard{
    width:100%;
    height: 250px;
    background-color: var(--card-bg);
    border-radius: 23px;
    box-shadow: 0px 155px 62px rgba(0, 0, 0, 0.01), 
                0px 87px 52px rgba(0, 0, 0, 0.05), 
                0px 39px 39px rgba(0, 0, 0, 0.09), 
                0px 10px 21px rgba(0, 0, 0, 0.1), 
                0px 0px 0px rgba(0, 0, 0, 0.1);
    transition: all 0.8s cubic-bezier(0.15, 0.83, 0.66, 1);
    transform-origin: center;
    overflow: hidden;
}

.weathercard:hover{
    transform: scale(1.05);
}

.container {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 0px;
}

.wc-l{
    width: 55%;
    height: 90%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
}

.wc-l .city{
    font-size: 2rem;
    font-weight: 500;
    color: var(--text-color);
    margin-bottom: 5px;
    margin-top: 10px;
    white-space: nowrap;
    /* overflow: hidden; */
    text-overflow: ellipsis;
}

.wc-l .date{
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--text-color);
    margin-bottom: 10px;
}

.wc-l .temperature{
    font-size: 4rem;
    color: var(--text-title-color);
    font-weight: bold;
}

.wc-r{
    width: 35%;
    height: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
}

.wc-r .icon{
    width: 110px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.wc-r .icon .weather-icon{
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.wc-r .weather{
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--text-title-color);
    background-color: var(--card-border);
    border-radius: 15px;
    margin-top: 10px;
}

/* 加载状态样式 */
.weathercard.loading .city,
.weathercard.loading .date,
.weathercard.loading .temperature,
.weathercard.loading .weather {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    color: transparent;
    border-radius: 4px;
}

.weathercard.loading .icon {
    background: #f0f0f0;
    border-radius: 50%;
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

/* 响应式设计 */
@media (max-width: 1450px) {
    .wc-l .city{
        font-size: 2rem;
    }
    
    .wc-l .temperature{
        font-size: 3.5rem;
    }
    
    .wc-r .icon{
        width: 100px;
        height: 100px;
    }
    
    .wc-r .weather{
        font-size: 1.3rem;
    }
}

@media (max-width: 768px) {
    .weathercard{
        height: 200px;
    }
    
    .wc-l .city{
        font-size: 1.8rem;
    }
    
    .wc-l .date{
        font-size: 1.2rem;
    }
    
    .wc-l .temperature{
        font-size: 3rem;
    }
    
    .wc-r .icon{
        width: 80px;
        height: 80px;
    }
    
    .wc-r .weather{
        font-size: 1.1rem;
        height: 35px;
    }
}
</style>

