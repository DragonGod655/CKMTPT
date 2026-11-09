<script setup>
import { nextTick, ref } from 'vue'
import { getAdvice } from './advice.js'
import { useCart } from './cart.js'

const cart = useCart()
const open = ref(false)
const input = ref('')
const field = ref(null)
const log = ref(null)
const pending = ref(false)
const messages = ref([])
const prompts = ['Gợi ý phối đồ đi làm', 'Tìm túi dưới 300k']

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
    messages.value.push(await getAdvice(question, cart.available))
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
      <div class="panel-head"><div><strong>Trợ lý Mộc</strong><small>Chatbot mô phỏng</small></div><button class="icon" aria-label="Đóng tư vấn" @click="toggle">×</button></div>
      <div ref="log" class="chat-log" role="log" aria-live="polite">
        <p class="bubble">Chào bạn! Mình có thể gợi ý phối đồ hoặc tìm món theo ngân sách.</p>
        <div v-for="(message, i) in messages" :key="i" class="bubble" :class="{ mine: message.user }">
          <p>{{ message.text }}</p>
          <RouterLink v-for="item in message.items ?? []" :key="item.id" :to="{ name: 'product', params: { id: item.id } }" @click="open = false">{{ item.name }} ↗</RouterLink>
        </div>
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
