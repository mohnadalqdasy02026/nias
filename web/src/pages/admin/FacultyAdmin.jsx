import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { ImageField, useImageUpload } from '../../components/admin/ImageField.jsx';
import { useAdminRecord } from '../../components/admin/useAdminRecord.js';

const emptyForm = {
  department_id: '',
  branch_id: '',
  name_ar: '',
  name_en: '',
  title: '',
  specialization: '',
  email: '',
  phone: '',
  photo: '',
  is_dept_head: false,
  status: 'active',
};

const emptyRefs = { departments: [], branches: [] };

export default function FacultyAdmin() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const perPage = 20;

  const load = useCallback(async (p = page, fstatus = filter, q = search) => {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fstatus && fstatus !== '') params.set('status', fstatus);
      if (q) params.set('search', q);
      if (p > 1) params.set('page', p);
      params.set('limit', perPage);
      const data = await api.get(`/admin/faculty?${params.toString()}`, { auth: true });
      setItems(data?.items ?? []);
      setTotal(data?.total ?? 0);
    } catch (e) {
      setError(e.message);
    }
  }, [page, filter, search]);

  useEffect(() => {
    load(1, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (m) => {
    if (!window.confirm(`حذف العضو "${m.name_ar}" (أرشفة ناعمة)؟`)) return;
    setBusy(m.id);
    try {
      await api.del(`/admin/faculty/${m.id}`, { auth: true });
      await load(page, filter, search);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const runSearch = () => { setPage(1); load(1, filter, search); };

  return (
    <section>
      <h1 className="admin-page-title">الكادر الأكاديمي</h1>
      <p className="muted">إضافة وتعديل وأرشفة أعضاء هيئة التدريس. الرتبة التي تختارها تظهر تلقائيًا في فلترة الموقع.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <input className="admin-search" placeholder="بحث بالاسم أو الرتبة أو التخصص..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }} />
        <button type="button" className="btn btn-soft" onClick={runSearch}>بحث</button>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); load(1, e.target.value, search); }}>
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
        <Link to="new" className="btn btn-primary">+ عضو جديد</Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>الاسم</th>
              <th>الرتبة</th>
              <th>الفرع</th>
              <th>القسم</th>
              <th>التخصص</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td data-label="الصورة">
                  {m.photo
                    ? <img className="admin-thumb table-thumb--round" src={m.photo} alt="" loading="lazy" />
                    : <span className="admin-thumb admin-thumb--empty table-thumb--round">—</span>}
                </td>
                <td data-label="الاسم">
                  <strong>{m.name_ar}</strong>
                  {m.is_dept_head && <span className="badge-msg badge-success" style={{ marginInlineStart: 6 }}>رئيس قسم</span>}
                </td>
                <td data-label="الرتبة">{m.title || '—'}</td>
                <td data-label="الفرع">{m.branch_name_ar ? <span className="badge-msg badge-success">{m.branch_name_ar}</span> : '—'}</td>
                <td data-label="القسم">{m.department_name_ar ?? '—'}</td>
                <td data-label="التخصص" className="table-muted">{m.specialization || '—'}</td>
                <td data-label="الحالة"><span className={`badge-msg badge-${m.status}`}>{m.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td data-label="إجراءات" className="table-actions">
                  <div className="admin-action-row">
                    <Link to={String(m.id)} className="btn btn-sm btn-soft">تعديل</Link>
                    <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === m.id} onClick={() => remove(m)}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="muted admin-empty">لا يوجد أعضاء هيئة تدريس.</p>}
      </div>

      {total > perPage && (
        <div className="admin-pagination">
          <button type="button" className="btn btn-sm btn-soft" disabled={page === 1} onClick={() => { const np = page - 1; setPage(np); load(np, filter, search); }}>السابق</button>
          <span>صفحة {page} من {Math.max(1, Math.ceil(total / perPage))}</span>
          <button type="button" className="btn btn-sm btn-soft" disabled={page >= Math.ceil(total / perPage)} onClick={() => { const np = page + 1; setPage(np); load(np, filter, search); }}>التالي</button>
        </div>
      )}
    </section>
  );
}

