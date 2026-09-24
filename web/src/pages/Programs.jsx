import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { branchLabel, isHeadquartersName } from '../lib/branch.js';

const typeMeta = {
  bachelor: { label: 'بكالوريوس', plural: 'برامج البكالوريوس' },
  master_academic: { label: 'ماجستير أكاديمي', plural: 'الماجستير الأكاديمي' },
  master_executive: { label: 'ماجستير تنفيذي', plural: 'الماجستير التنفيذي' },
  diploma: { label: 'دبلوم متوسط', plural: 'الدبلوم المتوسط' },
};

const typeOrder = ['bachelor', 'master_academic', 'master_executive', 'diploma'];

const coverByType = {
  bachelor: '/uploads/design/site/main_1786788776_852.jpg',
  master_academic: '/uploads/design/site/main_1783197092_280.jpg',
  master_executive: '/uploads/design/site/main_1783197092_280.jpg',
  diploma: '/uploads/design/site/main_1782830791_165.jpg',
};

const collegeIcon = {
  'كلية العلوم الإدارية': 'buildings',
  'كلية تكنولوجيا المعلومات': 'code',
  'مركز الدبلومات المتوسطة': 'book',
  'كلية الدراسات العليا': 'grad',
};

const iconPaths = {
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM20 17v4',
  buildings: 'M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h4a2 2 0 0 1 2 2v10M9 7h2M9 11h2M9 15h2',
  code: 'M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16',
  grad: 'M22 10l-10-5L2 10l10 5 10-5zM6 12v5c3 2 7 2 10 0v-5M22 10v6',
  clock: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM12 6v6l4 2',
  locations: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
};

function Icon({ name, size = 18, ariaHidden = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden={ariaHidden ? 'true' : undefined}>
      <path d={iconPaths[name] ?? iconPaths.book} />
    </svg>
  );
}

function ProgramCard({ program }) {
  const type = typeMeta[program.program_type] ?? { label: program.program_type };
  const college = program.college_name_ar ?? 'المعهد الوطني للعلوم الإدارية';
  const cover = program.image_url || coverByType[program.program_type];
  const branch = branchLabel(program.branch_name_ar);
  return (
    <article className={`program-card program-card--${program.program_type}`}>
      <div className="program-card-cover">
        <img src={cover} alt="" loading="lazy" />
        <span className="program-card-type">{type.label}</span>
      </div>
      <div className="program-card-body">
        <span className="program-card-college">
          <Icon name={collegeIcon[college] ?? 'book'} size={16} />
          {college}
        </span>
        {branch && (
          <span className="program-chip program-chip--branch">
            <Icon name="locations" size={14} />
            {isHeadquartersName(branch) ? branch : (String(branch).includes('فرع') ? branch : `فرع ${branch}`)}
          </span>
        )}
        <h3>{program.name_ar ?? program.name_en}</h3>
        <div className="program-card-footer">
          {program.admission_open ? (
            <span className="program-badge program-badge--open">التسجيل مفتوح</span>
          ) : (
            <span className="program-badge program-badge--closed">التسجيل مغلق</span>
          )}
          <Link to={`/programs/${program.id}`} className="program-card-cta">
            التفاصيل
            <span aria-hidden="true">←</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [active, setActive] = useState('all');
  const [search, setSearch] = useState('');

  usePageMeta('البرامج الأكاديمية', 'استعرض برامج المعهد الوطني للعلوم الإدارية: بكالوريوس، ماجستير أكاديمي وتنفيذي، ودبلوم متوسط.');

  useEffect(() => {
    api.get('/public/programs').then(setPrograms).catch(() => {});
  }, []);

  const groups = useMemo(() => {
    const g = {};
    for (const t of typeOrder) g[t] = programs.filter((p) => p.program_type === t);
    return g;
  }, [programs]);

  const counts = useMemo(() => {
    const c = { all: programs.length };
    for (const t of typeOrder) c[t] = groups[t].length;
    return c;
  }, [programs, groups]);

  const visible = active !== 'all' ? (groups[active] ?? []) : programs;
  const results = search.trim()
    ? visible.filter((p) => (p.name_ar ?? '').includes(search.trim()) || (p.description ?? '').includes(search.trim()))
    : visible;

  const tabs = [
    { key: 'all', label: 'الكل', icon: 'book' },
    ...typeOrder.filter((t) => counts[t] > 0).map((t) => ({ key: t, label: typeMeta[t].label, icon: 'grad' })),
  ];

  const mastersCount = (counts.master_academic ?? 0) + (counts.master_executive ?? 0);

  return (
    <>
      <section className="programs-hero">
        <div className="container programs-hero-inner">
          <p className="programs-hero-eyebrow">{programs.length} برنامجًا أكاديميًا معتمدًا — التسجيل عبر بوابة التنسيق</p>
          <h1>برامجنا الأكاديمية</h1>
          <p className="programs-hero-sub">
            برامج بكالوريوس وماجستير ودبلوم متوسط، تقدمها كليات المعهد الوطني للعلوم الإدارية
            وفق أعلى معايير الجودة الأكاديمية، لإعداد كوادر مؤهلة لسوق العمل.
          </p>
          <div className="programs-hero-strip">
            <div className="ph-stat">
              <span className="ph-stat-num">{counts.bachelor ?? 0}</span>
              <span className="ph-stat-label">بكالوريوس</span>
            </div>
            <div className="ph-stat">
              <span className="ph-stat-num">{mastersCount}</span>
              <span className="ph-stat-label">ماجستير</span>
            </div>
            <div className="ph-stat">
              <span className="ph-stat-num">{counts.diploma ?? 0}</span>
              <span className="ph-stat-label">دبلوم متوسط</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="programs-toolbar">
            <div className="programs-tabs" role="tablist" aria-label="تصفية حسب الدرجة العلمية">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active === tab.key}
                  className={`programs-tab${active === tab.key ? ' programs-tab--active' : ''}`}
                  onClick={() => setActive(tab.key)}
                >
                  <span>{tab.label}</span>
                  <span className="programs-tab-count">{counts[tab.key] ?? 0}</span>
                </button>
              ))}
            </div>
            <div className="programs-search">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن برنامج..."
                aria-label="ابحث عن برنامج"
              />
            </div>
          </div>

          <div className="programs-results">
            {results.length === 0 && <p className="muted">لا توجد برامج مطابقة.</p>}
            {results.map((p) => <ProgramCard key={p.id} program={p} />)}
          </div>

          <div className="card admission-cta admission-cta--bottom">
            <div>
              <h3>الترشيح والتسجيل عبر بوابة التنسيق الموحد</h3>
              <p>تتم تقديم طلبات القبول والتسجيل للبرامج الأكاديمية عبر بوابة التنسيق الموحد المعتمدة من وزارة التربية والتعليم والبحث العلمي.</p>
            </div>
            <a
              className="btn btn-primary"
              href="https://oasyemen.net/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="الانتقال إلى بوابة التنسيق الموحد للجامعات اليمنية (رابط خارجي)"
            >
              سجّل عبر البوابة
            </a>
          </div>
        </div>
      </section>
    </>
  );
}