/**
 * AI 天气总结服务
 * 使用本地 LLM 对天气数据进行语义总结
 */

import { ref } from 'vue'

// 提示词模板
const SUMMARY_PROMPT = `你是一个专业的天气助手。请根据以下天气数据，用简洁友好的语言为用户生成天气总结和建议。

天气数据：
- 地点：{location}
- 温度：{temp}°C（体感温度：{feelsLike}°C）
- 天气状况：{description}
- 湿度：{humidity}%
- 风速：{windSpeed} m/s
- 气压：{pressure} hPa
- 能见度：{visibility}m
- 穿衣指数：{clothingAdvice}
- 出行建议：{travelAdvice}

请用 2-3 句话总结今日天气特点，并给出实用建议。用中文回答。`

// 穿衣建议映射
const getClothingAdvice = (temp, description) => {
  const lowerDesc = description.toLowerCase()
  const isRainy = lowerDesc.includes('雨') || lowerDesc.includes('雪')

  if (temp <= 0) return isRainy ? '羽绒服、保暖内衣、防水靴子、雨伞' : '羽绒服、保暖内衣、棉裤、围巾手套'
  if (temp <= 10) return isRainy ? '厚外套、保暖内衣、雨伞' : '大衣、保暖内衣、围巾'
  if (temp <= 15) return isRainy ? '夹克衫、厚衬衫、雨伞' : '夹克衫、长袖衬衫'
  if (temp <= 20) return isRainy ? '薄外套、长袖、雨伞' : '长袖、薄外套'
  if (temp <= 25) return '衬衫、薄外套'
  if (temp <= 30) return '短袖、短裤、遮阳帽'
  return '轻薄短袖、短裤、遮阳防晒'
}

// 出行建议映射
const getTravelAdvice = (temp, description, windSpeed, humidity, visibility) => {
  const advices = []
  const lowerDesc = description.toLowerCase()
  const isRainy = lowerDesc.includes('雨') || lowerDesc.includes('雪')
  const isFoggy = lowerDesc.includes('雾') || lowerDesc.includes('霾')

  // 天气状况建议
  if (isRainy) {
    advices.push('记得带伞，路面湿滑注意安全')
  }
  if (isFoggy) {
    advices.push('空气质量较差，建议佩戴口罩')
  }
  if (lowerDesc.includes('晴')) {
    advices.push('适合户外活动，注意防晒')
  }
  if (lowerDesc.includes('多云')) {
    advices.push('天气宜人，适合外出')
  }

  // 温度建议
  if (temp < 10) {
    advices.push('天气较凉，适当添加衣物')
  } else if (temp > 30) {
    advices.push('高温预警，注意防暑降温')
  }

  // 风速建议
  if (windSpeed > 10) {
    advices.push('风速较大，户外活动注意安全')
  }

  // 湿度建议
  if (humidity > 80) {
    advices.push('空气潮湿，注意防潮防霉')
  }

  // 能见度建议
  if (visibility < 5000) {
    advices.push('能见度较低出行注意安全')
  }

  return advices.length > 0 ? advices.join('；') + '。' : '天气条件良好，适合出行。'
}

// 构建提示词
const buildPrompt = (weatherData, location) => {
  return SUMMARY_PROMPT
    .replace('{location}', location || '未知')
    .replace('{temp}', weatherData.temp ?? 'N/A')
    .replace('{feelsLike}', weatherData.feels_like ?? 'N/A')
    .replace('{description}', weatherData.description ?? '未知')
    .replace('{humidity}', weatherData.humidity ?? 'N/A')
    .replace('{windSpeed}', weatherData.wind_speed ?? 'N/A')
    .replace('{pressure}', weatherData.pressure ?? 'N/A')
    .replace('{visibility}', weatherData.visibility ?? 'N/A')
    .replace('{clothingAdvice}', getClothingAdvice(weatherData.temp, weatherData.description))
    .replace('{travelAdvice}', getTravelAdvice(
      weatherData.temp,
      weatherData.description,
      weatherData.wind_speed,
      weatherData.humidity,
      weatherData.visibility
    ))
}

