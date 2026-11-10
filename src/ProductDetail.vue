<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { products, money, productPhoto, unitPrice } from './catalog.js'
import { useCart } from './cart.js'
import ProductArt from './ProductArt.vue'

const props = defineProps({ id: { type: String, required: true } })
const cart = useCart()
const product = computed(() => products.find(item => item.id === props.id))
const colors = computed(() => [...new Set(product.value?.variants.map(item => item.color))])
const selected = reactive({ color: '', size: '' })
const preview = ref(null)
const message = ref('')
const sizes = computed(() => product.value?.variants.filter(item => item.color.name === selected.color) ?? [])
const variant = computed(() => sizes.value.find(item => item.size === selected.size))
const stock = computed(() => variant.value ? cart.available(product.value, variant.value) : 0)
const inStock = computed(() => stock.value > 0)
const sale = computed(() => product.value?.sale != null)

function pickColor(color) {
  selected.color = color
  if (!sizes.value.some(item => item.size === selected.size)) selected.size = sizes.value[0]?.size ?? ''
}

watch(product, item => {
  selected.size = ''
  preview.value = null
  pickColor(item?.variants[0].color.name ?? '')
}, { immediate: true })
watch(() => [props.id, selected.color, selected.size], () => { message.value = '' })

function add() {
  if (variant.value && cart.add(product.value, variant.value)) message.value = 'Đã thêm vào giỏ hàng.'
}

function buy() {
  if (variant.value && cart.add(product.value, variant.value)) {
    message.value = ''
    cart.checkoutOpen = true
  }
}
</script>

<template>
  <section v-if="product" class="detail">
    <RouterLink :to="{ name: 'catalog' }" class="back">← Bộ sưu tập</RouterLink>
    <div class="detail-grid">
      <figure class="product-image detail-image">
        <img :src="productPhoto(product)" :alt="'Ảnh minh họa ' + product.name">
        <figcaption>Ảnh minh họa</figcaption>
      </figure>
      <div class="detail-copy">
        <p class="eyebrow">{{ product.category }}</p>
        <h1>{{ product.name }}</h1>
        <p>{{ product.description }}</p>
        <p class="detail-price"><strong>{{ money(unitPrice(product)) }}</strong> <del v-if="sale">{{ money(product.price) }}</del></p>
        <p><strong>Màu</strong> · {{ selected.color }}</p>
        <div class="swatches">
          <button v-for="color in colors" :key="color.name" class="swatch" :style="{ '--paint': color.paint }"
            :aria-label="color.name" :aria-pressed="color.name === selected.color" @focus="preview = color.paint"
            @blur="preview = null" @mouseover="preview = color.paint" @mouseleave="preview = null" @click="pickColor(color.name)"></button>
        </div>
        <ProductArt v-if="['shirt', 'tee', 'bag'].includes(product.shape) || product.id === 'quan-straight'"
          class="color-preview" :shape="product.shape" :paint="preview ?? variant?.color.paint" />
        <p><strong>Kích cỡ</strong> · {{ selected.size }}</p>
        <div class="filters">
          <button v-for="item in sizes" :key="item.id" :class="{ selected: item.size === selected.size }"
            :aria-pressed="item.size === selected.size" @click="selected.size = item.size">{{ item.size }}</button>
        </div>
        <p v-if="inStock" class="stock" role="status">Còn hàng · {{ stock }} sản phẩm</p>
        <p v-else class="stock sold" role="status">Hết hàng</p>
        <div class="purchase-actions">
          <button class="secondary" :disabled="!inStock" @click="add">Thêm vào giỏ</button>
          <button class="primary" :disabled="!inStock" @click="buy">Mua ngay</button>
        </div>
        <p role="status">{{ message }}</p>
      </div>
    </div>
  </section>
  <section v-else class="detail"><h1>Không tìm thấy sản phẩm</h1><RouterLink :to="{ name: 'catalog' }">Về bộ sưu tập</RouterLink></section>
</template>
