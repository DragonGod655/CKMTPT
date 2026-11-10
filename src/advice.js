import { money, products, unitPrice } from './catalog.js'

const normalize = text => text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').trim()
const words = (question, pattern) => new RegExp(`\\b(?:${pattern})\\b`).test(question)
const aliases = {
  shirt: 'so mi|linen', tee: 'ao thun|ao phong|cotton', pants: 'quan|jean[s]?|straight',
  bag: 'tui|tote|canvas', jacket: 'ao khoac|denim', hoodie: 'hoodie|ao ni',
  knit: 'ao len', shoes: 'giay|sneaker[s]?', cap: 'mu|non', glasses: 'kinh',
}
const colors = [...new Set(products.flatMap(product => product.variants.map(variant => variant.color.name)))]

export const shoppingOnlyReply = 'Xin lỗi, tôi chỉ có thể giải đáp các thắc mắc về mua sắm của bạn.'

function getBudget(question) {
  const value = question.match(/\b(?:duoi|toi da|ngan sach|tam|khoang|khong qua)\s*[:=]?\s*(\d{1,3}(?:[., ]\d{3})+|\d+)(?:([.,]\d+))?\s*(trieu|tr|k|nghin|ngan|vnd|d)?\s*(\d{1,3})?/)
  if (!value) return Infinity
  const [, integer, fraction = '', unit, extra = ''] = value
  const digits = integer.replace(/[., ]/g, '')
  const number = Number(digits + fraction.replace(',', '.'))
  if (unit === 'tr' || unit === 'trieu') return (number + Number(`0.${extra}`)) * 1000000
  if (['k', 'nghin', 'ngan'].includes(unit) || !unit && digits.length <= 3) return number * 1000
  return number
}

function describeStock(product, variants, available) {
  return variants.map(variant => {
    const stock = available(product, variant)
    return `${variant.color.name} size ${variant.size}: ${stock ? `còn ${stock}` : 'hết hàng'}`
  }).join(' · ')
}

