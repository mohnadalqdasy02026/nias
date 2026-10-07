import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import { branchTitle } from '../lib/branch.js';

const typeLabel = {
  bachelor: 'بكالوريوس',
  diploma: 'دبلوم متوسط',
  master_executive: 'ماجستير تنفيذي',
  master_academic: 'ماجستير أكاديمي',
};

function HeadPhrase(nameAr) {
  return /^(أستاذة|دكتورة|أ\.د\.ة|هندسة|أمينة)/.test(nameAr) ? 'رئيسة القسم' : 'رئيس القسم';
}

function IconSVG({ d, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const paths = {
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM20 17v4',
  people: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  grad: 'M22 10l-10-5L2 10l10 5 10-5zM6 12v5c3 2 7 2 10 0v-5',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  locations: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  left: 'M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h4a2 2 0 0 1 2 2v10M9 7h2M9 11h2M9 15h2',
};

export default function DepartmentDetail() {
  const { id } = useParams();
  const [department, setDepartment] = useState(null);
  const [error, setError] = useState(null);
  const settings = useSiteSettings();
  const logo = settings?.general?.logo ?? '/uploads/design/site/logo.jpg';

  usePageMeta(
    department?.name_ar
      ? `قسم ${department.name_ar}${department.college_name_ar ? ` — ${department.college_name_ar}` : ''}`
      : 'القسم',
    department?.description ?? 'قسم من أقسام المعهد الوطني للعلوم الإدارية.',
  );

  useEffect(() => {
    setError(null);
    setDepartment(null);
    api.get(`/public/departments/${id}`)
      .then(setDepartment)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <div className="card department-page-empty">
            <h2>القسم غير موجود</h2>
            <p className="muted">تعذر العثور على هذا القسم.</p>
            <Link to="/colleges" className="btn btn-primary">العودة إلى الكليات</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!department) {
    return (
      <section className="section">
        <div className="container"><p className="muted">جاري التحميل...</p></div>
      </section>
    );
  }

  const head = department.head ?? null;
  const collegeLink = `/colleges/${department.college_id}`;

  return (
    <>
      <section className="department-page-hero">
        <div className="container">
          <nav className="college-page-crumbs" aria-label="مسار الصفحة">
            <Link to="/colleges">الكليات</Link>
            {department.college_name_ar && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={collegeLink}>{department.college_name_ar}</Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{department.name_ar}</span>
          </nav>
          <p className="department-page-eyebrow">قسم أكاديمي — {department.college_name_ar ?? 'المعهد'}</p>
          <h1>{department.name_ar}</h1>
          <p className="department-page-sub">
            {department.college_name_ar}
            {department.branch_name_ar ? (
              <>
                {' '}—{' '}
                <Link to={`/branches/${department.branch_slug}`}>{branchTitle(department.branch_name_ar) ?? department.branch_name_ar}</Link>
              </>
            ) : null}
          </p>
          <div className="department-page-stats">
            <span className="department-page-stat"><IconSVG d={paths.list} size={15} /> {department.programs_count ?? 0} برنامج</span>
            <span className="department-page-stat"><IconSVG d={paths.people} size={15} /> {department.faculty_count ?? 0} عضو هيئة تدريس</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container department-page">
          <div className="department-page-grid">
            <div className="department-page-main">
              {department.description && (
                <div className="card department-page-card">
                  <h2><IconSVG d={paths.book} size={17} /> نظرة عامة على القسم</h2>
                  <p>{department.description}</p>
                </div>
              )}

              {department.programs?.length > 0 && (
                <div className="card department-page-card">
                  <h2><IconSVG d={paths.grad} size={17} /> البرامج الأكاديمية</h2>
                  <div className="department-programs-grid">
                    {department.programs.map((p) => (
                      <Link key={p.id} to={`/programs/${p.id}`} className="department-program-card">
                        <div className="department-program-top">
                          <span className="department-program-type">{typeLabel[p.program_type] ?? p.program_type}</span>
                          {p.admission_open && <span className="program-badge program-badge--open">التسجيل مفتوح</span>}
                        </div>
                        <h3>{p.name_ar ?? p.name_en}</h3>
                        {p.description && <p>{p.description.length > 130 ? `${p.description.slice(0, 130)}…` : p.description}</p>}
                        <span className="department-program-more">عرض تفاصيل البرنامج ←</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {department.faculty?.length > 0 && (
                <div className="card department-page-card">
                  <h2><IconSVG d={paths.people} size={17} /> أعضاء هيئة التدريس</h2>
                  <ul className="department-faculty-grid">
                    {department.faculty.map((f) => (
                      <li key={f.id} className="department-faculty-item">
                        <span className="department-faculty-avatar">
                          {f.photo ? <img src={f.photo} alt="" loading="lazy" /> : <IconSVG d={paths.people} size={16} />}
                        </span>
                        <div>
                          <strong>{f.name_ar ?? f.name_en}</strong>
                          {f.title && <span>{f.title}</span>}
                          {f.specialization && <small>{f.specialization}</small>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className="department-page-side">
              {head && (
                <div className="card department-page-head-card" aria-labelledby="dept-head-title">
                  <h2 id="dept-head-title">{HeadPhrase(head.name_ar ?? head.name_ar_en ?? '')}</h2>
                  <div className="department-page-head-inner">
                    <div className="department-page-head-photo">
                      {department.head_photo ? (
                        <img src={department.head_photo} alt={head.name_ar ?? ''} />
                      ) : (
                        <img src={logo} alt="شعار المعهد الوطني للعلوم الإدارية" />
                      )}
                    </div>
                    <div className="department-page-head-info">
                      <strong>{head.name_ar ?? head.name_en ?? ''}</strong>
                      {head.title && <span className="department-page-head-rank">{head.title}</span>}
                    </div>
                  </div>
                </div>
              )}

              <div className="card department-page-side-card">
                <h3>معلومات سريعة</h3>
                <ul className="department-side-list">
                  <li>
                    <span className="department-side-icon"><IconSVG d={paths.left} size={15} /></span>
                    <div><small>الكلية</small><strong>{department.college_name_ar ?? '—'}</strong></div>
                  </li>
                  <li>
                    <span className="department-side-icon"><IconSVG d={paths.locations} size={15} /></span>
                    <div><small>الفرع</small><strong>{department.branch_name_ar ? branchTitle(department.branch_name_ar) : '—'}</strong></div>
                  </li>
                  <li>
                    <span className="department-side-icon"><IconSVG d={paths.list} size={15} /></span>
                    <div><small>البرامج</small><strong>{department.programs_count ?? 0}</strong></div>
                  </li>
                </ul>
              </div>

              <Link to={collegeLink} className="btn btn-soft department-page-back">العودة إلى {department.college_name_ar ?? 'الكلية'}</Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}