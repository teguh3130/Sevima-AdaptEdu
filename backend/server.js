import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 5000
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EduBridge AI API',
    env: {
      openaiApiKey: Boolean(process.env.OPENAI_API_KEY),
      firebase: Boolean(process.env.FIREBASE_PROJECT_ID),
    },
  })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`EduBridge AI backend running on http://localhost:${PORT}`)
})
