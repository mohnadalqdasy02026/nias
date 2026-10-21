import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { useAdminRecord } from '../../components/admin/useAdminRecord.js';
import { useImageUpload } from '../../components/admin/ImageField.jsx';
import Can from '../../components/admin/Can.jsx';

const STATUS_LABELS = {
  draft: 'مسودة',
  published: 'منشور',
  archived: 'مؤرشف',
};

const ACCEPT = '.pdf,.doc,.docx,.zip,.txt';

const readBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const emptyForm = {
  title: '',
  issue_number: '',
  published_at: '',
  status: 'draft',
  cover: '',
  file_path: '',
};

const toForm = (d) => ({
  title: d?.title ?? '',
  issue_number: d?.issue_number ?? '',
  published_at: d?.published_at ? String(d.published_at).slice(0, 10) : '',
  status: d?.status ?? 'draft',
  cover: d?.cover ?? '',
  file_path: d?.file_path ?? '',
});

export default function JournalAdmin() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems((await api.get('/admin/journal', { auth: true })) ?? []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (item) => {
    if (!window.confirm(`هل تريد حذف العدد «${item.title}»؟`)) return;
    setBusy(item.id);
    setError(null);
    try {
      await api.del(`/admin/journal/${item.id}`, { auth: true });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">مجلة العلوم الإدارية</h1>
      <p className="muted">أضف أعداد المجلة العلمية (العدد، تاريخ النشر، غلاف العدد، ملف PDF). تظهر الأعداد المنشورة في صفحة «المجلة» العامة.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <Can perm="journal.create"><Link to="new" className="btn btn-primary">عدد جديد</Link></Can>
        <button type="button" className="btn btn-soft" onClick={load}>تحديث</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>العدد</th>
              <th>تاريخ النشر</th>
              <th>الحالة</th>
              <th>الملف</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id}>
                <td data-label="العنوان"><strong>{d.title}</strong></td>
                <td data-label="العدد" className="table-muted">{d.issue_number || '—'}</td>
                <td data-label="تاريخ النشر" className="table-muted">{d.published_at ? String(d.published_at).slice(0, 10) : '—'}</td>
                <td data-label="الحالة">
                  <span className={`badge-msg ${d.status === 'published' ? 'badge-success' : 'badge-muted'}`}>
                    {STATUS_LABELS[d.status] ?? d.status}
                  </span>
                </td>
                <td data-label="الملف">
                  {d.file_path
                    ? <a href={d.file_path} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-soft">فتح</a>
                    : <span className="table-muted">—</span>}
                </td>
                <td data-label="إجراءات" className="table-actions">
                  <div className="admin-action-row">
                    <Can perm="journal.update"><Link to={String(d.id)} className="btn btn-sm btn-soft">تعديل</Link></Can>
                    <Can perm="journal.delete"><button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === d.id} onClick={() => remove(d)}>حذف</button></Can>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="muted admin-empty">لا توجد أعداد بعد.</p>}
      </div>
    </section>
  );
}

export function JournalForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { record, loading } = useAdminRecord({ id, path: '/admin/journal' });
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const coverUpload = useImageUpload({
    onUploaded: (_key, url) => setForm((f) => ({ ...f, cover: url })),
    onError: (msg) => setError(msg ?? null),
  });
  const coverBusy = coverUpload.busyKey === 'cover';

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
      issue_number: form.issue_number.trim(),
      published_at: form.published_at || null,
      status: form.status,
      cover: form.cover.trim(),
      file_path: form.file_path.trim(),
    };
    try {
      if (isEdit) {
        await api.patch(`/admin/journal/${id}`, payload, { auth: true });
      } else {
        await api.post('/admin/journal', payload, { auth: true });
      }
      navigate('/admin/journal');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && loading) return <p className="admin-form-loading">جارٍ تحميل بيانات العدد…</p>;

  return (
    <AdminFormPage
      title={isEdit ? `تعديل العدد: ${form.title || ''}` : 'عدد جديد من المجلة'}
      subtitle="حدّد رقم العدد وتاريخ النشر، ارفع غلاف العدد وملف PDF، ثم احفظ."
      backTo="/admin/journal"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card admin-form" onSubmit={save}>
        <AdminFormSection title="بيانات العدد">
          <div className="form-grid">
            <div className="form-field">
              <label>عنوان العدد *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>رقم العدد</label>
              <input value={form.issue_number} onChange={(e) => setForm({ ...form, issue_number: e.target.value })} placeholder="مثال: العدد العاشر" />
            </div>
            <div className="form-field">
              <label>تاريخ النشر</label>
              <input type="date" dir="ltr" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
            </div>
            <div className="form-field">
              <label>الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="غلاف العدد" hint="صورة الغلاف الظاهرة في صفحة المجلة.">
          <button type="button" className="btn btn-primary btn-sm" onClick={coverUpload.pick('cover')} disabled={coverBusy}>
            {coverBusy ? 'جارٍ الرفع…' : (form.cover ? 'استبدال الغلاف' : 'رفع صورة الغلاف')}
          </button>
          <input ref={coverUpload.registerInput('cover')} type="file" accept="image/*" hidden />
          {form.cover && (
            <img src={form.cover} alt="غلاف العدد" style={{ width: 80, borderRadius: 8, marginTop: 10, display: 'block' }} />
          )}
          <div className="form-field form-field--full" style={{ marginTop: 12 }}>
            <label>رابط الغلاف (يمكن إدخاله يدويًا)</label>
            <input dir="ltr" value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} />
          </div>
        </AdminFormSection>

        <AdminFormSection title="ملف العدد" hint="الحد الأقصى 8 ميجابايت. الأنواع المدعومة: PDF، Word، ZIP، TXT.">
          <div className="course-image-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? 'جارٍ الرفع…' : (form.file_path ? 'استبدال الملف' : 'رفع ملف العدد')}
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
          <button type="submit" className="btn btn-primary" disabled={busy || uploading || coverBusy}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</button>
          <Link to="/admin/journal" className="btn btn-soft">إلغاء</Link>
        </div>
      </form>
    </AdminFormPage>
  );
}
