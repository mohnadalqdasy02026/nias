import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { ImageField, useImageUpload } from '../../components/admin/ImageField.jsx';
import { useAdminRecord } from '../../components/admin/useAdminRecord.js';

const emptyForm = {
  college_id: '',
  name_ar: '',
  name_en: '',
  description: '',
  head_name_ar: '',
  head_title: '',
  head_photo: '',
  image: '',
};

export default function DepartmentsAdmin() {
  const [items, setItems] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [collegeFilter, setCollegeFilter] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async (collegeId = collegeFilter) => {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (collegeId) params.set('collegeId', collegeId);
      const data = await api.get(`/admin/colleges/departments?${params.toString()}`, { auth: true });
      setItems(data ?? []);
    } catch (e) {
      setError(e.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.get('/admin/programs/lookup', { auth: true })
      .then((r) => setColleges(r?.colleges ?? []))
      .catch(() => {});
    load('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (d) => {
    if (!window.confirm(`حذف القسم "${d.name_ar}"؟`)) return;
    setBusy(d.id);
    try {
      await api.del(`/admin/colleges/departments/${d.id}`, { auth: true });
      await load(collegeFilter);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">الأقسام العلمية</h1>
      <p className="muted">إنشاء وتعديل أقسام الكليات مع رئيس القسم ووصف تفصيلي لكل قسم.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <select value={collegeFilter} onChange={(e) => { setCollegeFilter(e.target.value); load(e.target.value); }}>
          <option value="">كل الكليات</option>
          {colleges.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
        </select>
        <Link to="new" className="btn btn-primary">+ قسم جديد</Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>القسم</th>
              <th>الكلية</th>
              <th>رئيس القسم</th>
              <th>البرامج</th>
              <th>الكادر</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id}>
                <td data-label="القسم">{d.name_ar}</td>
                <td data-label="الكلية">{d.college_name_ar ?? '—'}</td>
                <td data-label="رئيس القسم">{d.head_name_ar ? `${d.head_name_ar}${d.head_title ? ` (${d.head_title})` : ''}` : '—'}</td>
                <td data-label="البرامج">{d.programs_count}</td>
                <td data-label="الكادر">{d.faculty_count}</td>
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
        {items.length === 0 && !error && <p className="muted admin-empty">لا توجد أقسام.</p>}
      </div>
    </section>
  );
}

export function DepartmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { record, loading } = useAdminRecord({ id, path: '/admin/colleges/departments' });
  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/programs/lookup', { auth: true })
      .then((r) => setColleges(r?.colleges ?? []))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!record) return;
    setForm({
      college_id: record.college_id ? String(record.college_id) : '',
      name_ar: record.name_ar ?? '',
      name_en: record.name_en ?? '',
      description: record.description ?? '',
      head_name_ar: record.head_name_ar ?? '',
      head_title: record.head_title ?? '',
      head_photo: record.head_photo ?? '',
      image: record.image ?? '',
    });
  }, [record]);

  const uploadPhoto = useImageUpload({
    onUploaded: (_key, url) => setForm((f) => ({ ...f, head_photo: url })),
    onError: setError,
    altText: () => form.head_name_ar || form.name_ar || 'رئيس قسم',
  });

  const uploadImage = useImageUpload({
    onUploaded: (_key, url) => setForm((f) => ({ ...f, image: url })),
    onError: setError,
    altText: () => form.name_ar || 'قسم',
  });

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const body = {
      ...form,
      college_id: form.college_id ? Number(form.college_id) : null,
    };
    try {
      if (isEdit) await api.patch(`/admin/colleges/departments/${id}`, body, { auth: true });
      else await api.post('/admin/colleges/departments', body, { auth: true });
      navigate('/admin/departments');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && loading) return <p className="admin-form-loading">جارٍ تحميل بيانات القسم…</p>;

  return (
    <AdminFormPage
      title={isEdit ? `تعديل قسم: ${form.name_ar || ''}` : 'قسم جديد'}
      subtitle="بيانات القسم ورئيسه والوصف التفصيلي الذي يظهر للزوار في صفحة القسم."
      backTo="/admin/departments"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card admin-form" onSubmit={save}>
        <AdminFormSection title="بيانات القسم">
          <div className="form-grid">
            <div className="form-field">
              <label>الكلية *</label>
              <select value={form.college_id} onChange={(e) => setForm({ ...form, college_id: e.target.value })} required>
                <option value="">اختر الكلية</option>
                {colleges.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>الاسم بالعربية *</label>
              <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>الاسم بالإنجليزية</label>
              <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field form-field--full">
              <label>وصف القسم</label>
              <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="رئيس القسم">
          <div className="form-grid">
            <div className="form-field">
              <label>اسم رئيس القسم</label>
              <input value={form.head_name_ar} onChange={(e) => setForm({ ...form, head_name_ar: e.target.value })} />
            </div>
            <div className="form-field">
              <label>الرتبة الأكاديمية</label>
              <input value={form.head_title} onChange={(e) => setForm({ ...form, head_title: e.target.value })} placeholder="مثال: أستاذ مساعد" />
            </div>
            <ImageField
              label="صورة رئيس القسم"
              value={form.head_photo}
              onChange={(url) => setForm({ ...form, head_photo: url })}
              upload={uploadPhoto}
              fieldKey="head_photo"
              shape="square"
            />
          </div>
        </AdminFormSection>

        <AdminFormSection title="الصورة">
          <div className="form-grid">
            <ImageField
              label="صورة القسم"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              upload={uploadImage}
              fieldKey="image"
              shape="wide"
            />
          </div>
        </AdminFormSection>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'جارٍ الحفظ…' : isEdit ? 'حفظ' : 'إنشاء'}</button>
          <Link to="/admin/departments" className="btn btn-soft">إلغاء</Link>
        </div>
      </form>
    </AdminFormPage>
  );
}