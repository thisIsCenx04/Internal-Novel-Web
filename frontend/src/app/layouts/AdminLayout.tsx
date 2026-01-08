import { Outlet } from 'react-router-dom'

export function AdminLayout() {
  return (
    <div className="layout layout-admin">
      <header className="layout-header">
        <h1>Admin Dashboard</h1>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
