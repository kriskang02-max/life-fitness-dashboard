import { heuristicParseNutrition, sumNutrition } from './nutritionHeuristic'

function extractFirstJsonBlock(rawText) {
  const text = String(rawText ?? '').trim()
  if (!text) throw new Error('AI 응답이 비어 있습니다.')

  const withoutFence = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()

  const first = withoutFence.indexOf('{')
  const last = withoutFence.lastIndexOf('}')
  if (first === -1 || last === -1 || last <= first) throw new Error('AI 응답에서 JSON을 찾지 못했습니다.')

  return withoutFence.slice(first, last + 1)
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return []

  return items
    .map((item) => ({
      name: String(item?.name ?? '').trim(),
      amount: String(item?.amount ?? '').trim(),
      calories: toNumber(item?.calories),
      protein: toNumber(item?.protein),
      carbs: toNumber(item?.carbs),
      fat: toNumber(item?.fat),
    }))
    .filter((item) => item.name)
}

function createPrompt(text) {
  return `다음 식사 기록을 영양 정보 JSON으로 파싱하세요.

요구사항:
1) 추정이 필요한 경우 현실적인 범위에서 추정합니다.
2) 출력은 JSON object만 반환합니다.
3) 필수 스키마:
{
  "items": [
    {
      "name": "음식명",
      "amount": "섭취량",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  ],
  "confidence": 0.0,
  "notes": "간단한 추정 근거"
}
4) calories/protein/carbs/fat은 숫자여야 합니다.

식사 기록:
${text}`
}

async function parseWithGemini(text, settings) {
  const apiKey = settings?.geminiApiKey?.trim()
  if (!apiKey) throw new Error('Gemini API key가 설정되지 않았습니다.')

  const model = (settings?.geminiModel || 'gemini-1.5-flash').trim()
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: createPrompt(text) }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Gemini 요청 실패 (${response.status}): ${body.slice(0, 180)}`)
  }

  const data = await response.json()
  const raw = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('\n') ?? ''
  const jsonText = extractFirstJsonBlock(raw)
  const parsed = JSON.parse(jsonText)

  return {
    provider: 'gemini',
    model,
    items: normalizeItems(parsed.items),
    confidence: toNumber(parsed.confidence),
    notes: String(parsed.notes ?? ''),
  }
}

async function parseWithOpenAI(text, settings) {
  const apiKey = settings?.openaiApiKey?.trim()
  if (!apiKey) throw new Error('OpenAI API key가 설정되지 않았습니다.')

  const model = (settings?.openaiModel || 'gpt-4o-mini').trim()
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You parse meal text into nutrition JSON. Return JSON object only.' },
        { role: 'user', content: createPrompt(text) },
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenAI 요청 실패 (${response.status}): ${body.slice(0, 180)}`)
  }

  const data = await response.json()
  const raw = data?.choices?.[0]?.message?.content ?? ''
  const jsonText = extractFirstJsonBlock(raw)
  const parsed = JSON.parse(jsonText)

  return {
    provider: 'openai',
    model,
    items: normalizeItems(parsed.items),
    confidence: toNumber(parsed.confidence),
    notes: String(parsed.notes ?? ''),
  }
}

function resolveProviderOrder(settings) {
  const selected = settings?.provider ?? 'gemini'
  const hasGemini = Boolean(settings?.geminiApiKey?.trim())
  const hasOpenAI = Boolean(settings?.openaiApiKey?.trim())

  if (selected === 'auto') {
    const order = []
    if (hasGemini) order.push('gemini')
    if (hasOpenAI) order.push('openai')
    return order
  }
  if (selected === 'gemini') {
    return hasGemini ? ['gemini'] : []
  }
  if (selected === 'openai') {
    return hasOpenAI ? ['openai'] : []
  }
  return [selected]
}

function wrapResult(result) {
  const items = normalizeItems(result.items)
  if (items.length === 0) {
    throw new Error('AI 응답에서 유효한 음식 항목을 찾지 못했습니다.')
  }
  return {
    items,
    totals: sumNutrition(items),
    confidence: toNumber(result.confidence),
    notes: result.notes || '',
    source: result.provider,
    provider: result.provider,
    model: result.model,
  }
}

export async function parseNutritionText(text, settings) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) throw new Error('식사 내용을 입력해주세요.')

  const order = resolveProviderOrder(settings)
  const errors = []

  if (order.length === 0) {
    const fallback = heuristicParseNutrition(trimmed)
    return {
      ...fallback,
      source: 'heuristic',
      provider: 'heuristic',
      model: 'local-heuristic',
      notes: fallback.notes,
    }
  }

  for (const provider of order) {
    try {
      if (provider === 'gemini') {
        return wrapResult(await parseWithGemini(trimmed, settings))
      }
      if (provider === 'openai') {
        return wrapResult(await parseWithOpenAI(trimmed, settings))
      }
    } catch (error) {
      errors.push(error.message || String(error))
    }
  }

  const fallback = heuristicParseNutrition(trimmed)
  return {
    ...fallback,
    source: 'heuristic',
    provider: 'heuristic',
    model: 'local-heuristic',
    notes: fallback.notes,
  }
}
