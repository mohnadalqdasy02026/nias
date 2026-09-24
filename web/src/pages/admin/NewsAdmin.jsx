import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../contexts/auth.jsx';
import { branchLabel } from '../../lib/branch.js';
import RichEditor from '../../components/admin/RichEditor.jsx';

const MAX_IMAGE_WIDTH = 1280;
const IMAGE_QUALITY = 0.82;

const statusLabel = { draft: 'مسودة', published: 'منشور', archived: 'مؤرشف' };
const typeLabel = { news: 'خبر', event: 'فعالية', activity: 'نشاط', course: 'دورة' };

export default function NewsAdmin() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const [imageBusy, setImageBusy] = useState(false);
  const imageFileRef = useRef(null);
  const perPage = 20;

  const load = useCallback(async (fstatus = status, p = page) => {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fstatus) params.set('status', fstatus);
      if (p > 1) params.set('page', p);
      params.set('limit', perPage);
      const data = await api.get(`/admin/content/news?${params.toString()}`, { auth: true });
      setItems(data.items ?? data);
      setTotal(data.total ?? items.length);
      setPage(p);
    } catch (e) {
      setError(e.message);
    }
  }, [status, page]);

  useEffect(() => {
    load();
    api.get('/admin/content/news-categories', { auth: true }).then(setCategories).catch(() => {});
    api.get('/public/branches').then(setBranches).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (item) => {
    setEditingId(item?.id ?? null);
    setShowForm(true);
    setForm({
      category_id: item?.category_id ?? '',
      content_type: item?.content_type ?? 'news',
      branch_id: item?.branch_id ?? user?.branchId ?? '',
      title_ar: item?.title_ar ?? '',
      title_en: item?.title_en ?? '',
      summary_ar: item?.summary_ar ?? '',
      body_ar: item?.body_ar ?? '',
      cover_image: item?.cover_image ?? '',
      is_featured: item?.is_featured ?? false,
      status: item?.status ?? 'draft',
    });
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(null);
  };

  const compressAndUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('الرجاء اختيار ملف صورة.');
      return;
    }
    setImageBusy(true);
    setError(null);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('تعذر قراءة الملف'));
        reader.readAsDataURL(file);
      });

      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('تعذر فتح الصورة'));
        image.src = dataUrl;
      });

      const scale = Math.min(1, MAX_IMAGE_WIDTH / img.width);
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const isPng = file.type === 'image/png';
      const outType = isPng ? 'image/webp' : 'image/jpeg';
      const compressed = canvas.toDataURL(outType, IMAGE_QUALITY);
      const base64 = compressed.slice(compressed.indexOf(',') + 1);
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'news';

      const saved = await api.post(
        '/admin/media',
        { file_name: `${form.title_ar ?? baseName}.${isPng ? 'webp' : 'jpg'}`, mime_type: outType, data_base64: base64, alt_text: form.title_ar ?? baseName },
        { auth: true },
      );
      setForm((f) => ({ ...f, cover_image: saved.url }));
      if (imageFileRef.current) imageFileRef.current.value = '';
    } catch (e) {
      setError(e.message);
    } finally {
      setImageBusy(false);
    }
  };

  const removeCover = () => {
    setForm((f) => ({ ...f, cover_image: '' }));
    if (imageFileRef.current) imageFileRef.current.value = '';
  };

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy('save');
    const body = {
      ...form,
      category_id: form.category_id === '' ? null : Number(form.category_id),
      branch_id: form.branch_id === '' ? null : Number(form.branch_id),
    };
    try {
      if (editingId) await api.patch(`/admin/content/news/${editingId}`, body, { auth: true });
      else await api.post('/admin/content/news', body, { auth: true });
      cancel();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const toggleStatus = async (item) => {
    setBusy(item.id);
    try {
      await api.patch(`/admin/content/news/${item.id}`, { status: item.status === 'published' ? 'draft' : 'published' }, { auth: true });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`حذف الخبر "${item.title_ar}" نهائيًا؟`)) return;
    setBusy(item.id);
    try {
      await api.del(`/admin/content/news/${item.id}`, { auth: true });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">الأخبار والمقالات</h1>
      <p className="muted">إدارة المحتوى الإخباري والنشر.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {showForm && (
        <form className="card admin-form" onSubmit={save}>
          <h3>{editingId ? 'تعديل خبر' : 'خبر جديد'}</h3>
          <div className="form-grid">
            <div className="form-field form-field--full">
              <label>العنوان (عربي) *</label>
              <input value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>العنوان (إنجليزي)</label>
              <input value={form.title_en ?? ''} onChange={(e) => setForm({ ...form, title_en: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>التصنيف</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">بدون تصنيف</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>الفرع *</label>
              <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })} required>
                <option value="">اختر الفرع</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{branchLabel(b.name_ar) ?? b.name_ar}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>النوع</label>
              <select value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>
                {Object.entries(typeLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>
            <div className="form-field">
              <label>
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                خبر مميز
              </label>
            </div>
            <div className="form-field form-field--full">
              <label>الملخص</label>
              <textarea rows={2} value={form.summary_ar ?? ''} onChange={(e) => setForm({ ...form, summary_ar: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>النص الكامل</label>
              <RichEditor value={form.body_ar ?? ''} onChange={(html) => setForm({ ...form, body_ar: html })} rows={8} />
            </div>
            <div className="form-field form-field--full">
              <label>صورة الغلاف (cover)</label>
              <div className="course-image-picker">
                {form.cover_image ? (
                  <div className="course-image-preview">
                    <img src={form.cover_image} alt="" />
                  </div>
                ) : null}
                <div className="course-image-actions">
                  <button
                    type="button"
                    className="btn btn-soft"
                    disabled={imageBusy}
                    onClick={() => imageFileRef.current?.click()}
                  >
                    {imageBusy ? 'جارٍ التجهيز والضغط...' : form.cover_image ? 'استبدال الصورة' : 'اختيار صورة من الجهاز'}
                  </button>
                  {form.cover_image ? (
                    <button type="button" className="btn btn-sm btn-danger-soft" onClick={removeCover}>إزالة</button>
                  ) : null}
                </div>
              </div>
              <input
                ref={imageFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => compressAndUpload(e.target.files?.[0])}
              />
              <p className="muted admin-field-hint">تُضغط الصورة تلقائيًا (عرض أقصى 1280px بجودة موفرة) فلا تبطئ الموقع أو محركات البحث.</p>
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'save'}>{editingId ? 'حفظ' : 'إنشاء'}</button>
            <button type="button" className="btn btn-soft" onClick={cancel}>إلغاء</button>
          </div>
        </form>
      )}

      <div className="admin-toolbar">
        <select value={status} onChange={(e) => { setStatus(e.target.value); load(e.target.value, 1); }}>
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="published">منشور</option>
          <option value="archived">مؤرشف</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => startEdit(null)}>+ خبر جديد</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>الفرع</th>
              <th>التصنيف</th>
              <th>الحالة</th>
              <th>المنشور في</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n.id}>
                <td>{n.title_ar}{n.is_featured ? ' ★' : ''}</td>
                <td>{n.branch_name_ar ? <span className="badge-msg badge-success">{branchLabel(n.branch_name_ar)}</span> : '—'}</td>
                <td>{n.category_name ?? '—'}</td>
                <td>
                  <button type="button" className={`badge-msg badge-${n.status}`} disabled={busy === n.id} onClick={() => toggleStatus(n)}>
                    {statusLabel[n.status]}
                  </button>
                </td>
                <td>{n.published_at ? new Date(n.published_at).toLocaleString('ar-YE') : '—'}</td>
                <td className="table-actions">
                  <button type="button" className="btn btn-sm btn-soft" disabled={busy === n.id} onClick={() => startEdit(n)}>تعديل</button>
                  <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === n.id} onClick={() => remove(n)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="muted admin-empty">لا توجد عناصر.</p>}
      </div>

      {total > perPage && (
        <div className="admin-pagination">
          <button type="button" className="btn btn-sm btn-soft" disabled={page === 1} onClick={() => { const np = page - 1; load(status, np); }}>السابق</button>
          <span>صفحة {page} من {Math.max(1, Math.ceil(total / perPage))}</span>
          <button type="button" className="btn btn-sm btn-soft" disabled={page >= Math.ceil(total / perPage)} onClick={() => { const np = page + 1; load(status, np); }}>التالي</button>
        </div>
      )}
    </section>
  );
}