const GEMINI_MODEL = 'gemini-2.5-flash'
export const GEMINI_KEY_REQUIRED_MESSAGE = '⚙️ [루틴 설정]에서 Gemini API Key를 먼저 등록해주세요.'
const GEMINI_CALL_FAILED_MESSAGE = 'API 호출에 실패했습니다. 키를 확인해주세요.'
const GENERIC_PARSE_ERROR = 'Gemini 응답 파싱에 실패했습니다. 잠시 후 다시 시도해주세요.'

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function extractFirstJsonBlock(rawText) {
  const text = String(rawText ?? '').trim()
  if (!text) throw new Error('AI 응답이 비어 있습니다.')

  const withoutFence = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()

  const first = withoutFence.indexOf('{')
  const last = withoutFence.lastIndexOf('}')
  if (first === -1 || last === -1 || last <= first) {
    throw new Error('AI 응답에서 JSON을 찾지 못했습니다.')
  }

  return withoutFence.slice(first, last + 1)
}

function safeTrimText(value, limit = 260) {
  if (value == null) return ''
  const str = String(value).replace(/\s+/g, ' ').trim()
  if (!str) return ''
  return str.length > limit ? `${str.slice(0, limit)}...` : str
}

function extractGeminiErrorMessage(payload) {
  if (!payload || typeof payload !== 'object') return ''
  const top = safeTrimText(payload?.error?.message)
  if (top) return top
  const candidate = safeTrimText(payload?.promptFeedback?.blockReasonMessage)
  if (candidate) return candidate
  return ''
}

function buildHttpErrorMessage(status, statusText, payload, rawText) {
  const detail =
    extractGeminiErrorMessage(payload) ||
    safeTrimText(rawText) ||
    statusText ||
    '원인 미상'
  return `${GEMINI_CALL_FAILED_MESSAGE} (HTTP ${status}) · ${detail}`
}

function buildPrompt(text) {
  return `다음 식사 기록을 분석해 JSON object 하나만 반환하세요.

응답 스키마:
{
  "kcal": 850,
  "carbs": 70,
  "protein": 55,
  "fat": 38,
  "summary": "장어구이 1.5마리와 쌀밥 1공기"
}

규칙:
1) 숫자 필드는 반드시 number 타입으로 반환
2) summary는 1문장 한국어 요약
3) 코드블록 없이 JSON object만 반환
4) 정보가 불완전하면 현실적인 추정치로 계산

식사 기록:
${text}`
}

function normalizeGeminiResult(rawResult, originalText) {
  const kcal = toNumber(rawResult?.kcal ?? rawResult?.calories)
  const carbs = toNumber(rawResult?.carbs)
  const protein = toNumber(rawResult?.protein)
  const fat = toNumber(rawResult?.fat)
  const summary = String(rawResult?.summary ?? originalText).trim() || originalText

  return {
    items: [
      {
        name: summary,
        amount: '1회',
        calories: kcal,
        carbs,
        protein,
        fat,
      },
    ],
    totals: {
      calories: kcal,
      carbs,
      protein,
      fat,
    },
    summary,
    provider: 'gemini',
    model: GEMINI_MODEL,
  }
}

export async function parseNutritionText(text, settings) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) throw new Error('식사 내용을 입력해주세요.')

  const apiKey = settings?.geminiApiKey?.trim()
  if (!apiKey) {
    throw new Error(GEMINI_KEY_REQUIRED_MESSAGE)
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(trimmed) }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    },
  )

  const rawText = await response.text()
  let body = null
  try {
    body = rawText ? JSON.parse(rawText) : null
  } catch {
    body = null
  }

  if (!response.ok) {
    throw new Error(buildHttpErrorMessage(response.status, response.statusText, body, rawText))
  }

  const modelText =
    body?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('\n') ?? ''
  const blockedReason = safeTrimText(body?.promptFeedback?.blockReasonMessage)
  if (!modelText) {
    if (blockedReason) {
      throw new Error(`${GEMINI_CALL_FAILED_MESSAGE} · ${blockedReason}`)
    }
    throw new Error(`${GEMINI_CALL_FAILED_MESSAGE} · 응답 본문이 비어 있습니다.`)
  }

  try {
    const jsonText = extractFirstJsonBlock(modelText)
    const parsed = JSON.parse(jsonText)
    return normalizeGeminiResult(parsed, trimmed)
  } catch {
    throw new Error(`${GENERIC_PARSE_ERROR} (${safeTrimText(modelText, 180)})`)
  }
}
