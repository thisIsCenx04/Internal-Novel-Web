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
        <div className="admin-sidebar__brand">Admin</div>
        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/stories">Stories</Link>
          <Link to="/admin/categories">Categories</Link>
          <Link to="/admin/settings">Settings</Link>
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
