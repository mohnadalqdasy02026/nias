import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth.jsx';
import { api } from '../api/client.js';
import { branchTitle } from '../lib/branch.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';

const navItems = [
  { to: '/', label: 'الرئيسية' },
  { to: '/about', label: 'عن المعهد' },
  { to: '/programs', label: 'البرامج الأكاديمية' },
  { to: '/colleges', label: 'الكليات والأقسام' },
  { to: '/apply', label: 'التسجيل والقبول' },
  { to: '/training', label: 'التدريب' },
];

const moreItems = [
  { to: '/news', label: 'الأخبار والفعاليات' },
  { to: '/gallery', label: 'المعرض' },
  { to: '/downloads', label: 'التحميلات' },
  { to: '/faculty', label: 'هيئة التدريس' },
  { to: '/contact', label: 'تواصل معنا' },
];

function Logo({ small, src }) {
  return (
    <span className={`logo${small ? ' logo--small' : ''}`}>
      <img src={src || '/uploads/design/site/logo.jpg'} alt="شعار المعهد الوطني للعلوم الإدارية" width="48" height="48" />
    </span>
  );
}

function NavDropdown({ label, open, onToggle, children }) {
  return (
    <div className={`nav-drop${open ? ' nav-drop--open' : ''}`}>
      <button
        type="button"
        className="nav-link nav-drop-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        {label}
        <span className="nav-drop-caret" aria-hidden="true">▾</span>
      </button>
      <div className="nav-drop-menu">{children}</div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const { user } = useAuth();
  const settings = useSiteSettings();
  const isAdmin = user?.permissions?.includes('dashboard.access');
  const general = settings?.general ?? {};
  const navRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    api.get('/public/branches').then((list) => setBranches(list ?? [])).catch(() => {});
  }, []);

  const navBranchLabel = (b) => branchTitle(b) ?? 'فرع';

  const handleBrandClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.location.reload();
    }
  };

  const closeMenu = () => {
    setOpen(false);
    setBranchOpen(false);
    setMoreOpen(false);
  };

  // Tapping outside the drawer closes it, and Escape closes it too.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (navRef.current?.contains(e.target)) return;
      if (toggleRef.current?.contains(e.target)) return;
      closeMenu();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Freeze the page behind the drawer so it cannot scroll on touch.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">تخطى إلى المحتوى</a>
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="المعهد الوطني للعلوم الإدارية - الرئيسية" onClick={handleBrandClick}>
          <Logo src={general.logo} />
          <span className="brand-text">
            <strong>{general.site_name_ar ?? 'المعهد الوطني للعلوم الإدارية'}</strong>
            <small>{general.site_name_en ?? 'National Institute of Administrative Sciences'}</small>
          </span>
        </Link>

        <nav ref={navRef} className={`main-nav${open ? ' main-nav--open' : ''}`} aria-label="التنقل الرئيسي">
          <div className="nav-brand">
            <Logo src={general.logo} />
            <span className="brand-text">
              <strong>{general.site_name_ar ?? 'المعهد الوطني للعلوم الإدارية'}</strong>
              <small>{general.site_name_en ?? 'National Institute of Administrative Sciences'}</small>
            </span>
          </div>
          <button type="button" className="nav-close" aria-label="إغلاق القائمة" onClick={() => { setOpen(false); setBranchOpen(false); setMoreOpen(false); }}>×</button>
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
          <NavDropdown label="فروع المعهد" open={branchOpen} onToggle={() => { setBranchOpen((v) => !v); setMoreOpen(false); }}>
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
          </NavDropdown>
          <NavDropdown label="المزيد" open={moreOpen} onToggle={() => { setMoreOpen((v) => !v); setBranchOpen(false); }}>
            {moreItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="nav-drop-link"
                onClick={() => { setMoreOpen(false); setOpen(false); }}
              >
                {item.label}
              </Link>
            ))}
          </NavDropdown>
          {isAdmin && (
            <Link to="/admin" className="btn btn-primary nav-login" onClick={() => setOpen(false)}>لوحة التحكم</Link>
          )}
          {!isAdmin ? (
            <Link to="/login" className="btn btn-outline btn-light nav-login" onClick={() => setOpen(false)}>تسجيل الدخول</Link>
          ) : null}
        </nav>

        <button
          ref={toggleRef}
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

      <div
        className={`nav-scrim${open ? ' nav-scrim--open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
    </header>
  );
}

function Footer() {
  const settings = useSiteSettings();
  const general = settings?.general ?? {};
  const ministryLinks = [
    { label: 'بوابة التسجيل والتنسيق الإلكتروني', href: general.ministry_admission_url || 'https://oasyemen.net' },
    ...(general.ministry_results_url
      ? [{ label: 'الاستعلام عن نتائج القبول', href: general.ministry_results_url }]
      : []),
  ];
  const quickLinks = [
    { to: '/about', label: 'عن المعهد' },
    { to: '/programs', label: 'البرامج الأكاديمية' },
    { to: '/apply', label: 'التسجيل والقبول' },
    { to: '/training', label: 'التدريب' },
    { to: '/branches', label: 'فروع المعهد' },
    { to: '/gallery', label: 'المعرض' },
    { to: '/downloads', label: 'التحميلات' },
    { to: '/faculty', label: 'هيئة التدريس' },
    { to: '/contact', label: 'تواصل معنا' },
    { to: '/faq', label: 'الأسئلة الشائعة' },
  ];
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
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-brand-link">
              <Logo src={general.logo} />
              <span className="footer-brand-text">
                <strong>{general.site_name_ar ?? 'المعهد الوطني للعلوم الإدارية'}</strong>
                <small>{general.site_name_en ?? 'National Institute of Administrative Sciences'}</small>
              </span>
            </Link>
            <div className="footer-social-links">
              {socials.map((s) => (
                <a key={s.label} className="footer-social-link" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={s.path} /></svg>
                </a>
              ))}
            </div>
          </div>

          <nav className="footer-col" aria-label="روابط سريعة">
            <h4 className="footer-col-title">روابط سريعة</h4>
            <ul className="footer-link-list">
              {quickLinks.map((l) => (
                <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav className="footer-col" aria-label="روابط رسمية وقانونية">
            <h4 className="footer-col-title">روابط رسمية</h4>
            <ul className="footer-link-list">
              {ministryLinks.map((m) => (
                <li key={m.label}>
                  <a href={m.href} target="_blank" rel="noopener noreferrer">
                    {m.label}
                    <svg className="footer-ext" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3h7v7M21 3l-9 9M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></svg>
                  </a>
                </li>
              ))}
              <li><Link to="/terms">الشروط والأحكام</Link></li>
              <li><Link to="/privacy">سياسة الخصوصية</Link></li>
              <li><Link to="/accessibility">إمكانية الوصول</Link></li>
              <li><Link to="/sitemap">خريطة الموقع</Link></li>
            </ul>
          </nav>
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

  return (
    <>
      <Header />
      <main id="main-content">
        <div className="page-enter" key={location.pathname}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}