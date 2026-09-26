import { Router } from 'express'
import { generateText } from '../lib/gemini.js'
import { subjectOf } from '../lib/subjects.js'

const router = Router()

const SYSTEM_PROMPT =
  'Kamu adalah tutor SMP Indonesia. Hanya jawab pertanyaan yang berhubungan dengan mata pelajaran aktif. Jika pertanyaan di luar mata pelajaran aktif, jawab singkat bahwa hanya topik mata pelajaran aktif yang dibahas. Sesuaikan penjelasan dengan level siswa (Dasar, Menengah, atau Lanjut). Gunakan bahasa sederhana, maksimal 120 kata, dan selalu berikan satu contoh.'

const FORMAT_RULE =
  'Tulis pecahan dalam bentuk biasa seperti 1/2. Jangan gunakan LaTeX, simbol dollar, atau markdown.'

const LEVELS = ['Dasar', 'Menengah', 'Lanjut']
const MAX_HISTORY = 10

function buildContents(history, message) {
  const contents = history
    .slice(-MAX_HISTORY)
    .filter(
      (item) =>
        (item.role === 'user' || item.role === 'model') &&
        typeof item.text === 'string' &&
        item.text.trim(),
    )
    .map((item) => ({
      role: item.role,
      parts: [{ text: item.text.slice(0, 2000) }],
    }))

  contents.push({ role: 'user', parts: [{ text: message }] })
  return contents
}

router.post('/api/chat', async (req, res) => {
  const { message, history = [], level, subject } = req.body ?? {}

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong' })
  }

  const { label } = subjectOf(subject)
  const subjectRule = `Mata pelajaran aktif: ${label}.`
  const systemInstruction = LEVELS.includes(level)
    ? `${SYSTEM_PROMPT}\n${subjectRule}\nLevel siswa saat ini: ${level}.\n${FORMAT_RULE}`
    : `${SYSTEM_PROMPT}\n${subjectRule}\n${FORMAT_RULE}`

  try {
    const { text } = await generateText({
      contents: buildContents(Array.isArray(history) ? history : [], message.trim()),
      systemInstruction,
      temperature: 0.7,
    })

    return res.json({ reply: text })
  } catch (error) {
    console.error('Chat tutor gagal:', error?.message ?? error)
    return res
      .status(502)
      .json({ error: 'Gemini sedang tidak tersedia, coba lagi sebentar lagi.' })
  }
})

export default router
