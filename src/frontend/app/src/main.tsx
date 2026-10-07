import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { TemaProvider } from './lib/tema'

const CHUNK_RELOAD_KEY = 'vite-chunk-reload-attempted'

function tentarRecuperarChunkQuebrado() {
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1') {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
    return
  }

  sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
  window.location.reload()
}

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  tentarRecuperarChunkQuebrado()
})

window.addEventListener('error', (event) => {
  if (typeof event.message === 'string' && event.message.includes('Failed to fetch dynamically imported module')) {
    tentarRecuperarChunkQuebrado()
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TemaProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </TemaProvider>
  </StrictMode>,
)
