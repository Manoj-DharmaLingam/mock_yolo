import { Outlet } from 'react-router-dom'
import { useState, useCallback } from 'react'
import Sidebar from './Sidebar/Sidebar'
import AdminNavbar from './AdminNavbar/AdminNavbar'
import './AdminLayout.css'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen(s => !s), [])

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}
      <div className="admin-main">
        <AdminNavbar onMenuToggle={toggleSidebar} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
