import type { FormEvent } from 'react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../../shared/api/httpClient'
import { Button } from '../../../shared/components/Button'
import { useAuth } from '../../../app/providers/AuthProvider'
import { getDeviceId } from '../utils/deviceId'
import { parseJwt } from '../../../shared/utils/jwt'

export function LoginPage() {
  const { setTokens } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pingResult, setPingResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reason = new URLSearchParams(location.search).get('reason')
  const expiredMessage =
    reason === 'expired' ? 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.' : null

  const handlePing = async () => {
    setPingResult('...')
    try {
      const res = await api.get('/api/auth/ping')
      setPingResult(res.data?.data ?? 'pong')
    } catch {
      setPingResult('failed')
    }
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    if (!username || !password) return
    setError(null)

    try {
      const res = await api.post('/api/auth/login', {
        username,
        password,
        deviceId: getDeviceId(),
        userAgent: navigator.userAgent,
      })
      const accessToken = res.data?.data?.accessToken as string | undefined
      const refreshToken = res.data?.data?.refreshToken as string | undefined
      if (accessToken) {
        setTokens(accessToken, refreshToken)
        const role = parseJwt(accessToken)?.role
        navigate(role === 'ADMIN' ? '/admin' : '/home', { replace: true })
      }
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Tài khoản hoặc mật khẩu không đúng.'
      setError(message)
    }
  }

  return (
    <div className="card">
      <h2>Đăng nhập</h2>
      <form onSubmit={handleLogin} className="form">
        {expiredMessage ? <p className="toast toast--error">{expiredMessage}</p> : null}
        {error ? <p className="toast toast--error">{error}</p> : null}
        <label className="field">
          Tên đăng nhập
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin"
          />
        </label>
        <label className="field">
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="password"
          />
        </label>
        <div className="actions">
          <Button type="submit">Đăng nhập</Button>
        </div>
        {pingResult ? <p className="muted">Ping: {pingResult}</p> : null}
      </form>
    </div>
  )
}
