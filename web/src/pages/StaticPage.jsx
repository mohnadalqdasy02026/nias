import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { renderRichText } from '../lib/richText.js';

export default function StaticPage({ slug, fallbackTitle, metaTitle, metaDescription }) {
  const [page, setPage] = useState(null);

  usePageMeta(metaTitle ?? fallbackTitle, metaDescription);

  useEffect(() => {
    api.get(`/public/pages/${slug}`).then(setPage).catch(() => {});
  }, [slug]);

  const images = Array.isArray(page?.images) ? page.images.filter(Boolean) : [];

  return (
    <section className="section">
      <div className="container page-content">
        <h1 className="section-title">{page?.title_ar ?? fallbackTitle}</h1>
        {page ? (
          <article className="about-content">
            {page.primary_image && (
              <img className="about-hero-image" src={page.primary_image} alt={page.title_ar ?? fallbackTitle} />
            )}
            {images.length > 0 && (
              <div className="static-page-images">
                {images.map((src, i) => (
                  <img
                    key={`${src}-${i}`}
                    className="static-page-image"
                    src={src}
                    alt={`${page.title_ar ?? fallbackTitle} - ${i + 1}`}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: renderRichText(page.content_ar) }} />
          </article>
        ) : (
          <p className="muted">لم يتم نشر هذه الصفحة بعد.</p>
        )}
      </div>
    </section>
  );
}