import { NavLink, Outlet } from 'react-router-dom'

export function AdminLayout() {
  return (
    <div className="shell shell--admin">
      <aside className="side">
        <div className="brand">Admin</div>
        <nav>
          <NavLink to="/admin">Dashboard</NavLink>
        </nav>
      </aside>
      <main className="shell__content">
        <Outlet />
      </main>
    </div>
  )
}