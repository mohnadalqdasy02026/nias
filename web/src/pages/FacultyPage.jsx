import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  usePageMeta('أعضاء هيئة التدريس', 'نخبة من الأكاديميين والباحثين في المعهد الوطني للعلوم الإدارية.');

  useEffect(() => {
    Promise.all([
      api.get('/public/faculty'),
      api.get('/public/departments'),
    ]).then(([members, depts]) => {
      const names = new Map((depts ?? []).map((d) => [String(d.id), d.name_ar]));
      setFaculty((members ?? []).map((m) => ({
        ...m,
        department_name_ar: names.get(String(m.department_id)) ?? 'عام',
      })));
    }).catch((e) => setError(e.message));
  }, []);

  const titles = Array.from(new Set(faculty.map((m) => m.title).filter(Boolean).map((t) => t.trim())))
    .sort((a, b) => a.localeCompare(b, 'ar'));

  const visible = filter === 'all' ? faculty : faculty.filter((m) => (m.title ?? '').trim() === filter);

  const groups = visible.reduce((acc, m) => {
    const key = m.department_name_ar ?? 'عام';
    (acc[key] ??= []).push(m);
    return acc;
  }, {});

  return (
    <>
      <section className="subpage-hero">
        <div className="container subpage-hero-inner">
          <p className="subpage-eyebrow">الكادر الأكاديمي</p>
          <h1>أعضاء هيئة التدريس</h1>
          <p className="subpage-sub">نخبة من الأكاديميين والباحثين في المعهد الوطني للعلوم الإدارية.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error && <div className="alert alert-danger">{error}</div>}
          {faculty.length === 0 && !error && <p className="muted admin-empty">لم يسجَّل أعضاء هيئة تدريس بعد.</p>}
          {titles.length > 0 && (
            <div className="faculty-filters" role="tablist" aria-label="فلترة الكادر حسب الرتبة">
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'all'}
                className={`faculty-filter${filter === 'all' ? ' faculty-filter--active' : ''}`}
                onClick={() => setFilter('all')}
              >
                الكل
              </button>
              {titles.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={filter === t}
                  className={`faculty-filter${filter === t ? ' faculty-filter--active' : ''}`}
                  onClick={() => setFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
          {visible.length === 0 && faculty.length > 0 && <p className="muted admin-empty">لا يوجد أعضاء بهذه الرتبة.</p>}
          {Object.entries(groups).map(([dept, members]) => (
            <div key={dept} style={{ marginBottom: 40 }}>
              <h2 className="faculty-dept-title">{dept}</h2>
              <div className="faculty-grid">
                {members.map((m) => (
                  <article key={m.id} className="card faculty-card">
                    {m.photo ? (
                      <img className="faculty-photo" src={m.photo} alt={m.name_ar} loading="lazy" />
                    ) : (
                      <div className="faculty-photo faculty-photo--placeholder" aria-hidden="true">
                        {(m.name_ar ?? 'NIAS').slice(0, 1)}
                      </div>
                    )}
                    <h3>{m.name_ar}</h3>
                    {m.title && <span className="faculty-title">{m.title}</span>}
                    {m.specialization && <span className="faculty-spec">{m.specialization}</span>}
                    <div className="faculty-contacts">
                      {m.email && <a href={`mailto:${m.email}`} dir="ltr">{m.email}</a>}
                      {m.phone && <span dir="ltr">{m.phone}</span>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}