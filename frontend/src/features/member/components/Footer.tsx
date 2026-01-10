import { useQuery } from '@tanstack/react-query'
import { fetchMemberSettings } from '../api/settingsApi'

export function Footer() {
  const { data } = useQuery({
    queryKey: ['member-settings'],
    queryFn: fetchMemberSettings,
  })

  return (
    <footer className="member-footer">
      <div className="member-footer__inner">
        <div className="member-footer__brand">
          <div className="brand brand--member">Novel Web</div>
          <p className="muted">{data?.footerContactText || 'support@novelweb.local'}</p>
        </div>
        <div className="member-footer__col">
          <h4>Ve chung toi</h4>
          <a href="#about">Giới thiệu</a>
          <a href="#contact">Liên hệ</a>
          <a href="#policy">Điều khoản</a>
        </div>
        <div className="member-footer__col">
          <h4>Kham pha</h4>
          <a href="#discover">Tìm truyện</a>
          <a href="#newest">Truyện mới</a>
          <a href="#top">Truyện hot</a>
        </div>
        <div className="member-footer__col">
          <h4>Ho tro</h4>
          <a href="#guide">Hướng dẫn sử dụng</a>
          <a href="#support">Hỗ trợ</a>
        </div>
      </div>
      <div className="member-footer__bottom">
        <span>© 2026 Novel Web. All rights reserved.</span>
      </div>
    </footer>
  )
}
