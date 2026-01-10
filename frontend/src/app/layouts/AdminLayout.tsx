import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button'
import { useAuth } from '../providers/AuthProvider'

export function AdminLayout() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout layout-admin admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">Quản lý trang web</div>
        <nav className="admin-nav">
          <Link to="/admin">Thống kê</Link>
          <Link to="/admin/users">Quản lý người dùng</Link>
          <Link to="/admin/stories">Quản lý</Link>
          <Link to="/admin/categories">Quản lý thể loại</Link>
          <Link to="/admin/audit-logs">Logs hệ thống</Link>
          <Link to="/admin/settings">Cài đặ trang web</Link>
        </nav>
        <div className="admin-sidebar__footer">
          <Button type="button" variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