export function useAISummary() {
  const summary = ref('')
  const loading = ref(false)
  const error = ref(null)

  /**
   * 生成天气总结
   * @param {Object} weatherData - 当前天气数据
   * @param {string} location - 位置名称
   * @returns {Promise<string>} 天气总结文本
   */
  const generateSummary = async (weatherData, location) => {
    if (!weatherData) {
      error.value = '天气数据不可用'
      return ''
    }

    loading.value = true
    error.value = null

    try {
      // 方案1：使用本地规则生成总结（无需 API key）
      // 这个是即时生成，不依赖外部服务
      summary.value = generateLocalSummary(weatherData, location)
      return summary.value

    } catch (err) {
      error.value = err.message
      console.error('生成天气总结失败:', err)
      return ''
    } finally {
      loading.value = false
    }
  }

  /**
   * 本地规则生成总结（无需 API 调用）
   */
  const generateLocalSummary = (weatherData, location) => {
    const temp = weatherData.temp
    const feelsLike = weatherData.feels_like
    const desc = weatherData.description || ''
    const humidity = weatherData.humidity
    const windSpeed = weatherData.wind_speed
    const windDirection = weatherData.wind_direction_text || ''
    const visibility = weatherData.visibility

    const parts = []

    // 温度描述
    if (temp !== undefined) {
      if (temp <= 0) parts.push('气温较低')
      else if (temp <= 10) parts.push('气温偏低')
      else if (temp <= 20) parts.push('气温舒适')
      else if (temp <= 25) parts.push('气温温暖')
      else if (temp <= 30) parts.push('气温较热')
      else parts.push('高温炎热')

      // 体感温度差异
      if (feelsLike !== undefined && Math.abs(feelsLike - temp) >= 3) {
        if (feelsLike < temp) {
          parts.push(`体感偏冷（${feelsLike}°C）`)
        } else {
          parts.push(`体感偏热（${feelsLike}°C）`)
        }
      }
    }

    // 天气状况
    if (desc) {
      const lowerDesc = desc.toLowerCase()
      if (lowerDesc.includes('雨')) {
        parts.push('有降雨')
      } else if (lowerDesc.includes('雪')) {
        parts.push('有降雪')
      } else if (lowerDesc.includes('雾')) {
        parts.push('有雾')
      } else if (lowerDesc.includes('云')) {
        parts.push('多云')
      } else if (lowerDesc.includes('晴')) {
        parts.push('晴朗')
      }
    }

    // 风力
    if (windSpeed !== undefined) {
      if (windSpeed > 10) {
        parts.push('风力较大')
      } else if (windSpeed > 5) {
        parts.push('有微风')
      }
    }

    // 综合建议
    const clothingAdvice = getClothingAdvice(temp, desc)
    const travelAdvice = getTravelAdvice(temp, desc, windSpeed, humidity, visibility)

    return `${location || '当前地区'}\n\n${parts.join('，')}。\n\n穿衣建议：${clothingAdvice}\n\n出行建议：${travelAdvice}`
  }

  /**
   * 调用 LLM API 生成总结（需要 API key）
   * 当前使用免费的本地生成，后续可以切换到真正的 LLM
   */
  const generateSummaryWithLLM = async (weatherData, location) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY

    if (!apiKey) {
      // 没有 API key，使用本地生成
      return generateLocalSummary(weatherData, location)
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的天气助手，用简洁友好的语言为用户总结天气。'
            },
            {
              role: 'user',
              content: buildPrompt(weatherData, location)
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      })

      if (!response.ok) {
        throw new Error('API 调用失败')
      }

      const data = await response.json()
      const llmSummary = data.choices?.[0]?.message?.content || ''

      summary.value = llmSummary
      return llmSummary

    } catch (err) {
      console.warn('LLM API 调用失败，使用本地生成:', err)
      // 降级到本地生成
      return generateLocalSummary(weatherData, location)
    }
  }

  return {
    summary,
    loading,
    error,
    generateSummary,
    generateSummaryWithLLM
  }
}
