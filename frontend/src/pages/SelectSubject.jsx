import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SUBJECTS, storeSubject } from '../data/subjects.js'
import './SelectSubject.css'

function IconCalculator() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="34"
      height="34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <rect x="8" y="5" width="8" height="4" rx="1" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="34"
      height="34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22z" />
      <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="34"
      height="34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
    </svg>
  )
}

function IconFlask() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="34"
      height="34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 2v6.5L4.5 18A2.5 2.5 0 0 0 6.8 22h10.4a2.5 2.5 0 0 0 2.3-4L15 8.5V2" />
      <path d="M8 2h8M7.5 14h9" />
    </svg>
  )
}

const ICONS = {
  calculator: IconCalculator,
  book: IconBook,
  globe: IconGlobe,
  flask: IconFlask,
}

function SelectSubject() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  function handleStart() {
    if (!selected) return
    storeSubject(selected)
    navigate(`/diagnostic?subject=${selected}`)
  }

  return (
    <section className="subject-select">
      <header className="subject-select__header">
        <span className="subject-select__badge">Tes Diagnostik</span>
        <h1 className="subject-select__title">Pilih Mata Pelajaran</h1>
        <p className="subject-select__subtitle">
          Tes akan menyesuaikan dengan mata pelajaran yang dipilih.
        </p>
      </header>

      <div className="subject-select__grid">
        {SUBJECTS.map((subject) => {
          const Icon = ICONS[subject.icon]
          const isActive = selected === subject.id
          return (
            <button
              key={subject.id}
              type="button"
              className={`subject-card subject-card--${subject.color}${
                isActive ? ' subject-card--active' : ''
              }`}
              aria-pressed={isActive}
              onClick={() => setSelected(subject.id)}
            >
              <span className="subject-card__icon">
                <Icon />
              </span>
              <span className="subject-card__name">{subject.name}</span>
            </button>
          )
        })}
      </div>

      <div className="subject-select__actions">
        <button
          type="button"
          className="btn btn--primary subject-select__start"
          onClick={handleStart}
          disabled={!selected}
        >
          Mulai Tes
        </button>
      </div>
    </section>
  )
}

export default SelectSubject
