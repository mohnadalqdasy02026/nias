import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import RichEditor from '../../components/admin/RichEditor.jsx';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { ImageField, useImageUpload } from '../../components/admin/ImageField.jsx';
import { useAdminRecord } from '../../components/admin/useAdminRecord.js';

const emptyForm = {
  branch_id: '',
  name_ar: '',
  name_en: '',
  dean_name: '',
  dean_name_ar: '',
  dean_name_en: '',
  dean_message_ar: '',
  dean_message_en: '',
  image: '',
  dean_image: '',
  vision: '',
  mission: '',
  about: '',
  status: 'active',
};

const toForm = (c) => ({
  branch_id: c?.branch_id ? String(c.branch_id) : '',
  name_ar: c?.name_ar ?? '',
  name_en: c?.name_en ?? '',
  dean_name: c?.dean_name ?? '',
  dean_name_ar: c?.dean_name_ar ?? '',
  dean_name_en: c?.dean_name_en ?? '',
  dean_message_ar: c?.dean_message_ar ?? '',
  dean_message_en: c?.dean_message_en ?? '',
  image: c?.image ?? '',
  dean_image: c?.dean_image ?? '',
  vision: c?.vision ?? '',
  mission: c?.mission ?? '',
  about: c?.about ?? '',
  status: c?.status ?? 'active',
});

export default function CollegesAdmin() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setError(null);
    try {
      setItems((await api.get('/admin/colleges', { auth: true })) ?? []);
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`هل تريد حذف الكلية «${c.name_ar}»؟ سيُحذف كل ما يرتبط بها من أقسام.`)) return;
    setBusy(c.id);
    setError(null);
    try {
      await api.del(`/admin/colleges/${c.id}`, { auth: true });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">الكليات</h1>
      <p className="muted">بيانات الكليات في كل فرع: الاسم، صورة الكلية، عميد الكلية وصورته وكلمته، الرؤية والرسالة والنبذة. تُعرض في صفحة الفرع بالتبويب «الكليات».</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <Link to="new" className="btn btn-primary">كلية جديدة</Link>
        <button type="button" className="btn btn-soft" onClick={load}>تحديث</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الكلية</th>
              <th>الفرع</th>
              <th>صورة الكلية</th>
              <th>العميد</th>
              <th>صورة العميد</th>
              <th>كلمة العميد</th>
              <th>الرؤية</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td data-label="الكلية">
                  <strong>{c.name_ar}</strong>
                  <div className="muted">{c.name_en ?? ''}</div>
                </td>
                <td data-label="الفرع">{c.branch_name_ar ?? '—'}</td>
                <td data-label="صورة الكلية">
                  {c.image ? <img src={c.image} alt="" className="table-thumb" /> : <span className="table-muted">—</span>}
                </td>
                <td data-label="العميد">
                  {c.dean_name_ar || c.dean_name_en || c.dean_name
                    ? <span className="badge-msg badge-success">{c.dean_name_ar ?? c.dean_name_en ?? c.dean_name}</span>
                    : '—'}
                </td>
                <td data-label="صورة العميد">
                  {c.dean_image ? <img src={c.dean_image} alt="" className="table-thumb table-thumb--round" /> : <span className="table-muted">—</span>}
                </td>
                <td data-label="كلمة العميد" className="table-muted">{c.dean_message_ar ? 'منشورة' : '—'}</td>
                <td data-label="الرؤية" className="table-muted">{c.vision ? 'منشورة' : '—'}</td>
                <td data-label="الحالة" className="table-muted">{c.status}</td>
                <td data-label="إجراءات" className="table-actions">
                  <div className="admin-action-row">
                    <Link to={String(c.id)} className="btn btn-sm btn-soft">تعديل</Link>
                    <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === c.id} onClick={() => remove(c)}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="muted admin-empty">لا توجد كليات.</p>}
      </div>
    </section>
  );
}

