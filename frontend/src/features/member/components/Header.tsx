import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthProvider'
import { AdminHeader } from './AdminHeader'
import { MemberHeader } from './MemberHeader'

export function Header() {
  const { signOut, role } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return role === 'ADMIN' ? (
    <AdminHeader onLogout={handleLogout} />
  ) : (
    <MemberHeader onLogout={handleLogout} />
  )
}
