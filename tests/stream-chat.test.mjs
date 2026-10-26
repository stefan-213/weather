import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

let vite
let useStreamChat

before(async () => {
  vite = await createServer({
    configFile: false,
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true },
    appType: 'custom'
  })
  ;({ useStreamChat } = await vite.ssrLoadModule('/src/composables/useStreamChat.ts'))
})

after(async () => {
  await vite?.close()
})

async function createChat(t, response) {
  t.mock.method(globalThis, 'fetch', async () => response)
  const originalRAF = globalThis.requestAnimationFrame
  const originalCancelRAF = globalThis.cancelAnimationFrame
  globalThis.requestAnimationFrame = callback => setTimeout(callback, 0)
  globalThis.cancelAnimationFrame = clearTimeout
  t.after(() => {
    globalThis.requestAnimationFrame = originalRAF
    globalThis.cancelAnimationFrame = originalCancelRAF
  })

  let chat
  await renderToString(createSSRApp({
    setup() {
      chat = useStreamChat()
      return () => null
    }
  }))
  return chat
}

function streamResponse(chunks) {
  const encoder = new TextEncoder()
  return new Response(new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    }
  }), { headers: { 'Content-Type': 'text/event-stream' } })
}

test('renders a successful reply across split SSE chunks', async t => {
  const chat = await createChat(t, streamResponse([
    'data: {"content":"今天',
    '晴朗"}\n\ndata: {"content":"，适合散步。"}\n\n',
    'data: [DONE]\n\n'
  ]))
  await chat.sendMessage('天气如何？')
  assert.equal(chat.messages.value.at(-1).content, '今天晴朗，适合散步。')
  assert.equal(chat.messages.value.at(-1).isStreaming, false)
  assert.equal(chat.loading.value, false)
  assert.equal(chat.error.value, null)
})

test('surfaces a model permission error from a successful HTTP stream', async t => {
  const message = '403 Access denied by API-Key restrictions.'
  const chat = await createChat(t, streamResponse([
    `data: ${JSON.stringify({ error: message })}\n\n`
  ]))
  await chat.sendMessage('天气如何？')
  assert.equal(chat.error.value, message)
  assert.ok(chat.messages.value.at(-1).content.length > 0)
  assert.equal(chat.messages.value.at(-1).isStreaming, false)
  assert.equal(chat.loading.value, false)
})

test('reports an empty response instead of leaving a blank assistant message', async t => {
  const chat = await createChat(t, streamResponse([]))
  await chat.sendMessage('天气如何？')
  assert.match(chat.error.value, /模型未返回内容/)
  assert.ok(chat.messages.value.at(-1).content.length > 0)
  assert.equal(chat.loading.value, false)
})

test('preserves partial content when the model fails midstream', async t => {
  const chat = await createChat(t, streamResponse([
    'data: {"content":"今天晴朗"}\n\n',
    'data: {"error":"模型连接中断"}\n\n'
  ]))
  await chat.sendMessage('天气如何？')
  assert.equal(chat.messages.value.at(-1).content, '今天晴朗')
  assert.equal(chat.error.value, '模型连接中断')
  assert.equal(chat.loading.value, false)
})

test('surfaces the error returned with a failed HTTP request', async t => {
  const chat = await createChat(t, new Response(JSON.stringify({ error: '模型不可用' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  }))
  await chat.sendMessage('天气如何？')
  assert.equal(chat.error.value, '模型不可用')
  assert.equal(chat.loading.value, false)
})
