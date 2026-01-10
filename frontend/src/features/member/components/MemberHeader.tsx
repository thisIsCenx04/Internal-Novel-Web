import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../../../shared/components/Button'
import { fetchMemberProfile } from '../api/profileApi'

type HeaderProps = {
  onLogout: () => void
}

export function MemberHeader({ onLogout }: HeaderProps) {
  const profileQuery = useQuery({
    queryKey: ['member-profile'],
    queryFn: fetchMemberProfile,
  })

  const vipWarning = profileQuery.data?.vipWarningDays
  const vipExpired = profileQuery.data?.vipExpired

  return (
    <header className="member-header">
      <div className="member-header__inner">
        <Link to="/home" className="brand brand--member">
          Novel Web
        </Link>
        <div className="member-actions">
          <Button type="button" variant="secondary" onClick={onLogout}>
            Đăng xuất
          </Button>
        </div>
      </div>
      {vipExpired ? (
        <div className="vip-banner vip-banner--danger">
          Hết hạn đăng ký. Vui lòng liên hệ Admin và gia hạn để tiếp tục sử dụng
        </div>
      ) : vipWarning != null ? (
        <div className="vip-banner">
          VIP hết hạn trong {vipWarning} ngày{vipWarning === 1 ? '' : 's'}.
        </div>
      ) : null}
    </header>
  )
}
