import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()

// 初始化 OpenAI 客户端（使用 DashScope）
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY || 'your-api-key',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
})

// 天气相关的系统提示
const WEATHER_SYSTEM_PROMPT = `你是专业的天气助手，可以回答用户关于天气的问题。

你具备以下能力：
1. 根据温度、湿度、风速等数据给出穿衣建议
2. 根据天气状况给出出行建议
3. 判断是否适合户外活动（如跑步、晨练等）
4. 提供异常天气预警提醒
5. 生成简洁易懂的天气总结

请用友好、专业的语气回答用户问题。回答应该简洁有条理，使用 Markdown 格式。`

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface GenerateSummaryOptions {
  location: string
  temp: number
  feelsLike?: number
  description: string
  humidity?: number
  windSpeed?: number
  pressure?: number
  visibility?: number
}

/**
 * 生成天气总结
 */
export async function generateWeatherSummary(options: GenerateSummaryOptions): Promise<string> {
  const { location, temp, feelsLike, description, humidity, windSpeed, pressure, visibility } = options

  const response = await client.chat.completions.create({
    model: process.env.DASHSCOPE_MODEL || 'qwen3.7-flash-2026-07-15',
    messages: [
      { role: 'system', content: WEATHER_SYSTEM_PROMPT },
      { role: 'user', content: `请为以下天气数据生成简洁的总结：

地点：${location}
温度：${temp}°C${feelsLike ? `（体感 ${feelsLike}°C）` : ''}
天气：${description}
湿度：${humidity ?? '未知'}%
风速：${windSpeed ?? '未知'} m/s
气压：${pressure ?? '未知'} hPa
能见度：${visibility ? `${visibility / 1000} km` : '未知'}

请生成 2-3 句话的总结，包括：
1. 简要天气描述
2. 穿衣建议
3. 出行建议` }
    ],
    temperature: 0.7,
    max_tokens: 500
  })

  return response.choices[0]?.message?.content || '暂无数据'
}

/**
 * 流式对话
 */
export async function* streamChat(
  message: string,
  history: ChatMessage[] = []
): AsyncGenerator<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: WEATHER_SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: message }
  ]

  const stream = await client.chat.completions.create({
    model: process.env.DASHSCOPE_MODEL || 'qwen3.7-flash-2026-07-15',
    messages,
    temperature: 0.7,
    stream: true
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      yield content
    }
  }
}

/**
 * 非流式对话
 */
export async function chat(
  message: string,
  history: ChatMessage[] = []
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: WEATHER_SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: message }
  ]

  const response = await client.chat.completions.create({
    model: process.env.DASHSCOPE_MODEL || 'qwen3.7-flash-2026-07-15',
    messages,
    temperature: 0.7,
    max_tokens: 1000
  })

  return response.choices[0]?.message?.content || '抱歉，暂时无法回答'
}

/**
 * 生成穿衣建议
 */
export async function generateClothingAdvice(
  temp: number,
  description: string,
  windSpeed?: number
): Promise<string> {
  const response = await client.chat.completions.create({
    model: process.env.DASHSCOPE_MODEL || 'qwen3.7-flash-2026-07-15',
    messages: [
      { role: 'system', content: '你是一个专业的穿衣顾问，请根据天气数据给出简洁的穿衣建议。' },
      { role: 'user', content: `温度：${temp}°C，天气：${description}，风速：${windSpeed ?? 0} m/s。请给出穿衣建议。` }
    ],
    temperature: 0.7,
    max_tokens: 200
  })

  return response.choices[0]?.message?.content || '暂无建议'
}

/**
 * 生成出行建议
 */
export async function generateTravelAdvice(
  temp: number,
  description: string,
  windSpeed?: number,
  humidity?: number
): Promise<string> {
  const response = await client.chat.completions.create({
    model: process.env.DASHSCOPE_MODEL || 'qwen3.7-flash-2026-07-15',
    messages: [
      { role: 'system', content: '你是一个专业的出行顾问，请根据天气数据给出简洁的出行建议。' },
      { role: 'user', content: `温度：${temp}°C，天气：${description}，风速：${windSpeed ?? 0} m/s，湿度：${humidity ?? 0}%。请给出出行建议。` }
    ],
    temperature: 0.7,
    max_tokens: 200
  })

  return response.choices[0]?.message?.content || '暂无建议'
}
