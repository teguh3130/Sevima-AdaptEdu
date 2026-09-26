import { Router } from 'express'
import { GoogleGenAI } from '@google/genai'

const router = Router()

const MODELS = (
  process.env.GEMINI_MODEL ||
  'gemini-3.8-flash,gemini-flash-latest,gemini-flash-lite-latest'
)
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean)

const PROMPT =
  'Kamu adalah guru Matematika SMP Indonesia. Berdasarkan skor berikut tentukan level belajar: Dasar, Menengah, atau Lanjut. Berikan alasan maksimal satu kalimat. Balas hanya dalam format JSON dengan field level dan reason.'

const LEVELS = ['Dasar', 'Menengah', 'Lanjut']

function ruleLevel(score, total) {
  const ratio = score / total
  if (ratio <= 0.4) return 'Dasar'
  if (ratio <= 0.8) return 'Menengah'
  return 'Lanjut'
}

function parseResult(text) {
  const cleaned = String(text ?? '')
    .replace(/```(?:json)?/gi, '')
    .trim()
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const data = JSON.parse(match[0])
    if (!LEVELS.includes(data.level) || typeof data.reason !== 'string') {
      return null
    }
    return { level: data.level, reason: data.reason.trim() }
  } catch {
    return null
  }
}

router.post('/api/analyze-score', async (req, res) => {
  const { score, total = 5 } = req.body ?? {}

  if (
    typeof score !== 'number' ||
    !Number.isFinite(score) ||
    score < 0 ||
    score > total
  ) {
    return res.status(400).json({ error: 'Skor tidak valid' })
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const contents = `${PROMPT}\n\nSkor: ${score}/${total}`

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          temperature: 0,
          responseMimeType: 'application/json',
        },
      })

      const parsed = parseResult(response.text)

      if (parsed) {
        return res.json({ ...parsed, source: 'gemini' })
      }

      console.error(`Gemini (${model}) mengembalikan format tak sesuai`)
    } catch (error) {
      console.error(`Gemini (${model}) gagal:`, error?.message ?? error)
    }
  }

  return res.json({
    level: ruleLevel(score, total),
    reason: 'Gemini sedang tidak tersedia, level ditentukan dari perbandingan skor.',
    source: 'rule',
  })
})

export default router