export async function getAdvice(input, available, previousId) {
  const question = normalize(input)
  const reply = (text, items = []) => ({ text, items })

  if (words(question, 'don hang|dat hang|mua the nao|cach mua|thanh toan|giao hang|doi tra')) {
    return reply('Bạn có thể chọn Mua ngay ở trang sản phẩm hoặc chọn Đặt hàng trong giỏ. Đơn hàng mẫu được ghi nhận trên trình duyệt. Cửa hàng chưa xử lý thanh toán, giao hàng hoặc đổi trả thực tế.')
  }

  const outfit = words(question, 'phoi|di lam|di choi|di hoc|outfit|cong so')
  const stockQuery = words(question, 'con hang|het hang|ton kho|con bao nhieu|con khong')
  const priceQuery = words(question, 'gia|bao nhieu tien|gia bao nhieu|bao nhieu')
  const saleQuery = words(question, 'giam gia|khuyen mai|uu dai|sale')
  const size = question.match(/\b(?:size|co|kich co)\s*(os|xs|s|m|l|xl|xxl|\d{2})\b/)?.[1].toUpperCase()
  const color = colors.find(name => question.includes(`mau ${normalize(name)}`))
    ?? (words(question, 'mau den|den') ? 'Than' : undefined)
    ?? colors.find(name => words(question, normalize(name)))
  const colorQuery = words(question, 'mau')
  const sizeQuery = words(question, 'size|kich co') || size
  const budget = getBudget(question)
  const sunProtection = words(question, 'chong nang|che nang|bao ve da|giu da')
    || words(question, 'nang dep|troi nang|ngay nang|nang gat') && words(question, 'mac|phoi|trang phuc')

  const exact = products.filter(product => question.includes(normalize(product.name)))
  const named = exact.length ? exact : products.filter(product =>
    words(question, product.id === 'quan-jeans' ? 'jean[s]?' : product.id === 'quan-straight' ? 'straight' : aliases[product.shape]))
  const category = words(question, 'phu kien') ? 'Phụ kiện' : words(question, 'quan') ? 'Quần' : words(question, 'ao') ? 'Áo' : null
  const previous = products.find(product => product.id === previousId)
  const followUp = stockQuery || priceQuery || colorQuery || sizeQuery || color || words(question, 'mau nay|mon nay|cai nay')
  const targets = named.length ? named : category ? products.filter(product => product.category === category)
    : previous && followUp ? [previous] : []

  if (!targets.length && !outfit && stockQuery && !color && !size && !Number.isFinite(budget)) {
    return reply('Bạn muốn kiểm tra món nào? Gửi mình tên sản phẩm và màu hoặc size bạn cần nhé.')
  }

  if (!targets.length && !outfit && !sunProtection && !stockQuery && !priceQuery && !saleQuery && !sizeQuery && !colorQuery && !color && !Number.isFinite(budget)) {
    return reply(words(question, 'chao|hello|hi|mua sam|quan ao|thoi trang|trang phuc|san pham|mac gi')
      ? 'Bạn muốn tìm món theo ngân sách, kiểm tra màu và kích cỡ, hay phối đồ cho một dịp cụ thể?'
      : shoppingOnlyReply)
  }

  const scoped = (outfit || !targets.length ? products : targets)
    .filter(product => unitPrice(product) <= budget && (!saleQuery || product.sale != null))
  const selection = product => product.variants.filter(variant => (!color || variant.color.name === color) && (!size || variant.size === size))
  const availableItems = scoped.filter(product => selection(product).some(variant => available(product, variant) > 0))
  const budgetLabel = Number.isFinite(budget) ? ` trong ngân sách ${money(budget)}` : ''

  if (sunProtection) {
    const items = ['ao-linen', 'kinh-ram']
      .map(id => products.find(product => product.id === id))
      .filter(product => unitPrice(product) <= budget && selection(product).some(variant => available(product, variant) > 0))
      .slice(0, 2)
    const suggestion = items.length
      ? ` Bạn có thể xem ${items.map(product => `${product.name} (${money(unitPrice(product))})`).join(' hoặc ')}.`
      : ''
    return reply('Trời nắng, bạn nên chọn áo dài tay thoáng và quần dài nhẹ để che tay chân. Nếu đi ngoài trời lâu, hãy chọn thêm mũ vành rộng để che mặt và gáy.' + suggestion, items)
  }

  if (outfit) {
    const work = words(question, 'di lam|cong so')
    const topIds = work ? ['ao-linen', 'ao-len', 'ao-cotton'] : ['ao-cotton', 'ao-hoodie', 'ao-linen', 'ao-len']
    const bottomIds = work ? ['quan-straight', 'quan-jeans'] : ['quan-jeans', 'quan-straight']
    const choices = ids => ids.map(id => products.find(product => product.id === id))
      .filter(product => scoped.includes(product) && product.variants.some(variant => available(product, variant) > 0))
    for (const top of choices(topIds)) {
      for (const bottom of choices(bottomIds)) {
        const items = [top, bottom]
        if (targets.length && !items.some(product => targets.includes(product))) continue
        if ((size || color) && !items.some(product => availableItems.includes(product))) continue
        const total = unitPrice(top) + unitPrice(bottom)
        if (total > budget) continue
        const tip = work ? 'Sơ vin nhẹ để bộ đồ gọn gàng hơn.' : 'Bạn có thể đi cùng sneaker sáng màu cho dễ phối.'
        return reply(`Gợi ý ${work ? 'đi làm' : 'mặc thường ngày'}: ${top.name} + ${bottom.name}, tổng ${money(total)}. ${tip}`, items)
      }
    }
    return reply(`Mình chưa tìm được bộ áo và quần phù hợp${budgetLabel}. Bạn muốn xem từng món để tự phối không?`, availableItems.slice(0, 3))
  }

  if (targets.length && (stockQuery || sizeQuery || colorQuery) && !Number.isFinite(budget) && !saleQuery) {
    const items = targets.slice(0, 3)
    const details = items.map(product => {
      const variants = selection(product)
      if (!variants.length) return `${product.name}: chưa có ${[color && `màu ${color}`, size && `size ${size}`].filter(Boolean).join(' / ')}.`
      if (priceQuery && !stockQuery && !size && !color) return `${product.name}: ${money(unitPrice(product))}.`
      return `${product.name}: ${describeStock(product, variants, available)}.`
    })
    return reply(details.join('\n'), items)
  }

  const items = (priceQuery && targets.length && !size && !color ? scoped : availableItems)
    .sort((a, b) => unitPrice(a) - unitPrice(b)).slice(0, 3)
  if (!items.length) {
    const filters = [color && `màu ${color}`, size && `size ${size}`].filter(Boolean).join(', ')
    return reply(`Hiện chưa có món ${saleQuery ? 'ưu đãi ' : ''}phù hợp${filters ? ` với ${filters}` : ''}${budgetLabel}. Bạn thử đổi màu, size hoặc mức giá nhé.`)
  }

  const details = items.map(product => {
    const price = product.sale != null
      ? `${money(product.sale)} (giá gốc ${money(product.price)})`
      : money(product.price)
    const variants = size || color ? selection(product).filter(variant => available(product, variant) > 0) : []
    return `${product.name}: ${price}${variants.length ? ` · ${describeStock(product, variants, available)}` : ''}`
  })
  const intro = saleQuery ? 'Các món đang giảm giá:' : Number.isFinite(budget) ? `Món còn hàng${budgetLabel}:`
    : stockQuery || sizeQuery || colorQuery ? 'Các lựa chọn phù hợp:' : 'Giá hiện tại:'
  return reply([intro, ...details].join('\n'), items)
}

