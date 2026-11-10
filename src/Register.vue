<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './auth.js'

const auth = useAuth()
const router = useRouter()
const method = ref('email')
const identifier = ref('')
const password = ref('')
const error = ref('')
const pending = ref(false)

async function submit() {
  if (pending.value) return
  pending.value = true
  error.value = await auth.register(identifier.value, password.value)
  pending.value = false
  if (!error.value) router.replace({ name: 'catalog' })
}

function signInDemo() {
  auth.signInDemo()
  router.replace({ name: 'catalog' })
}
</script>

<template>
  <section class="login-page" aria-labelledby="register-title">
    <div class="login-card">
      <p class="eyebrow">Mộc Studio</p>
      <h1 id="register-title">Đăng ký</h1>
      <template v-if="auth.signedIn">
        <p>Bạn đang đăng nhập. Hãy đăng xuất để tạo tài khoản khác.</p>
        <RouterLink class="primary" :to="{ name: 'catalog' }">Xem bộ sưu tập</RouterLink>
      </template>
      <template v-else>
        <div class="filters" role="group" aria-label="Cách đăng ký">
          <button v-for="option in ['email', 'phone']" :key="option" type="button" :disabled="pending"
            :class="{ selected: method === option }" :aria-pressed="method === option"
            @click="method = option; identifier = ''; error = ''">{{ option === 'email' ? 'Email / Gmail' : 'Số điện thoại' }}</button>
        </div>
        <form class="checkout-form" @submit.prevent="submit" @input="error = ''">
          <label v-if="method === 'email'">Email<input key="email" v-model="identifier" type="email" autocomplete="email" maxlength="254" required></label>
          <label v-else>Số điện thoại<input key="phone" v-model="identifier" type="tel" autocomplete="tel" maxlength="20" required></label>
          <label>Mật khẩu<input v-model="password" type="password" autocomplete="new-password" minlength="8" maxlength="72" required></label>
          <p v-if="error" class="login-error" role="alert">{{ error }}</p>
          <button class="primary" type="submit" :disabled="pending">Tạo tài khoản</button>
        </form>
        <div class="social-options">
          <p>Đăng nhập mạng xã hội ở chế độ demo</p>
          <div class="purchase-actions">
            <button class="secondary" type="button" :disabled="pending" @click="signInDemo">Google (demo)</button>
            <button class="secondary" type="button" :disabled="pending" @click="signInDemo">Facebook (demo)</button>
          </div>
        </div>
        <p class="auth-switch">Đã có tài khoản? <RouterLink :to="{ name: 'login' }">Đăng nhập</RouterLink></p>
      </template>
    </div>
  </section>
</template>
