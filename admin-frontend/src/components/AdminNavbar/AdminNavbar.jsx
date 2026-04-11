import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminNavbar.css'

export default function AdminNavbar({ onMenuToggle }) {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <header className="admin-navbar">
      <div className="admin-navbar__left">
        <button className="admin-navbar__hamburger" onClick={onMenuToggle} aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span className="admin-navbar__breadcrumb">YOLO Admin</span>
      </div>
      <div className="admin-navbar__right">
        <span className="admin-navbar__user">
          👤 {admin?.username || 'Admin'}
        </span>
        <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}
