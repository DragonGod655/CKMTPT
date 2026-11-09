import test from 'node:test'
import assert from 'node:assert/strict'
import { createPinia } from 'pinia'
import { useCart } from '../src/cart.js'
import { products } from '../src/catalog.js'
import { getAdvice } from '../src/advice.js'

test('limits each variant and returns reserved stock when a line is removed', () => {
  const cart = useCart(createPinia())
  const product = products[0]
  const [available, sold] = product.variants
  assert.equal(cart.add(product, sold), false)
  assert.equal(cart.setQuantity(product.id, available.id, available.stock), true)
  assert.equal(cart.add(product, available), false)
  assert.equal(cart.available(product, available), 0)
  assert.equal(cart.setQuantity(product.id, available.id, 0), true)
  assert.equal(cart.available(product, available), available.stock)
  assert.equal(cart.count, 0)
})

test('calculates totals and discounts across different variants', () => {
  const cart = useCart(createPinia())
  const product = products[0]
  cart.add(product, product.variants[0])
  cart.add(product, product.variants[3])
  assert.equal(cart.lines.length, 2)
  assert.equal(cart.count, 2)
  assert.equal(cart.subtotal, 1098000)
  assert.equal(cart.discount, 200000)
  assert.equal(cart.total, 898000)
})

test('suggests a matching available product within the budget', async () => {
  const cart = useCart(createPinia())
  const result = await getAdvice('Tìm túi dưới 300k', cart.available)
  assert.deepEqual(result.items.map(item => item.id), ['tui-canvas'])
  const empty = await getAdvice('Tìm túi dưới 100k', cart.available)
  assert.deepEqual(empty.items, [])
})

