import { Router } from 'express'
import { z } from 'zod'
import {
  chat,
  streamChat,
  generateWeatherSummary,
  generateClothingAdvice,
  generateTravelAdvice,
  ChatMessage
} from '../services/ai.js'

export const aiRouter = Router()

// 请求体验证 schema
const chatSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
})

const summarySchema = z.object({
  location: z.string(),
  temp: z.number(),
  feelsLike: z.number().optional(),
  description: z.string(),
  humidity: z.number().optional(),
  windSpeed: z.number().optional(),
  pressure: z.number().optional(),
  visibility: z.number().optional()
})

const adviceSchema = z.object({
  temp: z.number(),
  description: z.string(),
  windSpeed: z.number().optional(),
  humidity: z.number().optional()
})

/**
 * POST /api/ai/chat
 * 非流式对话
 */
aiRouter.post('/chat', async (req, res) => {
  try {
    const { message, history } = chatSchema.parse(req.body)

    const reply = await chat(message, history as ChatMessage[])

    res.json({
      success: true,
      data: {
        role: 'assistant',
        content: reply
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})

/**
 * POST /api/ai/chat/stream
 * 流式对话
 */
aiRouter.post('/chat/stream', async (req, res) => {
  try {
    const { message, history } = chatSchema.parse(req.body)

    // 立即设置 headers 并禁用缓冲
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    ;(res as any).flushHeaders?.()

    // 心跳机制：每 15 秒发送 ping 防止连接超时
    const keepAlive = setInterval(() => {
      res.write(': ping\n\n')
    }, 20000)

    // 清理心跳
    req.on('close', () => {
      clearInterval(keepAlive)
    })

    for await (const chunk of streamChat(message, history as ChatMessage[])) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
      ;(res as any).flush?.()
    }

    clearInterval(keepAlive)
    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    console.error('Stream error:', error)
    clearInterval(keepAlive)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '服务器错误'
      })
    } else {
      res.end()
    }
  }
})

/**
 * POST /api/ai/summary
 * 生成天气总结
 */
aiRouter.post('/summary', async (req, res) => {
  try {
    const options = summarySchema.parse(req.body)

    const summary = await generateWeatherSummary(options)

    res.json({
      success: true,
      data: { content: summary }
    })
  } catch (error) {
    console.error('Summary error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})

/**
 * POST /api/ai/clothing-advice
 * 生成穿衣建议
 */
aiRouter.post('/clothing-advice', async (req, res) => {
  try {
    const { temp, description, windSpeed } = adviceSchema.parse(req.body)

    const advice = await generateClothingAdvice(temp, description, windSpeed)

    res.json({
      success: true,
      data: { content: advice }
    })
  } catch (error) {
    console.error('Clothing advice error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})

/**
 * POST /api/ai/travel-advice
 * 生成出行建议
 */
aiRouter.post('/travel-advice', async (req, res) => {
  try {
    const { temp, description, windSpeed, humidity } = adviceSchema.parse(req.body)

    const advice = await generateTravelAdvice(temp, description, windSpeed, humidity)

    res.json({
      success: true,
      data: { content: advice }
    })
  } catch (error) {
    console.error('Travel advice error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})
