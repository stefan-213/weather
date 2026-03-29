import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { aiRouter } from './routes/ai.js'

const app = express()
const PORT = process.env.PORT || 3001

// 禁用 ETag 和 compression 来确保流式输出
app.disable('etag')
app.use(cors({
  origin: (origin, callback) => {
    // 允许无 origin（比如 curl / postman）
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      'https://weather-iota-green.vercel.app',
    ]

    // 允许 vercel 所有子域
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use(express.json())

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// AI 路由
app.use('/api/ai', aiRouter)

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  })
})

app.listen(PORT, () => {
  console.log(`AI Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
