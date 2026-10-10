import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { branchTitle } from '../lib/branch.js';
import { collegeHeadNoun, collegeHeadWord } from '../lib/college.js';

function stripDept(name) {
  return (name ?? '').replace(/^قسم\s+/, '');
}

function CollegeCard({ college, departments, open, onToggle }) {
  const about = (college.about ?? '').trim();
  const excerpt = about.length > 150 ? `${about.slice(0, 150).trim()}…` : about;
  const backTo = college.branch_slug ? `/branches/${college.branch_slug}` : '/branches';
  const programs = departments.reduce((sum, d) => sum + (Number(d.programs_count) || 0), 0);

  return (
    <article className={`college-card${open ? ' is-open' : ''}`}>
      <button type="button" className="college-card-head" aria-expanded={open} onClick={onToggle}>
        <span className="college-card-cover" aria-hidden="true">
          {college.image ? (
            <img src={college.image} alt="" loading="lazy" />
          ) : (
            <span>{college.name_ar?.slice(0, 1) ?? 'ك'}</span>
          )}
        </span>
        <span className="college-card-main">
          <span className="college-card-name">{college.name_ar}</span>
          {college.name_en && <span className="college-card-en" dir="ltr">{college.name_en}</span>}
          {(college.dean_name_ar || college.branch_name_ar) && (
            <span className="college-card-meta">
              {college.dean_name_ar && (
                <span>{collegeHeadWord(college.name_ar)} {collegeHeadNoun(college.name_ar)}: {college.dean_name_ar}</span>
              )}
              {college.branch_name_ar && (
                <span className="college-card-branch">{branchTitle(college.branch_name_ar) ?? college.branch_name_ar}</span>
              )}
            </span>
          )}
        </span>
        <span className="college-card-stats">
          <span className="college-card-stat"><b>{departments.length}</b><small>قسم</small></span>
          <span className="college-card-stat"><b>{programs}</b><small>برنامج</small></span>
        </span>
        <span className="college-card-caret" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="college-card-body">
          {excerpt && <p className="college-card-about">{excerpt}</p>}
          {departments.length > 0 ? (
            <div className="dept-cards">
              {departments.map((d) => (
                <Link key={d.id} to={`/departments/${d.id}`} className="dept-card">
                  <span className="dept-card-name">{stripDept(d.name_ar)}</span>
                  <span className="dept-card-count">{d.programs_count ?? 0} برنامج</span>
                  <span className="dept-card-arrow" aria-hidden="true">←</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">لا توجد أقسام مسجلة لهذه الكلية بعد.</p>
          )}
          <div className="college-card-actions">
            <Link to={`/colleges/${college.id}`} className="btn btn-outline">صفحة الكلية</Link>
            {college.branch_slug && (
              <Link to={backTo} className="btn btn-soft">
                فرع {branchTitle(college.branch_name_ar) ?? ''}
              </Link>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export default function CollegesList() {
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openIds, setOpenIds] = useState(() => new Set());

  usePageMeta(
    'الكليات والمراكز والأقسام',
    'استعرض كليات المعهد الوطني للعلوم الإدارية ومراكزه وأقسامه العلمية وعدد برامج كل قسم.',
  );

  useEffect(() => {
    api.get('/public/colleges').then(setColleges).catch(() => {});
    api.get('/public/departments').then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    setOpenIds((prev) => (prev.size || colleges.length === 0 ? prev : new Set([colleges[0].id])));
  }, [colleges]);

  const deptsByCollege = useMemo(() => {
    const m = new Map();
    for (const d of departments) {
      if (!m.has(d.college_id)) m.set(d.college_id, []);
      m.get(d.college_id).push(d);
    }
    return m;
  }, [departments]);

  const programsTotal = useMemo(
    () => departments.reduce((sum, d) => sum + (Number(d.programs_count) || 0), 0),
    [departments],
  );

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <section className="programs-hero colleges-hero">
        <div className="container programs-hero-inner">
          <p className="programs-hero-eyebrow">الهيكل الأكاديمي للمعهد الوطني للعلوم الإدارية</p>
          <h1>الكليات والمراكز والأقسام</h1>
          <p className="programs-hero-sub">
            تأسست كليات المعهد ومراكزه لتقديم برامج البكالوريوس والماجستير والدبلوم.
            اضغط على أي كلية لعرض أقسامها العلمية وعدد البرامج في كل قسم.
          </p>
          <div className="programs-hero-strip">
            <div className="ph-stat">
              <span className="ph-stat-num">{colleges.length}</span>
              <span className="ph-stat-label">الكليات والمراكز</span>
            </div>
            <div className="ph-stat">
              <span className="ph-stat-num">{departments.length}</span>
              <span className="ph-stat-label">الأقسام العلمية</span>
            </div>
            <div className="ph-stat">
              <span className="ph-stat-num">{programsTotal}</span>
              <span className="ph-stat-label">البرامج الأكاديمية</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {colleges.length === 0 && <p className="muted">لا توجد كليات منشورة حاليًا.</p>}
          <div className="college-cards">
            {colleges.map((c) => (
              <CollegeCard
                key={c.id}
                college={c}
                departments={deptsByCollege.get(c.id) ?? []}
                open={openIds.has(c.id)}
                onToggle={() => toggle(c.id)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
