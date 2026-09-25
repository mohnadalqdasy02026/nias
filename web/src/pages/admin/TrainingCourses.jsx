import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../contexts/auth.jsx';
import { branchLabel } from '../../lib/branch.js';

const statusLabel = { draft: 'مسودة', open: 'مفتوحة', closed: 'مغلقة', completed: 'مكتملة' };
const MAX_IMAGE_WIDTH = 1280;
const IMAGE_QUALITY = 0.82;

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
  image_url: '',
  status: 'draft',
};

export default function TrainingCourses() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const [imageBusy, setImageBusy] = useState(false);
  const imageFileRef = useRef(null);
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
      setItems(data.items ?? data);
      setTotal(data.total ?? items.length);
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

  const startEdit = (c) => {
    setEditingId(c?.id ?? null);
    setShowForm(true);
    setForm({
      title: c?.title ?? '',
      branch_id: c?.branch_id ?? user?.branchId ?? '',
      description: c?.description ?? '',
      fees: c?.fees ?? '',
      start_date: c?.start_date ?? '',
      end_date: c?.end_date ?? '',
      location: c?.location ?? '',
      capacity: c?.capacity ?? '',
      trainer: c?.trainer ?? '',
      image_url: c?.image_url ?? '',
      status: c?.status ?? 'draft',
    });
  };

  const cancel = () => { setShowForm(false); setEditingId(null); setForm(null); };

  const compressAndUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('الرجاء اختيار ملف صورة.');
      return;
    }
    setImageBusy(true);
    setError(null);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('تعذر قراءة الملف'));
        reader.readAsDataURL(file);
      });

      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('تعذر فتح الصورة'));
        image.src = dataUrl;
      });

      const scale = Math.min(1, MAX_IMAGE_WIDTH / img.width);
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const isPng = file.type === 'image/png';
      const outType = isPng ? 'image/webp' : 'image/jpeg';
      const compressed = canvas.toDataURL(outType, IMAGE_QUALITY);
      const base64 = compressed.slice(compressed.indexOf(',') + 1);
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'course';

      const saved = await api.post(
        '/admin/media',
        { file_name: `${baseName}.${isPng ? 'webp' : 'jpg'}`, mime_type: outType, data_base64: base64, alt_text: form?.title ?? baseName },
        { auth: true },
      );
      setForm((f) => ({ ...f, image_url: saved.url }));
      if (imageFileRef.current) imageFileRef.current.value = '';
    } catch (e) {
      setError(e.message);
    } finally {
      setImageBusy(false);
    }
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, image_url: '' }));
    if (imageFileRef.current) imageFileRef.current.value = '';
  };

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy('save');
    const body = {
      ...form,
      branch_id: form.branch_id === '' ? null : Number(form.branch_id),
      fees: form.fees === '' ? null : Number(form.fees),
      capacity: form.capacity === '' ? null : Number(form.capacity),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };
    try {
      if (editingId) await api.patch(`/admin/training/courses/${editingId}`, body, { auth: true });
      else await api.post('/admin/training/courses', body, { auth: true });
      cancel();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

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

      {showForm && (
        <form className="card admin-form" onSubmit={save}>
          <h3>{editingId ? 'تعديل دورة' : 'دورة جديدة'}</h3>
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
            <div className="form-field form-field--full">
              <label>الوصف</label>
              <textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-field">
              <label>الرسوم</label>
              <input type="number" min="0" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>المقاعد (capacity)</label>
              <input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>تاريخ البداية</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>تاريخ النهاية</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>الموقع</label>
              <input value={form.location ?? ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-field">
              <label>المدرب</label>
              <input value={form.trainer ?? ''} onChange={(e) => setForm({ ...form, trainer: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>صورة الدورة</label>
              <div className="course-image-picker">
                {(form.image_url || (editingId && form.image_url)) ? (
                  <div className="course-image-preview">
                    <img src={form.image_url} alt="" />
                  </div>
                ) : null}
                <div className="course-image-actions">
                  <button
                    type="button"
                    className="btn btn-soft"
                    disabled={imageBusy}
                    onClick={() => imageFileRef.current?.click()}
                  >
                    {imageBusy ? 'جارٍ التجهيز والضغط...' : form.image_url ? 'استبدال الصورة' : 'اختيار صورة من الجهاز'}
                  </button>
                  {form.image_url ? (
                    <button type="button" className="btn btn-sm btn-danger-soft" onClick={removeImage}>إزالة</button>
                  ) : null}
                </div>
              </div>
              <input
                ref={imageFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => compressAndUpload(e.target.files?.[0])}
              />
              <p className="muted admin-field-hint">تُضغط الصورة تلقائيًا (عرض أقصى 1280px بجودة موفرة) فلا تبطئ الموقع أو محركات البحث.</p>
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
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'save'}>{editingId ? 'حفظ' : 'إنشاء'}</button>
            <button type="button" className="btn btn-soft" onClick={cancel}>إلغاء</button>
          </div>
        </form>
      )}

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
        <button type="button" className="btn btn-primary" onClick={() => startEdit(null)}>+ دورة جديدة</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>العنوان</th>
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
                <td data-label="الفرع">{c.branch_name_ar ? <span className="badge-msg badge-success">{branchLabel(c.branch_name_ar)}</span> : '—'}</td>
                <td data-label="الحالة"><span className={`badge-msg badge-${c.status === 'open' ? 'success' : 'draft'}`}>{statusLabel[c.status]}</span></td>
                <td data-label="التسجيلات">{c.enrollments_count}</td>
                <td data-label="المقاعد">{c.capacity ?? '—'}</td>
                <td data-label="الرسوم">{c.fees != null ? c.fees : '—'}</td>
                <td data-label="المدرب">{c.trainer ?? '—'}</td>
                <td data-label="إجراءات" className="table-actions">
                  <button type="button" className="btn btn-sm btn-soft" disabled={busy === c.id} onClick={() => startEdit(c)}>تعديل</button>
                  <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === c.id} onClick={() => remove(c)}>حذف</button>
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