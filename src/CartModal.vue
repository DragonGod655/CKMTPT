<script setup>
import { onMounted, ref } from 'vue'
import { useCart } from './cart.js'
import { money, unitPrice } from './catalog.js'

const cart = useCart()
const dialog = ref(null)
defineEmits(['close'])
onMounted(() => dialog.value.showModal())
</script>

<template>
  <dialog ref="dialog" class="cart-dialog" @close="$emit('close')">
    <div class="panel-head"><h2>Giỏ hàng</h2><button class="icon" aria-label="Đóng giỏ hàng" @click="dialog.close()">×</button></div>
    <p v-if="!cart.count">Giỏ hàng của bạn đang trống.</p>
    <template v-else>
      <ul class="cart-lines">
        <li v-for="line in cart.lines" :key="line.id">
          <div><strong>{{ line.product.name }}</strong><p>{{ line.variant.color.name }} · {{ line.variant.size }}</p></div>
          <strong>{{ money(unitPrice(line.product) * line.quantity) }}</strong>
          <div class="quantity">
            <button :aria-label="'Giảm số lượng ' + line.product.name" @click="cart.setQuantity(line.product.id, line.variant.id, line.quantity - 1)">−</button>
            <span>{{ line.quantity }}</span>
            <button :disabled="cart.available(line.product, line.variant) === 0" :aria-label="'Tăng số lượng ' + line.product.name"
              @click="cart.setQuantity(line.product.id, line.variant.id, line.quantity + 1)">+</button>
            <button @click="cart.setQuantity(line.product.id, line.variant.id, 0)">Xóa</button>
          </div>
        </li>
      </ul>
      <dl><dt>Tạm tính</dt><dd>{{ money(cart.subtotal) }}</dd><dt>Tiết kiệm</dt><dd>{{ money(cart.discount) }}</dd><dt>Tổng cộng</dt><dd><strong>{{ money(cart.total) }}</strong></dd></dl>
    </template>
  </dialog>
</template>
