import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import axios from "axios";

export const useGetLocationStore = defineStore("getlocation", () => {
  const location = ref({
    lat: "",
    lon: "",
    address: "",
    cityCode: "",
    chineseName: ""
  });
  const loading = ref(false);
  const error = ref(null);

  // 定位统计
  const locationStats = reactive({
    geolocationSuccess: 0,
    geolocationTimeout: 0,
    geolocationDenied: 0,
    geolocationError: 0,
    ipLocationSuccess: 0,
    searchCity: 0,
    defaultCity: 0
  });

  // 获取当前位置（使用浏览器定位，VPN 下不准确，需要手动搜索）
  async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理定位'))
        return
      }

      loading.value = true
      error.value = null

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          locationStats.geolocationSuccess++

          try {
            const addressInfo = await getAddressByCoordinates(latitude, longitude)
            location.value = {
              lat: latitude,
              lon: longitude,
              address: addressInfo.address,
              cityCode: addressInfo.cityCode,
              chineseName: addressInfo.chineseName
            }
            resolve(location.value)
          } catch (err) {
            console.warn('获取详细地址失败，使用坐标信息:', err)
            location.value = {
              lat: latitude,
              lon: longitude,
              address: '当前位置',
              cityCode: '',
              chineseName: ''
            }
            resolve(location.value)
          } finally {
            loading.value = false
          }
        },
        (err) => {
          error.value = getErrorMessage(err)
          if (err.code === err.TIMEOUT) {
            locationStats.geolocationTimeout++
          } else if (err.code === err.PERMISSION_DENIED) {
            locationStats.geolocationDenied++
          } else {
            locationStats.geolocationError++
          }
          loading.value = false
          reject(error.value)
        }
      )
    })
  }

  // 通过城市名获取地理位置
  async function getLocationByCity(cityName) {
    if (!cityName?.trim()) {
      throw new Error('城市名称不能为空')
    }

    loading.value = true
    error.value = null

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      )

      if (response.data && response.data.length > 0) {
        // 优先查找 local_names.zh 匹配的城市，找不到则用第一个结果
        const locationData = response.data.find(item =>
          item.local_names?.zh === cityName
        ) || response.data[0]
        locationStats.searchCity++
        location.value = {
          lat: locationData.lat,
          lon: locationData.lon,
          address: `${locationData.name}, ${locationData.country}`,
          cityCode: locationData.name, // 使用城市名称作为标识
          chineseName: locationData.local_names?.zh || cityName
        }

        return location.value
      } else {
        throw new Error(`未找到城市"${cityName}"`)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 通过坐标获取地址（反向地理编码）
  async function getAddressByCoordinates(lat, lon) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      )

      if (response.data && response.data.length > 0) {
        const locationData = response.data[0]
        return {
          address: `${locationData.name}, ${locationData.country}`,
          cityCode: locationData.name,
          chineseName: locationData.local_names?.zh
        }
      }
      throw new Error('获取地址信息失败')
    } catch (err) {
      throw new Error(`获取地址失败: ${err.message}`)
    }
  }

  // 错误信息处理
  function getErrorMessage(geolocationError) {
    switch (geolocationError.code) {
      case geolocationError.PERMISSION_DENIED:
        return '用户拒绝了地理定位请求'
      case geolocationError.POSITION_UNAVAILABLE:
        return '位置信息不可用'
      case geolocationError.TIMEOUT:
        return '获取位置信息超时'
      default:
        return '获取位置信息时发生未知错误'
    }
  }

  // 通过 IP 获取位置（备用方案）
  async function getLocationByIP() {
    try {
      // 使用 ip-api.com 获取 IP 定位（免费，无需 API key）
      const response = await axios.get('http://ip-api.com/json/?lang=zh-CN')
      if (response.data && response.data.status === 'success') {
        locationStats.ipLocationSuccess++
        const { lat, lon, city, regionName, country } = response.data
        // 通过城市名获取更精确的坐标
        const cityResponse = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
        )
        if (cityResponse.data && cityResponse.data.length > 0) {
          location.value = {
            lat: cityResponse.data[0].lat,
            lon: cityResponse.data[0].lon,
            address: `${city}, ${regionName}, ${country}`,
            cityCode: cityResponse.data[0].name,
            chineseName: cityResponse.data[0].local_names?.zh || city
          }
        } else {
          location.value = {
            lat,
            lon,
            address: `${city}, ${regionName}, ${country}`,
            cityCode: city,
            chineseName: city
          }
        }
        return location.value
      }
      throw new Error('IP 定位失败')
    } catch (err) {
      throw new Error(`IP 定位失败: ${err.message}`)
    }
  }

  // 清除错误
  function clearError() {
    error.value = null
  }

  // 打印统计信息（用于测试）
  // function printStats() {
  //   const total = locationStats.geolocationSuccess + locationStats.geolocationTimeout +
  //                 locationStats.geolocationDenied + locationStats.geolocationError +
  //                 locationStats.searchCity + locationStats.defaultCity
  //   const successRate = total > 0
  //       ? (locationStats.geolocationSuccess / (locationStats.geolocationSuccess +
  //           locationStats.geolocationTimeout + locationStats.geolocationDenied +
  //           locationStats.geolocationError) * 100).toFixed(1) + '%'
  //       : 'N/A'

  //   console.log('=== WeatherInsight 定位统计 ===')
  //   console.log(`定位成功: ${locationStats.geolocationSuccess}`)
  //   console.log(`定位超时: ${locationStats.geolocationTimeout}`)
  //   console.log(`定位拒绝: ${locationStats.geolocationDenied}`)
  //   console.log(`定位错误: ${locationStats.geolocationError}`)
  //   console.log(`手动搜索: ${locationStats.searchCity}`)
  //   console.log(`使用默认: ${locationStats.defaultCity}`)
  //   console.log(`定位成功率: ${successRate}`)
  // }

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    getLocationByCity,
    getAddressByCoordinates,
    getLocationByIP,
    clearError,
    locationStats,
    // printStats
  }
})