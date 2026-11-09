import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { products, unitPrice } from './catalog.js'

const key = 'moc-studio-cart-v1'

function restore() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(key) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

export const useCart = defineStore('cart', () => {
  const quantities = ref({})
  const saved = restore()

  const entries = products.flatMap(product => product.variants.map(variant => ({
    product, variant, id: `${product.id}:${variant.id}`,
  })))

  for (const { id, variant } of entries) {
    if (Number.isInteger(saved[id]) && saved[id] > 0 && variant.stock > 0) {
      quantities.value[id] = Math.min(saved[id], variant.stock)
    }
  }

  const lines = computed(() => entries.flatMap(entry => {
    const quantity = quantities.value[entry.id] ?? 0
    return quantity ? [{ ...entry, quantity }] : []
  }))
  const count = computed(() => lines.value.reduce((total, line) => total + line.quantity, 0))
  const subtotal = computed(() => lines.value.reduce((total, { product, quantity }) => total + product.price * quantity, 0))
  const total = computed(() => lines.value.reduce((sum, { product, quantity }) => sum + unitPrice(product) * quantity, 0))
  const discount = computed(() => subtotal.value - total.value)

  function available(product, variant) {
    return variant.stock - (quantities.value[`${product.id}:${variant.id}`] ?? 0)
  }

  function setQuantity(productId, variantId, quantity) {
    const id = `${productId}:${variantId}`
    const entry = entries.find(item => item.id === id)
    if (!entry || !Number.isInteger(quantity) || quantity < 0 || quantity > entry.variant.stock) return false
    if (quantity) quantities.value[id] = quantity
    else delete quantities.value[id]
    return true
  }

  function add(product, variant) {
    return setQuantity(product.id, variant.id, (quantities.value[`${product.id}:${variant.id}`] ?? 0) + 1)
  }

  watch(quantities, value => {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify(value))
    } catch {
      // The cart stays usable for the current session if storage is unavailable.
    }
  }, { deep: true })

  return { lines, count, subtotal, total, discount, available, setQuantity, add }
})
