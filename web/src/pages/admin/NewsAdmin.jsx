import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../contexts/auth.jsx';
import { branchLabel } from '../../lib/branch.js';
import RichEditor from '../../components/admin/RichEditor.jsx';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { ImageField, useImageUpload } from '../../components/admin/ImageField.jsx';
import { useAdminRecord } from '../../components/admin/useAdminRecord.js';

const statusLabel = { draft: 'مسودة', published: 'منشور', archived: 'مؤرشف' };
const typeLabel = { news: 'خبر', event: 'فعالية', activity: 'نشاط', course: 'دورة' };

export default function NewsAdmin() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const perPage = 20;

  const load = useCallback(async (fstatus = status, p = page) => {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fstatus) params.set('status', fstatus);
      if (p > 1) params.set('page', p);
      params.set('limit', perPage);
      const data = await api.get(`/admin/content/news?${params.toString()}`, { auth: true });
      setItems(data?.items ?? data ?? []);
      setTotal(data?.total ?? items.length);
      setPage(p);
    } catch (e) {
      setError(e.message);
    }
  }, [status, page]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <div className="admin-toolbar">
        <select value={status} onChange={(e) => { setStatus(e.target.value); load(e.target.value, 1); }}>
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="published">منشور</option>
          <option value="archived">مؤرشف</option>
        </select>
        <Link to="new" className="btn btn-primary">+ خبر جديد</Link>
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
                <td data-label="العنوان">{n.title_ar}{n.is_featured ? ' ★' : ''}</td>
                <td data-label="الفرع">{n.branch_name_ar ? <span className="badge-msg badge-success">{branchLabel(n.branch_name_ar)}</span> : '—'}</td>
                <td data-label="التصنيف">{n.category_name ?? '—'}</td>
                <td data-label="الحالة">
                  <button type="button" className={`badge-msg badge-${n.status}`} disabled={busy === n.id} onClick={() => toggleStatus(n)}>
                    {statusLabel[n.status]}
                  </button>
                </td>
                <td data-label="المنشور في">{n.published_at ? new Date(n.published_at).toLocaleString('ar-YE') : '—'}</td>
                <td data-label="إجراءات" className="table-actions">
                  <div className="admin-action-row">
                    <Link to={String(n.id)} className="btn btn-sm btn-soft">تعديل</Link>
                    <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === n.id} onClick={() => remove(n)}>حذف</button>
                  </div>
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

export function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const { record, loading } = useAdminRecord({ id, path: '/admin/content/news' });
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    category_id: '',
    content_type: 'news',
    branch_id: user?.branchId ?? '',
    title_ar: '',
    title_en: '',
    summary_ar: '',
    body_ar: '',
    cover_image: '',
    is_featured: false,
    status: 'draft',
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/content/news-categories', { auth: true }).then(setCategories).catch(() => {});
    api.get('/public/branches').then(setBranches).catch(() => {});
  }, []);

  useEffect(() => {
    if (!record) return;
    setForm({
      category_id: record.category_id ?? '',
      content_type: record.content_type ?? 'news',
      branch_id: record.branch_id ?? '',
      title_ar: record.title_ar ?? '',
      title_en: record.title_en ?? '',
      summary_ar: record.summary_ar ?? '',
      body_ar: record.body_ar ?? '',
      cover_image: record.cover_image ?? '',
      is_featured: record.is_featured ?? false,
      status: record.status ?? 'draft',
    });
  }, [record]);

  const upload = useImageUpload({
    onUploaded: (_key, url) => setForm((f) => ({ ...f, cover_image: url })),
    onError: setError,
    altText: () => form.title_ar || 'خبر',
  });

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const body = {
      ...form,
      category_id: form.category_id === '' ? null : Number(form.category_id),
      branch_id: form.branch_id === '' ? null : Number(form.branch_id),
    };
    try {
      if (isEdit) await api.patch(`/admin/content/news/${id}`, body, { auth: true });
      else await api.post('/admin/content/news', body, { auth: true });
      navigate('/admin/content/news');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && loading) return <p className="admin-form-loading">جارٍ تحميل بيانات الخبر…</p>;

  return (
    <AdminFormPage
      title={isEdit ? `تعديل خبر: ${form.title_ar || ''}` : 'خبر جديد'}
      subtitle="إدارة المحتوى الإخباري والنشر."
      backTo="/admin/content/news"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card admin-form" onSubmit={save}>
        <AdminFormSection title="العنوان والتصنيف">
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
          </div>
        </AdminFormSection>

        <AdminFormSection title="المحتوى">
          <div className="form-grid">
            <div className="form-field form-field--full">
              <label>الملخص</label>
              <textarea rows={2} value={form.summary_ar ?? ''} onChange={(e) => setForm({ ...form, summary_ar: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>النص الكامل</label>
              <RichEditor value={form.body_ar ?? ''} onChange={(html) => setForm({ ...form, body_ar: html })} rows={8} />
            </div>
            <ImageField
              label="صورة الغلاف (cover)"
              value={form.cover_image}
              onChange={(url) => setForm({ ...form, cover_image: url })}
              upload={upload}
              fieldKey="cover_image"
              shape="wide"
              hint="تُضغط الصورة تلقائيًا (عرض أقصى 1280px بجودة موفرة) فلا تبطئ الموقع أو محركات البحث."
            />
          </div>
        </AdminFormSection>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'جارٍ الحفظ…' : isEdit ? 'حفظ' : 'إنشاء'}</button>
          <Link to="/admin/content/news" className="btn btn-soft">إلغاء</Link>
        </div>
      </form>
    </AdminFormPage>
  );
}
