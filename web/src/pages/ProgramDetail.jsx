import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { branchTitle } from '../lib/branch.js';

const typeMeta = {
  bachelor: { label: 'بكالوريوس', plural: 'برامج البكالوريوس' },
  master_academic: { label: 'ماجستير أكاديمي', plural: 'الماجستير الأكاديمي' },
  master_executive: { label: 'ماجستير تنفيذي', plural: 'الماجستير التنفيذي' },
  diploma: { label: 'دبلوم متوسط', plural: 'الدبلوم المتوسط' },
};

const coverByType = {
  bachelor: '/uploads/design/site/main_1786788776_852.jpg',
  master_academic: '/uploads/design/site/main_1783197092_280.jpg',
  master_executive: '/uploads/design/site/main_1783197092_280.jpg',
  diploma: '/uploads/design/site/main_1782830791_165.jpg',
};

const iconPaths = {
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM20 17v4',
  buildings: 'M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h4a2 2 0 0 1 2 2v10M9 7h2M9 11h2M9 15h2',
  code: 'M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16',
  grad: 'M22 10l-10-5L2 10l10 5 10-5zM6 12v5c3 2 7 2 10 0v-5M22 10v6',
  clock: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM12 6v6l4 2',
  locations: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
};

function Icon({ name, size = 18, ariaHidden = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden={ariaHidden ? 'true' : undefined}>
      <path d={iconPaths[name] ?? iconPaths.book} />
    </svg>
  );
}

