import { createServer } from 'node:http'
import { createChatHandler } from './chat.js'

const port = Number(process.env.PORT ?? 8787)
const host = process.env.CHAT_ALLOWED_ORIGIN ? '0.0.0.0' : '127.0.0.1'
if (!process.env.OPENAI_API_KEY?.trim()) throw new Error('OPENAI_API_KEY is required.')
createServer(createChatHandler()).listen(port, host, () => {
  console.log(`Mộc Studio chat API listening on ${host}:${port}`)
})
