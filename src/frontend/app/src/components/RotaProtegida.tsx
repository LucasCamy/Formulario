import { useAuthStore } from '@/features/auth/store'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface RotaProtegidaProps {
  children: ReactNode
  apenasAdmin?: boolean
}

export function RotaProtegida({ children, apenasAdmin = false }: RotaProtegidaProps) {
  const token = useAuthStore((s) => s.token)
  const usuario = useAuthStore((s) => s.usuario)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (apenasAdmin && !usuario?.ehAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
