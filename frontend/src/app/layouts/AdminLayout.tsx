import { Link, Outlet } from 'react-router-dom'

export function AdminLayout() {
  return (
    <div className="layout layout-admin">
      <header className="layout-header">
        <div className="site-header__inner">
          <h1>Admin Dashboard</h1>
          <nav className="site-nav">
            <Link to="/admin">Overview</Link>
            <Link to="/admin/settings">Settings</Link>
          </nav>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
