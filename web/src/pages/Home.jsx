import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { branchLabel } from '../lib/branch.js';

const statsKeys = [
  { label: 'البرامج الأكاديمية', key: 'programs' },
  { label: 'الكليات والأقسام', key: 'colleges' },
  { label: 'الطلاب والطالبات', key: 'students' },
  { label: 'أعضاء هيئة التدريس', key: 'faculty' },
  { label: 'الدورات التدريبية', key: 'trainingCourses' },
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

const courseCovers = [
  '/uploads/design/site/main_1786901865_894.jpg',
  '/uploads/design/site/main_1786899199_299.jpg',
  '/uploads/design/site/main_1787071099_197.jpg',
];

const branchImages = {
  'صنعاء': '/uploads/design/site/main_1787952645_645.jpg',
  'عدن': '/uploads/design/site/main_1786787438_869.jpg',
  'تعز': '/uploads/design/site/main_1782830791_165.jpg',
  'الحديدة': '/uploads/design/site/main_1783197092_280.jpg',
  'إب': '/uploads/design/site/about_National.jpg',
  'المكلا': '/uploads/design/site/main_1778701899_784.jpg',
};

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

const features = [
  { icon: '🎓', title: 'برامج أكاديمية معتمدة', text: 'بكالوريوس وماجستير ودبلوم متوسط وفق أعلى معايير الجودة الأكاديمية.' },
  { icon: '🛠️', title: 'تدريب عملي مكثف', text: 'دورات تدريبية متطورة تواكب متطلبات سوق العمل اليمني وتنمي مهارات الكوادر.' },
  { icon: '🏛️', title: 'فروع في كل المحافظات', text: 'شبكة واسعة من الفروع تُعنى بتقديم خدمات المعهد قربًا من المتدربين وطلابنا.' },
  { icon: '👨‍🏫', title: 'كادر أكاديمي متميز', text: 'نخبة من الأكاديميين والباحثين ذوي الخبرة في مجال العلوم الإدارية.' },
];

function FeaturesBand() {
  return (
    <section className="section">
      <div className="container">
        <div className="highlight-grid">
          {features.map((f) => (
            <div key={f.title} className="card highlight-card">
              <span className="highlight-mark" aria-hidden="true">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
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
  const [branches, setBranches] = useState([]);
  const [colleges, setColleges] = useState([]);

  usePageMeta(
    'الرئيسية',
    'المعهد الوطني للعلوم الإدارية — برامج أكاديمية ودورات تدريبية متطورة لبناء القدرات الإدارية وإعداد الكوادر في اليمن.',
  );

  useEffect(() => {
    api.get('/public/stats').then(setStats).catch(() => setStats({}));
    api.get('/public/programs').then(setPrograms).catch(() => {});
    api.get('/public/training-courses').then(setCourses).catch(() => {});
    api.get('/public/news?limit=3').then((d) => setNews(d ?? [])).catch(() => {});
    api.get('/public/branches').then(setBranches).catch(() => {});
    api.get('/public/colleges').then(setColleges).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">الجمهورية اليمنية — المعهد الوطني للعلوم الإدارية</p>
          <h1>بناء القدرات الإدارية وإعداد الكوادر المؤهلة لخدمة اليمن</h1>
          <p className="hero-sub">
            المعهد الوطني للعلوم الإدارية مؤسسة وطنية معنية بالتنمية الإدارية، تقدم
            برامج أكاديمية ودورات تدريبية متطورة عبر فروعها في محافظات الجمهورية.
          </p>
          <div className="hero-actions">
            <Link to="/programs" className="btn btn-primary">البرامج الأكاديمية</Link>
            <Link to="/training/register" className="btn hero-btn-outline">سجّل في دورة تدريبية</Link>
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

      <FeaturesBand />

      {colleges.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <SectionHeading title="كليات المعهد" subtitle="كلية متخصصة تمنح درجة علمية في تخصصات إدارية حديثة" to="/programs" linkText="استكشف البرامج" />
            <div className="colleges-grid">
              {colleges.map((c) => (
                <article key={c.id} className="card college-card">
                  <div className="college-cover">
                    <img
                      src={c.image && c.image !== 'null' ? c.image : '/uploads/design/site/logo.jpg'}
                      alt={c.name_ar}
                      loading="lazy"
                    />
                  </div>
                  <h3>{c.name_ar}</h3>
                  {c.dean_name && <span className="college-dean">عميد الكلية: {c.dean_name}</span>}
                  {c.about && <p className="college-about">{c.about}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <SectionHeading title="معرض وملفات" subtitle="صور من أنشطة المعهد وملفاته المتاحة للتحميل" />
          <div className="feature-band">
            <Link to="/gallery" className="feature-tile">
              <span className="feature-tile-icon" aria-hidden="true">📸</span>
              <strong>معرض الصور</strong>
              <small>لقطات من فعاليات المعهد</small>
            </Link>
            <Link to="/downloads" className="feature-tile">
              <span className="feature-tile-icon" aria-hidden="true">⬇️</span>
              <strong>التحميلات</strong>
              <small>نماذج وللوائح وبرشورات</small>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading title="البرامج الأكاديمية" subtitle="برامجنا المتاحة للتسجيل" to="/programs" linkText="عرض جميع البرامج" />
          <div className="programs-results">
            {programs.map((p) => (
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
                  {p.description && <p className="program-card-desc">{p.description}</p>}
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
          <SectionHeading title="الدورات التدريبية" subtitle="دورات مفتوحة للتسجيل الآن" to="/training" linkText="عرض جميع الدورات" />
          <div className="courses-grid">
            {courses.map((c, ci) => (
              <article key={c.id} className="card course-card">
                <div className="card-cover">
                  <img src={courseCovers[ci % courseCovers.length]} alt="" loading="lazy" />
                  {c.category && <span className="cover-badge">{c.category}</span>}
                </div>
                <div className="card-body">
                  <h3>{c.title}</h3>
                  {c.description && <p>{c.description}</p>}
                  <div className="course-meta">
                    {c.location && <span>{c.location}</span>}
                    {c.start_date && <span>يبدأ: {new Date(c.start_date).toLocaleDateString('ar-YE')}</span>}
                    {c.trainer && <span>المدرب: {c.trainer}</span>}
                  </div>
                  <Link to="/training/register" className="btn btn-primary">التسجيل في الدورة</Link>
                </div>
              </article>
            ))}
            {courses.length === 0 && <p className="muted">لا توجد دورات مفتوحة حاليًا.</p>}
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
                      {branchLabel(item.branch_name_ar)}
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

      <section className="section section-alt">
        <div className="container">
          <SectionHeading title="فروع المعهد" subtitle="فروعنا في محافظات الجمهورية اليمنية" to="/branches" linkText="جميع الفروع" />
          <div className="branches-grid">
            {branches.map((b, bi) => (
              <article key={b.id} className="card branch-card">
                <img src={branchImages[b.name_ar] ?? Object.values(branchImages)[bi % Object.values(branchImages).length]} alt="" className="branch-cover" loading="lazy" />
                <div className="branch-body">
                  <span className="branch-name">{b.name_ar}</span>
                  <span className="branch-phone" dir="ltr">{b.phone ?? '—'}</span>
                  {b.address && <span className="branch-address">{b.address}</span>}
                </div>
              </article>
            ))}
            {branches.length === 0 && <p className="muted">لا توجد فروع مسجلة.</p>}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2>انضم إلى صفوف كوادرنا المؤهلة</h2>
            <p>سجّل الآن في أحد برامجنا الأكاديمية أو دوراتنا التدريبية وابدأ مسارك المهني.</p>
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