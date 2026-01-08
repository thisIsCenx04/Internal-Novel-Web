import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../../features/auth/hooks/useAuth'

export function MemberLayout() {
  const auth = useAuth()

  return (
    <div className="shell">
      <header className="shell__header">
        <div className="brand">NovelWeb</div>
        <nav>
          <NavLink to="/app">Home</NavLink>
        </nav>
        <button type="button" className="ghost" onClick={auth.logout}>
          Logout
        </button>
      </header>
      <main className="shell__content">
        <Outlet />
      </main>
    </div>
  )
}