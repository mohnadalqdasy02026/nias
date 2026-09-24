import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../../api/client.js';

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
];

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const perPage = 20;

  const load = useCallback(async (p = page, s = search) => {
    setError(null);
    try {
      const q = new URLSearchParams();
      if (s) q.set('search', s);
      if (p > 1) q.set('page', p);
      q.set('limit', perPage);
      const data = await api.get(`/admin/media?${q.toString()}`, { auth: true });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e.message);
    }
  }, [page, search]);

  useEffect(() => {
    load(1, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          throw new Error(`نوع الملف غير مدعوم: ${file.name}`);
        }
        if (file.size > 8 * 1024 * 1024) {
          throw new Error(`الملف أكبر من 8 MB: ${file.name}`);
        }
        const dataBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = String(reader.result ?? '');
            resolve(result.slice(result.indexOf(',') + 1));
          };
          reader.onerror = () => reject(new Error('تعذر قراءة الملف'));
          reader.readAsDataURL(file);
        });
        await api.post(
          '/admin/media',
          { file_name: file.name, mime_type: file.type, data_base64: dataBase64, alt_text: file.name },
          { auth: true },
        );
      }
      await load(1, search);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const copyUrl = async (item) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + item.url);
    } catch {
      setError('تعذر النسخ إلى الحافظة');
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`حذف "${item.file_name}" نهائيًا؟`)) return;
    setBusy(item.id);
    setError(null);
    try {
      await api.del(`/admin/media/${item.id}`, { auth: true });
      await load(page, search);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const isImage = (t) => t?.startsWith('image/');

  const runSearch = () => { setPage(1); load(1, search); };

  return (
    <section>
      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="بحث بالاسم أو النص البديل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
        />
        <button type="button" className="btn btn-soft" onClick={runSearch}>بحث</button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'جارٍ الرفع...' : '+ رفع ملفات'}
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          accept={ACCEPTED_TYPES.join(',')}
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div
        className={`media-dropzone${dragging ? ' media-dropzone--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files); }}
      >
        اسحب الملفات وأفلتها هنا أو اخترها بالزر أعلاه (صور JPG/PNG/WebP/GIF/SVG أو PDF — حد أقصى 8 MB).
      </div>

      <div className="admin-media-grid">
        {items.map((item) => (
          <div className="media-card" key={item.id}>
            <div className="media-thumb">
              {isImage(item.file_type) ? (
                <img src={item.url} alt={item.alt_text ?? item.file_name} loading="lazy" />
              ) : (
                <span className="media-pdf">PDF</span>
              )}
            </div>
            <div className="media-meta">
              <strong className="media-name" title={item.file_name}>{item.file_name}</strong>
              <span className="muted">{item.file_type} · {formatBytes(item.file_size)}</span>
            </div>
            <div className="media-actions">
              <button type="button" className="btn btn-sm btn-soft" onClick={() => copyUrl(item)}>نسخ الرابط</button>
              <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === item.id} onClick={() => remove(item)}>حذف</button>
              <a className="btn btn-sm btn-soft" href={item.url} target="_blank" rel="noreferrer">فتح</a>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !error && <p className="muted admin-empty">المكتبة فارغة — ارفع أول ملف.</p>}

      {total > perPage && (
        <div className="admin-pagination">
          <button type="button" className="btn btn-sm btn-soft" disabled={page === 1} onClick={() => { const p = page - 1; setPage(p); load(p, search); }}>السابق</button>
          <span>صفحة {page} من {Math.max(1, Math.ceil(total / perPage))}</span>
          <button type="button" className="btn btn-sm btn-soft" disabled={page >= Math.ceil(total / perPage)} onClick={() => { const p = page + 1; setPage(p); load(p, search); }}>التالي</button>
        </div>
      )}
    </section>
  );
}