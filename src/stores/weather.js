import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useGetLocationStore } from './location'

export const useWeatherStore = defineStore('weather', () => {
    // 状态定义
    const weatherData = ref(null)
    const currentWeather = ref(null)
    const hourlyForecast = ref([]) //48小时预报
    const dailyForecast = ref([]) // 6天预报
    const loading = ref(false)
    const error = ref(null)

    // 缓存统计
    const cacheStats = reactive({
        hits: 0,
        misses: 0,
        totalRequests: 0
    })

    const locationStore = useGetLocationStore()
    const location = computed(() => locationStore.location)
    const locationLoading = computed(() => locationStore.loading)
    const locationError = computed(() => locationStore.error)

    // 设置位置信息
    async function setLocationByCity(cityName) {
        try {
            await locationStore.getLocationByCity(cityName)
            // 位置设置成功后自动获取天气
            await getAllWeather()
        } catch (err) {
            error.value = `设置位置失败: ${err.message}`
        }
    }

    // 使用当前位置获取天气
    async function useCurrentLocation() {
        try {
            await locationStore.getCurrentLocation()
            // 位置获取成功后自动获取天气
            await getAllWeather()
        } catch (err) {
            error.value = `获取当前位置失败: ${err.message}`
        }
    }

    // 获取当前天气和48小时预报
    async function getHourlyWeather() {
        if (!location.value.lat || !location.value.lon) {
            error.value = '请先设置位置信息'
            return
        }

        loading.value = true
        error.value = null

        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${location.value.lat}&lon=${location.value.lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric&lang=zh_cn`
            )

            if (response.data) {
                // 当前天气使用第一个预报数据
                currentWeather.value = response.data.list[0]

                // 获取48小时内的预报（每3小时一个数据，共8个）
                hourlyForecast.value = response.data.list.slice(0, 8).map(item => ({
                    datetime: item.dt_txt,
                    temp: Math.round(item.main.temp),
                    feels_like: Math.round(item.main.feels_like),
                    humidity: item.main.humidity,
                    pressure: item.main.pressure,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    wind_speed: item.wind.speed,
                    pop: item.pop ? Math.round(item.pop * 100) : 0 // 降水概率
                }))
            } else {
                throw new Error('获取天气数据失败')
            }
        } catch (err) {
            error.value = `获取天气数据失败: ${err.message}`
        } finally {
            loading.value = false
        }
    }

    // 获取7天天气预报
    async function getDailyWeather() {
        if (!location.value.lat || !location.value.lon) {
            error.value = '请先设置位置信息'
            return
        }

        // 生成缓存键
        const cacheKey = cacheManager.getCacheKey(location.value.lat, location.value.lon) + '_daily'
        
        // 尝试从缓存获取数据
        const cachedData = await cacheManager.get(cacheKey)
        if (cachedData) {
            // 使用缓存数据
            dailyForecast.value = cachedData.dailyForecast
            return
        }

        loading.value = true
        error.value = null

        try {
            const startTime = Date.now()
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${location.value.lat}&lon=${location.value.lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric&lang=zh_cn`
            )

            if (response.data) {
                // 处理7天预报数据 - 按日期分组，每天取中午的数据作为代表
                const forecastsByDate = {}

                response.data.list.forEach(item => {
                    const date = item.dt_txt.split(' ')[0] // 获取日期部分
                    const time = item.dt_txt.split(' ')[1] // 获取时间部分

                    // 优先选择中午12点附近的数据作为当天的代表
                    if (!forecastsByDate[date] || time.includes('12:00')) {
                        forecastsByDate[date] = {
                            date: date,
                            temp_max: Math.round(item.main.temp_max),
                            temp_min: Math.round(item.main.temp_min),
                            description: item.weather[0].description,
                            icon: item.weather[0].icon,
                            humidity: item.main.humidity,
                            wind_speed: item.wind.speed,
                            pop: item.pop ? Math.round(item.pop * 100) : 0
                        }
                    }
                })

                // 转换为数组并限制为7天
                dailyForecast.value = Object.values(forecastsByDate).slice(0, 7)
                
                // 缓存数据
                const dataToCache = {
                    dailyForecast: dailyForecast.value
                }
                await cacheManager.set(cacheKey, dataToCache)
                
                // 记录性能数据
                if (CACHE_CONFIG?.DEBUG) {
                    cacheStats.misses++
                    cacheStats.totalRequests++
                    const timeSaved = Date.now() - startTime
                    cacheStats.cacheTimeSaved = (cacheStats.cacheTimeSaved || 0) + timeSaved
                }
            } else {
                throw new Error('获取一周天气数据失败')
            }
        } catch (err) {
            error.value = `获取一周天气数据失败: ${err.message}`
        } finally {
            loading.value = false
        }
    }
    const CACHE_DURATION = 10 * 60 * 1000; // 10分钟缓存
    // 获取完整的天气信息（包括当前天气48小时预报和6天预报）
    async function getAllWeather() {
        if (!location.value.lat || !location.value.lon) {
            error.value = '请先设置位置信息'
            return
        }
        const cacheKey = `weather_${location.value.lat}_${location.value.lon}`
        const cached = localStorage.getItem(cacheKey)

        cacheStats.totalRequests++

        if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            if (Date.now() - timestamp < CACHE_DURATION) {
                // 使用缓存数据
                cacheStats.hits++
                currentWeather.value = data.currentWeather
                hourlyForecast.value = data.hourlyForecast
                dailyForecast.value = data.dailyForecast
                // printStats()
                return
            }
        }

        cacheStats.misses++
        // printStats()
        loading.value = true
        error.value = null

        try {
            // 使用单个API调用获取所有数据
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${location.value.lat}&lon=${location.value.lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric&lang=zh_cn`
            )

            if (response.data) {
                // 处理当前天气
                currentWeather.value = {
                    temp: Math.round(response.data.list[0].main.temp),
                    feels_like: Math.round(response.data.list[0].main.feels_like),
                    humidity: response.data.list[0].main.humidity,
                    pressure: response.data.list[0].main.pressure,
                    description: response.data.list[0].weather[0].description,
                    icon: response.data.list[0].weather[0].icon,
                    wind_speed: response.data.list[0].wind.speed,
                    wind_direction: response.data.list[0].wind.deg,
                    wind_direction_text: getWindDirectionText(response.data.list[0].wind.deg),
                    visibility:response.data.list[0].visibility,
                    city: response.data.city.name,
                    country: response.data.city.country
                }

                // 处48小时预报
                hourlyForecast.value = response.data.list.slice(0, 16).map(item => ({
                    datetime: item.dt_txt,
                    temp: Math.round(item.main.temp),
                    feels_like: Math.round(item.main.feels_like),
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    pop: item.pop ? Math.round(item.pop * 100) : 0
                }))

                // 处理7天预报
                const forecastsByDate = {}
                response.data.list.forEach(item => {
                    const date = item.dt_txt.split(' ')[0]
                    if (!forecastsByDate[date]) {
                        forecastsByDate[date] = {
                            date: date,
                            temp_max: Math.round(item.main.temp_max),
                            temp_min: Math.round(item.main.temp_min),
                            description: item.weather[0].description,
                            icon: item.weather[0].icon
                        }
                    } else {
                        // 更新最高最低温度
                        forecastsByDate[date].temp_max = Math.max(forecastsByDate[date].temp_max, Math.round(item.main.temp_max))
                        forecastsByDate[date].temp_min = Math.min(forecastsByDate[date].temp_min, Math.round(item.main.temp_min))
                    }
                })

                dailyForecast.value = Object.values(forecastsByDate).slice(0, 7)

                // 保存到 localStorage 缓存
                const cacheKey = `weather_${location.value.lat}_${location.value.lon}`
                const dataToCache = {
                    currentWeather: currentWeather.value,
                    hourlyForecast: hourlyForecast.value,
                    dailyForecast: dailyForecast.value
                }
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: dataToCache,
                    timestamp: Date.now()
                }))
            }
        } catch (err) {
            error.value = `获取天气数据失败: ${err.message}`
        } finally {
            loading.value = false
        }
    }
    function getWindDirectionText(degrees) {
        // 将风向角度转换为方向文字
        const directions = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];
        const index = Math.round((degrees % 360) / 45) % 8;
        return directions[index];
    }

    // 清除错误
    function clearError() {
        error.value = null
    }

    // 打印统计信息（用于测试）
    // function printStats() {
    //     const hitRate = cacheStats.totalRequests > 0
    //         ? (cacheStats.hits / cacheStats.totalRequests * 100).toFixed(1) + '%'
    //         : 'N/A'
    //     console.log('=== WeatherInsight 缓存统计 ===')
    //     console.log(`总请求次数: ${cacheStats.totalRequests}`)
    //     console.log(`缓存命中: ${cacheStats.hits}`)
    //     console.log(`缓存未命中: ${cacheStats.misses}`)
    //     console.log(`缓存命中率: ${hitRate}`)
    // }

    return {
        // 位置相关
        location,
        locationLoading,
        locationError,

        // 天气相关
        currentWeather,
        hourlyForecast,
        dailyForecast,
        loading,
        error,

        // 方法
        setLocationByCity,
        useCurrentLocation,
        getHourlyWeather,
        getDailyWeather,
        getAllWeather,
        clearError,
        // printStats,
        cacheStats,
    }
})