import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function About() {
  const [page, setPage] = useState(null);

  usePageMeta('عن المعهد', 'تعرف على المعهد الوطني للعلوم الإدارية في اليمن: رسالته وأهدافه في بناء القدرات الإدارية وتأهيل الكوادر.');

  useEffect(() => {
    api.get('/public/pages/about').then(setPage).catch(() => {});
  }, []);

  return (
    <section className="section">
      <div className="container page-content">
        <h1 className="section-title">{page?.title_ar ?? 'عن المعهد'}</h1>
        {page ? (
          <article className="about-content">
            {page.primary_image && (
              <img className="about-hero-image" src={page.primary_image} alt={page.title_ar ?? 'عن المعهد'} />
            )}
            <div dangerouslySetInnerHTML={{ __html: page.content_ar }} />
          </article>
        ) : (
          <p className="muted">المعهد الوطني للعلوم الإدارية (NIAS) هو مؤسسة وطنية معنية ببناء القدرات الإدارية وتأهيل الكوادر في الجمهورية اليمنية.</p>
        )}
      </div>
    </section>
  );
}