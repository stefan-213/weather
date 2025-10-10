<template>
    <div class="dashboard">       
        <div class="content">
            <div class="mapBox">
                <Map></Map>
            </div>
            <div class="weather-card">
                <WeatherCard></WeatherCard>
                <WeatherInformationCard></WeatherInformationCard>
            </div>
        </div>
        <div class="chart">            
            <div class="chart-container">
                <div class="chart-option">
                    <div class="radio-button-container">
                        <div class="radio-button">
                            <input type="radio" class="radio-button__input" id="radio1" name="radio-group" value="48-hour" v-model="selectedOption">
                            <label class="radio-button__label" for="radio1">
                                <span class="radio-button__custom"></span>
                                48小时天气预报
                            </label>
                        </div>
                        <div class="radio-button">
                            <input type="radio" class="radio-button__input" id="radio2" name="radio-group" value="7-day" v-model="selectedOption">
                            <label class="radio-button__label" for="radio2">
                                <span class="radio-button__custom"></span>
                                6日天气预报
                            </label>
                        </div>
                    </div>
                </div>
                <div class="chart-content">
                    <!--48小时天气预报 -->
                    <div class="cc-container" v-if="selectedOption === '48-hour' && !weatherStore.loading">
                        <div class="cc-left">
                            <div class="cc-left-item">
                                <div class="cc-icon">
                                    <svg t="1758621947628" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2568" width="32" height="32"><path d="M746.666667 725.333333c59.733333-12.8 106.666667-64 106.666666-128 0-72.533333-55.466667-128-128-128-17.066667 0-29.866667 4.266667-42.666666 8.533334V469.333333c0-93.866667-76.8-170.666667-170.666667-170.666666s-170.666667 76.8-170.666667 170.666666c0 17.066667 4.266667 29.866667 4.266667 46.933334-8.533333-4.266667-17.066667-4.266667-25.6-4.266667C260.266667 512 213.333333 558.933333 213.333333 618.666667S260.266667 725.333333 320 725.333333h426.666667z m0 85.333334h-426.666667C213.333333 810.666667 128 725.333333 128 618.666667c0-85.333333 55.466667-157.866667 128-183.466667C273.066667 311.466667 379.733333 213.333333 512 213.333333c110.933333 0 209.066667 72.533333 243.2 170.666667 102.4 12.8 183.466667 102.4 183.466667 213.333333s-85.333333 200.533333-192 213.333334z" fill="#666666" p-id="2569"></path></svg>
                                </div>
                                <div class="cc-text">天气</div>
                            </div>
                            <div class="cc-left-item">
                                <div class="cc-icon">
                                    <svg t="1758622685355" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5229" width="32" height="32"><path d="M426.666667 485.546667l-21.333334 12.288a213.333333 213.333333 0 1 0 213.290667 0L597.333333 485.546667V213.333333a85.333333 85.333333 0 1 0-170.666666 0v272.213334z m-85.333334-48V213.333333a170.666667 170.666667 0 1 1 341.333334 0v224.213334a298.666667 298.666667 0 1 1-341.333334 0z" fill="#666666" p-id="5230"></path><path d="M554.666667 608.768a85.333333 85.333333 0 1 1-85.333334 0V384h85.333334v224.768z" fill="#666666" p-id="5231"></path></svg>
                                </div>
                                <div class="cc-text">温度（℃）</div>
                            </div>
                            <div class="cc-left-item">
                                <div class="cc-icon">
                                    <svg t="1758632324763" style="width: 50px;height: 50px;margin-left: 8px;margin-right: 5px;" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6287" width="32" height="32"><path d="M772.338983 138.847458a251.661017 251.661017 0 0 0-37.402034 2.776949A321.084746 321.084746 0 0 0 156.20339 247.842712 199.59322 199.59322 0 0 0 0 442.576271a199.59322 199.59322 0 0 0 199.59322 199.593221h572.745763a251.661017 251.661017 0 0 0 0-503.322034z m0 407.864406H199.59322a104.135593 104.135593 0 0 1-22.823051-205.754576l58.576272-13.016949 13.624406-58.402712a225.627119 225.627119 0 0 1 406.823051-74.456949l33.670509 49.811525 59.530847-8.677966A162.538305 162.538305 0 0 1 772.338983 234.305085a156.20339 156.20339 0 1 1 0 312.406779zM112.813559 694.237288h69.423729v190.915254h-69.423729zM295.050847 754.983051h69.423729v190.915254h-69.423729zM477.288136 833.084746h69.423728v190.915254h-69.423728zM659.525424 763.661017h69.423729v190.915254h-69.423729zM841.762712 694.237288h69.423729v190.915254h-69.423729z" p-id="6288" fill="#666666"></path></svg>
                                </div>
                                <div class="cc-text">降雨概率</div>
                            </div>
                        </div>
                        <div class="cc-right"  @wheel="handleHorizontalScroll" >
                            <div class="cc-right-item-title">
                                <div v-for="(hour, index) in weatherStore.hourlyForecast" :key="index" class="time-item" style="display: flex;flex-direction: column;align-items: center;">
                                    <span>{{ formatHourlyDate(hour.datetime) }}</span>
                                    <span>{{ formatHourlyTime(hour.datetime) }}</span>
                                </div>
                            </div>
                            <div class="cc-right-item">
                                <div v-for="(hour, index) in weatherStore.hourlyForecast" :key="index" class="weather-icon-item" style="display: flex;">
                                    <img :src="getWeatherIcon(hour.icon)" :alt="hour.description" class="weather-icon" style="width: 40px" />
                                </div>
                            </div>
                            <div class="cc-right-item">
                                <div v-for="(hour, index) in weatherStore.hourlyForecast" :key="index" class="temp-item">
                                    {{ hour.temp }}°
                                </div>
                            </div>
                            <div class="cc-right-item">
                                <div v-for="(hour, index) in weatherStore.hourlyForecast" :key="index" class="rain-item">
                                    {{ hour.pop }}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 7日天气预报 -->
                    <div class="cc-container" v-if="selectedOption === '7-day' && !weatherStore.loading">
                        <div class="cc-left">
                            <div class="cc-left-item">
                                <div class="cc-icon">
                                    <svg t="1758621947628" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2568" width="32" height="32"><path d="M746.666667 725.333333c59.733333-12.8 106.666667-64 106.666666-128 0-72.533333-55.466667-128-128-128-17.066667 0-29.866667 4.266667-42.666666 8.533334V469.333333c0-93.866667-76.8-170.666667-170.666667-170.666666s-170.666667 76.8-170.666667 170.666666c0 17.066667 4.266667 29.866667 4.266667 46.933334-8.533333-4.266667-17.066667-4.266667-25.6-4.266667C260.266667 512 213.333333 558.933333 213.333333 618.666667S260.266667 725.333333 320 725.333333h426.666667z m0 85.333334h-426.666667C213.333333 810.666667 128 725.333333 128 618.666667c0-85.333333 55.466667-157.866667 128-183.466667C273.066667 311.466667 379.733333 213.333333 512 213.333333c110.933333 0 209.066667 72.533333 243.2 170.666667 102.4 12.8 183.466667 102.4 183.466667 213.333333s-85.333333 200.533333-192 213.333334z" fill="#666666" p-id="2569"></path></svg>
                                </div>
                                <div class="cc-text">天气</div>
                            </div>
                            <div class="cc-left-item">
                                <div class="cc-icon">
                                    <svg t="1758771096276" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2998" width="32" height="32"><path d="M496.122 589.014V165.222c0-17.673-14.327-32-32-32H295.4c-17.673 0-32 14.327-32 32v425.62c-40.723 34.43-64.584 85.204-64.584 138.962 0 100.355 81.645 182 182 182s182-81.645 182-182c-0.001-54.925-24.643-106.364-66.694-140.79z m-115.307 258.79c-65.065 0-118-52.935-118-118 0-38.593 19.005-74.832 50.839-96.941A32.003 32.003 0 0 0 327.4 606.58V197.222h104.722v407.859a32 32 0 0 0 14.202 26.594c32.868 21.998 52.491 58.682 52.491 98.129 0 65.065-52.934 118-118 118z" fill="#666666" p-id="2999"></path><path d="M396.815 670.423V466.785c0-8.836-7.164-16-16-16s-16 7.164-16 16v203.638c-26.765 7.069-46.5 31.438-46.5 60.424 0 34.518 27.982 62.5 62.5 62.5s62.5-27.982 62.5-62.5c0-28.986-19.735-53.355-46.5-60.424zM837.436 258.953h-92.975v-92.975c0-17.673-14.327-32-32-32s-32 14.327-32 32v92.975h-92.975c-17.673 0-32 14.327-32 32s14.327 32 32 32h92.975v92.975c0 17.673 14.327 32 32 32s32-14.327 32-32v-92.975h92.975c17.673 0 32-14.327 32-32s-14.328-32-32-32z" fill="#666666" p-id="3000"></path></svg>
                                </div>
                                <div class="cc-text">最高气温</div>
                            </div>
                            <div class="cc-left-item">
                                <div class="cc-icon">
                                    <svg t="1758771168165" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3216" width="32" height="32"><path d="M496.122 589.014V165.222c0-17.673-14.327-32-32-32H295.4c-17.673 0-32 14.327-32 32v425.62c-40.723 34.43-64.584 85.204-64.584 138.962 0 100.355 81.645 182 182 182s182-81.645 182-182c-0.001-54.925-24.643-106.364-66.694-140.79z m-115.307 258.79c-65.065 0-118-52.935-118-118 0-38.593 19.005-74.832 50.839-96.941A32.003 32.003 0 0 0 327.4 606.58V197.222h104.722v407.859a32 32 0 0 0 14.202 26.594c32.868 21.998 52.491 58.682 52.491 98.129 0 65.065-52.934 118-118 118z" fill="#666666" p-id="3217"></path><path d="M396.815 670.423V466.785c0-8.836-7.164-16-16-16s-16 7.164-16 16v203.638c-26.765 7.069-46.5 31.438-46.5 60.424 0 34.518 27.982 62.5 62.5 62.5s62.5-27.982 62.5-62.5c0-28.986-19.735-53.355-46.5-60.424z" fill="#666666" p-id="3218"></path><path d="M837.436 322.953h-249.95c-17.673 0-32-14.327-32-32s14.327-32 32-32h249.949c17.673 0 32 14.327 32 32s-14.327 32-31.999 32z" fill="#666666" p-id="3219"></path></svg>
                                </div>
                                <div class="cc-text">最低气温</div>
                            </div>
                        </div>
                        <div class="cc-right" style="overflow: hidden;margin-top: 20px;"  > 
                            <div class="cc-right-item-title" style="width: 100%;"> 
                                <div v-for="(day, index) in weatherStore.dailyForecast" :key="index" class="time-item" style="display: flex;flex-direction: column;align-items: center;">
                                    <span>{{ getWeekday(day.date) }}</span><span>{{formatDate(day.date) }}</span>
                                </div>
                            </div>
                            <div class="cc-right-item" style="width: 100%;">
                                <div v-for="(day, index) in weatherStore.dailyForecast" :key="index">
                                    <img :src="getWeatherIcon(day.icon)" :alt="day.description" class="weather-icon" style="width: 40px" />
                                </div>
                            </div>
                            <div id="weather-chart" style="width: 100%; height: 57%;"></div>
                        </div>
                    </div>

                    <!-- 加载状态 - 由于全局Loading组件的存在，这里的加载状态可能不会显示 -->
                    <!-- 但保留此代码作为降级处理，以防全局Loading组件失效 -->
                    <div class="cc-container" v-if="weatherStore.loading && !error">
                        <div class="loading-container">
                            <div class="loading-spinner"></div>
                            <div class="loading-text">加载天气数据中...</div>
                        </div>
                    </div>

                    <!-- 错误状态 -->
                    <div class="cc-container" v-if="weatherStore.error && !weatherStore.loading">
                        <div class="error-container">
                            <div class="error-icon">⚠️</div>
                            <div class="error-text">{{ weatherStore.error }}</div>
                            <button @click="retryLoadWeather" class="retry-button">重试</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted,onBeforeUnmount, watch, nextTick } from 'vue';
