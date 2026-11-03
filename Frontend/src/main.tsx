import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { initializeOfflineSupport, reportOfflineError } from './lib/api'
import { announceSession, initializeSession, watchSessionChanges } from './lib/session'
import { LoadingState } from './components/layout/LoadingState'

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

const root = createRoot(document.getElementById('root')!)
root.render(<div className="container"><LoadingState variant="grid" label="Connecting to your library" /></div>)

async function start() {
  let sessionError: string | null = null
  try {
    await initializeSession()
  } catch (error) {
    sessionError = error instanceof Error ? error.message : 'Login verification is unavailable.'
  }
  watchSessionChanges()
  const params = new URLSearchParams(window.location.search)
  if (params.get('auth') === 'success') {
    announceSession()
    params.delete('auth')
    window.history.replaceState(null, '', `${window.location.pathname}${params.size ? `?${params}` : ''}`)
  }
  if (params.has('auth_error')) sessionError = 'TMDB login was cancelled or could not be completed. Please try again.'
  const logoutWarning = params.has('logout_warning')
  if (logoutWarning) {
    params.delete('logout_warning')
    window.history.replaceState(null, '', `${window.location.pathname}${params.size ? `?${params}` : ''}`)
  }
  void initializeOfflineSupport().catch(reportOfflineError)
  root.render(
    <StrictMode>
      <BrowserRouter>
        {sessionError ? <div className="session-error" role="alert">{sessionError} Private data stays locked until your login is verified.
          <button type="button" onClick={() => window.location.reload()}>Retry connection</button>
        </div> : null}
        {logoutWarning ? <div className="session-error" role="alert">
          You are logged out of this app. TMDB session revocation could not be confirmed. You can revoke access on TMDB.
        </div> : null}
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}

void start()
