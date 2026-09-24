import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth.jsx';

const navSections = [
  {
    title: 'عام',
    items: [
      { to: '/admin', label: 'لوحة الملخص', end: true, perm: 'dashboard.access' },
    ],
  },
  {
    title: 'المحتوى',
    items: [
      { to: '/admin/content/news', label: 'الأخبار', perm: 'news.read' },
      { to: '/admin/content/pages', label: 'الصفحات الثابتة', perm: 'site_pages.read' },
    ],
  },
  {
    title: 'التدريب',
    items: [
      { to: '/admin/training/courses', label: 'الدورات', perm: 'training_courses.read' },
      { to: '/admin/training/enrollments', label: 'التسجيلات', perm: 'training_enrollments.read' },
    ],
  },
  {
    title: 'الوسائط',
    items: [
      { to: '/admin/media', label: 'مكتبة الوسائط', perm: 'media_library.read' },
    ],
  },
  {
    title: 'البرامج',
    items: [
      { to: '/admin/programs', label: 'البرامج الأكاديمية', perm: 'academic_programs.read' },
    ],
  },
  {
    title: 'الإعدادات',
    items: [
      { to: '/admin/settings/site', label: 'الصفحة الرئيسية', perm: 'site_settings.read' },
      { to: '/admin/branches', label: 'إعدادات الفروع', perm: 'branches.read' },
    ],
  },
  {
    title: 'الحسابات',
    items: [
      { to: '/admin/users', label: 'المستخدمون', perm: 'users.view' },
      { to: '/admin/roles', label: 'الأدوار والصلاحيات', perm: 'roles.manage' },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-badge">NIAS</span>
          <span className="admin-brand-text">لوحة التحكم</span>
        </div>

        <nav className="admin-nav">
          {navSections.map((section) => (
            <div key={section.title} className="admin-nav-section">
              <h4>{section.title}</h4>
              <ul>
                {section.items.map((item) => (
                  <li key={item.to + item.label}>
                    {!item.perm || user?.permissions?.includes(item.perm) ? (
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
                      >
                        {item.label}
                      </NavLink>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}