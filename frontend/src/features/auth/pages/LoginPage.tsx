import { type FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { login } from '../api/authApi'

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deviceId = useMemo(() => {
    const existing = localStorage.getItem('device_id')
    if (existing) return existing
    const generated = crypto.randomUUID()
    localStorage.setItem('device_id', generated)
    return generated
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await login({
        username,
        password,
        deviceId,
        userAgent: navigator.userAgent,
      })
      auth.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      })
      localStorage.setItem('user_role', response.user.role)
      navigate('/app')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card card--tight">
      <h1>Sign in</h1>
      <p>Use your internal account to continue.</p>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <div className="alert">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}
