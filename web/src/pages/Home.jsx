import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import { branchTitle } from '../lib/branch.js';
import { trainingCategoryLabel } from '../lib/training.js';
import { collegeHeadNoun, collegeHeadWord } from '../lib/college.js';

const statsKeys = [
  { label: 'البرامج الأكاديمية', key: 'programs' },
  { label: 'الكليات والأقسام', key: 'colleges' },
  { label: 'الطلاب والطالبات', key: 'students' },
  { label: 'أعضاء هيئة التدريس', key: 'faculty' },
];

const typeLabel = {
  news: 'خبر',
  event: 'فعالية',
  activity: 'نشاط',
  course: 'دورة',
};

const programTypeLabel = {
  bachelor: 'بكالوريوس',
  diploma: 'دبلوم',
  master_executive: 'ماجستير تنفيذي',
  master_academic: 'ماجستير أكاديمي',
};

const programCoverKind = {
  bachelor: 'bachelor',
  master_academic: 'master',
  master_executive: 'master',
  diploma: 'diploma',
};

const programCovers = {
  bachelor: '/uploads/design/site/main_1786788776_852.jpg',
  master: '/uploads/design/site/main_1783197092_280.jpg',
  diploma: '/uploads/design/site/main_1782830791_165.jpg',
};

function shorten(text, max = 120) {
  if (!text) return text;
  const trimmed = text.replace(/\s+/g, ' ').trim();
  return trimmed.length > max ? `${trimmed.slice(0, max).trimEnd()}…` : trimmed;
}

const DEFAULT_HERO_IMAGE = '/uploads/design/site/about_National.jpg';

function heroImagesFrom(home) {
  const added = (home.hero_images ?? []).filter((src) => src && src !== 'null');
  const all = [DEFAULT_HERO_IMAGE, ...added];
  return all.filter((src, i) => all.indexOf(src) === i);
}

const courseCovers = [
  '/uploads/design/site/main_1786901865_894.jpg',
  '/uploads/design/site/main_1786899199_299.jpg',
  '/uploads/design/site/main_1787071099_197.jpg',
];

function SectionHeading({ title, subtitle, to, linkText }) {
  return (
    <div className="section-head">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {to && <Link to={to} className="section-more">{linkText} ←</Link>}
    </div>
  );
}

function Rail({ label, href, moreLabel = 'اكتشف المزيد', children }) {
  const railRef = useRef(null);
  const [state, setState] = useState({ overflow: false, canLeft: false, canRight: false });

  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      const rtl = getComputedStyle(el).direction === 'rtl';
      const sl = el.scrollLeft;
      const next = {
        overflow: max > 8,
        canRight: rtl ? sl < -4 : sl < max - 4,
        canLeft: rtl ? sl > -max + 4 : sl > 4,
      };
      setState((prev) => (prev.overflow === next.overflow && prev.canLeft === next.canLeft && prev.canRight === next.canRight ? prev : next));
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    return () => {
      ro?.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, []);

  // Physical direction: positive step scrolls the viewport to the right,
  // negative step scrolls it to the left — arrows always match their side.
  const nudge = (step) => {
    railRef.current?.scrollBy({ left: step, behavior: 'smooth' });
  };

  const cardStep = () => {
    const el = railRef.current;
    const card = el?.querySelector('.rail-card');
    const w = card ? card.getBoundingClientRect().width : 0;
    return Math.round(w > 0 ? w + 16 : (el?.clientWidth ?? 400) * 0.7);
  };

  return (
    <div className={`rail-wrap${state.overflow ? ' is-overflow' : ''}`}>
      <div className="rail" ref={railRef} aria-label={label}>
        {children}
      </div>
      <button
        type="button"
        className={`rail-btn rail-btn--left${state.canLeft ? '' : ' is-off'}`}
        aria-label="تحرك لليسار"
        disabled={!state.canLeft}
        onClick={() => nudge(-cardStep())}
      >
        ‹
      </button>
      <button
        type="button"
        className={`rail-btn rail-btn--right${state.canRight ? '' : ' is-off'}`}
        aria-label="تحرك لليمين"
        disabled={!state.canRight}
        onClick={() => nudge(cardStep())}
      >
        ›
      </button>
      <div className="rail-more">
        <Link to={href} className="btn btn-primary">{moreLabel}</Link>
      </div>
    </div>
  );
}

const defaultFeatures = [
  { icon: '🎓', title: 'برامج أكاديمية معتمدة', text: 'بكالوريوس وماجستير ودبلوم متوسط وفق أعلى معايير الجودة الأكاديمية.' },
  { icon: '🛠️', title: 'تدريب عملي مكثف', text: 'دورات تدريبية متطورة تواكب متطلبات سوق العمل اليمني وتنمي مهارات الكوادر.' },
  { icon: '🏛️', title: 'فروع في كل المحافظات', text: 'شبكة واسعة من الفروع تُعنى بتقديم خدمات المعهد قربًا من المتدربين وطلابنا.' },
  { icon: '👨‍🏫', title: 'كادر أكاديمي متميز', text: 'نخبة من الأكاديميين والباحثين ذوي الخبرة في مجال العلوم الإدارية.' },
];

