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

test('answers an exact stock question and understands a follow-up about the same product', async () => {
  const cart = useCart(createPinia())
  const sold = await getAdvice('Sneaker size 39 còn không?', cart.available)
  assert.match(sold.text, /size 39: hết hàng/)
  const followUp = await getAdvice('Còn size 40 không?', cart.available, sold.items[0].id)
  assert.match(followUp.text, /size 40: còn 5/)
  const linen = products[0]
  cart.add(linen, linen.variants[0])
  const stock = await getAdvice('Sơ mi linen màu kem size S còn bao nhiêu?', cart.available)
  assert.match(stock.text, /Kem size S: còn 2/)
})

test('gives different outfits for work and casual use and respects the total budget', async () => {
  const cart = useCart(createPinia())
  const work = await getAdvice('Phối đồ đi làm dưới 1,1 triệu', cart.available)
  assert.deepEqual(work.items.map(item => item.id), ['ao-linen', 'quan-straight'])
  const casual = await getAdvice('Phối đồ đi chơi dưới 900.000đ', cart.available)
  assert.deepEqual(casual.items.map(item => item.id), ['ao-cotton', 'quan-jeans'])
  const sale = await getAdvice('Có món nào đang giảm giá?', cart.available)
  assert.ok(sale.items.length && sale.items.every(item => item.sale != null))
  const unclear = await getAdvice('Bạn có biết dự báo thời tiết không?', cart.available)
  assert.equal(unclear.items.length, 0)
})

