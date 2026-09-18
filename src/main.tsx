import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Force update checks so phones pick up new builds without a manual refresh trick.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return
    // Re-check for a new SW periodically while the tab/app is open.
    setInterval(() => {
      registration.update().catch(() => {})
    }, 60_000)
  },
  onNeedRefresh() {
    // autoUpdate + skipWaiting should activate; reload once to apply.
    window.location.reload()
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
