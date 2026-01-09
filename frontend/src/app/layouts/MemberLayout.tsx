import { Outlet } from 'react-router-dom'
import { Header } from '../../features/member/components/Header'
import { Footer } from '../../features/member/components/Footer'
import { RulesBanner } from '../../features/member/components/RulesBanner'

export function MemberLayout() {
  return (
    <div className="layout layout-member">
      <Header />
      <RulesBanner />
      <main className="layout-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
