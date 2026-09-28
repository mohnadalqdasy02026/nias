import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import RichEditor from '../../components/admin/RichEditor.jsx';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { ImageField, useImageUpload } from '../../components/admin/ImageField.jsx';
import { useAdminRecord } from '../../components/admin/useAdminRecord.js';

const emptyForm = {
  name_ar: '',
  name_en: '',
  address: '',
  phone: '',
  is_headquarters: false,
  dean_image: '',
  latitude: '',
  longitude: '',
  dean_name_ar: '',
  dean_name_en: '',
  dean_message_ar: '',
  dean_message_en: '',
};

const SUBTITLE = 'بيانات الفروع كاملة: الاسم، المقر الرئيسي، صورة المسؤول، موقع الخريطة، الاسم والكلمة. المسؤول في الديوان «عميد الفروع» وفي باقي الفروع «مدير الفرع»، وينعكس ذلك مباشرة على صفحة كل فرع في الموقع.';

export default function BranchesAdmin() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems((await api.get('/admin/branches', { auth: true })) ?? []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section>
      <h1 className="admin-page-title">إعدادات الفروع</h1>
      <p className="muted">{SUBTITLE}</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <button type="button" className="btn btn-soft" onClick={load}>تحديث</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الفرع</th>
              <th>الصورة</th>
              <th>المسؤول</th>
              <th>كلمته</th>
              <th>العنوان</th>
              <th>الهاتف</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => {
              const head = b.is_headquarters ? 'العميد' : 'مدير الفرع';
              return (
              <tr key={b.id}>
                <td data-label="الفرع">
                  <strong>{b.name_ar}</strong>
                  <div className="muted">{b.is_headquarters ? 'المقر الرئيسي — ' : ''}{b.slug}</div>
                </td>
                <td data-label={`صورة ${head}`}>
                  {b.dean_image ? (
                    <img src={b.dean_image} alt="" className="table-thumb table-thumb--round" />
                  ) : (
                    <span className="table-muted">—</span>
                  )}
                </td>
                <td data-label={head}>{b.dean_name_ar ? <span className="badge-msg badge-success">{b.dean_name_ar}</span> : '—'}</td>
                <td data-label={`كلمة ${head}`} className="table-muted">{b.dean_message_ar ? 'منشورة' : '—'}</td>
                <td data-label="العنوان">{b.address ?? '—'}</td>
                <td data-label="الهاتف" dir="ltr">{b.phone ?? '—'}</td>
                <td data-label="إجراءات" className="table-actions">
                  <Link to={String(b.id)} className="btn btn-sm btn-soft">تعديل</Link>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="muted admin-empty">لا توجد فروع.</p>}
      </div>
    </section>
  );
}

export function BranchForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { record, loading } = useAdminRecord({ id, path: '/admin/branches' });
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!record) return;
    setForm({
      name_ar: record.name_ar ?? '',
      name_en: record.name_en ?? '',
      address: record.address ?? '',
      phone: record.phone ?? '',
      is_headquarters: record.is_headquarters ?? false,
      dean_image: record.dean_image ?? '',
      latitude: record.latitude != null ? String(record.latitude) : '',
      longitude: record.longitude != null ? String(record.longitude) : '',
      dean_name_ar: record.dean_name_ar ?? '',
      dean_name_en: record.dean_name_en ?? '',
      dean_message_ar: record.dean_message_ar ?? '',
      dean_message_en: record.dean_message_en ?? '',
    });
  }, [record]);

  const upload = useImageUpload({
    onUploaded: (_key, url) => setForm((f) => ({ ...f, dean_image: url })),
    onError: setError,
    altText: () => (form.is_headquarters ? 'عميد الفروع' : `مدير ${form.name_ar || 'الفرع'}`),
  });

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.patch(`/admin/branches/${id}`, {
        name_ar: form.name_ar.trim(),
        name_en: form.name_en.trim() || null,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        is_headquarters: !!form.is_headquarters,
        dean_image: form.dean_image.trim() || null,
        latitude: form.latitude.trim() || null,
        longitude: form.longitude.trim() || null,
        dean_name_ar: form.dean_name_ar.trim() || null,
        dean_name_en: form.dean_name_en.trim() || null,
        dean_message_ar: form.dean_message_ar.trim() || null,
        dean_message_en: form.dean_message_en.trim() || null,
      }, { auth: true });
      navigate('/admin/branches');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="admin-form-loading">جارٍ تحميل بيانات الفرع…</p>;

  return (
    <AdminFormPage
      title={record ? `تعديل بيانات الفرع: ${form.name_ar || ''}` : 'بيانات الفرع'}
      subtitle={SUBTITLE}
      backTo="/admin/branches"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card admin-form" onSubmit={save}>
        <AdminFormSection title="بيانات الفرع">
          <div className="form-grid">
            <div className="form-field">
              <label>اسم الفرع بالعربية *</label>
              <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>اسم الفرع بالإنجليزية</label>
              <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field form-field--full">
              <label className="checkbox-line">
                <input type="checkbox" checked={form.is_headquarters} onChange={(e) => setForm({ ...form, is_headquarters: e.target.checked })} />
                المقر الرئيسي (يظهر الأول وبتغليم مميز)
              </label>
            </div>
            <div className="form-field">
              <label>الهاتف</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>خط الطول (Longitude)</label>
              <input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} dir="ltr" placeholder="مثال: 44.2011" />
            </div>
            <div className="form-field">
              <label>خط العرض (Latitude)</label>
              <input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} dir="ltr" placeholder="مثال: 15.3694" />
            </div>
            <div className="form-field form-field--full">
              <label>العنوان</label>
              <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title={form.is_headquarters ? 'عميد الفروع' : 'مدير الفرع'}>
          <div className="form-grid">
            <div className="form-field">
              <label>{form.is_headquarters ? 'عميد الفروع (عربي)' : 'مدير الفرع (عربي)'}</label>
              <input value={form.dean_name_ar} onChange={(e) => setForm({ ...form, dean_name_ar: e.target.value })} />
            </div>
            <div className="form-field">
              <label>{form.is_headquarters ? 'عميد الفروع (إنجليزي)' : 'مدير الفرع (إنجليزي)'}</label>
              <input value={form.dean_name_en} onChange={(e) => setForm({ ...form, dean_name_en: e.target.value })} dir="ltr" />
            </div>
            <ImageField
              label={form.is_headquarters ? 'صورة العميد' : 'صورة مدير الفرع'}
              value={form.dean_image}
              onChange={(url) => setForm({ ...form, dean_image: url })}
              upload={upload}
              fieldKey="dean_image"
              shape="square"
              hint="تُضغط الصورة تلقائيًا (عرض أقصى 1280px بجودة موفرة)."
            />
            <div className="form-field form-field--full">
              <label>{form.is_headquarters ? 'كلمة العميد (عربي)' : 'كلمة المدير (عربي)'}</label>
              <RichEditor value={form.dean_message_ar} onChange={(html) => setForm({ ...form, dean_message_ar: html })} rows={6} />
            </div>
            <div className="form-field form-field--full">
              <label>{form.is_headquarters ? 'كلمة العميد (إنجليزي)' : 'كلمة المدير (إنجليزي)'}</label>
              <RichEditor value={form.dean_message_en} onChange={(html) => setForm({ ...form, dean_message_en: html })} rows={6} />
            </div>
          </div>
        </AdminFormSection>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</button>
          <Link to="/admin/branches" className="btn btn-soft">إلغاء</Link>
        </div>
      </form>
    </AdminFormPage>
  );
}
