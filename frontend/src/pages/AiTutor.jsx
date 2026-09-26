import { useEffect, useRef, useState } from 'react'
import './AiTutor.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const WELCOME = {
  role: 'assistant',
  text: 'Halo! Aku tutor matematikamu. Ketik pertanyaanmu tentang pecahan, operasi hitung, atau materi SMP lainnya.',
}

function AiTutor() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(event) {
    event.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setError('')
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages
            .filter((message) => message !== WELCOME)
            .map((message) => ({
              role: message.role === 'assistant' ? 'model' : 'user',
              text: message.text,
            })),
        }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }])
    } catch (err) {
      console.error('Chat gagal:', err)
      setError('Gagal menghubungi Gemini. Silakan coba lagi.')
      setInput(text)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="tutor">
      <header className="tutor__header">
        <span className="tutor__badge">AI Tutor</span>
        <p className="tutor__subtitle">Tanya materi Matematika SMP, dijawab oleh Gemini.</p>
      </header>

      <div className="chat">
        <div className="chat__messages" aria-live="polite">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`bubble ${
                message.role === 'user' ? 'bubble--user' : 'bubble--assistant'
              }`}
            >
              <p className="bubble__text">{message.text}</p>
            </div>
          ))}

          {loading && (
            <div className="bubble bubble--assistant">
              <span className="typing" aria-label="Gemini sedang mengetik">
                <span className="typing__dot" />
                <span className="typing__dot" />
                <span className="typing__dot" />
              </span>
            </div>
          )}

          {error && <p className="chat__error">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <form className="chat__form" onSubmit={handleSend}>
          <input
            className="chat__input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tulis pertanyaanmu..."
            aria-label="Pesan"
            disabled={loading}
          />
          <button
            className="btn btn--primary chat__send"
            type="submit"
            disabled={loading || !input.trim()}
          >
            Kirim
          </button>
        </form>
      </div>
    </section>
  )
}

export default AiTutor
