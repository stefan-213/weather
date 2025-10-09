<template>
    <div class="search">
        <div class="container-input">
            <input 
                type="text" 
                placeholder="Search" 
                name="text" 
                class="input" 
                v-model="search"  
                @keyup.enter="handleSearch"
            >
            <svg fill="#000000" width="20px" height="20px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                <path d="M790.588 1468.235c-373.722 0-677.647-303.924-677.647-677.647 0-373.722 303.925-677.647 677.647-677.647 373.723 0 677.647 303.925 677.647 677.647 0 373.723-303.924 677.647-677.647 677.647Zm596.781-160.715c120.396-138.692 193.807-319.285 193.807-516.932C1581.176 354.748 1226.428 0 790.588 0S0 354.748 0 790.588s354.748 790.588 790.588 790.588c197.647 0 378.24-73.411 516.932-193.807l516.028 516.142 79.963-79.963-516.142-516.028Z" fill-rule="evenodd"></path>
            </svg>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWeatherStore } from '../stores/weather' // 导入修正后的weather store

const search = ref('')
const weatherStore = useWeatherStore() // 使用新的weather store

// 处理搜索
const handleSearch = async () => {
    if (!search.value.trim()) {
        // 如果搜索框为空，获取当前位置
        await getCurrentAndWeather()
    } else {
        // 搜索指定城市
        await searchCityAndWeather(search.value.trim())
    }
}

// 获取当前位置并更新天气
const getCurrentAndWeather = async () => {
    try {
        await weatherStore.useCurrentLocation()
        console.log('', weatherStore.currentWeather, weatherStore.location)
    } catch (error) {
        console.error('获取当前位置失败:', error)
    }
}

// 通过城市名获取位置并更新天气
const searchCityAndWeather = async (cityName) => {
    try {
        await weatherStore.setLocationByCity(cityName)
        // console.log('=== 搜索城市天气信息 ===', weatherStore.currentWeather, weatherStore.location)
        console.log('=== 搜索城市信息 ===',  weatherStore.location);
        console.log('=== 搜索当前天气信息 ===', weatherStore.currentWeather);
        console.log('=== 搜48小时天气信息 ===', weatherStore.hourlyForecast);
        console.log('=== 搜索6天预报信息 ===', weatherStore.dailyForecast);
    } catch (error) {
        console.error('搜索城市或获取天气失败:', error)
    }
}

// 可选：在组件挂载时自动获取当前位置天气
// import { onMounted } from 'vue'
// onMounted(() => {
//     getCurrentAndWeather()
// })
</script>

<style scoped>
.container-input {
    position: relative;
}

.input {
    width: 150px;
    padding: 10px 0px 10px 40px;
    border-radius: 9999px;
    border: solid 1px #333;
    transition: all .2s ease-in-out;
    outline: none;
    opacity: 0.8;
}

.container-input svg {
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translate(0, -50%);
}

.input:focus {
    opacity: 1;
    width: 250px;
}
</style>