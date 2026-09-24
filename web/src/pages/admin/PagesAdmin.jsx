import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client.js';
import RichEditor from '../../components/admin/RichEditor.jsx';

const statusLabel = { draft: 'مسودة', published: 'منشور', archived: 'مؤرشف' };
const typeLabel = { news: 'خبر', event: 'فعالية', activity: 'نشاط', course: 'دورة' };

export default function PagesAdmin() {
  const [pages, setPages] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPages(await api.get('/admin/content/pages', { auth: true }));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (page) => {
    setEditing(page?.id ?? null);
    setForm({
      slug: page?.slug ?? '',
      title_ar: page?.title_ar ?? '',
      title_en: page?.title_en ?? '',
      content_ar: page?.content_ar ?? '',
      status: page?.status ?? 'draft',
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy('save');
    try {
      if (editing) await api.patch(`/admin/content/pages/${editing}`, form, { auth: true });
      else await api.post('/admin/content/pages', form, { auth: true });
      cancelEdit();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const toggleStatus = async (page) => {
    setBusy(page.id);
    try {
      await api.patch(`/admin/content/pages/${page.id}`, { status: page.status === 'published' ? 'draft' : 'published' }, { auth: true });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (page) => {
    if (!window.confirm(`حذف الصفحة "${page.title_ar}" نهائيًا؟`)) return;
    setBusy(page.id);
    try {
      await api.del(`/admin/content/pages/${page.id}`, { auth: true });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">الصفحات الثابتة</h1>
      <p className="muted">محتوى صفحات الموقع الثابتة (عن المعهد، شروط، ...).</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {form && (
        <form className="card admin-form" onSubmit={save}>
          <h3>{editing ? 'تعديل صفحة' : 'صفحة جديدة'}</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Slug (معرّف الرابط)</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required dir="ltr" />
            </div>
            <div className="form-field">
              <label>العنوان (عربي)</label>
              <input value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>العنوان (إنجليزي)</label>
              <input value={form.title_en ?? ''} onChange={(e) => setForm({ ...form, title_en: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>
            <div className="form-field form-field--full">
              <label>المحتوى (عربي)</label>
              <RichEditor value={form.content_ar ?? ''} onChange={(html) => setForm({ ...form, content_ar: html })} rows={12} />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'save'}>{editing ? 'حفظ' : 'إنشاء'}</button>
            <button type="button" className="btn btn-soft" onClick={cancelEdit}>إلغاء</button>
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>العنوان</th>
              <th>الحالة</th>
              <th>تاريخ التحديث</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td dir="ltr"><code>{p.slug}</code></td>
                <td>{p.title_ar}</td>
                <td>
                  <button type="button" className={`badge-msg badge-${p.status}`} disabled={busy === p.id} onClick={() => toggleStatus(p)}>
                    {statusLabel[p.status]}
                  </button>
                </td>
                <td>{new Date(p.updated_at).toLocaleString('ar-YE')}</td>
                <td className="table-actions">
                  <button type="button" className="btn btn-sm btn-soft" disabled={busy === p.id} onClick={() => startEdit(p)}>تعديل</button>
                  <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === p.id} onClick={() => remove(p)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && <p className="muted admin-empty">لا توجد صفحات.</p>}
      </div>
    </section>
  );
}