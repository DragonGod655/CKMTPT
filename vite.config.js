import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createChatHandler } from './server/chat.js'

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), ['OPENAI_', 'GEMINI_', 'CHAT_']) }
  return {
    base: './',
    plugins: [vue(), {
      name: 'moc-chat',
      configureServer(server) {
        server.middlewares.use(createChatHandler(env))
      },
    }],
  }
})
