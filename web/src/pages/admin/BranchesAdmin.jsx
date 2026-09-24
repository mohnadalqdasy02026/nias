import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/client.js';
import RichEditor from '../../components/admin/RichEditor.jsx';

const MAX_IMAGE_WIDTH = 1280;
const IMAGE_QUALITY = 0.85;

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

export default function BranchesAdmin() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageBusy, setImageBusy] = useState(false);
  const imageFileRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setError(null);
    try {
      setItems(await api.get('/admin/branches', { auth: true }));
    } catch (e) {
      setError(e.message);
    }
  };

  const startEdit = (b) => {
    setEditingId(b?.id ?? null);
    setShowForm(true);
    setForm({
      name_ar: b?.name_ar ?? '',
      name_en: b?.name_en ?? '',
      address: b?.address ?? '',
      phone: b?.phone ?? '',
      is_headquarters: b?.is_headquarters ?? false,
      dean_image: b?.dean_image ?? '',
      latitude: b?.latitude != null ? String(b.latitude) : '',
      longitude: b?.longitude != null ? String(b.longitude) : '',
      dean_name_ar: b?.dean_name_ar ?? '',
      dean_name_en: b?.dean_name_en ?? '',
      dean_message_ar: b?.dean_message_ar ?? '',
      dean_message_en: b?.dean_message_en ?? '',
    });
  };

  const cancel = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

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
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'branch-dean';
      const saved = await api.post(
        '/admin/media',
        { file_name: `branch-dean-${baseName}.${isPng ? 'webp' : 'jpg'}`, mime_type: outType, data_base64: base64, alt_text: form.name_ar || 'عميد فرع المعهد' },
        { auth: true },
      );
      setForm((f) => ({ ...f, dean_image: saved.url }));
      if (imageFileRef.current) imageFileRef.current.value = '';
    } catch (e) {
      setError(e.message);
    } finally {
      setImageBusy(false);
    }
  };

  const removeDeanImage = () => {
    setForm((f) => ({ ...f, dean_image: '' }));
    if (imageFileRef.current) imageFileRef.current.value = '';
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy('save');
    setError(null);
    try {
      const updated = await api.patch(`/admin/branches/${editingId}`, {
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
      setItems((prev) => prev.map((b) => (b.id === editingId ? { ...b, ...updated } : b)));
      cancel();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">إعدادات الفروع</h1>
      <p className="muted">بيانات الفروع كاملة: الاسم، المقر الرئيسي، صورة العميد، موقع الخريطة، العميد وكلمة العميد. تنعكس مباشرة على قائمة الموقع وصفحة كل فرع.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {showForm && (
        <form className="card admin-form" onSubmit={save}>
          <h3>{editingId ? 'تعديل بيانات الفرع' : 'فرع جديد'}</h3>
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
              <label>صورة عميد الفرع</label>
              <div className="course-image-picker">
                {form.dean_image ? (
                  <div className="dean-image-preview">
                    <img src={form.dean_image} alt="" />
                  </div>
                ) : null}
                <div className="course-image-actions">
                  <button
                    type="button"
                    className="btn btn-soft"
                    disabled={imageBusy}
                    onClick={() => imageFileRef.current?.click()}
                  >
                    {imageBusy ? 'جارٍ التجهيز والضغط...' : form.dean_image ? 'استبدال صورة العميد' : 'اختيار صورة من الجهاز'}
                  </button>
                  {form.dean_image ? (
                    <button type="button" className="btn btn-sm btn-danger-soft" onClick={removeDeanImage}>إزالة</button>
                  ) : null}
                </div>
              </div>
              <input
                ref={imageFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => compressAndUpload(e.target.files[0])}
              />
            </div>
            <div className="form-field form-field--full">
              <label>العنوان</label>
              <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="form-field">
              <label>عميد الفرع (عربي)</label>
              <input value={form.dean_name_ar} onChange={(e) => setForm({ ...form, dean_name_ar: e.target.value })} />
            </div>
            <div className="form-field">
              <label>عميد الفرع (إنجليزي)</label>
              <input value={form.dean_name_en} onChange={(e) => setForm({ ...form, dean_name_en: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field form-field--full">
              <label>كلمة العميد (عربي)</label>
              <RichEditor value={form.dean_message_ar ?? ''} onChange={(html) => setForm({ ...form, dean_message_ar: html })} rows={6} />
            </div>
            <div className="form-field form-field--full">
              <label>كلمة العميد (إنجليزي)</label>
              <RichEditor value={form.dean_message_en ?? ''} onChange={(html) => setForm({ ...form, dean_message_en: html })} rows={6} />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'save'}>{busy === 'save' ? 'حفظ...' : 'حفظ'}</button>
            <button type="button" className="btn btn-soft" onClick={cancel}>إلغاء</button>
          </div>
        </form>
      )}

      <div className="admin-toolbar">
        <button type="button" className="btn btn-soft" onClick={load}>تحديث</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الفرع</th>
              <th>صورة العميد</th>
              <th>العميد</th>
              <th>كلمة العميد</th>
              <th>العنوان</th>
              <th>الهاتف</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong>{b.name_ar}</strong>
                  <div className="muted">{b.is_headquarters ? 'المقر الرئيسي — ' : ''}{b.slug}</div>
                </td>
                <td>
                  {b.dean_image ? (
                    <img src={b.dean_image} alt="" className="table-thumb table-thumb--round" />
                  ) : (
                    <span className="table-muted">—</span>
                  )}
                </td>
                <td>{b.dean_name_ar ? <span className="badge-msg badge-success">{b.dean_name_ar}</span> : '—'}</td>
                <td className="table-muted">{b.dean_message_ar ? 'منشورة' : '—'}</td>
                <td>{b.address ?? '—'}</td>
                <td dir="ltr">{b.phone ?? '—'}</td>
                <td className="table-actions">
                  <button type="button" className="btn btn-sm btn-soft" disabled={busy === b.id} onClick={() => startEdit(b)}>تعديل</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="muted admin-empty">لا توجد فروع.</p>}
      </div>
    </section>
  );
}