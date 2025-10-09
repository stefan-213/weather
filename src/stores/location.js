import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useGetLocationStore = defineStore("getlocation", () => {
  const location = ref({
    lat: "",
    lon: "",
    address: "",
    cityCode: "", // 城市名称作为标识
    chineseName: ""
  });
  const loading = ref(true);
  const error = ref(null);

  // 获取当前位置
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
          try {
            const { latitude, longitude } = position.coords
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
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      )

      if (response.data && response.data.length > 0) {
        const locationData = response.data[0]

        location.value = {
          lat: locationData.lat,
          lon: locationData.lon,
          address: `${locationData.name}, ${locationData.country}`,
          cityCode: locationData.name, // 使用城市名称作为标识
          chineseName: locationData.local_names?.zh
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

  // 清除错误
  function clearError() {
    error.value = null
  }

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    getLocationByCity,
    getAddressByCoordinates,
    clearError
  }
})