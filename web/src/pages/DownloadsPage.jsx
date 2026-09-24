import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

const CATEGORY_LABELS = {
  admission: 'القبول والتسجيل',
  forms: 'النماذج',
  regulations: 'اللوائح والأنظمة',
  brochures: 'البرشورات',
  publications: 'الإصدارات',
};

export default function DownloadsPage() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState('all');
  const [error, setError] = useState(null);

  usePageMeta('التحميلات والملفات', 'تحميل نماذج القبول واللوائح والبرشورات والإصدارات من المعهد الوطني للعلوم الإدارية.');

  useEffect(() => {
    api.get('/public/downloads').then(setItems).catch((e) => setError(e.message));
  }, []);

  const cats = [...new Set(items.map((x) => x.category).filter(Boolean))];
  const visible = active === 'all' ? items : items.filter((x) => x.category === active);

  return (
    <>
      <section className="subpage-hero">
        <div className="container subpage-hero-inner">
          <p className="subpage-eyebrow">مركز الوثائق</p>
          <h1>التحميلات والملفات</h1>
          <p className="subpage-sub">النماذج واللوائح والإصدارات الرسمية للمعهد — تحميل مباشر.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error && <div className="alert alert-danger">{error}</div>}
          {items.length === 0 && !error && <p className="muted admin-empty">لا توجد ملفات مرفوعة بعد.</p>}

          {cats.length > 1 && (
            <div className="programs-tabs" style={{ marginBottom: 24 }}>
              <button type="button" className={`programs-tab${active === 'all' ? ' programs-tab--active' : ''}`} onClick={() => setActive('all')}>الكل</button>
              {cats.map((c) => (
                <button key={c} type="button" className={`programs-tab${active === c ? ' programs-tab--active' : ''}`} onClick={() => setActive(c)}>
                  {CATEGORY_LABELS[c] ?? c}
                </button>
              ))}
            </div>
          )}

          <div className="downloads-list">
            {visible.map((d) => (
              <div key={d.id} className="card download-row">
                <div className="download-icon" aria-hidden="true">📄</div>
                <div className="download-info">
                  <strong>{d.title}</strong>
                  {d.category && <span className="download-cat">{CATEGORY_LABELS[d.category] ?? d.category}</span>}
                </div>
                <div className="download-side">
                  <span className="download-count">{d.downloads_count ?? 0} تحميل</span>
                  <a href={d.file_path} download className="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">تحميل</a>
                </div>
              </div>
            ))}
            {visible.length === 0 && <p className="muted">لا توجد ملفات في هذا التصنيف.</p>}
          </div>
        </div>
      </section>
    </>
  );
}