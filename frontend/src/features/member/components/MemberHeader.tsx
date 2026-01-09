import { Link } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'

type HeaderProps = {
  onLogout: () => void
}

export function MemberHeader({ onLogout }: HeaderProps) {
  return (
    <header className="member-header">
      <div className="member-header__inner">
        <Link to="/home" className="brand brand--member">
          Novel Web
        </Link>
        <div className="member-actions">
          <Button type="button" variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
