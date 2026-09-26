import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../../api/client.js';

const MAX_IMAGE_WIDTH = 1280;
const IMAGE_QUALITY = 0.82;

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

export default function FacultyAdmin() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [titles, setTitles] = useState([]);
  const [refs, setRefs] = useState({ departments: [], branches: [] });
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
      if (fstatus && fstatus !== '') params.set('status', fstatus);
      if (q) params.set('search', q);
      if (p > 1) params.set('page', p);
      params.set('limit', perPage);
      const data = await api.get(`/admin/faculty?${params.toString()}`, { auth: true });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e.message);
    }
  }, [page, filter, search]);

  const loadTitles = async () => {
    try {
      setTitles(await api.get('/admin/faculty/titles', { auth: true }));
    } catch (e) {
      if (!['UNPROCESSABLE_ENTITY', 'BAD_REQUEST'].includes(e.code) && !e.message?.includes('404')) setError(e.message);
    }
  };

  useEffect(() => {
    load(1, '', '');
    api.get('/admin/faculty/lookup', { auth: true })
      .then(setRefs)
      .catch((e) => setError(e.message));
    loadTitles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (m) => {
    setEditingId(m?.id ?? null);
    setShowForm(true);
    setForm({
      department_id: m?.department_id ? String(m.department_id) : '',
      branch_id: m?.branch_id ? String(m.branch_id) : '',
      name_ar: m?.name_ar ?? '',
      name_en: m?.name_en ?? '',
      title: m?.title ?? '',
      specialization: m?.specialization ?? '',
      email: m?.email ?? '',
      phone: m?.phone ?? '',
      photo: m?.photo ?? '',
      is_dept_head: Boolean(m?.is_dept_head),
      status: m?.status ?? 'active',
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
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'faculty';

      const saved = await api.post(
        '/admin/media',
        { file_name: `${baseName}-${Date.now()}.${isPng ? 'webp' : 'jpg'}`, mime_type: outType, data_base64: base64, alt_text: form?.name_ar ?? baseName },
        { auth: true },
      );
      setForm((f) => ({ ...f, photo: saved.url }));
      if (imageFileRef.current) imageFileRef.current.value = '';
    } catch (e) {
      setError(e.message);
    } finally {
      setImageBusy(false);
    }
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, photo: '' }));
    if (imageFileRef.current) imageFileRef.current.value = '';
  };

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy('save');
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
      if (editingId) await api.patch(`/admin/faculty/${editingId}`, body, { auth: true });
      else await api.post('/admin/faculty', body, { auth: true });
      cancel();
      await load(page, filter, search);
      loadTitles();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`حذف العضو "${m.name_ar}" (أرشفة ناعمة)؟`)) return;
    setBusy(m.id);
    try {
      await api.del(`/admin/faculty/${m.id}`, { auth: true });
      await load(page, filter, search);
      loadTitles();
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

      {showForm && (
        <form className="card admin-form" onSubmit={save}>
          <h3>{editingId ? 'تعديل عضو' : 'عضو جديد'}</h3>
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
            <div className="form-field form-field--full">
              <label>الصورة الشخصية</label>
              <div className="course-image-picker">
                {form.photo ? (
                  <div className="dean-image-preview">
                    <img src={form.photo} alt="" />
                  </div>
                ) : null}
                <div className="course-image-actions">
                  <button
                    type="button"
                    className="btn btn-soft"
                    disabled={imageBusy}
                    onClick={() => imageFileRef.current?.click()}
                  >
                    {imageBusy ? 'جارٍ التجهيز والضغط...' : form.photo ? 'استبدال الصورة' : 'اختيار صورة من الجهاز'}
                  </button>
                  {form.photo ? (
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
              <p className="muted admin-field-hint">يُفضل صورة شخصية مربعة. تُضغط تلقائيًا ولا تبطئ الموقع.</p>
            </div>
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
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'save'}>{editingId ? 'حفظ' : 'إنشاء'}</button>
            <button type="button" className="btn btn-soft" onClick={cancel}>إلغاء</button>
          </div>
        </form>
      )}

      <div className="admin-toolbar">
        <input className="admin-search" placeholder="بحث بالاسم أو الرتبة أو التخصص..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }} />
        <button type="button" className="btn btn-soft" onClick={runSearch}>بحث</button>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); load(1, e.target.value, search); }}>
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => startEdit(null)}>+ عضو جديد</button>
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
                  <button type="button" className="btn btn-sm btn-soft" disabled={busy === m.id} onClick={() => startEdit(m)}>تعديل</button>
                  <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === m.id} onClick={() => remove(m)}>حذف</button>
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