export function CollegeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { record, loading } = useAdminRecord({ id, path: '/admin/colleges' });
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/branches', { auth: true }).then((list) => setBranches(list ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (record) setForm(toForm(record));
  }, [record]);

  const upload = useImageUpload({
    onUploaded: (key, url) => setForm((f) => ({ ...f, [key]: url })),
    onError: setError,
    altText: () => form.name_ar || 'كلية',
  });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      branch_id: form.branch_id ? Number(form.branch_id) : null,
      name_ar: form.name_ar.trim(),
      name_en: form.name_en.trim() || null,
      dean_name: form.dean_name.trim() || null,
      dean_name_ar: form.dean_name_ar.trim() || null,
      dean_name_en: form.dean_name_en.trim() || null,
      dean_message_ar: form.dean_message_ar.trim() || null,
      dean_message_en: form.dean_message_en.trim() || null,
      image: form.image.trim() || null,
      dean_image: form.dean_image.trim() || null,
      vision: form.vision.trim() || null,
      mission: form.mission.trim() || null,
      about: form.about.trim() || null,
      status: form.status,
    };
    try {
      if (isEdit) {
        await api.patch(`/admin/colleges/${id}`, payload, { auth: true });
      } else {
        await api.post('/admin/colleges', payload, { auth: true });
      }
      navigate('/admin/colleges');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && loading) return <p className="admin-form-loading">جارٍ تحميل بيانات الكلية…</p>;

  return (
    <AdminFormPage
      title={isEdit ? `تعديل كلية: ${form.name_ar || ''}` : 'كلية جديدة'}
      subtitle="تُعرض هذه البيانات في صفحة الفرع بالتبويب «الكليات»."
      backTo="/admin/colleges"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card admin-form" onSubmit={save}>
        <AdminFormSection title="البيانات الأساسية">
          <div className="form-grid">
            <div className="form-field">
              <label>اسم الكلية (عربي) *</label>
              <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>اسم الكلية (إنجليزي)</label>
              <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>الفرع</label>
              <select value={form.branch_id ?? ''} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}>
                <option value="">غير محدد</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">نشطة</option>
                <option value="inactive">متوقفة</option>
              </select>
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="العميد" hint="الاسم بالعربية هو اللي يظهر في صفحة الكلية. الاسم بالإنجليزية و«المختصر/القديم» للتوافق مع البيانات القديمة.">
          <div className="form-grid">
            <div className="form-field form-field--full">
              <label>عميد الكلية (اسم بالعربية)</label>
              <input value={form.dean_name_ar ?? ''} onChange={(e) => setForm({ ...form, dean_name_ar: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>عميد الكلية (اسم بالإنجليزية)</label>
              <input value={form.dean_name_en ?? ''} onChange={(e) => setForm({ ...form, dean_name_en: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field form-field--full">
              <label>عميد الكلية (اسم مختصر / قديم)</label>
              <input value={form.dean_name ?? ''} onChange={(e) => setForm({ ...form, dean_name: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>كلمة عميد الكلية (عربي)</label>
              <RichEditor value={form.dean_message_ar ?? ''} onChange={(html) => setForm({ ...form, dean_message_ar: html })} rows={5} />
            </div>
            <div className="form-field form-field--full">
              <label>كلمة عميد الكلية (إنجليزي)</label>
              <RichEditor value={form.dean_message_en ?? ''} onChange={(html) => setForm({ ...form, dean_message_en: html })} rows={5} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="الصور" hint="صورة الكلية تظهر بحجم موحّد في كل الكليات. صورة العميد تظهر كصورة دائرية.">
          <div className="form-grid">
            <ImageField
              label="صورة الكلية"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              upload={upload}
              fieldKey="image"
              shape="wide"
            />
            <ImageField
              label="صورة عميد الكلية"
              value={form.dean_image}
              onChange={(url) => setForm({ ...form, dean_image: url })}
              upload={upload}
              fieldKey="dean_image"
              shape="square"
            />
          </div>
        </AdminFormSection>

        <AdminFormSection title="النبذة والرؤية والرسالة">
          <div className="form-grid">
            <div className="form-field form-field--full">
              <label>نبذة عن الكلية</label>
              <textarea rows={3} value={form.about ?? ''} onChange={(e) => setForm({ ...form, about: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>الرؤية</label>
              <textarea rows={2} value={form.vision ?? ''} onChange={(e) => setForm({ ...form, vision: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>الرسالة</label>
              <textarea rows={2} value={form.mission ?? ''} onChange={(e) => setForm({ ...form, mission: e.target.value })} />
            </div>
          </div>
        </AdminFormSection>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</button>
          <Link to="/admin/colleges" className="btn btn-soft">إلغاء</Link>
        </div>
      </form>
    </AdminFormPage>
  );
}
