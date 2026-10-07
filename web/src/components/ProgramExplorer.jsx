import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const typeLabel = {
  bachelor: 'بكالوريوس',
  diploma: 'دبلوم متوسط',
  master_executive: 'ماجستير تنفيذي',
  master_academic: 'ماجستير أكاديمي',
};

function deptShortName(name) {
  return (name ?? '').replace(/^قسم\s+/, '').replace(/^الأقسام\s+/, '') || name;
}

export default function ProgramExplorer({ colleges = [], departments = [], programs = [] }) {
  const [collegeId, setCollegeId] = useState('');
  const [deptId, setDeptId] = useState('');
  const id = (v) => (v == null || v === '' ? null : Number(v));

  const currentCollege = useMemo(
    () => colleges.find((c) => Number(c.id) === id(collegeId)) ?? null,
    [colleges, collegeId],
  );

  const deptList = useMemo(
    () => (currentCollege ? departments.filter((d) => Number(d.college_id) === id(collegeId)) : []),
    [departments, collegeId, currentCollege],
  );

  const results = useMemo(() => {
    if (!currentCollege) return [];
    const cid = id(collegeId);
    const did = id(deptId);
    return programs.filter((p) => {
      if (Number(p.college_id) !== cid) return false;
      if (did && Number(p.department_id ?? null) !== did) return false;
      return true;
    });
  }, [programs, collegeId, deptId, currentCollege]);

  const handleCollege = (e) => {
    setCollegeId(e.target.value);
    setDeptId('');
  };

  return (
    <section className="section section-alt explorer" aria-labelledby="explorer-title">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title" id="explorer-title">استكشف البرامج حسب الكلية والقسم</h2>
          <p className="section-subtitle">اختر الكلية ثم القسم لعرض كل برامجها — كل قسم يتبع كليته، وكل برنامج يتبع قسمه.</p>
        </div>

        <div className="explorer-control">
          <label className="explorer-field">
            <span>1 — اختر الكلية</span>
            <select value={collegeId} onChange={handleCollege} aria-label="اختر الكلية">
              <option value="">كل كليات المعهد...</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name_ar}</option>
              ))}
            </select>
          </label>
          <label className="explorer-field">
            <span>2 — اختر القسم</span>
            <select
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              aria-label="اختر القسم"
              disabled={!currentCollege}
            >
              <option value="">{currentCollege ? 'كل الأقسام...' : 'اختر الكلية أولاً'}</option>
              {deptList.map((d) => (
                <option key={d.id} value={d.id}>{d.name_ar}</option>
              ))}
            </select>
          </label>
        </div>

        {currentCollege && deptList.length > 0 && (
          <div className="explorer-chips">
            <span className="explorer-chips-label">أقسام {currentCollege.name_ar.replace(/^قسم\s+/, '')}:</span>
            <button
              type="button"
              className={`explorer-chip${!deptId ? ' is-active' : ''}`}
              onClick={() => setDeptId('')}
            >
              كل الأقسام
            </button>
            {deptList.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`explorer-chip${Number(d.id) === id(deptId) ? ' is-active' : ''}`}
                onClick={() => setDeptId(String(d.id))}
              >
                {deptShortName(d.name_ar)}
                {d.programs_count ? <span className="explorer-chip-count">{d.programs_count}</span> : null}
              </button>
            ))}
          </div>
        )}

        <div className="explorer-results" aria-live="polite">
          {!currentCollege && (
            <p className="explorer-empty">اختر كلية من القائمة أعلاه لعرض أقسامها وبرامجها.</p>
          )}
          {currentCollege && results.length === 0 && (
            <p className="muted">لا توجد برامج مسجلة ضمن هذا الاختيار حاليًا.</p>
          )}
          {results.length > 0 && (
            <div className="explorer-list">
              {results.map((p) => {
                const dept = departments.find((d) => Number(d.id) === Number(p.department_id));
                return (
                  <article key={p.id} className="explorer-item">
                    <span className={`explorer-item-type explorer-item-type--${p.program_type}`}>
                      {typeLabel[p.program_type] ?? p.program_type}
                    </span>
                    <div className="explorer-item-main">
                      <h3>{p.name_ar ?? p.name_en}</h3>
                      <p>
                        {p.department_name_ar || dept?.name_ar || currentCollege.name_ar}
                        {p.branch_name_ar ? ` — ${p.branch_name_ar}` : ''}
                      </p>
                    </div>
                    {p.admission_open ? (
                      <span className="program-badge program-badge--open">التسجيل مفتوح</span>
                    ) : (
                      <span className="program-badge program-badge--closed">التسجيل مغلق</span>
                    )}
                    <Link to={`/programs/${p.id}`} className="btn btn-soft explorer-item-cta">التفاصيل ←</Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}