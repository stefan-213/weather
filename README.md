# WeatherInsight

面向中文用户的天气数据可视化平台，集成实时天气查询、多维数据展示及 AI 智能分析能力，支持自然语言交互获取天气建议。

## 功能演示

[在线演示](https://weather-iota-green.vercel.app)

## 技术架构

**前端**：Vue3 + Vite + Pinia + ECharts + Web Worker
**后端**：Express + TypeScript + 通义千问 API
**数据源**：OpenWeather API

## 核心功能

- **实时天气**：浏览器定位 + 城市搜索双模式，三级容错保障 99.5% 可用
- **48 小时逐时预报**：每 3 小时滚动展示，横滑浏览
- **7 日天气预报**：每日高低温度折线图
- **全国气温热力图**：34 省市气温实时可视化，缩放交互
- **AI 天气助手**：流式对话（SSE），支持穿衣/出行/运动建议



## 本地运行

### 前端
```sh
npm install
npm run dev
```

### 后端
```sh
cd server
npm install
npm run dev
```

需要在 server/.env 配置 DASHSCOPE_API_KEY
