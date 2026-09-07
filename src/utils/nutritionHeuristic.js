const FOOD_REFERENCE = [
  {
    name: '닭가슴살',
    aliases: ['닭가슴살', 'chicken breast'],
    base: { kind: 'g', amount: 100 },
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  },
  {
    name: '밥',
    aliases: ['밥', '쌀밥', 'rice'],
    base: { kind: 'count', amount: 1 },
    nutrition: { calories: 300, protein: 6, carbs: 67, fat: 1 },
  },
  {
    name: '계란',
    aliases: ['계란', '달걀', 'egg'],
    base: { kind: 'count', amount: 1 },
    nutrition: { calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  },
  {
    name: '바나나',
    aliases: ['바나나', 'banana'],
    base: { kind: 'count', amount: 1 },
    nutrition: { calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  },
  {
    name: '고구마',
    aliases: ['고구마', 'sweet potato'],
    base: { kind: 'g', amount: 100 },
    nutrition: { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1 },
  },
  {
    name: '프로틴 쉐이크',
    aliases: ['프로틴', '단백질쉐이크', 'whey', 'protein shake'],
    base: { kind: 'count', amount: 1 },
    nutrition: { calories: 120, protein: 24, carbs: 3, fat: 1.5 },
  },
  {
    name: '두부',
    aliases: ['두부', 'tofu'],
    base: { kind: 'g', amount: 100 },
    nutrition: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  },
  {
    name: '연어',
    aliases: ['연어', 'salmon'],
    base: { kind: 'g', amount: 100 },
    nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13 },
  },
  {
    name: '오트밀',
    aliases: ['오트밀', 'oatmeal', 'oats'],
    base: { kind: 'g', amount: 50 },
    nutrition: { calories: 190, protein: 7, carbs: 32, fat: 3.5 },
  },
]

function round1(value) {
  return Math.round((value + Number.EPSILON) * 10) / 10
}

function extractNumber(pattern, text) {
  const match = text.match(pattern)
  if (!match) return null
  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}

function extractQuantity(text) {
  const grams = extractNumber(/(\d+(?:\.\d+)?)\s*g\b/i, text)
  if (grams != null) return { kind: 'g', amount: grams }

  const ml = extractNumber(/(\d+(?:\.\d+)?)\s*ml\b/i, text)
  if (ml != null) return { kind: 'ml', amount: ml }

  const count = extractNumber(/(\d+(?:\.\d+)?)\s*(개|알|스쿱|공기|인분|조각|컵|봉지)\b/i, text)
  if (count != null) return { kind: 'count', amount: count }

  const times = extractNumber(/x\s*(\d+(?:\.\d+)?)/i, text)
  if (times != null) return { kind: 'count', amount: times }

  return { kind: 'count', amount: 1 }
}

function calcByReference(reference, quantity) {
  const source = reference.base
  let factor = 1

  if (source.kind === quantity.kind) {
    factor = quantity.amount / source.amount
  } else if (source.kind === 'count' && quantity.kind === 'g') {
    factor = quantity.amount / 100
  } else if (source.kind === 'g' && quantity.kind === 'count') {
    factor = quantity.amount
  }

  return {
    calories: round1(reference.nutrition.calories * factor),
    protein: round1(reference.nutrition.protein * factor),
    carbs: round1(reference.nutrition.carbs * factor),
    fat: round1(reference.nutrition.fat * factor),
  }
}

function parseExplicitNutrition(chunk) {
  const calories =
    extractNumber(/(\d+(?:\.\d+)?)\s*(?:kcal|칼로리)/i, chunk) ??
    extractNumber(/칼로리\s*[:=]?\s*(\d+(?:\.\d+)?)/i, chunk)

  const protein =
    extractNumber(/(?:단백질|protein)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, chunk) ??
    extractNumber(/(\d+(?:\.\d+)?)\s*g?\s*(?:단백질|protein)/i, chunk)

  const carbs =
    extractNumber(/(?:탄수화물|탄수|carb(?:s)?)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, chunk) ??
    extractNumber(/(\d+(?:\.\d+)?)\s*g?\s*(?:탄수화물|탄수|carb(?:s)?)/i, chunk)

  const fat =
    extractNumber(/(?:지방|fat)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, chunk) ??
    extractNumber(/(\d+(?:\.\d+)?)\s*g?\s*(?:지방|fat)/i, chunk)

  if (calories == null && protein == null && carbs == null && fat == null) {
    return null
  }

  const cleanedName = chunk
    .replace(/\(.*?\)/g, '')
    .replace(/(?:\d+(?:\.\d+)?\s*(?:kcal|칼로리|g|그램|개|알|스쿱|공기|인분|조각))/gi, '')
    .replace(/(?:단백질|protein|탄수화물|탄수|carb(?:s)?|지방|fat)\s*[:=]?\s*\d+(?:\.\d+)?/gi, '')
    .replace(/[,:/|]+/g, ' ')
    .trim()

  return {
    name: cleanedName || '직접 입력 식사',
    amount: '',
    calories: round1(calories ?? 0),
    protein: round1(protein ?? 0),
    carbs: round1(carbs ?? 0),
    fat: round1(fat ?? 0),
  }
}

function parseByReference(chunk) {
  const lowered = chunk.toLowerCase()
  const reference = FOOD_REFERENCE.find((item) =>
    item.aliases.some((alias) => lowered.includes(alias.toLowerCase())),
  )
  if (!reference) return null

  const quantity = extractQuantity(chunk)
  const nutrition = calcByReference(reference, quantity)
  const amountText = `${quantity.amount}${quantity.kind === 'g' ? 'g' : quantity.kind === 'ml' ? 'ml' : '회'}`

  return {
    name: reference.name,
    amount: amountText,
    ...nutrition,
  }
}

export function sumNutrition(items) {
  return items.reduce(
    (acc, item) => ({
      calories: round1(acc.calories + (Number(item.calories) || 0)),
      protein: round1(acc.protein + (Number(item.protein) || 0)),
      carbs: round1(acc.carbs + (Number(item.carbs) || 0)),
      fat: round1(acc.fat + (Number(item.fat) || 0)),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

export function heuristicParseNutrition(text) {
  const chunks = String(text ?? '')
    .split(/\n|,|\/|\+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)

  const items = chunks
    .map((chunk) => parseExplicitNutrition(chunk) ?? parseByReference(chunk))
    .filter(Boolean)

  if (items.length === 0) {
    const fallback = {
      name: '식사(추정)',
      amount: '1회',
      calories: 350,
      protein: 18,
      carbs: 40,
      fat: 12,
    }
    return {
      items: [fallback],
      totals: sumNutrition([fallback]),
      confidence: 0.25,
      notes: '음식명을 인식하지 못해 기본 추정치로 기록했습니다.',
    }
  }

  return {
    items,
    totals: sumNutrition(items),
    confidence: 0.6,
    notes: '휴리스틱 추정치입니다. 정확한 성분표와 차이가 있을 수 있습니다.',
  }
}