function FeaturesBand({ features }) {
  const list = (features?.length ? features : defaultFeatures)
    .filter((f) => f?.title || f?.text);
  if (list.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="highlight-grid">
          {list.map((f, fi) => (
            <div key={f.title ?? f.icon ?? `item-${fi}`} className="card highlight-card">
              <span className="highlight-mark" aria-hidden="true">{f.icon ?? '✦'}</span>
              {f.title && <h3>{f.title}</h3>}
              {f.text && <p>{f.text}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RegistrationCta({ general }) {
  const admission = general?.ministry_admission_url || 'https://oasyemen.net';
  return (
    <section className="section">
      <div className="container">
        <div className="reg-cta">
          <span className="reg-cta-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
          </span>
          <div className="reg-cta-text">
            <h2>التسجيل والقبول</h2>
            <p>خطوات التقديم والمستندات المطلوبة وشروط القبول — كلّها في صفحة واحدة.</p>
          </div>
          <div className="reg-cta-actions">
            <Link to="/apply" className="btn btn-primary">شروط وخطوات التسجيل ←</Link>
            <a className="btn btn-soft" href={admission} target="_blank" rel="noopener noreferrer">بوابة التنسيق الموحد</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [stats, setStats] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [news, setNews] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const settings = useSiteSettings();

  const home = settings?.home ?? {};

  usePageMeta(
    'الرئيسية',
    'المعهد الوطني للعلوم الإدارية — برامج أكاديمية ودورات تدريبية متطورة لبناء القدرات الإدارية وإعداد الكوادر في اليمن.',
  );

  useEffect(() => {
    api.get('/public/stats').then((d) => setStats(d ?? {})).catch(() => setStats({}));
    api.get('/public/programs').then((d) => setPrograms(d ?? [])).catch(() => {});
    api.get('/public/training-courses').then((d) => setCourses(d ?? [])).catch(() => {});
    api.get('/public/news?limit=10').then((d) => setNews(d ?? [])).catch(() => {});
    api.get('/public/colleges').then((d) => setColleges(d ?? [])).catch(() => {});
  }, []);

  const heroImages = heroImagesFrom(home);

  useEffect(() => {
    if (heroImages.length < 2) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <>
      <section className={heroImages.length > 0 ? 'hero has-slides' : 'hero'}>
        {heroImages.length > 0 && (
          <div className="hero-slides" aria-hidden="true">
            {heroImages.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className={`hero-slide${i === heroIndex ? ' is-active' : ''}`}
                style={{ backgroundImage: `url('${src}')` }}
              />
            ))}
          </div>
        )}
        <div className="hero-inner">
          <p className="hero-eyebrow">{home.hero_eyebrow ?? 'الجمهورية اليمنية — المعهد الوطني للعلوم الإدارية'}</p>
          <h1>{home.hero_title ?? 'بناء القدرات الإدارية وإعداد الكوادر المؤهلة لخدمة اليمن'}</h1>
          <p className="hero-sub">
            {home.hero_subtitle ??
              'المعهد الوطني للعلوم الإدارية مؤسسة وطنية معنية بالتنمية الإدارية، تقدم برامج أكاديمية ودورات تدريبية متطورة عبر فروعها في محافظات الجمهورية.'}
          </p>
          <div className="hero-actions">
            <Link to="/programs" className="btn btn-primary">البرامج الأكاديمية</Link>
            <Link to="/apply" className="btn hero-btn-outline">التسجيل والقبول</Link>
          </div>
          <div className="hero-stats">
            {statsKeys.map((s) => (
              <div key={s.key} className="stat-card">
                <span className="stat-value">{stats?.[s.key] ?? '—'}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturesBand features={home.features} />

      <RegistrationCta general={settings?.general} />

      {colleges.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading title="كليات المعهد" subtitle="كلية متخصصة تمنح درجة علمية في تخصصات إدارية حديثة" to="/colleges" linkText="جميع الكليات والأقسام" />
            <div className="colleges-grid">
              {colleges.map((c) => (
                <article key={c.id} className="card college-card">
                  <div className="college-cover">
                    <img
                      src={c.image && c.image !== 'null' ? c.image : '/uploads/design/site/logo.jpg'}
                      alt={c.name_ar}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = '/uploads/design/site/logo.jpg'; }}
                    />
                  </div>
                  <h3><Link to={`/colleges/${c.id}`}>{c.name_ar}</Link></h3>
                  {(c.dean_name_ar ?? c.dean_name) && (
                    <div className="college-dean">
                      {c.dean_image && c.dean_image !== 'null' ? (
                        <span className="college-dean-photo">
                          <img src={c.dean_image} alt={`${collegeHeadWord(c.name_ar)} ${collegeHeadNoun(c.name_ar)} — ${c.name_ar}`} loading="lazy" />
                        </span>
                      ) : null}
                      <span>{collegeHeadWord(c.name_ar)} {collegeHeadNoun(c.name_ar)}: {c.dean_name_ar ?? c.dean_name}</span>
                    </div>
                  )}
                  {c.about && <p className="college-about">{c.about}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <SectionHeading title="البرامج الأكاديمية" subtitle="برامجنا المتاحة للتسجيل" to="/programs" linkText="عرض جميع البرامج" />
          <div className="programs-results">
            {programs.slice(0, 3).map((p) => (
              <article key={p.id} className={`program-card program-card--${p.program_type}`}>
                <div className="program-card-cover">
                  <img src={programCovers[programCoverKind[p.program_type] ?? 'bachelor']} alt={p.name_ar ?? p.name_en} loading="lazy" />
                  <span className="program-card-type">{programTypeLabel[p.program_type] ?? p.program_type}</span>
                </div>
                <div className="program-card-body">
                  {p.college_name_ar && (
                    <span className="program-card-college">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h4a2 2 0 0 1 2 2v10M9 7h2M9 11h2M9 15h2" /></svg>
                      {p.college_name_ar}
                    </span>
                  )}
                  <h3>{p.name_ar ?? p.name_en}</h3>
                  {p.description && <p className="program-card-desc">{shorten(p.description)}</p>}
                  <div className="program-card-footer">
                    {p.admission_open ? (
                      <span className="program-badge program-badge--open">التسجيل مفتوح</span>
                    ) : (
                      <span className="program-badge program-badge--closed">التسجيل مغلق</span>
                    )}
                    <Link to={`/programs/${p.id}`} className="program-card-cta">التفاصيل <span aria-hidden="true">←</span></Link>
                  </div>
                </div>
              </article>
            ))}
            {programs.length === 0 && <p className="muted">لا توجد برامج متاحة حاليًا.</p>}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHeading title="البرامج التدريبية" subtitle="برامج مفتوحة للتسجيل الآن" />
          {courses.length > 0 ? (
            <Rail label="قائمة البرامج التدريبية" href="/training">
              {courses.slice(0, 10).map((c, ci) => (
                <article key={c.id} className="card course-card rail-card">
                  <div className="card-cover">
                    <img src={courseCovers[ci % courseCovers.length]} alt={c.title} loading="lazy" />
                    <span className="cover-badge">{trainingCategoryLabel(c.category)}</span>
                  </div>
                  <div className="card-body">
                    <h3>{c.title}</h3>
                    <div className="course-meta">
                      {c.location && <span>{c.location}</span>}
                      {c.start_date && <span>يبدأ: {new Date(c.start_date).toLocaleDateString('ar-YE')}</span>}
                      {c.trainer && <span>المدرب: {c.trainer}</span>}
                    </div>
                    <div className="course-card-actions">
                      <Link to={`/training/${c.id}`} className="btn btn-soft">التفاصيل</Link>
                      <Link to={`/training/register?course=${c.id}`} className="btn btn-primary">التسجيل</Link>
                    </div>
                  </div>
                </article>
              ))}
            </Rail>
          ) : (
            <p className="muted">لا توجد برامج تدريبية مفتوحة حاليًا.</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading title="أخبار وفعاليات المعهد" subtitle="مستجدات وأنشطة المعهد" />
          {news.length > 0 ? (
            <Rail label="قائمة أخبار وفعاليات المعهد" href="/news">
              {news.map((item) => (
                <article key={item.id} className="card news-card rail-card">
                  {item.cover_image ? (
                    <img className="news-cover" src={item.cover_image} alt={item.title_ar ?? item.title_en} loading="lazy" />
                  ) : (
                    <div className="news-cover news-cover--placeholder">
                      <span className="news-cover-mark">NIAS</span>
                      <span className="news-type-badge">{typeLabel[item.content_type] ?? 'خبر'}</span>
                    </div>
                  )}
                  <div className="news-body">
                    <div className="news-body-top">
                      <span className={`news-type-badge news-type--${item.content_type}`}>{typeLabel[item.content_type] ?? 'خبر'}</span>
                      {item.published_at && (
                        <span className="news-date">{new Date(item.published_at).toLocaleDateString('ar-YE')}</span>
                      )}
                    </div>
                    {item.branch_name_ar && (
                      <Link to={`/branches/${item.branch_slug}`} className="news-branch-tag">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></svg>
                        {branchTitle(item.branch_name_ar)}
                      </Link>
                    )}
                    <h3>{item.title_ar ?? item.title_en}</h3>
                    <Link to={`/news/${item.id}`} className="news-link">اقرأ المزيد ←</Link>
                  </div>
                </article>
              ))}
            </Rail>
          ) : (
            <p className="muted">لا توجد أخبار منشورة حاليًا.</p>
          )}
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2>{home.cta_title ?? 'انضم إلى صفوف كوادرنا المؤهلة'}</h2>
            <p>{home.cta_text ?? 'سجّل الآن في أحد برامجنا الأكاديمية أو دوراتنا التدريبية وابدأ مسارك المهني.'}</p>
          </div>
          <div className="cta-actions">
            <Link to="/programs" className="btn btn-primary">سجّل عبر بوابة التنسيق</Link>
            <Link to="/training/register" className="btn btn-outline btn-light">التدريب</Link>
          </div>
        </div>
      </section>
    </>
  );
}