import { useWeatherStore } from '../stores/weather';
import * as echarts from 'echarts';
import Map from '../components/Map.vue'
import WeatherCard from '../components/card/WeatherCard.vue'
import WeatherInformationCard from '@/components/card/WeatherInformationCard.vue';
import { useWeatherIcons } from '../composables/useWeatherIcons';

const selectedOption = ref('48-hour');
const weatherStore = useWeatherStore();

let chartInstance = null;
// 星期几
const getWeekday = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
};

// 几月几日
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
};


//哪一天
const formatHourlyDate = (datetime) => {
    if (!datetime) return '';
    const date = new Date(datetime);
    const today = new Date();
    
    // 检查是否是今天
    if (date.toDateString() === today.toDateString()) {
        return '今天';
    }
    
    // 检查是否是明天
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
        return '明天';
    }
    
    // 其他情况显示星期几
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
};
// 几点（小时）
const formatHourlyTime = (datetime) => {
    if (!datetime) return '';
    const date = new Date(datetime);
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

// 获取天气图标
const { getWeatherIcon, preloadCommonIcons } = useWeatherIcons();

// const getWeatherIcon = (iconCode) => {
//     if (!iconCode) return '';

//     // 基于你实际拥有的图标文件进行映射
//     const iconMap = {
//         // 晴天相关
//         '01d': '晴天',      // 白天晴天
//         '01n': '晚晴天',    // 夜晚晴天
        
//         // 少云/多云相关
//         '02d': '少云',      // 白天少云
//         '02n': '晚多云',    // 夜晚少云
//         '03d': '多云',      // 白天散云
//         '03n': '晚多云',    // 夜晚散云
//         '04d': '阴天',      // 白天阴天
//         '04n': '阴天',      // 夜晚阴天
        
//         // 降雨相关
//         '09d': '阵雨',      // 白天小雨 -> 使用阵雨图标
//         '09n': '阵雨',      // 夜晚小雨
//         '10d': '中雨',      // 白天中雨
//         '10n': '中雨',      // 夜晚中雨
        
//         // 雷雨
//         '11d': '雷阵雨',    // 白天雷雨
//         '11n': '雷阵雨',    // 夜晚雷雨
        
//         // 降雪相关
//         '13d': '小雪',      // 白天雪 -> 使用小雪图标
//         '13n': '小雪',      // 夜晚雪
        
//         // 雾/霾
//         '50d': '雾',        // 白天雾
//         '50n': '雾'         // 夜晚雾
//     };

//     // 获取对应的中文图标名称
//     const iconName = iconMap[iconCode] || '晴天'; // 默认使用晴天图标
    
//     try {
//         // 尝试动态导入图标文件
//         const iconUrl = new URL(`../assets/img/${iconName}.svg`, import.meta.url).href;
//         return iconUrl;
//     } catch (error) {
//         console.warn(`图标文件未找到: ${iconName}.svg, 错误:`, error);
        
//         // 备用映射方案（如果某些图标不存在）
//         const fallbackMap = {
//             '晚晴天': '晴天',
//             '晚多云': '多云',
//             '中雨': '阵雨',
//             '小雪': '阴天', // 如果没有雪图标，使用阴天代替
//             '雷阵雨': '阵雨',
//             '雾': '阴天'
//         };
        
//         const fallbackName = fallbackMap[iconName] || '晴天';
        
//         try {
//             return new URL(`../assets/img/${fallbackName}.svg`, import.meta.url).href;
//         } catch {
//             // 最终回退到晴天图标
//             try {
//                 return new URL('../assets/img/晴天.svg', import.meta.url).href;
//             } catch {
//                 console.error('连晴天图标都不存在！');
//                 return '';
//             }
//         }
//     }
// };

// 更详细的天气描述映射（用于显示）
// const getWeatherDescription = (iconCode) => {
//     const descriptionMap = {
//         '01d': '晴天',
//         '01n': '晴朗夜晚',
//         '02d': '少云',
//         '02n': '少云夜晚',
//         '03d': '多云',
//         '03n': '多云夜晚',
//         '04d': '阴天',
//         '04n': '阴天夜晚',
//         '09d': '阵雨',
//         '09n': '阵雨夜晚',
//         '10d': '中雨',
//         '10n': '中雨夜晚',
//         '11d': '雷阵雨',
//         '11n': '雷阵雨夜晚',
//         '13d': '小雪',
//         '13n': '小雪夜晚',
//         '50d': '雾',
//         '50n': '雾夜晚'
//     };
    
//     return descriptionMap[iconCode] || '未知天气';
// };

// 初始化图表
const initChart = () => {
    const chartDom = document.getElementById('weather-chart');
    if (!chartDom || !weatherStore.dailyForecast.length) return;
    
    if (chartInstance) {
        chartInstance.dispose();
    }

    chartInstance = echarts.init(chartDom);

    const days = weatherStore.dailyForecast.map(item => item.date);
    const maxTemps = weatherStore.dailyForecast.map(item => item.temp_max);
    const minTemps = weatherStore.dailyForecast.map(item => item.temp_min);

    const option = {
        grid: {
            top: '15%',
            left: '5%',
            right: '5%',
            bottom: '15%',
            containLabel: true
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: days,
            show: false
        },
        yAxis: {
            type: 'value',
            show: false
        },
        series: [
            {
                name: '最高气温',
                type: 'line',
                data: maxTemps,
                lineStyle: {
                    width: 3,
                    color: '#FF9900'
                },
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: '#FF9900'
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}°',
                    textStyle: {
                        color: '#e53e3e',
                        fontSize: 12
                    }
                }
            },
            {
                name: '最低气温',
                type: 'line',
                data: minTemps,
                lineStyle: {
                    width: 3,
                    color: '#87CEEB'
                },
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: '#87CEEB'
                },
                label: {
                    show: true,
                    position: 'bottom',
                    formatter: '{c}°',
                    textStyle: {
                        color: '#3182ce',
                        fontSize: 12
                    }
                }
            }
        ]
    };

    chartInstance.setOption(option);
    window.addEventListener('resize', () => chartInstance.resize());
};

