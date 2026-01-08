import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react'

import { tokenStore, type TokenPair } from '../../shared/api/tokenStore'

type AuthContextValue = {
  tokens: TokenPair | null
  isAuthenticated: boolean
  setTokens: (tokens: TokenPair) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokensState] = useState<TokenPair | null>(() => tokenStore.get())

  const setTokens = useCallback((next: TokenPair) => {
    tokenStore.set(next)
    setTokensState(next)
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    setTokensState(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      tokens,
      isAuthenticated: Boolean(tokens?.accessToken),
      setTokens,
      logout,
    }),
    [logout, setTokens, tokens],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
