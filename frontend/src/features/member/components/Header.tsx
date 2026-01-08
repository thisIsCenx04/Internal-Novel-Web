import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/app" className="brand">
          Novel Web
        </Link>
        <nav className="site-nav">
          <Link to="/app">Home</Link>
        </nav>
      </div>
    </header>
  )
}
