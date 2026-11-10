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
  <dialog ref="dialog" class="cart-dialog" aria-labelledby="cart-title" @close="$emit('close')">
    <div class="panel-head"><h2 id="cart-title">{{ cart.checkoutOpen && cart.count ? 'Đặt hàng' : 'Giỏ hàng' }}</h2><button class="icon" aria-label="Đóng giỏ hàng" @click="dialog.close()">×</button></div>
    <div v-if="!cart.count && cart.lastOrder" class="order-receipt" role="status">
      <h3>Đã ghi nhận đơn hàng mẫu</h3>
      <p>Mã đơn: <strong>{{ cart.lastOrder.code }}</strong></p>
      <p>{{ cart.lastOrder.count }} sản phẩm · {{ money(cart.lastOrder.total) }}</p>
      <button class="primary" @click="dialog.close()">Tiếp tục mua sắm</button>
    </div>
    <p v-else-if="!cart.count">Giỏ hàng của bạn đang trống.</p>
    <template v-else>
      <ul class="cart-lines">
        <li v-for="line in cart.lines" :key="line.id">
          <div><strong>{{ line.product.name }}</strong><p>{{ line.variant.color.name }} · {{ line.variant.size }}<span v-if="cart.checkoutOpen"> · SL {{ line.quantity }}</span></p></div>
          <strong>{{ money(unitPrice(line.product) * line.quantity) }}</strong>
          <div v-if="!cart.checkoutOpen" class="quantity">
            <button :aria-label="'Giảm số lượng ' + line.product.name" @click="cart.setQuantity(line.product.id, line.variant.id, line.quantity - 1)">−</button>
            <span>{{ line.quantity }}</span>
            <button :disabled="cart.available(line.product, line.variant) === 0" :aria-label="'Tăng số lượng ' + line.product.name"
              @click="cart.setQuantity(line.product.id, line.variant.id, line.quantity + 1)">+</button>
            <button @click="cart.setQuantity(line.product.id, line.variant.id, 0)">Xóa</button>
          </div>
        </li>
      </ul>
      <dl><dt>Tạm tính</dt><dd>{{ money(cart.subtotal) }}</dd><dt>Tiết kiệm</dt><dd>{{ money(cart.discount) }}</dd><dt>Tổng cộng</dt><dd><strong>{{ money(cart.total) }}</strong></dd></dl>
      <form v-if="cart.checkoutOpen" class="checkout-form" @submit.prevent="cart.placeOrder()">
        <p>Đơn hàng mẫu cho toàn bộ giỏ. Thông tin giao hàng chỉ dùng để thử biểu mẫu.</p>
        <label>Họ và tên<input name="name" autocomplete="name" required maxlength="80" pattern=".*\S.*"></label>
        <label>Số điện thoại<input name="phone" type="tel" autocomplete="tel-national" required pattern="[0-9]{9,11}" title="Nhập từ 9 đến 11 chữ số"></label>
        <label>Địa chỉ giao hàng<textarea name="address" autocomplete="street-address" required minlength="5" maxlength="200" rows="2"></textarea></label>
        <div class="purchase-actions">
          <button type="button" class="secondary" @click="cart.checkoutOpen = false">Về giỏ hàng</button>
          <button class="primary" type="submit">Xác nhận đặt hàng</button>
        </div>
      </form>
      <button v-else class="primary" @click="cart.checkoutOpen = true">Đặt hàng</button>
    </template>
  </dialog>
</template>
