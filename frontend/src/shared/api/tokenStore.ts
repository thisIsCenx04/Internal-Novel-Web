export type TokenPair = {
  accessToken: string
  refreshToken: string
}

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export const tokenStore = {
  get(): TokenPair | null {
    const accessToken = localStorage.getItem(ACCESS_KEY)
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (!accessToken || !refreshToken) return null
    return { accessToken, refreshToken }
  },
  set(tokens: TokenPair) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}