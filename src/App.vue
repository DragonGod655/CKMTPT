<script setup>
import { ref, watch } from 'vue'
import Header from './Header.vue'
import CartModal from './CartModal.vue'
import AIChatbot from './AIChatbot.vue'
import { useCart } from './cart.js'

const cartOpen = ref(false)
const cart = useCart()

watch(() => cart.checkoutOpen, open => {
  if (open) cartOpen.value = true
})

function closeCart() {
  cartOpen.value = false
  cart.checkoutOpen = false
}
</script>

<template>
  <Header @cart="cartOpen = true" />
  <main class="wrap"><RouterView /></main>
  <footer><div class="wrap"><strong>Mộc Studio</strong><span>Thời trang &amp; phụ kiện hằng ngày</span></div></footer>
  <CartModal v-if="cartOpen" @close="closeCart" />
  <AIChatbot />
</template>
