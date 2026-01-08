import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import { tokenStore } from '../../shared/api/tokenStore'

type AuthContextValue = {
  accessToken: string | null
  setTokens: (accessToken: string, refreshToken?: string | null) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    tokenStore.getAccessToken(),
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      setTokens: (token, refreshToken) => {
        tokenStore.setTokens(token, refreshToken)
        setAccessToken(token)
      },
      signOut: () => {
        tokenStore.clear()
        setAccessToken(null)
      },
    }),
    [accessToken],
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