// 重试加载天气
const retryLoadWeather = async () => {
    try {
        await weatherStore.getAllWeather();
    } catch (error) {
        console.error('重试加载天气失败:', error);
    }
};

// 监听数据变化
watch(() => weatherStore.dailyForecast, () => {
    if (selectedOption.value === '7-day') {
        nextTick(() => {
            initChart();
        });
    }
}, { immediate: true });

watch(selectedOption, (newVal) => {
    if (newVal === '7-day') {
        nextTick(() => {
            initChart();
        });
    }
});

// 初始化滚动事件
const handleHorizontalScroll = (evt) => {
    const container = evt.currentTarget;
    if (container.scrollWidth > container.clientWidth) {
        evt.preventDefault();
        container.scrollLeft += evt.deltaY * 3;
    }
};

// 组件挂载时检查数据和预加载图标
onMounted(() => {
    // 预加载常用天气图标
    preloadCommonIcons();
    
    // 注意：现在位置和天气数据的获取已在App.vue中统一管理
    // 这里只需专注于渲染逻辑

});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', () => chartInstance?.resize());
});
</script>

<style scoped>

.loading-container, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #5fabc7;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-text {
    margin-top: 16px;
    color: #666;
    font-size: 16px;
}

.error-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.error-text {
    color: #e53e3e;
    margin-bottom: 16px;
    text-align: center;
}

