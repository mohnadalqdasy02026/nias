import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../../api/client.js';

const PROGRAM_TYPES = ['bachelor', 'diploma', 'master_executive', 'master_academic'];
const MAX_IMAGE_WIDTH = 1280;
const IMAGE_QUALITY = 0.82;

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
  const [refs, setRefs] = useState({ colleges: [], departments: [], branches: [] });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [imageBusy, setImageBusy] = useState(false);
  const imageFileRef = useRef(null);
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
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e.message);
    }
  }, [page, filter, search]);

  useEffect(() => {
    load(1, '', '');
    api.get('/admin/programs/lookup', { auth: true })
      .then(setRefs)
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableDepts = form?.college_id
    ? refs.departments.filter((d) => String(d.college_id) === String(form.college_id))
    : [];

  const startEdit = (p) => {
    setEditingId(p?.id ?? null);
    setShowForm(true);
    setForm({
      college_id: p?.college_id ? String(p.college_id) : '',
      department_id: p?.department_id ? String(p.department_id) : '',
      branch_id: p?.branch_id ? String(p.branch_id) : '',
      name_ar: p?.name_ar ?? '',
      name_en: p?.name_en ?? '',
      program_type: p?.program_type ?? 'bachelor',
      description: p?.description ?? '',
      outcomes: p?.outcomes ?? '',
      image_url: p?.image_url ?? '',
      admission_open: Boolean(p?.admission_open),
      status: p?.status ?? 'active',
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
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'program';

      const saved = await api.post(
        '/admin/media',
        { file_name: `${baseName}.${isPng ? 'webp' : 'jpg'}`, mime_type: outType, data_base64: base64, alt_text: form?.name_ar ?? baseName },
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
      college_id: form.college_id ? Number(form.college_id) : null,
      department_id: form.department_id ? Number(form.department_id) : null,
      branch_id: form.branch_id ? Number(form.branch_id) : null,
    };
    try {
      if (editingId) await api.patch(`/admin/programs/${editingId}`, body, { auth: true });
      else await api.post('/admin/programs', body, { auth: true });
      cancel();
      await load(page, filter, search);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

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

      {showForm && (
        <form className="card admin-form" onSubmit={save}>
          <h3>{editingId ? 'تعديل برنامج' : 'برنامج جديد'}</h3>
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
            <div className="form-field">
              <label>الفرع *</label>
              <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })} required>
                <option value="">اختر الفرع</option>
                {refs.branches.map((b) => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
              </select>
            </div>
            <div className="form-field form-field--full">
              <label>الوصف</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>مخرجات التعلم</label>
              <textarea rows={3} value={form.outcomes} onChange={(e) => setForm({ ...form, outcomes: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>صورة البرنامج</label>
              <div className="course-image-picker">
                {form.image_url ? (
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
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'save'}>{editingId ? 'حفظ' : 'إنشاء'}</button>
            <button type="button" className="btn btn-soft" onClick={cancel}>إلغاء</button>
          </div>
        </form>
      )}

      <div className="admin-toolbar">
        <input className="admin-search" placeholder="بحث بالاسم أو الوصف..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }} />
        <button type="button" className="btn btn-soft" onClick={runSearch}>بحث</button>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); load(1, e.target.value, search); }}>
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => startEdit(null)}>+ برنامج جديد</button>
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
                  <button type="button" className="btn btn-sm btn-soft" disabled={busy === p.id} onClick={() => startEdit(p)}>تعديل</button>
                  <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === p.id} onClick={() => remove(p)}>حذف</button>
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