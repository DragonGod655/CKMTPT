<script setup>
import { computed, ref } from 'vue'
import { money, productPhoto, unitPrice } from './catalog.js'
import { useCart } from './cart.js'

const props = defineProps({ product: { type: Object, required: true } })
const cart = useCart()
const colors = [...new Set(props.product.variants.map(variant => variant.color))]
const paint = ref(colors[0].paint)
const message = ref('')
const quickVariant = computed(() => props.product.variants.find(variant =>
  variant.color.paint === paint.value && cart.available(props.product, variant) > 0))

function selectColor(color) {
  if (paint.value === color.paint) return
  paint.value = color.paint
  message.value = ''
}

function addToCart() {
  const variant = quickVariant.value
  if (variant && cart.add(props.product, variant)) {
    const size = variant.size === 'OS' ? '' : `, cỡ ${variant.size}`
    message.value = `Đã thêm ${variant.color.name}${size} vào giỏ.`
  }
}
</script>

<template>
  <article class="product-card">
    <RouterLink class="product-image" :to="{ name: 'product', params: { id: product.id } }" :aria-label="product.name">
      <span v-if="product.sale" class="badge">Ưu đãi</span>
      <img class="catalog-photo" :src="productPhoto(product)" :alt="'Ảnh minh họa ' + product.name" loading="lazy" width="400" height="450">
    </RouterLink>
    <div class="card-info">
      <div><small>{{ product.category }} · {{ colors.find(color => color.paint === paint)?.name }}</small><h3><RouterLink :to="{ name: 'product', params: { id: product.id } }">{{ product.name }}</RouterLink></h3></div>
      <div class="swatches">
        <button v-for="color in colors" :key="color.name" class="swatch" :style="{ '--paint': color.paint }"
          :aria-label="color.name" :aria-pressed="paint === color.paint" @mouseover="selectColor(color)" @click="selectColor(color)"></button>
      </div>
    </div>
    <div class="card-purchase">
      <div>
        <strong>{{ money(unitPrice(product)) }}</strong> <del v-if="product.sale">{{ money(product.price) }}</del>
        <small v-if="quickVariant">Thêm nhanh · {{ quickVariant.size === 'OS' ? 'Cỡ duy nhất' : 'Cỡ ' + quickVariant.size }}</small>
        <small v-else>Màu này đã hết hàng</small>
      </div>
      <button class="quick-add" type="button" :disabled="!quickVariant" :aria-label="'Thêm nhanh ' + product.name" @click="addToCart">+</button>
    </div>
    <p class="card-feedback" role="status">{{ message }}</p>
  </article>
</template>