.retry-button {
    padding: 8px 16px;
    background-color: #5fabc7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.retry-button:hover {
    background-color: #4a8da3;
}

/* 其他原有样式保持不变 */
.dashboard {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    width: 100%;
    min-height: 100vh;
    background-color: var(--bg-color);
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.content {
    display: flex;
    justify-content: center;
    flex-direction: row;
    height:calc(100vh - 120px);
    width: 100%;
    background-color: var(--bg-color);
}

.mapBox {
    width:78%;
    justify-content: start;
    align-items: center;
    flex-direction: column;
}

.weather-card {
    width: 17%; 
    margin-left: 3%;
    margin-right: 1%;
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
}

.chart { 
    width: 100%;
    height: 500px;
    display: flex;
    background-color: var(--bg-color);
}

.chart-container{ 
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.chart-option{
    display: flex;
    height: fit-content;
    background-color:  var(--bg-color);
    justify-content: center;
    margin-top: 60px;
}

.chart-content{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color:  var(--bg-color);
}

.cc-container{
    width: 95%;
    height: 95%;
    display: flex;
    flex-direction: row;
    background-color: var(--card-bg);
    border-radius: 24px;
    overflow: hidden;
}

.cc-left{
    display: flex;
    flex-direction: column;
    width: 200px;
    align-items: start;
    justify-content: end;
    margin-left: 20px;
}

.cc-left-item{
    height:calc(100%/3.5);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
}

.cc-icon .icon{
    display: flex;
    width: 60px;
    height: 60px;
}

.cc-text{
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-color);
    margin-left: 10px;
}

.cc-right {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: end;
    margin-left: 20px;
    width: 95%;
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: #5fabc7 #88888829;
    font-size:large;
    font-weight: 500;
    scroll-behavior: smooth;
}

.cc-right-item-title,
.cc-right-item {
    display: flex;
    flex-direction: row;
    width: 200%;
    justify-content: space-around;
    align-items: center;
}

.cc-right-item{
    height:calc(100%/3.5);
}

/* 选择框样式 */
.radio-button-container {
    display: flex;
    align-items: center;
    gap: 24px;
}

.radio-button {
    display: inline-block;
    position: relative;
    cursor: pointer;
}

.radio-button__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.radio-button__label {
    display: inline-block;
    padding-left: 30px;
    margin-bottom: 10px;
    position: relative;
    font-size: 15px;
    color: var(--text-color);
    font-weight: 600;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.3s ease;
}

.radio-button__custom {
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--text-color);
    transition: all 0.3s ease;
}

