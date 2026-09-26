import { GoogleGenAI } from '@google/genai'

const DEFAULT_MODELS =
  'gemini-2.5-flash,gemini-3.8-flash,gemini-flash-latest,gemini-flash-lite-latest'

export const MODELS = (
  process.env.GEMINI_MODEL || DEFAULT_MODELS
)
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean)

export function createClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
}

export async function generateText({
  contents,
  systemInstruction,
  temperature = 0,
  config = {},
}) {
  const ai = createClient()
  let lastError = null

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          temperature,
          ...config,
          ...(systemInstruction ? { systemInstruction } : {}),
        },
      })

      const text = response.text?.trim()
      if (text) return { text, model }

      lastError = new Error('Balasan kosong')
      console.error(`Gemini (${model}) mengembalikan balasan kosong`)
    } catch (error) {
      lastError = error
      console.error(`Gemini (${model}) gagal:`, error?.message ?? error)
    }
  }

  throw lastError ?? new Error('Gemini tidak tersedia')
}
