import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { branchLabel } from '../lib/branch.js';

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

  usePageMeta(program?.title_ar ? `برنامج ${program.title_ar}` : 'البرنامج الأكاديمي', program?.summary_ar ?? 'برنامج من برامج المعهد الوطني للعلوم الإدارية.');

  useEffect(() => {
    setError(null);
    setProgram(null);
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

  const facts = [
    { icon: 'grad', label: 'الدرجة العلمية', value: type.plural ?? type.label },
    { icon: 'book', label: 'الكلية', value: college },
    { icon: 'list', label: 'القسم', value: department ?? '—' },
    { icon: 'locations', label: 'الفرع', value: program.branch_name_ar ? branchLabel(program.branch_name_ar) : '—' },
  ];

  return (
    <>
      <section className="program-detail-hero">
        <div className="container program-detail-hero-inner">
          <p className="programs-hero-eyebrow">التفاصيل — {type.label}</p>
          <h1>{program.name_ar ?? program.name_en}</h1>
          <p className="programs-hero-sub">
            {college}{department ? ` — ${department}` : ''}
            {program.branch_name_ar ? (
              <>
                {' '}
                <Link to={`/branches/${program.branch_slug}`} className="program-branch-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h4a2 2 0 0 1 2 2v10M9 7h2M9 11h2M9 15h2" /></svg>
                  {branchLabel(program.branch_name_ar)}
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
              <img src={cover} alt="" />
            </div>

            <div className="card program-detail-card">
              <h2>نبذة عن البرنامج</h2>
              <p className="program-detail-text">{program.description || 'لا يوجد وصف متاح لهذا البرنامج حاليًا.'}</p>
            </div>

            {program.outcomes && (() => {
                const parts = program.outcomes
                  .split(/\n|\(\d+\)/)
                  .map((s) => s.trim())
                  .filter(Boolean);
                const intro = parts[0];
                const items = parts.slice(1);
                return (
                  <div className="card program-detail-card">
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

            <div className="card program-detail-card">
              <h2>شروط القبول والتسجيل</h2>
              <p className="program-detail-text">
                يتطلب التقديم على هذا البرنامج استيفاء شروط القبول المعتمدة وفق المعايير الأكاديمية للمعهد
                الوطني للعلوم الإدارية، والتسجيل يتم عبر بوابة التنسيق الموحد المعتمدة من وزارة التربية
                والتعليم والبحث العلمي.
              </p>
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

          <aside className="program-detail-side">
            <div className="card program-detail-card program-detail-overview">
              <h3>لمحة سريعة</h3>
              <ul className="program-detail-facts">
                {facts.map((f) => (
                  <li key={f.label}>
                    <span className="program-detail-fact-icon"><Icon name={f.icon} size={17} /></span>
                    <div>
                      <small>{f.label}</small>
                      <strong>{f.value}</strong>
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