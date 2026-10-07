import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { branchTitle } from '../lib/branch.js';
import { TRAINING_TABS, trainingCategoryLabel } from '../lib/training.js';

export default function Training() {
  const [courses, setCourses] = useState([]);
  const [active, setActive] = useState('all');

  usePageMeta(
    'التدريب',
    'قسم البرامج التدريبية المستقل في المعهد الوطني للعلوم الإدارية: الدورات التدريبية والبرامج التأهيلية والندوات والأنشطة التدريبية.',
  );

  useEffect(() => {
    api.get('/public/training-courses').then(setCourses).catch(() => {});
  }, []);

  const byCategory = useMemo(() => {
    const g = {};
    for (const t of TRAINING_TABS) g[t.key] = [];
    for (const c of courses) {
      const key = TRAINING_TABS.some((t) => t.key === c.category) ? c.category : 'course';
      g[key]?.push(c);
    }
    return g;
  }, [courses]);

  const counts = useMemo(() => {
    const c = { all: courses.length };
    for (const t of TRAINING_TABS) c[t.key] = byCategory[t.key]?.length ?? 0;
    return c;
  }, [courses, byCategory]);

  const visible = active === 'all' ? courses : (byCategory[active] ?? []);

  const tabs = [
    { key: 'all', label: 'الكل' },
    ...TRAINING_TABS.filter((t) => counts[t.key] > 0).map((t) => ({ key: t.key, label: t.label })),
  ];

  return (
    <>
      <section className="programs-hero training-hero">
        <div className="container programs-hero-inner">
          <p className="programs-hero-eyebrow">{courses.length} من البرامج التدريبية المفتوحة للتسجيل</p>
          <h1>البرامج التدريبية</h1>
          <p className="programs-hero-sub">
            قسم مستقل عن البرامج الأكاديمية يضم الدورات التدريبية والبرامج التأهيلية والندوات
            والأنشطة التدريبية التي يقدمها المعهد لتطوير مهارات الكوادر.
          </p>
          <div className="programs-hero-strip">
            {TRAINING_TABS.map((t) => (
              <div className="ph-stat" key={t.key}>
                <span className="ph-stat-num">{counts[t.key] ?? 0}</span>
                <span className="ph-stat-label">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="programs-toolbar">
            <div className="programs-tabs" role="tablist" aria-label="تصفية حسب التصنيف">
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
          </div>

          <div className="courses-grid">
            {visible.map((c) => (
              <article key={c.id} className="card course-card">
                {c.image_url && <img className="course-image" src={c.image_url} alt={c.title} loading="lazy" />}
                <div className="course-body">
                  <span className="course-cat">{trainingCategoryLabel(c.category)}</span>
                  <h3>{c.title}</h3>
                  {c.branch_name_ar && (
                    <span className="course-branch">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h4a2 2 0 0 1 2 2v10M9 7h2M9 11h2M9 15h2" /></svg>
                      <Link to={`/branches/${c.branch_slug ?? 'all'}`} onClick={(e) => { if (!c.branch_slug) e.preventDefault(); }}>
                        {branchTitle(c.branch_name_ar)}
                      </Link>
                    </span>
                  )}
                  {c.description && <p className="course-card-desc clamp-3">{c.description}</p>}
                  <div className="course-meta">
                    {c.location && <span className="course-loc">{c.location}</span>}
                    {c.capacity != null && <span>المقاعد: {c.capacity}</span>}
                  </div>
                  <div className="course-card-actions">
                    <Link to={`/training/${c.id}`} className="btn btn-soft">التفاصيل</Link>
                    <Link to={`/training/register?course=${c.id}`} className="btn btn-primary">التسجيل</Link>
                  </div>
                </div>
              </article>
            ))}
            {visible.length === 0 && <p className="muted">لا توجد برامج مطابقة حاليًا.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
