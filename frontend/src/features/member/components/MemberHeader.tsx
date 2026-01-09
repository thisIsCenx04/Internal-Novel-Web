import { Link } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'

type HeaderProps = {
  onLogout: () => void
}

export function MemberHeader({ onLogout }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/app" className="brand">
          Novel Web
        </Link>
        <nav className="site-nav">
          <Link to="/app">Home</Link>
          <Button type="button" variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </nav>
      </div>
    </header>
  )
}
