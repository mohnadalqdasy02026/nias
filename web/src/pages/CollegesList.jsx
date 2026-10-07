import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { branchTitle } from '../lib/branch.js';
import { collegeHeadNoun, collegeHeadWord } from '../lib/college.js';

function CollegeCard({ college, departments = [] }) {
  const about = (college.about ?? '').trim();
  const excerpt = about.length > 160 ? `${about.slice(0, 160).trim()}…` : about;
  const backTo = college.branch_slug ? `/branches/${college.branch_slug}` : '/branches';
  return (
    <article className="college-list-card">
      <Link to={`/colleges/${college.id}`} className="college-list-card-cover" aria-label={college.name_ar}>
        {college.image ? (
          <img src={college.image} alt="" loading="lazy" />
        ) : (
          <span className="college-list-card-letter" aria-hidden="true">{college.name_ar?.slice(0, 1) ?? 'ك'}</span>
        )}
      </Link>
      <div className="college-list-card-body">
        <h2 className="college-list-card-name">
          <Link to={`/colleges/${college.id}`}>{college.name_ar}</Link>
        </h2>
        {college.name_en && <span className="college-list-card-en" dir="ltr">{college.name_en}</span>}
        <div className="college-list-card-meta">
          {college.dean_name_ar && (
            <span className="college-list-card-dean">{collegeHeadWord(college.name_ar)} {collegeHeadNoun(college.name_ar)}: {college.dean_name_ar}</span>
          )}
          {college.branch_name_ar && (
            <Link to={backTo} className="college-list-card-branch">{branchTitle(college.branch_name_ar) ?? college.branch_name_ar}</Link>
          )}
        </div>
        {excerpt && <p className="college-list-card-about">{excerpt}</p>}
        {departments.length > 0 && (
          <div className="college-list-depts">
            <span className="college-list-depts-label">الأقسام العلمية ({departments.length})</span>
            <div className="college-list-depts-chips">
              {departments.map((d) => (
                <Link key={d.id} to={`/departments/${d.id}`}>{d.name_ar.replace(/^قسم\s+/, '')}</Link>
              ))}
            </div>
          </div>
        )}
        <Link to={`/colleges/${college.id}`} className="college-list-card-cta">التفاصيل ←</Link>
      </div>
    </article>
  );
}

export default function CollegesList() {
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);

  usePageMeta(
    'الكليات والمراكز والأقسام',
    'استعرض كليات المعهد الوطني للعلوم الإدارية ومراكزه وأقسامه العلمية ونبذة عن كل منها.',
  );

  useEffect(() => {
    api.get('/public/colleges').then(setColleges).catch(() => {});
    api.get('/public/departments').then(setDepartments).catch(() => {});
  }, []);

  const groupedDepartments = useMemo(() => {
    const map = new Map();
    for (const c of colleges) map.set(c.id, { college: c, items: [] });
    for (const d of departments) {
      if (!map.has(d.college_id)) map.set(d.college_id, { college: null, items: [] });
      map.get(d.college_id).items.push(d);
    }
    return [...map.values()].filter((g) => g.college || g.items.length > 0);
  }, [colleges, departments]);

  const deptsByCollege = useMemo(() => {
    const m = new Map();
    for (const d of departments) {
      if (!m.has(d.college_id)) m.set(d.college_id, []);
      m.get(d.college_id).push(d);
    }
    return m;
  }, [departments]);

  const deptsTotal = departments.length;

  return (
    <>
      <section className="programs-hero colleges-hero">
        <div className="container programs-hero-inner">
          <p className="programs-hero-eyebrow">الهيكل الأكاديمي للمعهد الوطني للعلوم الإدارية</p>
          <h1>الكليات والمراكز والأقسام</h1>
          <p className="programs-hero-sub">
            تأسست كليات المعهد ومراكزه لتقديم برامج البكالوريوس والماجستير والدبلوم،
            ويشرف على كل منها عميده ونخبة من أعضاء هيئة التدريس.
          </p>
          <div className="programs-hero-strip">
            <div className="ph-stat">
              <span className="ph-stat-num">{colleges.length}</span>
              <span className="ph-stat-label">الكليات والمراكز</span>
            </div>
            <div className="ph-stat">
              <span className="ph-stat-num">{deptsTotal}</span>
              <span className="ph-stat-label">الأقسام العلمية</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">الكليات والمراكز</h2>
          {colleges.length === 0 && <p className="muted">لا توجد كليات منشورة حاليًا.</p>}
          <div className="colleges-list-grid">
            {colleges.map((c) => <CollegeCard key={c.id} college={c} departments={deptsByCollege.get(c.id) ?? []} />)}
          </div>

          {deptsTotal > 0 && (
            <div className="colleges-depts">
              <h2 className="section-title">الأقسام العلمية</h2>
              <div className="colleges-depts-list">
                {groupedDepartments.map((g) => (
                  <section key={g.college?.id ?? `dept-${g.items[0]?.id}`} className="colleges-depts-group">
                    <h3 className="colleges-depts-title">
                      {g.college ? (
                        <Link to={`/colleges/${g.college.id}`}>{g.college.name_ar}</Link>
                      ) : (
                        'الأقسام'
                      )}
                    </h3>
                    <ul className="colleges-depts-chips">
                      {g.items.map((d) => (
                        <li key={d.id}>
                          {g.college ? (
                            <Link to={`/colleges/${g.college.id}`}>{d.name_ar}</Link>
                          ) : (
                            d.name_ar
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
