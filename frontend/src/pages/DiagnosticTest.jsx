import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import questions from '../data/questions.js'
import './DiagnosticTest.css'

const TOTAL = questions.length
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function DiagnosticTest() {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [saveState, setSaveState] = useState('idle')
  const [analysis, setAnalysis] = useState(null)
  const [analysisState, setAnalysisState] = useState('idle')
  const [practice, setPractice] = useState(null)
  const [practiceLoading, setPracticeLoading] = useState(false)
  const [practiceError, setPracticeError] = useState('')

  const current = questions[index]
  const isLast = index === TOTAL - 1
  const progress = ((index + (selected !== null ? 1 : 0)) / TOTAL) * 100

  function handleSelect(optionIndex) {
    if (selected !== null) return
    setSelected(optionIndex)
  }

  async function saveScore(finalScore) {
    setSaveState('saving')
    try {
      await addDoc(collection(db, 'diagnosticScores'), {
        score: finalScore,
        total: TOTAL,
        createdAt: serverTimestamp(),
      })
      setSaveState('saved')
    } catch (error) {
      console.error('Gagal menyimpan skor:', error)
      setSaveState('error')
    }
  }

  async function fetchAnalysis(finalScore) {
    setAnalysisState('loading')
    try {
      const response = await fetch(`${API_BASE}/api/analyze-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: finalScore, total: TOTAL }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setAnalysis(data)
      setAnalysisState('done')
    } catch (error) {
      console.error('Gagal menganalisis skor:', error)
      setAnalysisState('error')
    }
  }

  async function startPractice() {
    setPracticeLoading(true)
    setPracticeError('')
    try {
      const response = await fetch(`${API_BASE}/api/practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: analysis?.level }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setPractice({
        level: data.level,
        questions: data.questions,
        index: 0,
        selected: null,
        revealed: false,
        score: 0,
        finished: false,
      })
    } catch (error) {
      console.error('Gagal memuat latihan:', error)
      setPracticeError('Gagal memuat latihan dari Gemini. Silakan coba lagi.')
    } finally {
      setPracticeLoading(false)
    }
  }

  function selectPracticeOption(optionIndex) {
    if (!practice || practice.revealed) return
    const question = practice.questions[practice.index]
    const correctIndex = question.answer.charCodeAt(0) - 65
    setPractice({
      ...practice,
      selected: optionIndex,
      revealed: true,
      score: practice.score + (optionIndex === correctIndex ? 1 : 0),
    })
  }

  function nextPractice() {
    const isLastPractice = practice.index === practice.questions.length - 1
    if (isLastPractice) {
      setPractice({ ...practice, finished: true })
      return
    }
    setPractice({
      ...practice,
      index: practice.index + 1,
      selected: null,
      revealed: false,
    })
  }

  function handleNext() {
    const nextAnswers = [...answers, selected]
    setAnswers(nextAnswers)

    if (isLast) {
      const finalScore = nextAnswers.reduce(
        (sum, answer, i) => (answer === questions[i].answer ? sum + 1 : sum),
        0,
      )
      setScore(finalScore)
      setFinished(true)
      saveScore(finalScore)
      fetchAnalysis(finalScore)
      return
    }

    setIndex(index + 1)
    setSelected(null)
  }

  function handleRestart() {
    setIndex(0)
    setSelected(null)
    setAnswers([])
    setScore(0)
    setFinished(false)
    setSaveState('idle')
    setAnalysis(null)
    setAnalysisState('idle')
    setPractice(null)
    setPracticeLoading(false)
    setPracticeError('')
  }

  if (finished) {
    if (practice) {
      const practiceQuestion = practice.questions[practice.index]
      const correctIndex = practiceQuestion.answer.charCodeAt(0) - 65
      const isLastPractice = practice.index === practice.questions.length - 1
      const isCorrect = practice.selected === correctIndex

      if (practice.finished) {
        return (
          <section className="test result">
            <span className="result__badge">Latihan Selesai</span>
            <p className="result__score">
              {practice.score}
              <span>/{practice.questions.length}</span>
            </p>
            <h1 className="result__title">Skor Latihan</h1>
            <p className="result__message">
              Latihan level {practice.level} selesai. Mau lanjut soal baru?
            </p>
            <div className="test__actions test__actions--center">
              <button
                type="button"
                className="btn btn--primary"
                onClick={startPractice}
                disabled={practiceLoading}
              >
                Latihan Selanjutnya
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setPractice(null)}
              >
                Kembali ke Hasil
              </button>
            </div>
          </section>
        )
      }

      return (
        <section className="test">
          <header className="test__header">
            <span className="test__badge">Latihan - {practice.level}</span>
            <p className="test__counter">
              Soal {practice.index + 1} dari {practice.questions.length}
            </p>
          </header>

          <div
            className="progress"
            role="progressbar"
            aria-valuenow={Math.round(
              ((practice.index + (practice.revealed ? 1 : 0)) /
                practice.questions.length) *
                100,
            )}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="progress__fill"
              style={{
                width: `${((practice.index + (practice.revealed ? 1 : 0)) / practice.questions.length) * 100}%`,
              }}
            />
          </div>

          <div className="test__card">
            <h1 className="test__question">{practiceQuestion.question}</h1>
            <ul className="test__options">
              {practiceQuestion.options.map((option, optionIndex) => {
                let stateClass = ''
                if (practice.revealed) {
                  if (optionIndex === correctIndex) stateClass = ' option--correct'
                  else if (optionIndex === practice.selected)
                    stateClass = ' option--wrong'
                } else if (optionIndex === practice.selected) {
                  stateClass = ' option--selected'
                }

                return (
                  <li key={`${practice.index}-${optionIndex}`}>
                    <button
                      type="button"
                      className={`option${stateClass}`}
                      onClick={() => selectPracticeOption(optionIndex)}
                      disabled={practice.revealed}
                    >
                      <span className="option__label">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span>{option}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            {practice.revealed && (
              <p
                className={`practice__feedback ${
                  isCorrect
                    ? 'practice__feedback--ok'
                    : 'practice__feedback--no'
                }`}
              >
                {isCorrect
                  ? 'Benar!'
                  : `Salah. Jawaban benar: ${practiceQuestion.answer} - ${practiceQuestion.options[correctIndex]}`}
              </p>
            )}
          </div>

          <div className="test__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={nextPractice}
              disabled={!practice.revealed}
            >
              {isLastPractice ? 'Lihat Hasil' : 'Soal Berikutnya'}
            </button>
          </div>
        </section>
      )
    }

    return (
      <section className="test result">
        <span className="result__badge">Selesai</span>
        <p className="result__score">
          {score}
          <span>/{TOTAL}</span>
        </p>
        <h1 className="result__title">Hasil Tes Diagnostik</h1>
        <p className="result__message">
          {score === TOTAL
            ? 'Sempurna! Kamu menguasai materi pecahan.'
            : score >= 3
              ? 'Bagus! Sebagian besar jawabanmu benar.'
              : 'Terus belajar materi pecahan, ya!'}
        </p>
        <div className="analysis">
          {analysisState === 'loading' && (
            <p className="analysis__status">Gemini sedang menganalisis skor...</p>
          )}
          {analysis && (
            <>
              <span
                className={`analysis__badge analysis__badge--${analysis.level.toLowerCase()}`}
              >
                {analysis.level}
              </span>
              <p className="analysis__reason">{analysis.reason}</p>
            </>
          )}
          {analysisState === 'error' && (
            <p className="analysis__status">Analisis Gemini gagal dijalankan.</p>
          )}
        </div>
        <p className="result__save">
          {saveState === 'saving' && 'Menyimpan skor ke Firestore...'}
          {saveState === 'saved' && 'Skor tersimpan di Firestore.'}
          {saveState === 'error' &&
            'Skor gagal disimpan. Periksa konfigurasi Firebase.'}
          {saveState === 'idle' && ''}
        </p>
        <div className="test__actions test__actions--center">
          <button
            type="button"
            className="btn btn--primary"
            onClick={startPractice}
            disabled={practiceLoading || analysisState === 'loading'}
          >
            {practiceLoading ? 'Menyiapkan latihan...' : 'Latihan Selanjutnya'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleRestart}
          >
            Ulangi Tes
          </button>
        </div>
        {practiceError && (
          <p className="analysis__status practice__error">{practiceError}</p>
        )}
      </section>
    )
  }

  return (
    <section className="test">
      <header className="test__header">
        <span className="test__badge">Tes Diagnostik</span>
        <p className="test__counter">Soal {index + 1} dari {TOTAL}</p>
      </header>

      <div
        className="progress"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div className="progress__fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="test__card">
        <h1 className="test__question">{current.question}</h1>
        <ul className="test__options">
          {current.options.map((option, optionIndex) => (
            <li key={option}>
              <button
                type="button"
                className={`option ${selected === optionIndex ? 'option--selected' : ''}`}
                onClick={() => handleSelect(optionIndex)}
                disabled={selected !== null}
              >
                <span className="option__label">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span>{option}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="test__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleNext}
          disabled={selected === null}
        >
          {isLast ? 'Lihat Hasil' : 'Next'}
        </button>
      </div>
    </section>
  )
}

export default DiagnosticTest
