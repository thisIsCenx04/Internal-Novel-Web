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
          <Link to="/admin">Thống kê</Link>
          <Link to="/admin/stories">Quản lí truyện</Link>
          <Link to="/admin/settings">Cài đặt</Link>
          <Button type="button" variant="secondary" onClick={onLogout}>
            Đăng xuất
          </Button>
        </nav>
      </div>
    </header>
  )
}
