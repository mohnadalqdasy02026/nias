import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { branchLabel } from '../lib/branch.js';

export default function Training() {
  const [courses, setCourses] = useState([]);

  usePageMeta('الدورات التدريبية', 'الدورات التدريبية المفتوحة للتسجيل في المعهد الوطني للعلوم الإدارية — سجل الآن.');

  useEffect(() => {
    api.get('/public/training-courses').then(setCourses).catch(() => {});
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">الدورات التدريبية</h1>
        <p className="section-subtitle">دورات مفتوحة للتسجيل</p>

        <div className="courses-grid">
          {courses.map((c) => (
            <article key={c.id} className="card course-card">
              {c.image_url && <img className="course-image" src={c.image_url} alt={c.title} loading="lazy" />}
              <div className="course-body">
              <h3>{c.title}</h3>
              {c.branch_name_ar && (
                <span className="course-branch">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h4a2 2 0 0 1 2 2v10M9 7h2M9 11h2M9 15h2" /></svg>
                  <Link to={`/branches/${c.branch_slug ?? 'all'}`} onClick={(e) => { if (!c.branch_slug) e.preventDefault(); }}>
                    {branchLabel(c.branch_name_ar)}
                  </Link>
                </span>
              )}
              {c.description && <p>{c.description}</p>}
              <div className="course-meta">
                {c.location && <span className="course-loc">{c.location}</span>}
                {c.capacity != null && <span>المقاعد: {c.capacity}</span>}
              </div>
              <Link to="/training/register" className="btn btn-primary">التسجيل</Link>
              </div>
            </article>
          ))}
          {courses.length === 0 && <p className="muted">لا توجد دورات مفتوحة حاليًا.</p>}
        </div>
      </div>
    </section>
  );
}