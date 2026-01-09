import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthProvider'
import { Button } from '../../../shared/components/Button'

export function Header() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/app" className="brand">
          Novel Web
        </Link>
        <nav className="site-nav">
          <Link to="/app">Home</Link>
          <Button type="button" variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </nav>
      </div>
    </header>
  )
}
