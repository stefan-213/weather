<template>
    <div class="body">
        <!-- 全局加载组件 - 在所有数据加载完成前显示 -->
        <Loading :loading="loading" loading-text="加载天气数据中..." />
        
        <!-- 当数据加载完成后显示主内容 -->
        <div v-if="!loading" class="app-content">
            <div class="navbar">
               <Navbar></Navbar>
            </div>
            <div class="main">
                <router-view></router-view>
            </div>
            <div class="footer">
                <Footer></Footer>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import Loading from './components/Loading.vue';
import { useWeatherStore } from './stores/weather';
import { useGetLocationStore } from './stores/location';

// 初始化store
const weatherStore = useWeatherStore()
const locationStore = useGetLocationStore()

// 计算总的加载状态
const loading = computed(() => {
    // 1. 当位置或天气数据正在加载时显示loading
    if (weatherStore.loading || locationStore.loading) {
        return true
    }
    
    // 2. 处理初始状态和位置获取失败的情况
    // 如果没有位置信息且没有天气数据，但也没有正在加载，说明位置获取失败了
    // 这种情况下不应该一直显示loading，而是应该显示主页面，让用户可以手动搜索位置
    if (!locationStore.location?.lat && !weatherStore.currentWeather && !locationStore.loading && !weatherStore.loading) {
        return false
    }
    
    return false
})



// 监听位置变化，如果位置存在但没有天气数据，则获取天气数据
watch(() => locationStore.location, (newLocation) => {
    if (newLocation?.lat && newLocation?.lon && !weatherStore.currentWeather && !weatherStore.loading) {
        weatherStore.getAllWeather()
    }
}, { immediate: true })

// 组件挂载时，如果还没有位置信息，尝试获取当前位置
setTimeout(() => {
    if (!locationStore.location?.lat && !locationStore.loading) {
        // 添加超时处理，避免定位过程卡住
        let locationTimeout = setTimeout(() => {
            console.warn('位置获取超时，使用默认位置信息')
            loading.value = false
            
            // 设置一个默认位置（北京），避免用户界面一直卡在加载状态
            locationStore.location = {
                lat: 39.9042,
                lon: 116.4074,
                address: '北京市',
                cityCode: 'Beijing',
                chineseName: '北京'
            }
            
            // 使用默认位置获取天气数据
            if (!weatherStore.loading) {
                weatherStore.getAllWeather()
            }
        }, 10000) // 10秒超时
        
        // 获取位置并清除超时计时器
        locationStore.getCurrentLocation()
            .then(() => {
                clearTimeout(locationTimeout)
            })
            .catch(() => {
                clearTimeout(locationTimeout)
                // 位置获取失败，使用默认位置
                console.warn('位置获取失败，使用默认位置信息')
                locationStore.location = {
                    lat: 39.9042,
                    lon: 116.4074,
                    address: '北京市',
                    cityCode: 'Beijing',
                    chineseName: '北京'
                }
                
                // 使用默认位置获取天气数据
                if (!weatherStore.loading) {
                    weatherStore.getAllWeather()
                }
            })
    }
}, 100)
</script>

<style scoped>

.body {
    width: 100%;
    height: 100vh;
    /* overflow: hidden; */
}

.app-content {
    width: 100%;
    height: 100%;
}

.main{
    padding-top: 80px;
}

/* 淡入动画，提升用户体验 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>