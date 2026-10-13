import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { useAdminRecord } from '../../components/admin/useAdminRecord.js';

const CATEGORY_LABELS = {
  admission: 'القبول والتسجيل',
  forms: 'النماذج',
  regulations: 'اللوائح والأنظمة',
  brochures: 'البرشورات',
  publications: 'الإصدارات',
};

const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,image/*';

const readBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const emptyForm = {
  title: '',
  category: '',
  file_path: '',
};

const toForm = (d) => ({
  title: d?.title ?? '',
  category: d?.category ?? '',
  file_path: d?.file_path ?? '',
});

export default function DownloadsAdmin() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems((await api.get('/admin/downloads', { auth: true })) ?? []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (item) => {
    if (!window.confirm(`هل تريد حذف الملف «${item.title}»؟`)) return;
    setBusy(item.id);
    setError(null);
    try {
      await api.del(`/admin/downloads/${item.id}`, { auth: true });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">ملفات التحميلات</h1>
      <p className="muted">أضف نماذج القبول واللوائح والبرشورات والإصدارات الرسمية. تظهر الملفات في صفحة «التحميلات» العامة.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <Link to="new" className="btn btn-primary">ملف جديد</Link>
        <button type="button" className="btn btn-soft" onClick={load}>تحديث</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>التصنيف</th>
              <th>عدد التحميلات</th>
              <th>الملف</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id}>
                <td data-label="العنوان"><strong>{d.title}</strong></td>
                <td data-label="التصنيف" className="table-muted">{CATEGORY_LABELS[d.category] ?? d.category ?? '—'}</td>
                <td data-label="عدد التحميلات"><span className="badge-msg badge-success">{d.downloads_count ?? 0}</span></td>
                <td data-label="الملف">
                  {d.file_path
                    ? <a href={d.file_path} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-soft">فتح</a>
                    : <span className="table-muted">—</span>}
                </td>
                <td data-label="إجراءات" className="table-actions">
                  <div className="admin-action-row">
                    <Link to={String(d.id)} className="btn btn-sm btn-soft">تعديل</Link>
                    <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === d.id} onClick={() => remove(d)}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="muted admin-empty">لا توجد ملفات بعد.</p>}
      </div>
    </section>
  );
}

export function DownloadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { record, loading } = useAdminRecord({ id, path: '/admin/downloads' });
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (record) setForm(toForm(record));
  }, [record]);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const data_base64 = await readBase64(file);
      const saved = await api.post(
        '/admin/media',
        {
          file_name: file.name,
          mime_type: file.type || 'application/octet-stream',
          data_base64,
          alt_text: form.title || file.name,
        },
        { auth: true },
      );
      setForm((f) => ({ ...f, file_path: saved.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      title: form.title.trim(),
      category: form.category.trim() || null,
      file_path: form.file_path.trim(),
    };
    try {
      if (isEdit) {
        await api.patch(`/admin/downloads/${id}`, payload, { auth: true });
        navigate('/admin/downloads');
      } else {
        await api.post('/admin/downloads', payload, { auth: true });
        navigate('/admin/downloads');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && loading) return <p className="admin-form-loading">جارٍ تحميل بيانات الملف…</p>;

  return (
    <AdminFormPage
      title={isEdit ? `تعديل ملف: ${form.title || ''}` : 'ملف جديد'}
      subtitle="ارفع الملف (PDF أو Word أو Excel أو صورة) ثم احفظ البيانات."
      backTo="/admin/downloads"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card admin-form" onSubmit={save}>
        <AdminFormSection title="بيانات الملف">
          <div className="form-grid">
            <div className="form-field">
              <label>العنوان *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>التصنيف</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">بدون تصنيف</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="الملف" hint="الحد الأقصى 8 ميجابايت. الأنواع المدعومة: PDF، Word، Excel، PowerPoint، ZIP، TXT، والصور.">
          <div className="course-image-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? 'جارٍ الرفع…' : (form.file_path ? 'استبدال الملف' : 'رفع ملف')}
            </button>
            <input ref={fileRef} type="file" accept={ACCEPT} hidden onChange={onPick} />
            {form.file_path && (
              <a href={form.file_path} target="_blank" rel="noopener noreferrer" className="btn btn-soft btn-sm">معاينة الملف الحالي</a>
            )}
          </div>
          <div className="form-field form-field--full" style={{ marginTop: 12 }}>
            <label>رابط الملف (يمكن إدخاله يدويًا)</label>
            <input dir="ltr" value={form.file_path} onChange={(e) => setForm({ ...form, file_path: e.target.value })} required />
          </div>
        </AdminFormSection>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy || uploading}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</button>
          <Link to="/admin/downloads" className="btn btn-soft">إلغاء</Link>
        </div>
      </form>
    </AdminFormPage>
  );
}
