import { products, unitPrice } from '../src/catalog.js'

const instructions = `Bạn là Trợ lý Mộc, tư vấn thời trang bằng tiếng Việt. Trả lời đúng câu hỏi cuối, dùng ngữ cảnh hội thoại và trang đang mở khi cần. Nếu câu hỏi mơ hồ, hỏi lại một câu ngắn. Giá, ưu đãi, biến thể và tồn khả dụng phải dựa trên danh mục trong yêu cầu. Không bịa sản phẩm, giá, size, đơn hàng hay chính sách. Mộc Studio là cửa hàng demo, chưa hỗ trợ đặt hàng và thanh toán. Khi gợi ý bộ đồ, giữ tổng giá trong ngân sách và nêu lý do phối. Trả lời ngắn gọn, tránh Markdown. Danh sách productIds chỉ chứa mã sản phẩm được nhắc đến và tối đa ba mã.`

const answerFormat = {
  type: 'json_schema',
  name: 'storefront_advice',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      text: { type: 'string' },
      productIds: { type: 'array', items: { type: 'string', enum: products.map(product => product.id) } },
    },
    required: ['text', 'productIds'],
    additionalProperties: false,
  },
}

export function createChatHandler(env = process.env, fetchResponse = fetch) {
  const geminiKey = env.GEMINI_API_KEY?.trim() ||
    (env.OPENAI_API_KEY?.startsWith('AQ.') || env.OPENAI_API_KEY?.startsWith('AIza') ? env.OPENAI_API_KEY.trim() : null)
  const openaiKey = env.OPENAI_API_KEY?.startsWith('sk-') ? env.OPENAI_API_KEY.trim() : (!geminiKey ? env.OPENAI_API_KEY?.trim() : null)
  const allowedOrigin = env.CHAT_ALLOWED_ORIGIN
  let minute = -1
  let day = -1
  let minuteCount = 0
  let dayCount = 0

  return async function chat(req, res, next) {
    if (req.url?.split('?')[0] !== '/api/chat') {
      if (next) return next()
      res.writeHead(404).end()
      return
    }

    const origin = req.headers.origin
    const localOrigin = !allowedOrigin && ['http://localhost', 'http://127.0.0.1'].some(host =>
      origin === host || origin?.startsWith(host + ':'))
    const respond = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      res.end(JSON.stringify(data))
    }

    if (origin && origin !== allowedOrigin && !localOrigin) return respond(403, { error: 'origin_denied' })
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Vary', 'Origin')
    }
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      res.writeHead(204).end()
      return
    }
    if (req.method !== 'POST') return respond(405, { error: 'method_not_allowed' })
    if (!geminiKey && !openaiKey) return respond(503, { error: 'ai_not_configured' })

    let body
    try {
      const chunks = []
      let length = 0
      for await (const chunk of req.iterator({ destroyOnReturn: false })) {
        length += chunk.length
        if (length > 24000) return respond(413, { error: 'request_too_large' })
        chunks.push(chunk)
      }
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch {
      return respond(400, { error: 'invalid_json' })
    }

    const conversation = Array.isArray(body?.conversation) ? body.conversation : []
    if (!conversation.length || conversation.length > 8 || conversation.at(-1)?.role !== 'user' ||
      conversation.some(turn => !['user', 'assistant'].includes(turn?.role) ||
        typeof turn.content !== 'string' || !turn.content.trim() ||
        turn.content.length > (turn.role === 'user' ? 400 : 1200))) {
      return respond(400, { error: 'invalid_conversation' })
    }

    const now = Date.now()
    const currentMinute = Math.floor(now / 60000)
    const currentDay = Math.floor(now / 86400000)
    if (minute !== currentMinute) {
      minute = currentMinute
      minuteCount = 0
    }
    if (day !== currentDay) {
      day = currentDay
      dayCount = 0
    }
    if (minuteCount >= 12 || dayCount >= 100) return respond(429, { error: 'chat_limit' })
    minuteCount++
    dayCount++

    const catalog = products.map(product => ({
      id: product.id, name: product.name, description: product.description, category: product.category,
      price: unitPrice(product), originalPrice: product.price,
      variants: product.variants.map(variant => {
        const reserved = body.reserved?.[`${product.id}:${variant.id}`]
        const quantity = Number.isInteger(reserved) ? Math.max(0, reserved) : 0
        return { color: variant.color.name, size: variant.size, available: Math.max(0, variant.stock - quantity) }
      }),
    }))
    const currentProduct = products.some(product => product.id === body.currentProduct) ? body.currentProduct : null

    try {
      if (geminiKey) {
        const model = env.GEMINI_MODEL || 'gemini-3.6-flash'
        const result = await fetchResponse(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          headers: { 'x-goog-api-key': geminiKey, 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(16000),
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: `${instructions}\nDanh mục và trang hiện tại: ${JSON.stringify({ catalog, currentProduct })}` }],
            },
            contents: conversation.map(({ role, content }) => ({
              role: role === 'assistant' ? 'model' : 'user',
              parts: [{ text: content }],
            })),
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  text: { type: 'STRING' },
                  productIds: {
                    type: 'ARRAY',
                    items: { type: 'STRING', enum: products.map(product => product.id) },
                  },
                },
                required: ['text', 'productIds'],
              },
            },
          }),
        })
        if (!result.ok) return respond(502, { error: 'gemini_unavailable' })
        const response = await result.json()
        const rawText = response.candidates?.[0]?.content?.parts
          ?.filter(part => !part.thought).map(part => part.text ?? '').join('')
        if (!rawText) return respond(502, { error: 'gemini_incomplete' })
        const { text, productIds } = JSON.parse(rawText)
        if (typeof text !== 'string' || !text.trim() || !Array.isArray(productIds)) {
          return respond(502, { error: 'invalid_gemini_reply' })
        }
        return respond(200, {
          text: text.slice(0, 1200),
          productIds: [...new Set(productIds)].filter(id => products.some(product => product.id === id)).slice(0, 3),
          provider: 'Gemini',
        })
      }

      const result = await fetchResponse('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(16000),
        body: JSON.stringify({
          model: env.OPENAI_MODEL || 'gpt-5.4-mini',
          instructions: `${instructions}\nDanh mục và trang hiện tại: ${JSON.stringify({ catalog, currentProduct })}`,
          input: conversation.map(({ role, content }) => ({ role, content })),
          store: false,
          max_output_tokens: 900,
          reasoning: { effort: 'low' },
          text: { format: answerFormat },
        }),
      })
      if (!result.ok) return respond(502, { error: 'openai_unavailable' })
      const response = await result.json()
      const output = response.output?.flatMap(item => item.content ?? []).find(item => item.type === 'output_text')
      if (response.status !== 'completed' || !output) return respond(502, { error: 'openai_incomplete' })
      const { text, productIds } = JSON.parse(output.text)
      if (typeof text !== 'string' || !text.trim() || !Array.isArray(productIds)) {
        return respond(502, { error: 'invalid_openai_reply' })
      }
      return respond(200, {
        text: text.slice(0, 1200),
        productIds: [...new Set(productIds)].filter(id => products.some(product => product.id === id)).slice(0, 3),
        provider: 'OpenAI',
      })
    } catch {
      return respond(502, { error: geminiKey ? 'gemini_unavailable' : 'openai_unavailable' })
    }
  }
}
