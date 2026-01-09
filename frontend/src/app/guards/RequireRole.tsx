import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

type RequireRoleProps = {
  role?: string
  children: ReactNode
}

export function RequireRole({ role = 'ADMIN', children }: RequireRoleProps) {
  const { role: currentRole } = useAuth()

  if (!currentRole || currentRole !== role) {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}
