import { Outlet } from 'react-router-dom'
import { Header } from '../../features/member/components/Header'
import { Footer } from '../../features/member/components/Footer'

export function MemberLayout() {
  return (
    <div className="layout layout-member">
      <Header />
      <main className="layout-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
