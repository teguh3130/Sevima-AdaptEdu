import { Router } from 'express'
import { generateText } from '../lib/gemini.js'

const router = Router()

const LEVELS = ['Dasar', 'Menengah', 'Lanjut']
const VALID_ANSWERS = ['A', 'B', 'C', 'D']

function buildPrompt(level) {
  return [
    `Buat tepat 3 soal latihan Matematika SMP bertema pecahan untuk siswa level ${level}.`,
    'Balas HANYA dengan JSON array, tanpa teks lain dan tanpa markdown, dengan format:',
    '[{"question":"pertanyaan","options":["pilihan A","pilihan B","pilihan C","pilihan D"],"answer":"B"}]',
    'Ketentuan: setiap soal punya tepat 4 pilihan jawaban, dan field answer adalah huruf A, B, C, atau D sesuai opsi yang benar.',
  ].join(' ')
}

function sanitize(data) {
  if (!Array.isArray(data)) return null

  const questions = data
    .slice(0, 3)
    .map((item) => {
      if (
        typeof item?.question !== 'string' ||
        !Array.isArray(item?.options) ||
        item.options.length !== 4
      ) {
        return null
      }

      const answer = String(item.answer ?? '').trim().toUpperCase()
      if (!VALID_ANSWERS.includes(answer)) return null

      return {
        question: item.question.trim(),
        options: item.options.map((option) => String(option).trim()),
        answer,
      }
    })
    .filter(Boolean)

  return questions.length === 3 ? questions : null
}

function parseQuestions(text) {
  const cleaned = String(text ?? '')
    .replace(/```(?:json)?/gi, '')
    .trim()
  const match = cleaned.match(/\[[\s\S]*\]/)
  if (!match) return null
  try {
    return sanitize(JSON.parse(match[0]))
  } catch {
    return null
  }
}

router.post('/api/practice', async (req, res) => {
  const { level } = req.body ?? {}
  const studentLevel = LEVELS.includes(level) ? level : 'Menengah'
  const contents = buildPrompt(studentLevel)

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { text } = await generateText({
        contents,
        temperature: 0.8,
        config: { responseMimeType: 'application/json' },
      })

      const questions = parseQuestions(text)
      if (questions) {
        return res.json({ level: studentLevel, questions })
      }

      console.error('Gemini mengembalikan format soal tak sesuai')
    } catch (error) {
      console.error('Latihan gagal:', error?.message ?? error)
      break
    }
  }

  return res
    .status(502)
    .json({ error: 'Gemini sedang tidak tersedia, coba lagi sebentar lagi.' })
})

export default router
