import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { ImageField, useImageUpload } from '../../components/admin/ImageField.jsx';
import { useAdminRecord } from '../../components/admin/useAdminRecord.js';
import StudyPlanEditor from './StudyPlanEditor.jsx';

const PROGRAM_TYPES = ['bachelor', 'diploma', 'master_executive', 'master_academic'];

const typeLabel = {
  bachelor: 'بكالوريوس',
  diploma: 'دبلوم',
  master_executive: 'ماجستير تنفيذي',
  master_academic: 'ماجستير أكاديمي',
};

const emptyForm = {
  college_id: '',
  department_id: '',
  branch_id: '',
  name_ar: '',
  name_en: '',
  program_type: 'bachelor',
  description: '',
  outcomes: '',
  image_url: '',
  admission_open: false,
  status: 'active',
};

export default function ProgramsAdmin() {
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
      if (fstatus) params.set('status', fstatus);
      if (q) params.set('search', q);
      if (p > 1) params.set('page', p);
      params.set('limit', perPage);
      const data = await api.get(`/admin/programs?${params.toString()}`, { auth: true });
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

  const remove = async (p) => {
    if (!window.confirm(`حذف البرنامج "${p.name_ar}" (أرشفة ناعمة)؟`)) return;
    setBusy(p.id);
    try {
      await api.del(`/admin/programs/${p.id}`, { auth: true });
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
      <h1 className="admin-page-title">البرامج الأكاديمية</h1>
      <p className="muted">إنشاء وتعديل وأرشفة برامج البكالوريوس والدبلوم والماجستير.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <input className="admin-search" placeholder="بحث بالاسم أو الوصف..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }} />
        <button type="button" className="btn btn-soft" onClick={runSearch}>بحث</button>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); load(1, e.target.value, search); }}>
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
        <Link to="new" className="btn btn-primary">+ برنامج جديد</Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>البرنامج</th>
              <th>النوع</th>
              <th>الفرع</th>
              <th>الكلية</th>
              <th>القسم</th>
              <th>التقديم</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td data-label="الصورة">
                  {p.image_url
                    ? <img className="admin-thumb" src={p.image_url} alt="" loading="lazy" />
                    : <span className="admin-thumb admin-thumb--empty">—</span>}
                </td>
                <td data-label="البرنامج">{p.name_ar}</td>
                <td data-label="النوع">{typeLabel[p.program_type]}</td>
                <td data-label="الفرع">{p.branch_name_ar ? <span className="badge-msg badge-success">{p.branch_name_ar}</span> : '—'}</td>
                <td data-label="الكلية">{p.college_name_ar ?? '—'}</td>
                <td data-label="القسم">{p.department_name_ar ?? '—'}</td>
                <td data-label="التقديم">{p.admission_open ? 'مفتوح' : 'مغلق'}</td>
                <td data-label="الحالة"><span className={`badge-msg badge-${p.status}`}>{p.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td data-label="إجراءات" className="table-actions">
                  <div className="admin-action-row">
                    <Link to={String(p.id)} className="btn btn-sm btn-soft">تعديل</Link>
                    <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === p.id} onClick={() => remove(p)}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="muted admin-empty">لا توجد برامج.</p>}
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

export function ProgramForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { record, loading } = useAdminRecord({ id, path: '/admin/programs' });
  const [refs, setRefs] = useState({ colleges: [], departments: [], branches: [] });
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/programs/lookup', { auth: true }).then(setRefs).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!record) return;
    setForm({
      college_id: record.college_id ? String(record.college_id) : '',
      department_id: record.department_id ? String(record.department_id) : '',
      branch_id: record.branch_id ? String(record.branch_id) : '',
      name_ar: record.name_ar ?? '',
      name_en: record.name_en ?? '',
      program_type: record.program_type ?? 'bachelor',
      description: record.description ?? '',
      outcomes: record.outcomes ?? '',
      image_url: record.image_url ?? '',
      admission_open: Boolean(record.admission_open),
      status: record.status ?? 'active',
    });
  }, [record]);

  const availableDepts = form.college_id
    ? refs.departments.filter((d) => String(d.college_id) === String(form.college_id))
    : [];

  const upload = useImageUpload({
    onUploaded: (_key, url) => setForm((f) => ({ ...f, image_url: url })),
    onError: setError,
    altText: () => form.name_ar || 'برنامج',
  });

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const body = {
      ...form,
      college_id: form.college_id ? Number(form.college_id) : null,
      department_id: form.department_id ? Number(form.department_id) : null,
      branch_id: form.branch_id ? Number(form.branch_id) : null,
    };
    try {
      if (isEdit) await api.patch(`/admin/programs/${id}`, body, { auth: true });
      else await api.post('/admin/programs', body, { auth: true });
      navigate('/admin/programs');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && loading) return <p className="admin-form-loading">جارٍ تحميل بيانات البرنامج…</p>;

  return (
    <AdminFormPage
      title={isEdit ? `تعديل برنامج: ${form.name_ar || ''}` : 'برنامج جديد'}
      subtitle="إنشاء وتعديل وأرشفة برامج البكالوريوس والدبلوم والماجستير."
      backTo="/admin/programs"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card admin-form" onSubmit={save}>
        <AdminFormSection title="بيانات البرنامج">
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
              <label>نوع البرنامج *</label>
              <select value={form.program_type} onChange={(e) => setForm({ ...form, program_type: e.target.value })}>
                {PROGRAM_TYPES.map((t) => <option key={t} value={t}>{typeLabel[t]}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>الفرع *</label>
              <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })} required>
                <option value="">اختر الفرع</option>
                {refs.branches.map((b) => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>الكلية</label>
              <select value={form.college_id} onChange={(e) => setForm({ ...form, college_id: e.target.value, department_id: '' })}>
                <option value="">بدون كلية</option>
                {refs.colleges.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>القسم</label>
              <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} disabled={!form.college_id}>
                <option value="">بدون قسم</option>
                {availableDepts.map((d) => <option key={d.id} value={d.id}>{d.name_ar}</option>)}
              </select>
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="الوصف والمخرجات">
          <div className="form-grid">
            <div className="form-field form-field--full">
              <label>الوصف</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>مخرجات التعلم</label>
              <textarea rows={3} value={form.outcomes} onChange={(e) => setForm({ ...form, outcomes: e.target.value })} />
            </div>
            <ImageField
              label="صورة البرنامج"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              upload={upload}
              fieldKey="image_url"
              shape="wide"
              hint="تُضغط الصورة تلقائيًا (عرض أقصى 1280px بجودة موفرة) فلا تبطئ الموقع أو محركات البحث."
            />
          </div>
        </AdminFormSection>

        <AdminFormSection title="الحالة">
          <div className="form-grid">
            <div className="form-field">
              <label className="checkbox-line">
                <input type="checkbox" checked={form.admission_open} onChange={(e) => setForm({ ...form, admission_open: e.target.checked })} />
                التقديم مفتوح
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

        {isEdit && <StudyPlanEditor programId={id} />}

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'جارٍ الحفظ…' : isEdit ? 'حفظ' : 'إنشاء'}</button>
          <Link to="/admin/programs" className="btn btn-soft">إلغاء</Link>
        </div>
      </form>
    </AdminFormPage>
  );
}