export default function ProgramDetail() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('overview');

  usePageMeta(program?.title_ar ? `برنامج ${program.title_ar}` : 'البرنامج الأكاديمي', program?.summary_ar ?? 'برنامج من برامج المعهد الوطني للعلوم الإدارية.');

  useEffect(() => {
    setError(null);
    setProgram(null);
    setTab('overview');
    api.get(`/public/programs/${id}`)
      .then(setProgram)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <div className="card program-detail-empty">
            <h2>البرنامج غير موجود</h2>
            <p className="muted">تعذر العثور على هذا البرنامج أو أنه غير نشط.</p>
            <Link to="/programs" className="btn btn-primary">العودة إلى البرامج</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!program) {
    return (
      <section className="section">
        <div className="container"><p className="muted">جاري التحميل...</p></div>
      </section>
    );
  }

  const type = typeMeta[program.program_type] ?? { label: program.program_type };
  const college = program.college_name_ar ?? 'المعهد الوطني للعلوم الإدارية';
  const department = program.department_name_ar ?? null;
  const cover = program.image_url || coverByType[program.program_type];

  const studyPlan = program.studyPlan ?? null;
  const planCourses = studyPlan?.courses ?? [];
  const planFacts = [];
  if (studyPlan && planCourses.length > 0) {
    const maxLevel = Math.max(...studyPlan.levels);
    const durationLabel = { 4: 'أربع سنوات', 3: 'ثلاث سنوات', 2: 'سنتان', 1: 'سنة واحدة' }[maxLevel] ?? `${maxLevel} مستويات`;
    planFacts.push(
      { icon: 'clock', label: 'مدة الدراسة', value: durationLabel },
      { icon: 'book', label: 'الساعات المعتمدة', value: `${studyPlan.totalHours} ساعة` },
    );
  }

  const facts = [
    { icon: 'grad', label: 'الدرجة العلمية', value: type.plural ?? type.label },
    { icon: 'book', label: 'الكلية', value: college, link: program.college_id ? `/colleges/${program.college_id}` : null },
    { icon: 'list', label: 'القسم', value: department ?? '—', link: department && program.department_id ? `/departments/${program.department_id}` : null },
    { icon: 'locations', label: 'الفرع', value: program.branch_name_ar ? branchTitle(program.branch_name_ar) : '—' },
    ...planFacts,
  ];

  const admissionConditions = (() => {
    if (program.program_type === 'bachelor') {
      return [
        'الحصول على شهادة الثانوية العامة (القسم العلمي أو الأدبي) أو ما يعادلها بمعدل لا يقل عن الحد المعتمد.',
        'التقديم عبر بوابة التنسيق الموحد لوزارة التربية والتعليم والبحث العلمي.',
        'رفع المستندات المطلوبة كاملة: الشهادة، الصورة الشخصية، والهوية الوطنية.',
        'اجتياز المفاضلة التنافسية وفق المعدل والأماكن المتاحة.',
        'استيفاء أي شروط خاصة يقررها القسم أو الكلية.',
      ];
    }
    if (program.program_type === 'diploma') {
      return [
        'الحصول على شهادة الثانوية العامة أو ما يعادلها.',
        'التقديم عبر بوابة التنسيق الموحد للجامعات اليمنية.',
        'رفع المستندات المطلوبة كاملة.',
        'استيفاء المفاضلة التنافسية حسب الأماكن المتاحة.',
      ];
    }
    return [
      'الحصول على درجة البكالوريوس في تخصص ذي صلة من جهة معترف بها بتقدير لا يقل عن «جيد».',
      'اجتياز المفاضلة والمقابلة العلمية التي يقررها القسم.',
      'رفع المستندات المطلوبة: البكالوريوس، كشف الدرجات، الهوية، والسيرة الذاتية.',
      'استيفاء أي متطلبات إضافية يحددها البرنامج.',
    ];
  })();

  const tabs = [
    { key: 'overview', label: 'نبذة عن البرنامج' },
    ...(program.outcomes ? [{ key: 'outcomes', label: 'مخرجات التعلم' }] : []),
    { key: 'admission', label: 'شروط القبول' },
    ...(studyPlan && planCourses.length > 0 ? [{ key: 'plan', label: `الخطة الدراسية (${studyPlan.totalHours} ساعة)` }] : []),
  ];
  const activeTab = tab && tabs.some((t) => t.key === tab) ? tab : 'overview';

  return (
    <>
      <section className="program-detail-hero">
        <div className="container program-detail-hero-inner">
          <nav className="college-page-crumbs" aria-label="مسار الصفحة">
            <Link to="/programs">البرامج</Link>
            {program.college_id && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={`/colleges/${program.college_id}`}>{college}</Link>
              </>
            )}
            {department && program.department_id && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={`/departments/${program.department_id}`}>{department}</Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{program.name_ar ?? program.name_en}</span>
          </nav>
          <p className="programs-hero-eyebrow">التفاصيل — {type.label}</p>
          <h1>{program.name_ar ?? program.name_en}</h1>
          <p className="programs-hero-sub">
            {college}{department ? ` — ${department}` : ''}
            {program.branch_name_ar ? (
              <>
                {' '}
                <Link to={`/branches/${program.branch_slug}`} className="program-branch-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h4a2 2 0 0 1 2 2v10M9 7h2M9 11h2M9 15h2" /></svg>
                  {branchTitle(program.branch_name_ar)}
                </Link>
              </>
            ) : null}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container program-detail-layout">
          <div className="program-detail-main">
            <div className="program-detail-cover">
              <img src={cover} alt={program.name_ar ?? program.name_en} />
            </div>

            <div className="program-detail-tabs" role="tablist" aria-label="أقسام صفحة البرنامج">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === t.key}
                  className={`program-detail-tab${activeTab === t.key ? ' is-active' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="card program-detail-card" role="tabpanel">
                <h2>نبذة عن البرنامج</h2>
                <p className="program-detail-text">{program.description || 'لا يوجد وصف متاح لهذا البرنامج حاليًا.'}</p>
              </div>
            )}

            {activeTab === 'outcomes' && program.outcomes && (() => {
                const parts = program.outcomes
                  .split(/\n|\(\d+\)/)
                  .map((s) => s.trim())
                  .filter(Boolean);
                const intro = parts[0];
                const items = parts.slice(1);
                return (
                  <div className="card program-detail-card" role="tabpanel">
                    <h2>مخرجات التعلم</h2>
                    {intro && <p className="program-detail-text program-detail-outcomes-intro">{intro}</p>}
                    {items.length > 0 && (
                      <ul className="program-detail-outcomes">
                        {items.map((s) => <li key={s}>{s}</li>)}
                      </ul>
                    )}
                  </div>
                );
              })()}

            {activeTab === 'admission' && (
              <div className="card program-detail-card" role="tabpanel">
                <h2>شروط القبول والتسجيل</h2>
                <ol className="content-list program-detail-conditions">
                  {admissionConditions.map((c) => <li key={c}>{c}</li>)}
                </ol>
                <Link to="/apply" className="btn btn-soft program-detail-tablink">اطّلع على خطوات التسجيل ←</Link>
              </div>
            )}

            {activeTab === 'plan' && (() => {
              if (!studyPlan || planCourses.length === 0) return null;
              const groups = new Map();
              planCourses.forEach((c, i) => {
                const key = `${c.level_no}|${c.semester_no}`;
                if (!groups.has(key)) groups.set(key, { level_no: c.level_no, semester_no: c.semester_no, items: [] });
                groups.get(key).items.push({ ...c, _i: i });
              });
              const sorted = [...groups.values()].sort(
                (a, b) => a.level_no - b.level_no || a.semester_no - b.semester_no,
              );
              const semesterCount = new Set(planCourses.map((c) => `${c.level_no}|${c.semester_no}`)).size;
              return (
                <div className="card program-detail-card" role="tabpanel">
                  <h2>الخطة الدراسية</h2>
                  <p className="program-detail-text program-detail-plan-intro">
                    تمتد الدراسة على {semesterCount === 1 ? 'فصل دراسي واحد' : `${semesterCount} فصول دراسية`}
                    {' '}وبإجمالي {studyPlan.totalHours} ساعة معتمدة.
                  </p>
                  <div className="program-plan">
                    {sorted.map((g) => (
                      <details key={`${g.level_no}|${g.semester_no}`} className="program-plan-sem" open={g.level_no === 1 && g.semester_no === 1}>
                        <summary>المستوى {g.level_no} — الفصل {g.semester_no}</summary>
                        <div className="program-plan-table-wrap">
                          <table className="program-plan-table">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>الرمز</th>
                                <th>المقرر</th>
                                <th>الساعات</th>
                                <th>النوع</th>
                              </tr>
                            </thead>
                            <tbody>
                              {g.items.map((c) => (
                                <tr key={c._i}>
                                  <td>{c._i + 1}</td>
                                  <td dir="ltr">{c.course_code ?? '—'}</td>
                                  <td className="program-plan-name">{c.name_ar}</td>
                                  <td>{c.credit_hours}</td>
                                  <td>{c.is_optional ? <span className="program-plan-optional">اختياري</span> : 'إجباري'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              );
            })()}

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

          <aside className="program-detail-side">
            <div className="card program-detail-card program-detail-overview">
              <h3>لمحة سريعة</h3>
              <ul className="program-detail-facts">
                {facts.map((f) => (
                  <li key={f.label}>
                    <span className="program-detail-fact-icon"><Icon name={f.icon} size={17} /></span>
                    <div>
                      <small>{f.label}</small>
                      {f.link ? <strong><Link to={f.link}>{f.value}</Link></strong> : <strong>{f.value}</strong>}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="program-detail-status">
                {program.admission_open ? (
                  <span className="program-badge program-badge--open">التسجيل مفتوح حاليًا</span>
                ) : (
                  <span className="program-badge program-badge--closed">التسجيل مغلق حاليًا</span>
                )}
              </div>
              <Link to="/programs" className="btn btn-soft program-detail-back">العودة إلى جميع البرامج</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}