export function FacultyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { record, loading } = useAdminRecord({ id, path: '/admin/faculty' });
  const [titles, setTitles] = useState([]);
  const [refs, setRefs] = useState(emptyRefs);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/faculty/lookup', { auth: true }).then(setRefs).catch((e) => setError(e.message));
    api.get('/admin/faculty/titles', { auth: true })
      .then(setTitles)
      .catch((e) => { if (!['UNPROCESSABLE_ENTITY', 'BAD_REQUEST'].includes(e.code) && !e.message?.includes('404')) setError(e.message); });
  }, []);

  useEffect(() => {
    if (!record) return;
    setForm({
      department_id: record.department_id ? String(record.department_id) : '',
      branch_id: record.branch_id ? String(record.branch_id) : '',
      name_ar: record.name_ar ?? '',
      name_en: record.name_en ?? '',
      title: record.title ?? '',
      specialization: record.specialization ?? '',
      email: record.email ?? '',
      phone: record.phone ?? '',
      photo: record.photo ?? '',
      is_dept_head: Boolean(record.is_dept_head),
      status: record.status ?? 'active',
    });
  }, [record]);

  const upload = useImageUpload({
    onUploaded: (_key, url) => setForm((f) => ({ ...f, photo: url })),
    onError: setError,
    altText: () => form.name_ar || 'عضو هيئة تدريس',
  });

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const body = {
      department_id: form.department_id ? Number(form.department_id) : null,
      branch_id: form.branch_id ? Number(form.branch_id) : null,
      name_ar: form.name_ar.trim(),
      name_en: form.name_en.trim() || null,
      title: form.title.trim() || null,
      specialization: form.specialization.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      photo: form.photo || null,
      is_dept_head: Boolean(form.is_dept_head),
      status: form.status,
    };
    try {
      if (isEdit) await api.patch(`/admin/faculty/${id}`, body, { auth: true });
      else await api.post('/admin/faculty', body, { auth: true });
      navigate('/admin/faculty');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && loading) return <p className="admin-form-loading">جارٍ تحميل بيانات العضو…</p>;

  return (
    <AdminFormPage
      title={isEdit ? `تعديل عضو: ${form.name_ar || ''}` : 'عضو جديد'}
      subtitle="إضافة وتعديل وأرشفة أعضاء هيئة التدريس. الرتبة التي تختارها تظهر تلقائيًا في فلترة الموقع."
      backTo="/admin/faculty"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card admin-form" onSubmit={save}>
        <AdminFormSection title="بيانات العضو">
          <div className="form-grid">
            <div className="form-field">
              <label>الاسم بالعربية *</label>
              <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>الاسم بالإنجليزية</label>
              <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>الرتبة / المؤهل</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: دكتوراه، ماجستير، مدرس..." list="faculty-titles-list" />
              <datalist id="faculty-titles-list">
                {titles.map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div className="form-field">
              <label>التخصص</label>
              <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            </div>
            <div className="form-field">
              <label>الفرع</label>
              <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}>
                <option value="">غير محدد</option>
                {refs.branches.map((b) => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>القسم</label>
              <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                <option value="">غير محدد</option>
                {refs.departments.map((d) => <option key={d.id} value={d.id}>{d.name_ar}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>البريد الإلكتروني</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} dir="ltr" type="email" />
            </div>
            <div className="form-field">
              <label>رقم الجوال</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="الصورة والحالة">
          <div className="form-grid">
            <ImageField
              label="الصورة الشخصية"
              value={form.photo}
              onChange={(url) => setForm({ ...form, photo: url })}
              upload={upload}
              fieldKey="photo"
              shape="square"
              hint="يُفضل صورة شخصية مربعة. تُضغط تلقائيًا ولا تبطئ الموقع."
            />
            <div className="form-field">
              <label className="checkbox-line">
                <input type="checkbox" checked={form.is_dept_head} onChange={(e) => setForm({ ...form, is_dept_head: e.target.checked })} />
                رئيس قسم
              </label>
            </div>
            <div className="form-field">
              <label>الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </div>
        </AdminFormSection>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'جارٍ الحفظ…' : isEdit ? 'حفظ' : 'إنشاء'}</button>
          <Link to="/admin/faculty" className="btn btn-soft">إلغاء</Link>
        </div>
      </form>
    </AdminFormPage>
  );
}
