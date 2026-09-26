import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/client.js';
import RichEditor from '../../components/admin/RichEditor.jsx';

const MAX_IMAGE_WIDTH = 1280;
const IMAGE_QUALITY = 0.85;

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

export default function CollegesAdmin() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageBusy, setImageBusy] = useState(null);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    load();
    api.get('/admin/branches', { auth: true }).then((list) => setBranches(list ?? [])).catch(() => {});
  }, []);

  const load = async () => {
    setError(null);
    try {
      setItems(await api.get('/admin/colleges', { auth: true }));
    } catch (e) {
      setError(e.message);
    }
  };

  const startEdit = (c) => {
    setEditingId(c?.id ?? null);
    setShowForm(true);
    setForm({
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
  };

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const cancel = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  const compressAndUpload = async (file, targetKey) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('الرجاء اختيار ملف صورة.');
      return;
    }
    setImageBusy(targetKey);
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
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || (targetKey === 'dean_image' ? 'college-dean' : 'college');
      const saved = await api.post(
        '/admin/media',
        { file_name: `${baseName}-${Date.now()}.${isPng ? 'webp' : 'jpg'}`, mime_type: outType, data_base64: base64, alt_text: form.name_ar || 'كلية' },
        { auth: true },
      );
      setForm((f) => ({ ...f, [targetKey]: saved.url }));
    } catch (e) {
      setError(e.message);
    } finally {
      setImageBusy(null);
    }
  };

  const removeImage = (targetKey) => setForm((f) => ({ ...f, [targetKey]: '' }));
  const imageInputRef = useRef({});
  const imageRef = (key) => (el) => { imageInputRef.current[key] = el; };
  const pickImage = (key) => () => imageInputRef.current[key]?.click();

  const save = async (e) => {
    e.preventDefault();
    setBusy('save');
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
      if (editingId) {
        await api.patch(`/admin/colleges/${editingId}`, payload, { auth: true });
      } else {
        await api.post('/admin/colleges', payload, { auth: true });
      }
      cancel();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`هل تريد حذف الكلية «${c.name_ar}»؟ سيُحذف كل ما يرتبط بها من أقسام.`)) return;
    setBusy(c.id);
    setError(null);
    try {
      await api.del(`/admin/colleges/${c.id}`, { auth: true });
      cancel();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const totalDepartments = items.length;

  return (
    <section>
      <h1 className="admin-page-title">الكليات</h1>
      <p className="muted">بيانات الكليات في كل فرع: الاسم، صورة الكلية، عميد الكلية وصورته وكلمته، الرؤية والرسالة والنبذة. تُعرض في صفحة الفرع بالتبويب «الكليات».</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {showForm && (
        <form className="card admin-form" onSubmit={save}>
          <h3>{editingId ? `تعديل كلية: ${form.name_ar || ''}` : 'كلية جديدة'}</h3>
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
              <label>صورة الكلية</label>
              <div className="course-image-picker">
                {form.image ? <div className="course-image-preview"><img src={form.image} alt="" /></div> : null}
                <div className="course-image-actions">
                  <button type="button" className="btn btn-soft" disabled={imageBusy === 'image'} onClick={pickImage('image')}>
                    {imageBusy === 'image' ? 'جارٍ التجهيز...' : form.image ? 'استبدال الصورة' : 'اختيار صورة من الجهاز'}
                  </button>
                  {form.image ? <button type="button" className="btn btn-sm btn-danger-soft" onClick={() => removeImage('image')}>إزالة</button> : null}
                  <input ref={imageRef('image')} type="file" accept="image/*" hidden onChange={(e) => compressAndUpload(e.target.files[0], 'image')} />
                </div>
              </div>
            </div>
            <div className="form-field form-field--full">
              <label>صورة عميد الكلية</label>
              <div className="course-image-picker">
                {form.dean_image ? <div className="dean-image-preview"><img src={form.dean_image} alt="" /></div> : null}
                <div className="course-image-actions">
                  <button type="button" className="btn btn-soft" disabled={imageBusy === 'dean_image'} onClick={pickImage('dean_image')}>
                    {imageBusy === 'dean_image' ? 'جارٍ التجهيز...' : form.dean_image ? 'استبدال صورة العميد' : 'اختيار صورة العميد'}
                  </button>
                  {form.dean_image ? <button type="button" className="btn btn-sm btn-danger-soft" onClick={() => removeImage('dean_image')}>إزالة</button> : null}
                  <input ref={imageRef('dean_image')} type="file" accept="image/*" hidden onChange={(e) => compressAndUpload(e.target.files[0], 'dean_image')} />
                </div>
              </div>
            </div>
            <div className="form-field form-field--full">
              <label>كلمة عميد الكلية (عربي)</label>
              <RichEditor value={form.dean_message_ar ?? ''} onChange={(html) => setForm({ ...form, dean_message_ar: html })} rows={5} />
            </div>
            <div className="form-field form-field--full">
              <label>كلمة عميد الكلية (إنجليزي)</label>
              <RichEditor value={form.dean_message_en ?? ''} onChange={(html) => setForm({ ...form, dean_message_en: html })} rows={5} />
            </div>
            <div className="form-field form-field--full">
              <label>الرؤية</label>
              <textarea rows={2} value={form.vision ?? ''} onChange={(e) => setForm({ ...form, vision: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>الرسالة</label>
              <textarea rows={2} value={form.mission ?? ''} onChange={(e) => setForm({ ...form, mission: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>نبذة عن الكلية</label>
              <textarea rows={3} value={form.about ?? ''} onChange={(e) => setForm({ ...form, about: e.target.value })} />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'save'}>{busy === 'save' ? 'حفظ...' : 'حفظ'}</button>
            <button type="button" className="btn btn-soft" onClick={cancel}>إلغاء</button>
          </div>
        </form>
      )}

      <div className="admin-toolbar">
        <button type="button" className="btn btn-primary" onClick={startNew}>
          {busy === 'save' ? 'جاري...' : 'كلية جديدة'}
        </button>
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
                    <button type="button" className="btn btn-sm btn-soft" disabled={busy === c.id} onClick={() => startEdit(c)}>تعديل</button>
                    <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === c.id} onClick={() => remove(c)}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="muted admin-empty">لا توجد كليات.{totalDepartments === 0 ? '' : ''}</p>}
      </div>
    </section>
  );
}