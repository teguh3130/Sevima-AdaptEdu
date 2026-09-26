import { Router } from 'express'
import { generateText } from '../lib/gemini.js'
import { subjectOf } from '../lib/subjects.js'

const router = Router()

const PROMPT =
  'Kamu adalah guru SMP Indonesia. Mata pelajaran: {subject}. Berdasarkan skor {score} dari {total}, tentukan level belajar (Dasar, Menengah, Lanjut) dan berikan alasan maksimal satu kalimat. Balas hanya dalam format JSON dengan field level dan reason.'

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
  const { score, total = 5, subject } = req.body ?? {}

  if (
    typeof score !== 'number' ||
    !Number.isFinite(score) ||
    score < 0 ||
    score > total
  ) {
    return res.status(400).json({ error: 'Skor tidak valid' })
  }

  const prompt = PROMPT.replace('{subject}', subjectOf(subject).label)
    .replace('{score}', String(score))
    .replace('{total}', String(total))

  try {
    const { text } = await generateText({
      contents: prompt,
      temperature: 0,
      config: { responseMimeType: 'application/json' },
    })

    const parsed = parseResult(text)

    if (parsed) {
      return res.json({ ...parsed, source: 'gemini' })
    }

    console.error('Gemini mengembalikan format tak sesuai')
  } catch (error) {
    console.error('Analisis Gemini gagal:', error?.message ?? error)
  }

  return res.json({
    level: ruleLevel(score, total),
    reason: 'Gemini sedang tidak tersedia, level ditentukan dari perbandingan skor.',
    source: 'rule',
  })
})

export default router
