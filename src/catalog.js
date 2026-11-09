const sand = { name: 'Cát', paint: '#c8a784' }
const ink = { name: 'Than', paint: '#3a3b33' }
const moss = { name: 'Rêu', paint: '#737c55' }
const ivory = { name: 'Kem', paint: '#e7d9bc' }

function variants(colors, sizes, stocks) {
  return colors.flatMap((color, i) => sizes.map((size, j) => ({
    id: `${i}-${size}`, color, size, stock: stocks[i][j],
  })))
}

export const products = [
  { id: 'ao-linen', name: 'Sơ mi Linen', category: 'Áo', shape: 'shirt', price: 549000, sale: 449000,
    description: 'Sơ mi linen dáng rộng, nhẹ và thoáng cho những ngày nhiều nắng.',
    variants: variants([ivory, moss], ['S', 'M', 'L'], [[3, 0, 5], [2, 4, 1]]) },
  { id: 'quan-straight', name: 'Quần Straight', category: 'Quần', shape: 'pants', price: 589000,
    description: 'Quần ống đứng cạp cao, dễ phối cùng sơ mi hoặc áo thun.',
    variants: variants([ink, sand], ['S', 'M', 'L'], [[2, 4, 3], [0, 3, 4]]) },
  { id: 'tui-canvas', name: 'Túi Canvas', category: 'Phụ kiện', shape: 'bag', price: 299000, sale: 249000,
    description: 'Túi canvas quai dài, đủ chỗ cho sách và các vật dụng hằng ngày.',
    variants: variants([sand, ink], ['OS'], [[6], [0]]) },
  { id: 'ao-cotton', name: 'Áo thun Cotton', category: 'Áo', shape: 'tee', price: 329000,
    description: 'Áo thun cotton cổ tròn, dáng suông và mềm nhẹ.',
    variants: variants([moss, ivory], ['S', 'M', 'L'], [[4, 4, 0], [3, 2, 4]]) },
]

export const unitPrice = product => product.sale ?? product.price
export const money = amount => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

