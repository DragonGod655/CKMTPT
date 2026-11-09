<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { products } from './catalog.js'
import ProductArt from './ProductArt.vue'
import ProductCard from './ProductCard.vue'

const route = useRoute()
const categories = ['Tất cả', ...new Set(products.map(product => product.category))]
const category = computed(() => categories.includes(route.query.nhom) ? route.query.nhom : 'Tất cả')
const shown = computed(() => category.value === 'Tất cả' ? products : products.filter(product => product.category === category.value))
</script>

<template>
  <section v-if="route.name === 'home'" class="hero">
    <div class="hero-copy">
      <p class="eyebrow">MỘC STUDIO / BỘ SƯU TẬP 01</p>
      <h1>Đơn giản mà<br><em>có gu.</em></h1>
      <p>Những món đồ dễ mặc, dễ phối và đủ thoải mái để đồng hành cùng bạn mỗi ngày.</p>
      <RouterLink class="primary" :to="{ name: 'catalog' }">Khám phá bộ sưu tập <span aria-hidden="true">↗</span></RouterLink>
    </div>
    <div class="hero-art">
      <span class="hero-note">01 / LINEN EDIT</span>
      <ProductArt shape="shirt" paint="#cdb590" />
      <span class="hero-caption">SƠ MI LINEN · MÀU KEM</span>
    </div>
  </section>
  <section class="catalog" aria-labelledby="catalog-title">
    <p class="eyebrow">CHỌN MÓN ĐỒ CỦA BẠN</p>
    <div class="section-head">
      <h2 id="catalog-title">Bộ sưu tập</h2>
      <nav class="filters" aria-label="Danh mục">
        <RouterLink v-for="item in categories" :key="item" :class="{ selected: category === item }"
          :aria-current="category === item ? 'true' : undefined"
          :to="{ name: 'catalog', query: item === 'Tất cả' ? {} : { nhom: item } }">{{ item }}</RouterLink>
      </nav>
    </div>
    <div class="grid"><ProductCard v-for="product in shown" :key="product.id" :product="product" /></div>
  </section>
</template>
