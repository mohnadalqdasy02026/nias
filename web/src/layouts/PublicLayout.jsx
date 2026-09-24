import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth.jsx';
import { api } from '../api/client.js';
import { branchLabel, isHeadquartersName } from '../lib/branch.js';

const navItems = [
  { to: '/', label: 'الرئيسية' },
  { to: '/about', label: 'عن المعهد' },
  { to: '/programs', label: 'البرامج الأكاديمية' },
  { to: '/news', label: 'الأخبار والفعاليات' },
  { to: '/training', label: 'التدريب' },
];

function Logo({ small }) {
  return (
    <span className={`logo${small ? ' logo--small' : ''}`}>
      <img src="/uploads/design/site/logo.jpg" alt="شعار المعهد الوطني للعلوم الإدارية" width="48" height="48" />
    </span>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.permissions?.includes('dashboard.access');

  useEffect(() => {
    api.get('/public/branches').then((list) => setBranches(list ?? [])).catch(() => {});
  }, []);

  const navBranchLabel = (b) => {
    const label = branchLabel(b.name_ar) ?? 'فرع';
    return isHeadquartersName(label) ? label : (label.includes('فرع') ? label : `فرع ${label}`);
  };

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">تخطى إلى المحتوى</a>
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="المعهد الوطني للعلوم الإدارية - الرئيسية">
          <Logo />
          <span className="brand-text">
            <strong>المعهد الوطني للعلوم الإدارية</strong>
            <small>National Institute of Administrative Sciences</small>
          </span>
        </Link>

        <nav className={`main-nav${open ? ' main-nav--open' : ''}`} aria-label="التنقل الرئيسي">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <div className={`nav-drop${branchOpen ? ' nav-drop--open' : ''}`}>
            <button
              type="button"
              className="nav-link nav-drop-toggle"
              aria-expanded={branchOpen}
              onClick={() => setBranchOpen((v) => !v)}
            >
              فروع المعهد
              <span className="nav-drop-caret" aria-hidden="true">▾</span>
            </button>
            <div className="nav-drop-menu">
              {branches.length === 0 && <span className="nav-drop-empty">لا توجد فروع مسجلة.</span>}
              {branches.map((b) => (
                <Link
                  key={b.id}
                  to={`/branches/${b.slug}`}
                  className="nav-drop-link"
                  onClick={() => { setBranchOpen(false); setOpen(false); }}
                >
                  <span className="nav-drop-label">{navBranchLabel(b)}</span>
                  {b.is_headquarters && <span className="nav-drop-mark">رئيسي</span>}
                </Link>
              ))}
            </div>
          </div>
          {isAdmin && (
            <Link to="/admin" className="btn btn-primary nav-login" onClick={() => setOpen(false)}>لوحة التحكم</Link>
          )}
          {!isAdmin ? (
            <Link to="/login" className="btn btn-outline btn-light nav-login" onClick={() => setOpen(false)}>تسجيل الدخول</Link>
          ) : null}
        </nav>

        <button
          type="button"
          className={`nav-toggle${open ? ' nav-toggle--open' : ''}`}
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function Footer() {
  const socials = [
    { label: 'تليجرام', href: 'https://t.me/nias_academy', path: 'M21 9.3a23.4 23.4 0 0 0-11.2 3.9L9 15.8l-3.9.9a.8.8 0 0 1-.6-.1l-2.3-1.1a.8.8 0 0 1-.2-1.4l3.9-3.6h.6l1.9 1.1M11.8 15.8l.9 2.9c0 .4.5.6.9.3l1-2.2' },
    { label: 'فيسبوك', href: 'https://www.facebook.com/nias.academy', path: 'M14 8h2V5h-2c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8z' },
    { label: 'إيميل', href: 'mailto:nias@nias-ye.academy', path: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 2v1.4l8 5 8-5V7H4zm16 12v-8l-8 5-8-5v8h16z' },
    { label: 'واتساب', href: 'https://wa.me/9671222537', path: 'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3zm-3.5 5.3c.2 0 .4.2.5.4l.5 1.1c.1.2.1.4 0 .6L9 11.2a.5.5 0 0 0 0 .6c.2.4.6 1 1.3 1.7.9.9 1.6 1.2 2.1 1.4.2.1.4.1.5 0l1-1c.2-.2.4-.2.6-.1l1.2.6c.2.1.4.2.4.4 0 .7-.6 1.7-1.3 1.7-1 0-3.6-1.9-5-3.6-1-1.2-1.5-2.2-1.6-2.9 0-.8.4-1.4.9-1.6l.4-.2z' },
    { label: 'يوتيوب', href: 'https://www.youtube.com/@nias_academy', path: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.2V8.8l5.2 3.2L10 15.2z' },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-social">
          <p className="footer-social-note">تابعونا على مواقع التواصل الاجتماعي</p>
          <div className="footer-social-links">
            {socials.map((s) => (
              <a key={s.label} className="footer-social-link" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={s.path} /></svg>
                <span>{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-ticker" aria-hidden="true">
        <div className="footer-ticker-track">
          <span>حلول كود — مصمم ومطور الموقع&nbsp;&nbsp;•&nbsp;&nbsp;جميع الحقوق محفوظة للمعهد الوطني للعلوم الإدارية</span>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      {isHome && <Footer />}
    </>
  );
}