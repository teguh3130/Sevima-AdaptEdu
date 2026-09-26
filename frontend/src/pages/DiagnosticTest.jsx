import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import questions from '../data/questions.js'
import './DiagnosticTest.css'

const TOTAL = questions.length

function DiagnosticTest() {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [saveState, setSaveState] = useState('idle')

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
  }

  if (finished) {
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
        <p className="result__save">
          {saveState === 'saving' && 'Menyimpan skor ke Firestore...'}
          {saveState === 'saved' && 'Skor tersimpan di Firestore.'}
          {saveState === 'error' &&
            'Skor gagal disimpan. Periksa konfigurasi Firebase.'}
          {saveState === 'idle' && ''}
        </p>
        <button type="button" className="btn btn--primary" onClick={handleRestart}>
          Ulangi Tes
        </button>
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
