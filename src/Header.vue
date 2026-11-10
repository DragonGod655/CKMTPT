<script setup>
import { useCart } from './cart.js'
import { useAuth } from './auth.js'
const cart = useCart()
const auth = useAuth()
defineEmits(['cart'])
</script>
<template>
  <header class="header">
    <div class="header-inner">
      <RouterLink class="brand" :to="{ name: 'home' }">mộc<span>.</span><small>STUDIO</small></RouterLink>
      <nav aria-label="Điều hướng chính"><RouterLink :to="{ name: 'home' }">Trang chủ</RouterLink><RouterLink :to="{ name: 'catalog' }">Bộ sưu tập</RouterLink></nav>
      <div class="header-actions">
        <button v-if="auth.signedIn" class="account-link" @click="auth.signOut()">Đăng xuất</button>
        <RouterLink v-else class="account-link" :to="{ name: 'login' }">Đăng nhập</RouterLink>
        <button class="cart-toggle" @click="$emit('cart')">Giỏ hàng <span>{{ cart.count }}</span></button>
      </div>
    </div>
  </header>
</template>
