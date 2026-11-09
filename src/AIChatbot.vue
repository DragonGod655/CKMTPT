<script setup>
import { nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getAdvice } from './advice.js'
import { useCart } from './cart.js'
import { products } from './catalog.js'

const cart = useCart()
const route = useRoute()
const open = ref(false)
const input = ref('')
const field = ref(null)
const log = ref(null)
const pending = ref(false)
const messages = ref([])
const prompts = ['Phối đồ đi làm', 'Tìm túi dưới 300k', 'Sneaker size 39 còn không?', 'Món nào đang giảm giá?']
const endpoint = import.meta.env.VITE_CHAT_API_URL || (import.meta.env.DEV ? '/api/chat' : '')
let previousId

async function askOpenAI() {
  if (!endpoint) return null
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(18000),
    body: JSON.stringify({
      conversation: messages.value.slice(-8).map(message => ({
        role: message.user ? 'user' : 'assistant', content: message.text.slice(0, message.user ? 400 : 1200),
      })),
      currentProduct: route.params.id,
      reserved: Object.fromEntries(cart.lines.map(line => [line.id, line.quantity])),
    }),
  })
  if (!response.ok) return null
  const { text, productIds } = await response.json()
  if (!text || !Array.isArray(productIds)) return null
  return { text, items: products.filter(product => productIds.includes(product.id)), openai: true }
}

async function toggle() {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    field.value?.focus()
  }
}

async function send(text) {
  const question = text.trim()
  if (!question || pending.value) return
  messages.value.push({ text: question, user: true })
  input.value = ''
  pending.value = true
  try {
    const ai = await askOpenAI().catch(() => null)
    const answer = ai ?? await getAdvice(question, cart.available, route.params.id ?? previousId)
    previousId = answer.items.length === 1 ? answer.items[0].id : undefined
    messages.value.push(answer)
  } catch {
    messages.value.push({ text: 'Mình chưa tra được danh mục. Bạn thử gửi lại câu hỏi nhé.' })
  } finally {
    pending.value = false
    await nextTick()
    log.value?.scrollTo(0, log.value.scrollHeight)
  }
}
</script>

<template>
  <aside class="chat" aria-label="Tư vấn phối đồ">
    <section v-if="open" class="chat-panel">
      <div class="panel-head"><div><strong>Trợ lý Mộc</strong><small>Tư vấn phối đồ và sản phẩm</small></div><button class="icon" aria-label="Đóng tư vấn" @click="toggle">×</button></div>
      <div ref="log" class="chat-log" role="log" aria-live="polite">
        <p class="bubble">Chào bạn! Hỏi mình về phối đồ, ngân sách, giá ưu đãi hoặc tồn kho theo màu và size nhé.</p>
        <div v-for="(message, i) in messages" :key="i" class="bubble" :class="{ mine: message.user }">
          <p>{{ message.text }}</p>
          <small v-if="!message.user">{{ message.openai ? 'OpenAI' : 'Tra cứu danh mục' }}</small>
          <RouterLink v-for="item in message.items ?? []" :key="item.id" :to="{ name: 'product', params: { id: item.id } }" @click="open = false">{{ item.name }} ↗</RouterLink>
        </div>
        <p v-if="pending" class="bubble">Mình đang xem danh mục…</p>
      </div>
      <div class="prompts"><button v-for="prompt in prompts" :key="prompt" :disabled="pending" @click="send(prompt)">{{ prompt }}</button></div>
      <form class="chat-form" @submit.prevent="send(input)">
        <input ref="field" v-model="input" aria-label="Nhập câu hỏi" placeholder="Bạn đang tìm gì?" maxlength="400">
        <button :disabled="pending || !input.trim()">Gửi</button>
      </form>
    </section>
    <button class="chat-toggle" :aria-expanded="open" @click="toggle"><span aria-hidden="true">✦</span> Tư vấn phối đồ</button>
  </aside>
</template>
