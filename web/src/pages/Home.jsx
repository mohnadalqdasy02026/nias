import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import { branchTitle } from '../lib/branch.js';
import { trainingCategoryLabel } from '../lib/training.js';
import { collegeHeadNoun, collegeHeadWord } from '../lib/college.js';
import { IntroBlock, useIntroPages } from '../components/IntroBlocks.jsx';
import RegistrationSteps from '../components/RegistrationSteps.jsx';
import ProgramExplorer from '../components/ProgramExplorer.jsx';

const statsKeys = [
  { label: 'البرامج الأكاديمية', key: 'programs' },
  { label: 'الكليات والأقسام', key: 'colleges' },
  { label: 'الطلاب والطالبات', key: 'students' },
  { label: 'أعضاء هيئة التدريس', key: 'faculty' },
  { label: 'البرامج التدريبية', key: 'trainingCourses' },
  { label: 'الأخبار والفعاليات', key: 'news' },
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
          {list.map((f) => (
            <div key={f.title ?? f.icon ?? Math.random().toString(36)} className="card highlight-card">
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

function MinistryLinks({ general }) {
  const admission = general?.ministry_admission_url || 'https://oasyemen.net';
  const results = general?.ministry_results_url || '';
  if (!admission && !results) return null;
  return (
    <section className="ministry-links" aria-labelledby="ministry-links-title">
      <div className="container">
        <h2 id="ministry-links-title" className="ministry-links-title">روابط وزارة التربية والتعليم والبحث العلمي</h2>
        <div className="ministry-links-grid">
          {admission && (
            <a className="ministry-link-card" href={admission} target="_blank" rel="noopener noreferrer">
              <span className="ministry-link-name">بوابة التسجيل والتنسيق الإلكتروني</span>
              <span className="ministry-link-desc">الترشيح والتقديم والقبول في كليات المعهد عبر البوابة الموحدة</span>
              <span className="ministry-link-go">زيارة البوابة ←</span>
            </a>
          )}
          {results && (
            <a className="ministry-link-card" href={results} target="_blank" rel="noopener noreferrer">
              <span className="ministry-link-name">الاستعلام عن نتائج القبول</span>
              <span className="ministry-link-desc">متابعة نتائج المفاضلة والقبول للعام الدراسي الحالي</span>
              <span className="ministry-link-go">استعلام عن النتيجة ←</span>
            </a>
          )}
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
  const [departments, setDepartments] = useState([]);
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
    api.get('/public/news?limit=3').then((d) => setNews(d ?? [])).catch(() => {});
    api.get('/public/colleges').then((d) => setColleges(d ?? [])).catch(() => {});
    api.get('/public/departments').then((d) => setDepartments(d ?? [])).catch(() => {});
  }, []);

  const heroImages = heroImagesFrom(home);
  const intro = useIntroPages();

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
            <Link to="/apply" className="btn hero-btn-outline">خطوات التسجيل</Link>
            <Link to="/training/register" className="btn hero-btn-outline">سجّل في برنامج تدريبى</Link>
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

      <MinistryLinks general={settings?.general} />

      <RegistrationSteps tone="dark" />

      <FeaturesBand features={home.features} />

      {(intro.vision || intro.mission) && (
        <section className="section">
          <div className="container">
            <SectionHeading title="رؤيتنا ورسالتنا" subtitle="المحددات الاستراتيجية لعمل المعهد الوطني للعلوم الإدارية" to="/about" linkText="عن المعهد" />
            <div className="intro-blocks-row">
              <IntroBlock page={intro.vision} className="intro-block--vision" />
              <IntroBlock page={intro.mission} className="intro-block--mission" />
            </div>
          </div>
        </section>
      )}

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
                          <img src={c.dean_image} alt="" loading="lazy" />
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

      <ProgramExplorer colleges={colleges} departments={departments} programs={programs} />

      <section className="section">
        <div className="container">
          <SectionHeading title="البرامج الأكاديمية" subtitle="برامجنا المتاحة للتسجيل" to="/programs" linkText="عرض جميع البرامج" />
          <div className="programs-results">
            {programs.slice(0, 3).map((p) => (
              <article key={p.id} className={`program-card program-card--${p.program_type}`}>
                <div className="program-card-cover">
                  <img src={programCovers[programCoverKind[p.program_type] ?? 'bachelor']} alt="" loading="lazy" />
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
          <SectionHeading title="البرامج التدريبية" subtitle="برامج مفتوحة للتسجيل الآن" to="/training" linkText="عرض جميع البرامج" />
          <div className="courses-grid">
            {courses.slice(0, 3).map((c, ci) => (
              <article key={c.id} className="card course-card">
                <div className="card-cover">
                  <img src={courseCovers[ci % courseCovers.length]} alt="" loading="lazy" />
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
            {courses.length === 0 && <p className="muted">لا توجد برامج تدريبية مفتوحة حاليًا.</p>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading title="أخبار وفعاليات المعهد" subtitle="مستجدات وأنشطة المعهد" to="/news" linkText="عرض جميع الأخبار" />
          <div className="news-grid">
            {news.map((item) => (
              <article key={item.id} className="card news-card">
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
                  {item.summary_ar && <p>{item.summary_ar}</p>}
                  <Link to={`/news/${item.id}`} className="news-link">اقرأ المزيد ←</Link>
                </div>
              </article>
            ))}
            {news.length === 0 && <p className="muted">لا توجد أخبار منشورة حاليًا.</p>}
          </div>
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