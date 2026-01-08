import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../features/auth/hooks/useAuth'

type Props = {
  role: 'ADMIN' | 'MEMBER'
  children: ReactNode
}

export function RequireRole({ role, children }: Props) {
  const auth = useAuth()
  const currentRole = (localStorage.getItem('user_role') || 'MEMBER') as 'ADMIN' | 'MEMBER'

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role === 'ADMIN' && currentRole !== 'ADMIN') {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}
