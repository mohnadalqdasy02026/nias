import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import { branchTitle } from '../lib/branch.js';

const typeMeta = {
  bachelor: { label: 'بكالوريوس', plural: 'برامج البكالوريوس' },
  master_academic: { label: 'ماجستير أكاديمي', plural: 'الماجستير الأكاديمي' },
  master_executive: { label: 'ماجستير تنفيذي', plural: 'الماجستير التنفيذي' },
  diploma: { label: 'دبلوم متوسط', plural: 'الدبلوم المتوسط' },
};

// التسلسل الهرمي المعتمد من العميد:
// 1) كلية الدراسات العليا  2) كلية البكالوريوس  3) مراكز وأقسام الدبلوم
const TIERS = [
  {
    key: 'graduate',
    tab: 'دراسات عليا',
    title: 'كلية الدراسات العليا',
    desc: 'برامج الماجستير الأكاديمي والتنفيذي، وهي أعلى درجات التخصص في المعهد.',
    types: ['master_academic', 'master_executive'],
    icon: 'grad',
  },
  {
    key: 'bachelor',
    tab: 'بكالوريوس',
    title: 'كلية البكالوريوس',
    desc: 'كليات المعهد والتخصصات المتاحة لنيل درجة البكالوريوس.',
    types: ['bachelor'],
    icon: 'buildings',
  },
  {
    key: 'diploma',
    tab: 'دبلوم متوسط',
    title: 'مراكز وأقسام الدبلوم',
    desc: 'برامج الدبلوم المتوسطة وتقدمها مراكز المعهد وأقسامه.',
    types: ['diploma'],
    icon: 'book',
  },
];

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
  const branch = branchTitle(program.branch_name_ar);
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
        {program.department_name_ar && (
          <span className="program-card-dept">
            <Icon name="book" size={14} />
            {program.department_name_ar}
          </span>
        )}
        {branch && (
          <span className="program-chip program-chip--branch">
            <Icon name="locations" size={14} />
            {branch}
          </span>
        )}
        <h3>{program.name_ar ?? program.name_en}</h3>
        {program.description && <p className="program-card-desc">{program.description}</p>}
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

function groupByCollege(list) {
  const map = new Map();
  for (const p of list) {
    const key = p.college_name_ar ?? 'المعهد الوطني للعلوم الإدارية';
    if (!map.has(key)) map.set(key, { name: key, collegeId: p.college_id ?? null, items: [] });
    map.get(key).items.push(p);
  }
  return [...map.values()];
}

function TierSection({ tier, programs, compact }) {
  if (programs.length === 0) return null;
  const colleges = groupByCollege(programs);
  const collegeId = colleges.length === 1 ? colleges[0].collegeId : null;
  return (
    <section className="programs-tier" aria-labelledby={`tier-${tier.key}`}>
      <div className="programs-tier-head">
        <span className="programs-tier-icon" aria-hidden="true"><Icon name={tier.icon} size={22} /></span>
        <div>
          <h2 className="programs-tier-title" id={`tier-${tier.key}`}>{tier.title}</h2>
          {!compact && <p className="programs-tier-desc">{tier.desc}</p>}
        </div>
        {collegeId && (
          <Link to={`/colleges/${collegeId}`} className="programs-tier-link">استعراض الكلية ←</Link>
        )}
      </div>
      <div className="programs-tier-groups">
        {colleges.map((g) => (
          <div key={g.name} className="programs-tier-group">
            {colleges.length > 1 && <h3 className="programs-tier-group-title">{g.name}</h3>}
            <div className="programs-results">
              {g.items.map((p) => <ProgramCard key={p.id} program={p} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [active, setActive] = useState('all');
  const [search, setSearch] = useState('');
  const settings = useSiteSettings();
  const admissionUrl = settings?.general?.ministry_admission_url || 'https://oasyemen.net';

  usePageMeta('البرامج الأكاديمية', 'برامج المعهد الوطني للعلوم الإدارية بالترتيب: كلية الدراسات العليا، ثم البكالوريوس، ثم مراكز وأقسام الدبلوم.');

  useEffect(() => {
    api.get('/public/programs').then(setPrograms).catch(() => {});
  }, []);

  const tierOf = useMemo(() => {
    const m = new Map();
    for (const t of TIERS) for (const type of t.types) m.set(type, t);
    return m;
  }, []);

  const byTier = useMemo(() => {
    const g = {};
    for (const t of TIERS) g[t.key] = programs.filter((p) => tierOf.get(p.program_type) === t);
    return g;
  }, [programs, tierOf]);

  const counts = useMemo(() => {
    const c = { all: programs.length };
    for (const t of TIERS) c[t.key] = byTier[t.key].length;
    return c;
  }, [programs, byTier]);

  const searching = search.trim().length > 0;
  const searchResults = searching
    ? programs.filter((p) => (p.name_ar ?? '').includes(search.trim()) || (p.description ?? '').includes(search.trim()))
    : [];

  const tabs = [
    { key: 'all', label: 'الكل' },
    ...TIERS.filter((t) => counts[t.key] > 0).map((t) => ({ key: t.key, label: t.tab })),
  ];

  const activeTier = TIERS.find((t) => t.key === active);
  const shownTiers = activeTier ? [activeTier] : TIERS;

  const stats = TIERS.map((t) => ({ key: t.key, label: t.title.replace('كلية ', '').replace('مراكز وأقسام ', ''), value: counts[t.key] ?? 0 }));

  return (
    <>
      <section className="programs-hero">
        <div className="container programs-hero-inner">
          <p className="programs-hero-eyebrow">{programs.length} برنامجًا أكاديميًا معتمدًا — التسجيل عبر بوابة التنسيق</p>
          <h1>برامجنا الأكاديمية</h1>
          <p className="programs-hero-sub">
            تُقدَّم برامجنا وفق تسلسل هرمي واضح: كلية الدراسات العليا، ثم كلية البكالوريوس، ثم مراكز وأقسام الدبلوم،
            وفق أعلى معايير الجودة الأكاديمية المعتمدة.
          </p>
          <div className="programs-hero-strip">
            {stats.map((s) => (
              <div className="ph-stat" key={s.key}>
                <span className="ph-stat-num">{s.value}</span>
                <span className="ph-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="programs-toolbar">
            <div className="programs-tabs" role="tablist" aria-label="تصفية حسب المستوى الدراسي">
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

          {searching ? (
            <div className="programs-results">
              {searchResults.length === 0 && <p className="muted">لا توجد برامج مطابقة.</p>}
              {searchResults.map((p) => <ProgramCard key={p.id} program={p} />)}
            </div>
          ) : (
            shownTiers.map((t) => <TierSection key={t.key} tier={t} programs={byTier[t.key]} />)
          )}

          {!searching && programs.length === 0 && <p className="muted">لا توجد برامج منشورة حاليًا.</p>}

          <div className="card admission-cta admission-cta--bottom">
            <div>
              <h3>الترشيح والتسجيل عبر بوابة التنسيق الموحد</h3>
              <p>تتم تقديم طلبات القبول والتسجيل للبرامج الأكاديمية عبر بوابة التنسيق الموحد المعتمدة من وزارة التربية والتعليم والبحث العلمي.</p>
            </div>
            <a
              className="btn btn-primary"
              href={admissionUrl}
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
