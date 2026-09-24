import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [error, setError] = useState(null);

  usePageMeta('معرض الصور', 'لقطات من فعاليات وأنشطة وفروع المعهد الوطني للعلوم الإدارية.');

  useEffect(() => {
    api.get('/public/gallery').then(setItems).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <section className="subpage-hero">
        <div className="container subpage-hero-inner">
          <p className="subpage-eyebrow">توثيق بصري</p>
          <h1>معرض الصور</h1>
          <p className="subpage-sub">لقطات من فعاليات وأنشطة وفروع المعهد الوطني للعلوم الإدارية.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error && <div className="alert alert-danger">{error}</div>}
          {items.length === 0 && !error && <p className="muted admin-empty">لا توجد صور في المعرض بعد.</p>}
          <div className="gallery-grid">
            {items.map((g, i) => {
              const img = g.image?.startsWith('http') ? g.image : g.image;
              return (
                <button
                  key={g.id}
                  type="button"
                  className="gallery-item card"
                  onClick={() => setLightbox({ index: i, image: img, title: g.title, link: g.link })}
                  aria-label={`عرض ${g.title}`}
                >
                  <img src={img} alt={g.title} loading="lazy" />
                  {g.title && <span className="gallery-caption">{g.title}</span>}
                </button>
              );
            })}
          </div>

          {lightbox && (
            <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
              <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
                <img src={lightbox.image} alt={lightbox.title} />
                <div className="lightbox-meta">
                  <strong>{lightbox.title}</strong>
                  {lightbox.link && (
                    <a href={lightbox.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">فتح المصدر</a>
                  )}
                </div>
                <button type="button" className="lightbox-close" onClick={() => setLightbox(null)} aria-label="إغلاق">×</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}