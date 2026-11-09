<script setup>
import { ref } from 'vue'
import { money, productPhoto, unitPrice } from './catalog.js'

const props = defineProps({ product: { type: Object, required: true } })
const colors = [...new Set(props.product.variants.map(variant => variant.color))]
const paint = ref(colors[0].paint)
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
          :aria-label="color.name" :aria-pressed="paint === color.paint" @mouseover="paint = color.paint" @click="paint = color.paint"></button>
      </div>
    </div>
    <strong>{{ money(unitPrice(product)) }}</strong> <del v-if="product.sale">{{ money(product.price) }}</del>
  </article>
</template>
