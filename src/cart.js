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
  const purchased = ref({})
  const lastOrder = ref(saved.lastOrder ?? null)
  const checkoutOpen = ref(false)

  const entries = products.flatMap(product => product.variants.map(variant => ({
    product, variant, id: `${product.id}:${variant.id}`,
  })))

  for (const { id, variant } of entries) {
    const sold = saved.purchased?.[id]
    if (Number.isInteger(sold) && sold > 0) purchased.value[id] = Math.min(sold, variant.stock)
    const quantity = (saved.quantities ?? saved)[id]
    const remaining = variant.stock - (purchased.value[id] ?? 0)
    if (Number.isInteger(quantity) && quantity > 0 && remaining > 0) {
      quantities.value[id] = Math.min(quantity, remaining)
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
  const reserved = computed(() => Object.fromEntries(entries.map(({ id }) => [
    id, (purchased.value[id] ?? 0) + (quantities.value[id] ?? 0),
  ])))

  function available(product, variant) {
    return variant.stock - (reserved.value[`${product.id}:${variant.id}`] ?? 0)
  }

  function setQuantity(productId, variantId, quantity) {
    const id = `${productId}:${variantId}`
    const entry = entries.find(item => item.id === id)
    if (!entry || !Number.isInteger(quantity) || quantity < 0 || quantity > entry.variant.stock - (purchased.value[id] ?? 0)) return false
    if (quantity) quantities.value[id] = quantity
    else delete quantities.value[id]
    return true
  }

  function add(product, variant) {
    return setQuantity(product.id, variant.id, (quantities.value[`${product.id}:${variant.id}`] ?? 0) + 1)
  }

  function placeOrder() {
    if (!count.value) return null
    const order = { code: `MOC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, total: total.value, count: count.value }
    for (const { id, quantity } of lines.value) purchased.value[id] = (purchased.value[id] ?? 0) + quantity
    quantities.value = {}
    lastOrder.value = order
    return order
  }

  watch([quantities, purchased, lastOrder], ([cart, sold, receipt]) => {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify({ quantities: cart, purchased: sold, lastOrder: receipt }))
    } catch {
      // The cart stays usable for the current session if storage is unavailable.
    }
  }, { deep: true })

  return { lines, count, subtotal, total, discount, reserved, lastOrder, checkoutOpen, available, setQuantity, add, placeOrder }
})
