import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

export function RequireMember({ children }: { children: ReactNode }) {
  const { role } = useAuth()

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
