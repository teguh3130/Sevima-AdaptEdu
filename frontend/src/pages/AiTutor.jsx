import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  SUBJECTS,
  getStoredSubject,
  isValidSubject,
  storeSubject,
  subjectName,
} from '../data/subjects.js'
import './AiTutor.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function welcomeFor(name) {
  return {
    role: 'assistant',
    welcome: true,
    text: `Halo! Aku tutor ${name} kamu. Ketik pertanyaanmu tentang materi ${name} SMP.`,
  }
}

function AiTutor() {
  const location = useLocation()
  const [subject, setSubject] = useState(() => {
    const fromQuery = new URLSearchParams(location.search).get('subject')
    return isValidSubject(fromQuery) ? fromQuery : getStoredSubject()
  })
  const [messages, setMessages] = useState(() =>
    welcomeFor(subjectName(subject)),
  )
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function changeSubject(nextSubject) {
    storeSubject(nextSubject)
    setSubject(nextSubject)
    setMessages([welcomeFor(subjectName(nextSubject))])
    setError('')
    setInput('')
    setPickerOpen(false)
  }

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
          subject,
          history: messages
            .filter((message) => !message.welcome)
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
        <p className="tutor__subtitle">
          Tanya materi {subjectName(subject)} SMP, dijawab oleh Gemini.
        </p>
      </header>

      <div className="tutor__subject">
        <span className="tutor__subject-label">
          Mata Pelajaran Aktif: <strong>{subjectName(subject)}</strong>
        </span>
        <div className="tutor__subject-wrap">
          <button
            type="button"
            className="chip"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((value) => !value)}
          >
            Ganti Mapel
          </button>

          {pickerOpen && (
            <div className="subject-picker" role="menu">
              {SUBJECTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`subject-picker__item${
                    item.id === subject ? ' subject-picker__item--active' : ''
                  }`}
                  role="menuitem"
                  onClick={() => changeSubject(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="chat">
        <div className="chat__messages" aria-live="polite">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`bubble ${
                message.role === 'user' ? 'bubble--user' : 'bubble--assistant'
              }`}
            >
              {message.role !== 'user' && (
                <span className="bubble__avatar" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="8" width="16" height="12" rx="3" />
                    <path d="M12 8V5" />
                    <circle cx="9" cy="13.5" r="1" />
                    <circle cx="15" cy="13.5" r="1" />
                    <path d="M9.5 17h5" />
                  </svg>
                </span>
              )}
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
            placeholder={`Tulis pertanyaanmu tentang ${subjectName(subject)}...`}
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