.radio-button__input:checked + .radio-button__label .radio-button__custom {
    background-color: #5fabc7;
    border-color: transparent;
    transform: scale(0.8);
    box-shadow: 0 0 20px rgba(72, 136, 247, 0.502)
}

.radio-button__input:checked + .radio-button__label {
    color: #5fabc7;
}

.radio-button__label:hover .radio-button__custom {
    transform: scale(1.2);
    border-color: #5fabc7;
    box-shadow: 0 0 20px #5fabc7
}

@media (max-width: 1450px ) { 
    .mapBox {
        width:71%;
    }
    .weather-card {
        width: 24%; 
        margin-left: 3%;
    }
}
/* 手机端适配 */
@media (max-width: 768px) {

  .content {
    flex-direction: column;
    height: auto;
  }
  
  .mapBox {
    width: 100%;
    height: 50vh;
  }
  
  .weather-card {
    width: 100%;
    height: 85vh;
    margin: 20px 0;
    flex-direction: column;
  }
  
  .chart {
    height: auto;
  }
  
  .cc-container {
    width: 100%;
    flex-direction: column;
    border-radius: 0;
  }
  .chart-option{
    margin-top: 0;
  }
  .cc-left {
    margin-left: 0;
    display:none;
  }
  
  .cc-right {
    width: 200%;
    margin-left: 0;
    margin-top: 20px;
  }
}
</style>