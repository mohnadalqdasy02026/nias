import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth.jsx';
import { ADMIN_NAV } from '../lib/adminNav.js';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const permissions = user?.permissions ?? [];
  const visibleSections = ADMIN_NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.perm || permissions.includes(item.perm)),
  })).filter((section) => section.items.length > 0);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  return (
    <div className="admin-shell">
      <div
        className={`admin-sidebar-overlay${sidebarOpen ? ' is-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <aside className={`admin-sidebar${sidebarOpen ? ' is-open' : ''}`}>
        <div className="admin-brand">
          <span className="brand-badge">NIAS</span>
          <span className="admin-brand-text">لوحة التحكم</span>
          <button
            type="button"
            className="admin-sidebar-close"
            aria-label="إغلاق القائمة"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="admin-nav">
          {visibleSections.map((section) => (
            <div key={section.title} className="admin-nav-section">
              <h4>{section.title}</h4>
              <ul>
                {section.items.map((item) => (
                  <li key={item.to + item.label}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-btn"
            aria-label="فتح القائمة"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="admin-user">
            <span className="admin-user-name">{user?.nameAr ?? user?.nameEn}</span>
            <span className="admin-user-roles">{(user?.roles ?? []).join('، ')}</span>
          </div>
          <div className="admin-topbar-actions">
            <Link to="/" className="btn btn-outline btn-sm">الموقع العام</Link>
            <button type="button" onClick={handleLogout} className="btn btn-sm btn-logout">خروج</button>
          </div>
        </header>

        <main className="admin-content">
          <div className="page-enter" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}