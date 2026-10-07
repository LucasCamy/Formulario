import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Tema = 'claro' | 'escuro'

interface TemaContexto {
  tema: Tema
  alternarTema: () => void
}

const TemaContext = createContext<TemaContexto | null>(null)

function obterCookieTema(): Tema {
  const match = document.cookie.match(/(?:^|;\s*)tema=([^;]*)/)
  return match?.[1] === 'escuro' ? 'escuro' : 'claro'
}

function salvarCookieTema(tema: Tema) {
  document.cookie = `tema=${tema};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(obterCookieTema)

  useEffect(() => {
    const root = document.documentElement
    if (tema === 'escuro') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    salvarCookieTema(tema)
  }, [tema])

  const alternarTema = () => setTema((prev) => (prev === 'claro' ? 'escuro' : 'claro'))

  return (
    <TemaContext value={{ tema, alternarTema }}>
      {children}
    </TemaContext>
  )
}

export function useTema() {
  const ctx = useContext(TemaContext)
  if (!ctx) throw new Error('useTema deve ser usado dentro de TemaProvider')
  return ctx
}
