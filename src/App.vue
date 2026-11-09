<script setup>
import { ref } from 'vue'
import Header from './Header.vue'
import CartModal from './CartModal.vue'
import AIChatbot from './AIChatbot.vue'

const cartOpen = ref(false)
</script>

<template>
  <Header @cart="cartOpen = true" />
  <main class="wrap"><RouterView /></main>
  <footer><div class="wrap"><strong>Mộc Studio</strong><span>Thời trang &amp; phụ kiện hằng ngày</span></div></footer>
  <CartModal v-if="cartOpen" @close="cartOpen = false" />
  <AIChatbot />
</template>
