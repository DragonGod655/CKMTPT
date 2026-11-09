import { money, products, unitPrice } from './catalog.js'

export async function getAdvice(input, available) {
  const question = input.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd')
  if (/don hang|thanh toan|giao hang/.test(question)) {
    return { text: 'Đây là cửa hàng demo. Bạn có thể xem sản phẩm đã chọn trong giỏ hàng. Tính năng đặt và theo dõi đơn hàng chưa có trong bản này.', items: [] }
  }
  const budgetMatch = question.match(/(?:duoi|toi da|ngan sach)\s*(\d+)\s*(k|nghin|ngan|d)?/)
  const budget = budgetMatch ? Number(budgetMatch[1]) * (budgetMatch[2] === 'd' || !budgetMatch[2] && budgetMatch[1].length > 3 ? 1 : 1000) : Infinity
  const outfit = /phoi|di lam|di choi|outfit/.test(question)
  const shape = !outfit && (/tui|phu kien/.test(question) ? 'bag' : /quan/.test(question) ? 'pants' : /linen|so mi/.test(question) ? 'shirt' : /thun/.test(question) ? 'tee' : '')
  const matches = products.filter(product => (!shape || product.shape === shape) && product.variants.some(variant => available(product, variant) > 0))
  const items = []
  let remaining = budget
  for (const product of matches) {
    const price = unitPrice(product)
    if (price > remaining) continue
    items.push(product)
    if (outfit) remaining -= price
    if (items.length === 2) break
  }
  if (!items.length) return { text: 'Mình chưa tìm được món còn hàng phù hợp. Bạn có thể thử danh mục hoặc mức giá khác.', items }
  const names = items.map(item => `${item.name} (${money(unitPrice(item))})`).join(' và ')
  return { text: outfit && items.length > 1 ? `Bạn có thể phối ${names}. Chọn hai tông trung tính để dễ kết hợp.` : `Bạn có thể xem ${names}. Mở sản phẩm để chọn màu và size còn hàng.`, items }
}
