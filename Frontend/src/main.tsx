import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { initializeOfflineSupport, reportOfflineError } from './lib/api'

void initializeOfflineSupport().catch(reportOfflineError)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event: MessageEvent<unknown>) => {
    const data = event.data;
    if (typeof data === 'object' && data !== null && 'type' in data
      && data.type === 'offline-cache-error' && 'message' in data) {
      reportOfflineError(new Error(String(data.message)))
    }
  })
  void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`)
    .then(() => navigator.serviceWorker.ready)
    .then((registration) => {
      registration.active?.postMessage({
        type: 'cache-images',
        urls: performance.getEntriesByType('resource').map((resource) => resource.name),
      })
    })
    .catch(reportOfflineError)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
