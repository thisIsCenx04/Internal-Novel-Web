import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="layout layout-auth">
      <header className="layout-header">
        <h1>Novel Web</h1>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
