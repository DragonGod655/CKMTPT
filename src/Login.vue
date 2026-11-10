<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { demoAccount, useAuth } from './auth.js'

const router = useRouter()
const auth = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const pending = ref(false)

async function submit() {
  if (pending.value) return
  pending.value = true
  const signedIn = await auth.signIn(email.value, password.value)
  pending.value = false
  if (!signedIn) {
    error.value = 'Email, số điện thoại hoặc mật khẩu chưa đúng.'
    return
  }
  router.replace({ name: 'catalog' })
}

function fillDemo() {
  email.value = demoAccount.email
  password.value = demoAccount.password
  error.value = ''
}
</script>

<template>
  <section class="login-page" aria-labelledby="login-title">
    <div class="login-card">
      <p class="eyebrow">Mộc Studio</p>
      <h1 id="login-title">Đăng nhập</h1>
      <p v-if="auth.signedIn">Bạn đang đăng nhập bằng tài khoản mẫu.</p>
      <form v-else class="checkout-form" @submit.prevent="submit" @input="error = ''">
        <p>Đăng nhập bằng email hoặc số điện thoại đã đăng ký.</p>
        <label>Email hoặc số điện thoại<input v-model="email" autocomplete="username" required maxlength="254"></label>
        <label>Mật khẩu<input v-model="password" type="password" autocomplete="current-password" required></label>
        <p v-if="error" class="login-error" role="alert">{{ error }}</p>
        <div class="purchase-actions">
          <button class="primary" type="submit" :disabled="pending">Đăng nhập</button>
          <button class="secondary" type="button" @click="fillDemo">Điền tài khoản mẫu</button>
        </div>
      </form>
      <p v-if="!auth.signedIn" class="auth-switch">Chưa có tài khoản? <RouterLink :to="{ name: 'register' }">Đăng ký</RouterLink></p>
      <RouterLink v-if="auth.signedIn" class="primary" :to="{ name: 'catalog' }">Xem bộ sưu tập</RouterLink>
    </div>
  </section>
</template>
