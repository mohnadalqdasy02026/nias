import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../contexts/auth.jsx';
import { branchLabel } from '../../lib/branch.js';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { ImageField, useImageUpload } from '../../components/admin/ImageField.jsx';
import { useAdminRecord } from '../../components/admin/useAdminRecord.js';
import { TRAINING_CATEGORY_LABELS } from '../../lib/training.js';

const statusLabel = { draft: 'مسودة', open: 'مفتوحة', closed: 'مغلقة', completed: 'مكتملة' };

const emptyForm = {
  title: '',
  branch_id: '',
  description: '',
  fees: '',
  start_date: '',
  end_date: '',
  location: '',
  capacity: '',
  trainer: '',
  category: 'course',
  image_url: '',
  status: 'draft',
};

export default function TrainingCourses() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const perPage = 20;

  const load = useCallback(async (fstatus = status, fbranch = branchFilter, p = page) => {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fstatus) params.set('status', fstatus);
      if (fbranch) params.set('branchId', fbranch);
      if (p > 1) params.set('page', p);
      params.set('limit', perPage);
      const data = await api.get(`/admin/training/courses?${params.toString()}`, { auth: true });
      setItems(data?.items ?? data ?? []);
      setTotal(data?.total ?? items.length);
      setPage(p);
    } catch (e) {
      setError(e.message);
    }
  }, [status, branchFilter, page]);

  useEffect(() => {
    load();
    api.get('/public/branches').then(setBranches).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (c) => {
    if (!window.confirm(`حذف الدورة "${c.title}" نهائيًا؟`)) return;
    setBusy(c.id);
    try {
      await api.del(`/admin/training/courses/${c.id}`, { auth: true });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">الدورات التدريبية</h1>
      <p className="muted">إنشاء وإدارة الدورات وحالة فتح التسجيل فيها.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <select value={status} onChange={(e) => { setStatus(e.target.value); load(e.target.value, branchFilter, 1); }}>
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="open">مفتوحة</option>
          <option value="closed">مغلقة</option>
          <option value="completed">مكتملة</option>
        </select>
        <select value={branchFilter} onChange={(e) => { setBranchFilter(e.target.value); load(status, e.target.value, 1); }}>
          <option value="">كل الفروع</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{branchLabel(b.name_ar) ?? b.name_ar}</option>)}
        </select>
        <Link to="new" className="btn btn-primary">+ دورة جديدة</Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>العنوان</th>
              <th>التصنيف</th>
              <th>الفرع</th>
              <th>الحالة</th>
              <th>التسجيلات</th>
              <th>المقاعد</th>
              <th>الرسوم</th>
              <th>المدرب</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td data-label="الصورة">
                  {c.image_url
                    ? <img className="admin-thumb" src={c.image_url} alt="" loading="lazy" />
                    : <span className="admin-thumb admin-thumb--empty">—</span>}
                </td>
                <td data-label="العنوان">{c.title}</td>
                <td data-label="التصنيف">{TRAINING_CATEGORY_LABELS[c.category] ?? TRAINING_CATEGORY_LABELS.course}</td>
                <td data-label="الفرع">{c.branch_name_ar ? <span className="badge-msg badge-success">{branchLabel(c.branch_name_ar)}</span> : '—'}</td>
                <td data-label="الحالة"><span className={`badge-msg badge-${c.status === 'open' ? 'success' : 'draft'}`}>{statusLabel[c.status]}</span></td>
                <td data-label="التسجيلات">{c.enrollments_count}</td>
                <td data-label="المقاعد">{c.capacity ?? '—'}</td>
                <td data-label="الرسوم">{c.fees != null ? c.fees : '—'}</td>
                <td data-label="المدرب">{c.trainer ?? '—'}</td>
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
        {items.length === 0 && <p className="muted admin-empty">لا توجد دورات.</p>}
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

export function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const { record, loading } = useAdminRecord({ id, path: '/admin/training/courses' });
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({ ...emptyForm, branch_id: user?.branchId ?? '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/public/branches').then(setBranches).catch(() => {});
  }, []);

  useEffect(() => {
    if (!record) return;
    setForm({
      title: record.title ?? '',
      branch_id: record.branch_id ?? '',
      description: record.description ?? '',
      fees: record.fees ?? '',
      start_date: record.start_date ?? '',
      end_date: record.end_date ?? '',
      location: record.location ?? '',
      capacity: record.capacity ?? '',
      trainer: record.trainer ?? '',
      category: record.category ?? 'course',
      image_url: record.image_url ?? '',
      status: record.status ?? 'draft',
    });
  }, [record]);

  const upload = useImageUpload({
    onUploaded: (_key, url) => setForm((f) => ({ ...f, image_url: url })),
    onError: setError,
    altText: () => form.title || 'دورة',
  });

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const body = {
      ...form,
      branch_id: form.branch_id === '' ? null : Number(form.branch_id),
      fees: form.fees === '' ? null : Number(form.fees),
      capacity: form.capacity === '' ? null : Number(form.capacity),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };
    try {
      if (isEdit) await api.patch(`/admin/training/courses/${id}`, body, { auth: true });
      else await api.post('/admin/training/courses', body, { auth: true });
      navigate('/admin/training/courses');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && loading) return <p className="admin-form-loading">جارٍ تحميل بيانات الدورة…</p>;

  return (
    <AdminFormPage
      title={isEdit ? `تعديل دورة: ${form.title || ''}` : 'دورة جديدة'}
      subtitle="إنشاء وإدارة الدورات وحالة فتح التسجيل فيها."
      backTo="/admin/training/courses"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card admin-form" onSubmit={save}>
        <AdminFormSection title="بيانات الدورة">
          <div className="form-grid">
            <div className="form-field form-field--full">
              <label>عنوان الدورة *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>الفرع *</label>
              <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })} required>
                <option value="">اختر الفرع</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{branchLabel(b.name_ar) ?? b.name_ar}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>التصنيف</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {Object.entries(TRAINING_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">مسودة</option>
                <option value="open">مفتوحة</option>
                <option value="closed">مغلقة</option>
                <option value="completed">مكتملة</option>
              </select>
            </div>
            <div className="form-field form-field--full">
              <label>الوصف</label>
              <textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-field">
              <label>المدرب</label>
              <input value={form.trainer ?? ''} onChange={(e) => setForm({ ...form, trainer: e.target.value })} />
            </div>
            <div className="form-field">
              <label>الموقع</label>
              <input value={form.location ?? ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="التواريخ والتسجيل">
          <div className="form-grid">
            <div className="form-field">
              <label>تاريخ البداية</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>تاريخ النهاية</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>الرسوم</label>
              <input type="number" min="0" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>المقاعد (capacity)</label>
              <input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} dir="ltr" />
            </div>
            <ImageField
              label="صورة الدورة"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              upload={upload}
              fieldKey="image_url"
              shape="wide"
              hint="تُضغط الصورة تلقائيًا (عرض أقصى 1280px بجودة موفرة) فلا تبطئ الموقع أو محركات البحث."
            />
          </div>
        </AdminFormSection>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'جارٍ الحفظ…' : isEdit ? 'حفظ' : 'إنشاء'}</button>
          <Link to="/admin/training/courses" className="btn btn-soft">إلغاء</Link>
        </div>
      </form>
    </AdminFormPage>
  );
}
