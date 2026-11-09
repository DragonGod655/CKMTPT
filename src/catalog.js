const sand = { name: 'Cát', paint: '#c8a784' }
const ink = { name: 'Than', paint: '#3a3b33' }
const moss = { name: 'Rêu', paint: '#737c55' }
const ivory = { name: 'Kem', paint: '#e7d9bc' }
const denim = { name: 'Xanh denim', paint: '#506d87' }
const gray = { name: 'Xám', paint: '#93928d' }
const white = { name: 'Trắng', paint: '#f7f5ed' }

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
  { id: 'quan-jeans', name: 'Quần Jeans ống đứng', category: 'Quần', shape: 'pants', price: 649000, sale: 549000,
    description: 'Quần jeans xanh ống đứng, dễ mặc cùng áo thun hoặc hoodie.',
    variants: variants([denim, ink], ['S', 'M', 'L'], [[4, 5, 2], [2, 0, 3]]) },
  { id: 'ao-khoac-denim', name: 'Áo khoác Denim', category: 'Áo khoác', shape: 'jacket', price: 789000,
    description: 'Áo khoác denim dáng rộng, dễ mặc ngoài áo thun.',
    variants: variants([denim], ['S', 'M', 'L'], [[2, 3, 1]]) },
  { id: 'ao-hoodie', name: 'Hoodie nỉ', category: 'Áo khoác', shape: 'hoodie', price: 529000, sale: 459000,
    description: 'Hoodie nỉ có mũ và túi trước, phù hợp cho ngày mát.',
    variants: variants([gray, ink], ['S', 'M', 'L'], [[3, 5, 4], [2, 2, 0]]) },
  { id: 'ao-len', name: 'Áo len dệt', category: 'Áo', shape: 'knit', price: 499000,
    description: 'Áo len cổ tròn tông sáng, dễ phối cùng quần tối màu.',
    variants: variants([sand, ivory], ['S', 'M', 'L'], [[2, 3, 3], [0, 2, 1]]) },
  { id: 'giay-sneaker', name: 'Sneaker trắng', category: 'Giày', shape: 'shoes', price: 749000, sale: 649000,
    description: 'Sneaker trắng cổ thấp, đi cùng jeans hoặc quần ống đứng.',
    variants: variants([white], ['36', '37', '38', '39', '40', '41', '42'], [[2, 4, 3, 0, 5, 3, 1]]) },
  { id: 'mu-luoi-trai', name: 'Mũ lưỡi trai', category: 'Phụ kiện', shape: 'cap', price: 199000,
    description: 'Mũ lưỡi trai tông cát với khóa chỉnh vòng đầu.',
    variants: variants([sand, ink], ['OS'], [[7], [3]]) },
  { id: 'kinh-ram', name: 'Kính râm gọng đen', category: 'Phụ kiện', shape: 'glasses', price: 279000,
    description: 'Kính râm gọng đen dáng chữ nhật cho trang phục hằng ngày.',
    variants: variants([ink], ['OS'], [[4]]) },
]

export const productPhoto = product => `${import.meta.env.BASE_URL}photos/${product.id}.jpg`
export const unitPrice = product => product.sale ?? product.price
export const money = amount => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

