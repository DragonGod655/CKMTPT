<script setup>
import { useCart } from './cart.js'
const cart = useCart()
defineEmits(['cart'])
</script>
<template>
  <header class="header">
    <div class="header-inner">
      <RouterLink class="brand" :to="{ name: 'home' }">mộc<span>.</span><small>STUDIO</small></RouterLink>
      <nav aria-label="Điều hướng chính"><RouterLink :to="{ name: 'home' }">Trang chủ</RouterLink><RouterLink :to="{ name: 'catalog' }">Bộ sưu tập</RouterLink></nav>
      <button class="cart-toggle" @click="$emit('cart')">Giỏ hàng <span>{{ cart.count }}</span></button>
    </div>
  </header>
</template>
