import { Link } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'

type HeaderProps = {
  onLogout: () => void
}

export function AdminHeader({ onLogout }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/admin" className="brand">
          Novel Web Admin
        </Link>
        <nav className="site-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/settings">Settings</Link>
          <Button type="button" variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </nav>
      </div>
    </header>
  )
}
