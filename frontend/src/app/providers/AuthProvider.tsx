import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import { tokenStore } from '../../shared/api/tokenStore'
import { parseJwt } from '../../shared/utils/jwt'

type AuthContextValue = {
  accessToken: string | null
  role: string | null
  setTokens: (accessToken: string, refreshToken?: string | null) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    tokenStore.getAccessToken(),
  )
  const [role, setRole] = useState<string | null>(() => {
    const token = tokenStore.getAccessToken()
    return token ? parseJwt(token)?.role ?? null : null
  })

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      role,
      setTokens: (token, refreshToken) => {
        tokenStore.setTokens(token, refreshToken)
        setAccessToken(token)
        setRole(parseJwt(token)?.role ?? null)
      },
      signOut: () => {
        tokenStore.clear()
        setAccessToken(null)
        setRole(null)
      },
    }),
    [accessToken, role],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
