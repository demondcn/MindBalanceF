import '@fontsource/space-grotesk/700.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/sora/400.css'
import '@fontsource/sora/600.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import App from './App'
import './styles.css'

async function clearDevelopmentServiceWorkers() {
  if (!('serviceWorker' in navigator)) {
    return
  }

  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((registration) => registration.unregister()))

  if (!('caches' in window)) {
    return
  }

  const cacheKeys = await window.caches.keys()
  await Promise.all(cacheKeys.map((key) => window.caches.delete(key)))
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isLocalEnvironment =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'

    if (isLocalEnvironment || !import.meta.env.PROD) {
      clearDevelopmentServiceWorkers().catch(() => undefined)
      return
    }

    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
