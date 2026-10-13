import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

const dateLabel = (value) => {
  if (!value) return '';
  const d = new Date(String(value).slice(0, 10));
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function GalleryPage() {
  const [albums, setAlbums] = useState([]);
  const [items, setItems] = useState([]);
  const [viewer, setViewer] = useState(null);
  const [loadingAlbum, setLoadingAlbum] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [error, setError] = useState(null);

  usePageMeta('معرض الصور', 'لقطات من فعاليات وأنشطة وفروع المعهد الوطني للعلوم الإدارية.');

  useEffect(() => {
    api.get('/public/gallery/albums').then((list) => setAlbums(list ?? [])).catch(() => {});
    api.get('/public/gallery').then((list) => setItems(list ?? [])).catch((e) => setError(e.message));
  }, []);

  const openAlbum = async (album) => {
    setLoadingAlbum(true);
    setError(null);
    try {
      const full = await api.get(`/public/gallery/albums/${album.id}`);
      setViewer(full);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingAlbum(false);
    }
  };

  const openLightbox = (images, index, context) =>
    setLightbox({ images, index, context });

  const closeLightbox = () => setLightbox(null);

  const step = (dir) => {
    setLightbox((lb) => {
      if (!lb) return null;
      const next = (lb.index + dir + lb.images.length) % lb.images.length;
      return { ...lb, index: next };
    });
  };

  const touchX = useRef(null);
  const onTouchStart = (e) => {
    touchX.current = e.changedTouches?.[0]?.clientX ?? null;
  };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = (e.changedTouches?.[0]?.clientX ?? touchX.current) - touchX.current;
    if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') step(1);
      else if (e.key === 'ArrowRight') step(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  useEffect(() => {
    if (!viewer) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setViewer(null);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [viewer]);

  const active = lightbox?.images?.[lightbox.index];
  const viewerImages = viewer?.images ?? [];

  return (
    <>
      <section className="subpage-hero">
        <div className="container subpage-hero-inner">
          <p className="subpage-eyebrow">توثيق بصري</p>
          <h1>معرض الصور</h1>
          <p className="subpage-sub">لقطات من فعاليات وأنشطة وفروع المعهد الوطني للعلوم الإدارية.</p>
        </div>
      </section>

      {albums.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>الفعاليات والمناسبات</h2>
              <p>اختر فعالية لعرض صورها.</p>
            </div>
            <div className="gallery-albums">
              {albums.map((album) => (
                <button
                  key={album.id}
                  type="button"
                  className="gallery-album-card"
                  onClick={() => openAlbum(album)}
                  disabled={loadingAlbum}
                >
                  <span className="gallery-album-cover">
                    {album.cover_image
                      ? <img src={album.cover_image} alt={album.title} loading="lazy" />
                      : <span className="gallery-album-cover-empty" aria-hidden="true">🖼</span>}
                    <span className="gallery-album-badge">{album.image_count} صورة</span>
                  </span>
                  <span className="gallery-album-body">
                    <strong>{album.title}</strong>
                    {album.event_date && <span className="gallery-album-date">{dateLabel(album.event_date)}</span>}
                    {album.description && <span className="gallery-album-desc">{album.description}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          {error && <div className="alert alert-danger">{error}</div>}
          {albums.length > 0 && items.length > 0 && (
            <div className="section-head">
              <h2>لقطات متنوعة</h2>
            </div>
          )}
          {items.length === 0 && albums.length === 0 && !error && (
            <p className="muted admin-empty">لا توجد صور في المعرض بعد.</p>
          )}
          <div className="gallery-grid">
            {items.map((g, i) => (
              <button
                key={g.id}
                type="button"
                className="gallery-item card"
                onClick={() => openLightbox(items, i, 'معرض الصور')}
                aria-label={`عرض ${g.title}`}
              >
                <img src={g.image} alt={g.title} loading="lazy" />
                {g.title && <span className="gallery-caption">{g.title}</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {viewer && (
        <div className="album-viewer" role="dialog" aria-modal="true" aria-label={viewer.title} onClick={() => setViewer(null)}>
          <div className="album-viewer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="album-viewer-head">
              <div>
                <h3>{viewer.title}</h3>
                <p className="muted">
                  {dateLabel(viewer.event_date) || ''}{viewer.event_date ? ' · ' : ''}{viewerImages.length} صورة
                </p>
                {viewer.description && <p className="album-viewer-desc">{viewer.description}</p>}
              </div>
              <button type="button" className="lightbox-close album-viewer-close" onClick={() => setViewer(null)} aria-label="إغلاق">×</button>
            </div>
            {viewerImages.length === 0 ? (
              <p className="muted admin-empty">لا توجد صور في هذه الفعالية.</p>
            ) : (
              <div className="album-viewer-grid">
                {viewerImages.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    className="album-viewer-item"
                    onClick={() => openLightbox(viewerImages, i, viewer.title)}
                    aria-label={`عرض ${img.title || viewer.title}`}
                  >
                    <img src={img.image} alt={img.title || ''} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {lightbox && active && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.title || lightbox.context} onClick={closeLightbox}>
          <div
            className="lightbox-inner"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="lightbox-stage">
              <img src={active.image} alt={active.title || ''} />
            </div>
            <div className="lightbox-meta">
              <strong>{active.title || lightbox.context}</strong>
              <span className="lightbox-counter" aria-hidden="true">{lightbox.index + 1} / {lightbox.images.length}</span>
              {active.link && (
                <a href={active.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">فتح المصدر</a>
              )}
            </div>
            {lightbox.images.length > 1 && (
              <>
                <button type="button" className="lightbox-previous" onClick={() => step(-1)} aria-label="الصورة السابقة">›</button>
                <button type="button" className="lightbox-next" onClick={() => step(1)} aria-label="الصورة التالية">‹</button>
              </>
            )}
            <button type="button" className="lightbox-close" onClick={closeLightbox} aria-label="إغلاق">×</button>
          </div>
        </div>
      )}
    </>
  );
}
