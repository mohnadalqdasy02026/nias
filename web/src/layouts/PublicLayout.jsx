import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth.jsx';
import { api } from '../api/client.js';
import { branchTitle } from '../lib/branch.js';
import { initReveal } from '../lib/reveal.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import { DEFAULT_MAIN, DEFAULT_MORE, DEFAULT_NAV_LABELS, ABOUT_GROUP_ITEMS, resolveNav } from '../lib/navigation.js';
import SmartAssistant from '../components/SmartAssistant.jsx';

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
  const [aboutOpen, setAboutOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const { user } = useAuth();
  const settings = useSiteSettings();
  const isAdmin = user?.permissions?.includes('dashboard.access');
  const general = settings?.general ?? {};
  const contact = settings?.contact ?? {};
  const navCfg = settings?.navigation ?? {};
  const navItems = resolveNav(DEFAULT_MAIN, navCfg.main).filter((i) => i.visible);
  const moreItems = resolveNav(DEFAULT_MORE, navCfg.more).filter((i) => i.visible);
  const aboutItems = moreItems.filter((i) => ABOUT_GROUP_ITEMS.includes(i.to));
  const otherMoreItems = moreItems.filter((i) => !ABOUT_GROUP_ITEMS.includes(i.to));
  const navLabels = { ...DEFAULT_NAV_LABELS, ...(navCfg.labels ?? {}) };
  const serviceLinks = [
    general.portal_student_url && { label: 'بوابة الطالب', href: general.portal_student_url },
    general.portal_training_url && { label: 'التسجيل في الدورات', href: general.portal_training_url },
    general.ministry_admission_url && { label: 'بوابة التنسيق الموحد', href: general.ministry_admission_url },
    general.ministry_results_url && { label: 'الاستعلام عن نتائج القبول', href: general.ministry_results_url },
  ].filter(Boolean);
  const socialLinks = [
    contact.social_telegram && { label: 'تليجرام', href: contact.social_telegram },
    contact.social_facebook && { label: 'فيسبوك', href: contact.social_facebook },
    contact.whatsapp && { label: 'واتساب', href: `https://wa.me/${String(contact.whatsapp).replace(/\D/g, '')}` },
    contact.social_youtube && { label: 'يوتيوب', href: contact.social_youtube },
  ].filter(Boolean);
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    api.get('/public/branches').then((list) => setBranches(list ?? [])).catch(() => {});
  }, []);

  // Elevate the header once the page is scrolled away from the top.
  useEffect(() => {
    const onScroll = () => {
      headerRef.current?.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
    setAboutOpen(false);
    setLinksOpen(false);
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
    <header className="site-header" ref={headerRef}>
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
          <button type="button" className="nav-close" aria-label="إغلاق القائمة" onClick={() => { setOpen(false); setBranchOpen(false); setMoreOpen(false); setAboutOpen(false); setLinksOpen(false); }}>×</button>
          {navItems.map((item) =>
            item.to === '/about' ? (
              <NavDropdown
                key={item.to}
                label={item.label}
                open={aboutOpen}
                onToggle={() => { setAboutOpen((v) => !v); setBranchOpen(false); setMoreOpen(false); setLinksOpen(false); }}
              >
                <Link to="/about" className="nav-drop-link nav-drop-link--lead" onClick={() => { setAboutOpen(false); setOpen(false); }}>
                  نظرة عامة
                </Link>
                {aboutItems.map((sub) => (
                  <Link
                    key={sub.to}
                    to={sub.to}
                    className="nav-drop-link"
                    onClick={() => { setAboutOpen(false); setOpen(false); }}
                  >
                    {sub.label}
                  </Link>
                ))}
              </NavDropdown>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ),
          )}
          <NavDropdown label={navLabels.branches} open={branchOpen} onToggle={() => { setBranchOpen((v) => !v); setMoreOpen(false); setAboutOpen(false); setLinksOpen(false); }}>
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
          <NavDropdown label={navLabels.more} open={moreOpen} onToggle={() => { setMoreOpen((v) => !v); setBranchOpen(false); setAboutOpen(false); setLinksOpen(false); }}>
            {otherMoreItems.map((item) => (
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
          <NavDropdown label={navLabels.links} open={linksOpen} onToggle={() => { setLinksOpen((v) => !v); setBranchOpen(false); setMoreOpen(false); setAboutOpen(false); }}>
            {serviceLinks.length > 0 && (
              <>
                <span className="nav-drop-group">خدمات إلكترونية</span>
                {serviceLinks.map((l) => (
                  <a
                    key={l.href}
                    className="nav-drop-link"
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { setLinksOpen(false); setOpen(false); }}
                  >
                    {l.label}
                    <span className="nav-drop-ext" aria-hidden="true">↗</span>
                  </a>
                ))}
              </>
            )}
            {socialLinks.length > 0 && (
              <>
                <span className="nav-drop-group">تابعنا</span>
                {socialLinks.map((l) => (
                  <a
                    key={l.href}
                    className="nav-drop-link"
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { setLinksOpen(false); setOpen(false); }}
                  >
                    {l.label}
                    <span className="nav-drop-ext" aria-hidden="true">↗</span>
                  </a>
                ))}
              </>
            )}
            <span className="nav-drop-group">الحساب</span>
            {isAdmin ? (
              <Link to="/admin" className="nav-drop-link" onClick={() => { setLinksOpen(false); setOpen(false); }}>لوحة التحكم</Link>
            ) : (
              <Link to="/login" className="nav-drop-link" onClick={() => { setLinksOpen(false); setOpen(false); }}>تسجيل الدخول</Link>
            )}
          </NavDropdown>
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
  const contact = settings?.contact ?? {};
  const socials = [
    contact.social_telegram && { key: 'telegram', label: 'تليجرام', href: contact.social_telegram, path: 'M21 9.3a23.4 23.4 0 0 0-11.2 3.9L9 15.8l-3.9.9a.8.8 0 0 1-.6-.1l-2.3-1.1a.8.8 0 0 1-.2-1.4l3.9-3.6h.6l1.9 1.1M11.8 15.8l.9 2.9c0 .4.5.6.9.3l1-2.2' },
    contact.social_facebook && { key: 'facebook', label: 'فيسبوك', href: contact.social_facebook, path: 'M14 8h2V5h-2c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8z' },
    contact.email && { key: 'email', label: 'إيميل', href: `mailto:${contact.email}`, path: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 2v1.4l8 5 8-5V7H4zm16 12v-8l-8 5-8-5v8h16z' },
    contact.whatsapp && { key: 'whatsapp', label: 'واتساب', href: `https://wa.me/${String(contact.whatsapp).replace(/\D/g, '')}`, path: 'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3zm-3.5 5.3c.2 0 .4.2.5.4l.5 1.1c.1.2.1.4 0 .6L9 11.2a.5.5 0 0 0 0 .6c.2.4.6 1 1.3 1.7.9.9 1.6 1.2 2.1 1.4.2.1.4.1.5 0l1-1c.2-.2.4-.2.6-.1l1.2.6c.2.1.4.2.4.4 0 .7-.6 1.7-1.3 1.7-1 0-3.6-1.9-5-3.6-1-1.2-1.5-2.2-1.6-2.9 0-.8.4-1.4.9-1.6l.4-.2z' },
    contact.social_youtube && { key: 'youtube', label: 'يوتيوب', href: contact.social_youtube, path: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.2V8.8l5.2 3.2L10 15.2z' },
  ].filter(Boolean);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-brand-main">
              <Link to="/" className="footer-brand-link">
                <Logo src={general.logo} />
                <span className="footer-brand-text">
                  <strong>{general.site_name_ar ?? 'المعهد الوطني للعلوم الإدارية'}</strong>
                  <small>{general.site_name_en ?? 'National Institute of Administrative Sciences'}</small>
                </span>
              </Link>
              {(contact.address || contact.phone || contact.email) && (
                <ul className="footer-contact">
                  {contact.address && <li>{contact.address}</li>}
                  {contact.phone && <li><a href={`tel:${contact.phone}`} dir="ltr">{contact.phone}</a></li>}
                  {contact.email && <li><a href={`mailto:${contact.email}`} dir="ltr">{contact.email}</a></li>}
                </ul>
              )}
            </div>
            <div className="footer-social-links">
              {socials.map((s) => (
                <a key={s.key} className="footer-social-link" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={s.path} /></svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {contact.map_url && (
          <div className="footer-map-wrap">
            <h4 className="footer-col-title">الموقع الجغرافي</h4>
            <div className="footer-map-frame">
              <iframe
                src={contact.map_url}
                title="موقع المعهد الوطني للعلوم الإدارية على الخريطة"
                loading="lazy"
                style={{ border: 0 }}
                allowFullScreen=""
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}
      </div>
      <div className="footer-ticker" aria-hidden="true">
        <div className="footer-ticker-track">
          <span>{contact.footer_credits || 'حلول كود — مصمم ومطور الموقع  •  جميع الحقوق محفوظة للمعهد الوطني للعلوم الإدارية'}</span>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} {general.site_name_ar ?? 'المعهد الوطني للعلوم الإدارية'} — جميع الحقوق محفوظة</span>
          <nav className="footer-bottom-links" aria-label="روابط قانونية">
            <Link to="/terms">الشروط والأحكام</Link>
            <Link to="/privacy">سياسة الخصوصية</Link>
            <Link to="/accessibility">إمكانية الوصول</Link>
            <Link to="/sitemap">خريطة الموقع</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  const location = useLocation();

  useLayoutEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return undefined;
    return initReveal(main);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <main id="main-content">
        <div className="page-enter" key={location.pathname}>
          <Outlet />
        </div>
      </main>
      {location.pathname === '/' && <Footer />}
      <SmartAssistant />
    </>
  );
}