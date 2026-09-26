import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import analyzeRouter from './routes/analyze.js'
import chatRouter from './routes/chat.js'

const app = express()
const PORT = process.env.PORT || 5000
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        CORS_ORIGINS.includes(origin) ||
        /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
      callback(null, allowed)
    },
  }),
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AdaptEdu API',
    env: {
      openaiApiKey: Boolean(process.env.OPENAI_API_KEY),
      firebase: Boolean(process.env.FIREBASE_PROJECT_ID),
    },
  })
})

app.use(analyzeRouter)
app.use(chatRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`AdaptEdu backend running on http://localhost:${PORT}`)
})
