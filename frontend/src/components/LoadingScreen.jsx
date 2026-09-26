import './LoadingScreen.css'

function LoadingScreen({ label = 'Memeriksa status login...' }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <span className="loading-screen__spinner" />
      <p className="loading-screen__label">{label}</p>
    </div>
  )
}

export default LoadingScreen
