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

  const close = () => setLightbox(null);

  const step = (dir) => {
    if (!lightbox || items.length === 0) return;
    const next = (lightbox.index + dir + items.length) % items.length;
    const g = items[next];
    setLightbox({ index: next, image: g.image, title: g.title, link: g.link });
  };

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(1);
      else if (e.key === 'ArrowRight') step(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, items]);

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
            {items.map((g, i) => (
              <button
                key={g.id}
                type="button"
                className="gallery-item card"
                onClick={() => setLightbox({ index: i, image: g.image, title: g.title, link: g.link })}
                aria-label={`عرض ${g.title}`}
              >
                <img src={g.image} alt={g.title} loading="lazy" />
                {g.title && <span className="gallery-caption">{g.title}</span>}
              </button>
            ))}
          </div>

          {lightbox && (
            <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightbox.title} onClick={close}>
              <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
                <img src={lightbox.image} alt={lightbox.title} />
                <div className="lightbox-meta">
                  <strong>{lightbox.title}</strong>
                  <span className="lightbox-counter" aria-hidden="true">{lightbox.index + 1} / {items.length}</span>
                  {lightbox.link && (
                    <a href={lightbox.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">فتح المصدر</a>
                  )}
                </div>
                <button type="button" className="lightbox-previous" onClick={() => step(-1)} aria-label="السابق">‹</button>
                <button type="button" className="lightbox-next" onClick={() => step(1)} aria-label="التالي">›</button>
                <button type="button" className="lightbox-close" onClick={close} aria-label="إغلاق">×</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}