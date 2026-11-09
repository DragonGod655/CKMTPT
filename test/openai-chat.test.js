import test from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { createChatHandler } from '../server/chat.js'

async function send(handler, body, origin = 'http://127.0.0.1:5173') {
  const req = Object.assign(Readable.from([Buffer.from(JSON.stringify(body))]), {
    url: '/api/chat', method: 'POST', headers: { origin },
  })
  let status
  let result
  await handler(req, {
    setHeader() {},
    writeHead(code) { status = code },
    end(data) { result = JSON.parse(data) },
  })
  return { status, result }
}

test('sends catalog and conversation to OpenAI and filters returned product IDs', async () => {
  const handler = createChatHandler({ OPENAI_API_KEY: 'test-placeholder' }, async (url, init) => {
    const request = JSON.parse(init.body)
    assert.equal(url, 'https://api.openai.com/v1/responses')
    assert.equal(init.headers.Authorization, 'Bearer test-placeholder')
    assert.equal(request.model, 'gpt-5.4-mini')
    assert.equal(request.store, false)
    assert.match(request.instructions, /"color":"Kem","size":"S","available":2/)
    assert.deepEqual(request.input.map(turn => turn.role), ['user', 'assistant', 'user'])
    const text = JSON.stringify({ text: 'Sơ mi Linen màu Kem size S còn 2.', productIds: ['ao-linen', 'invalid'] })
    return { ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'output_text', text }] }] }) }
  })
  const { status, result } = await send(handler, {
    conversation: [
      { role: 'user', content: 'Mình thích sơ mi.' },
      { role: 'assistant', content: 'Bạn thử xem Sơ mi Linen.' },
      { role: 'user', content: 'Còn màu kem size S không?' },
    ],
    reserved: { 'ao-linen:0-S': 1 },
  })
  assert.equal(status, 200)
  assert.deepEqual(result.productIds, ['ao-linen'])
})

test('returns a controlled response for missing credentials or a disallowed origin', async () => {
  const handler = createChatHandler({})
  assert.equal((await send(handler, {})).status, 503)
  assert.equal((await send(handler, {}, 'https://example.com')).status, 403)
})

