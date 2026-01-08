import type { FormEvent } from 'react'
import { useState } from 'react'
import api from '../../../shared/api/httpClient'
import { Button } from '../../../shared/components/Button'
import { useAuth } from '../../../app/providers/AuthProvider'

export function LoginPage() {
  const { setTokens } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pingResult, setPingResult] = useState<string | null>(null)

  const handlePing = async () => {
    setPingResult('...')
    try {
      const res = await api.get('/api/auth/ping')
      setPingResult(res.data?.data ?? 'pong')
    } catch {
      setPingResult('failed')
    }
  }

  const handleMockLogin = (event: FormEvent) => {
    event.preventDefault()
    if (username && password) {
      setTokens(`dev-token-${username}`)
    }
  }

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={handleMockLogin} className="form">
        <label className="field">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin"
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="password"
          />
        </label>
        <div className="actions">
          <Button type="submit">Mock Login</Button>
          <Button type="button" variant="secondary" onClick={handlePing}>
            Ping Auth
          </Button>
        </div>
        {pingResult ? <p className="muted">Ping: {pingResult}</p> : null}
      </form>
    </div>
  )
}
