import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function StaticPage({ slug, fallbackTitle, metaTitle, metaDescription }) {
  const [page, setPage] = useState(null);

  usePageMeta(metaTitle ?? fallbackTitle, metaDescription);

  useEffect(() => {
    api.get(`/public/pages/${slug}`).then(setPage).catch(() => {});
  }, [slug]);

  return (
    <section className="section">
      <div className="container page-content">
        <h1 className="section-title">{page?.title_ar ?? fallbackTitle}</h1>
        {page ? (
          <article className="about-content">
            {page.primary_image && (
              <img className="about-hero-image" src={page.primary_image} alt={page.title_ar ?? fallbackTitle} />
            )}
            <div dangerouslySetInnerHTML={{ __html: page.content_ar }} />
          </article>
        ) : (
          <p className="muted">لم يتم نشر هذه الصفحة بعد.</p>
        )}
      </div>
    </section>
  );
}