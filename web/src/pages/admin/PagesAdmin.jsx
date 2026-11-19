import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import RichEditor from '../../components/admin/RichEditor.jsx';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { ImageField, useImageUpload } from '../../components/admin/ImageField.jsx';
import { useAdminRecord } from '../../components/admin/useAdminRecord.js';
import Can from '../../components/admin/Can.jsx';

const MAX_IMAGE_WIDTH = 1280;
const IMAGE_QUALITY = 0.85;

const statusLabel = { draft: 'مسودة', published: 'منشور', archived: 'مؤرشف' };

const emptyForm = {
  slug: '',
  title_ar: '',
  title_en: '',
  content_ar: '',
  primary_image: '',
  images: [],
  status: 'draft',
};

export default function PagesAdmin() {
  const [pages, setPages] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPages((await api.get('/admin/content/pages', { auth: true })) ?? []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleStatus = async (page) => {
    setBusy(page.id);
    try {
      await api.patch(
        `/admin/content/pages/${page.id}`,
        { status: page.status === 'published' ? 'draft' : 'published' },
        { auth: true },
      );
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (page) => {
    if (!window.confirm(`حذف الصفحة "${page.title_ar}" نهائيًا؟`)) return;
    setBusy(page.id);
    try {
      await api.del(`/admin/content/pages/${page.id}`, { auth: true });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">الصفحات الثابتة</h1>
      <p className="muted">محتوى صفحات الموقع الثابتة (عن المعهد، شروط، ...).</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <Can perm="site_pages.create"><Link to="new" className="btn btn-primary">+ صفحة جديدة</Link></Can>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>العنوان</th>
              <th>الحالة</th>
              <th>تاريخ التحديث</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td data-label="Slug" dir="ltr"><code>{p.slug}</code></td>
                <td data-label="العنوان">{p.title_ar}</td>
                <td data-label="الحالة">
                  <button type="button" className={`badge-msg badge-${p.status}`} disabled={busy === p.id} onClick={() => toggleStatus(p)}>
                    {statusLabel[p.status]}
                  </button>
                </td>
                <td data-label="تاريخ التحديث">{new Date(p.updated_at).toLocaleString('ar-YE')}</td>
                <td data-label="إجراءات" className="table-actions">
                  <div className="admin-action-row">
                    <Can perm="site_pages.update"><Link to={String(p.id)} className="btn btn-sm btn-soft">تعديل</Link></Can>
                    <Can perm="site_pages.delete"><button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === p.id} onClick={() => remove(p)}>حذف</button></Can>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && <p className="muted admin-empty">لا توجد صفحات.</p>}
      </div>
    </section>
  );
}

export function PageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { record, loading } = useAdminRecord({ id, path: '/admin/content/pages' });
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!record) return;
    setForm({
      slug: record.slug ?? '',
      title_ar: record.title_ar ?? '',
      title_en: record.title_en ?? '',
      content_ar: record.content_ar ?? '',
      primary_image: record.primary_image ?? '',
      images: Array.isArray(record.images) ? record.images : [],
      status: record.status ?? 'draft',
    });
  }, [record]);

  const upload = useImageUpload({
    onUploaded: (_key, url) => setForm((f) => ({ ...f, primary_image: url })),
    onError: setError,
    altText: () => form.title_ar || 'صفحة',
  });

  const [imagesBusy, setImagesBusy] = useState(false);
  const imagesInputRef = useRef(null);

  const compressAndUploadImage = async (file) => {
    if (!file) return null;
    if (!file.type.startsWith('image/')) throw new Error('الرجاء اختيار ملف صورة.');
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
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'page-image';
    const saved = await api.post(
      '/admin/media',
      {
        file_name: `${baseName}-${Date.now()}.${isPng ? 'webp' : 'jpg'}`,
        mime_type: outType,
        data_base64: base64,
        alt_text: form.title_ar || 'صفحة',
      },
      { auth: true },
    );
    return saved.url;
  };

  const addImages = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setImagesBusy(true);
    setError(null);
    try {
      const urls = [];
      for (const file of files) {
        const url = await compressAndUploadImage(file);
        if (url) urls.push(url);
      }
      if (urls.length) {
        setForm((f) => ({ ...f, images: [...(Array.isArray(f.images) ? f.images : []), ...urls] }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setImagesBusy(false);
    }
  };

  const removeImage = (index) => {
    setForm((f) => ({ ...f, images: (f.images || []).filter((_, i) => i !== index) }));
  };

  const moveImage = (index, dir) => {
    setForm((f) => {
      const imgs = [...(f.images || [])];
      const next = index + dir;
      if (next < 0 || next >= imgs.length) return f;
      [imgs[index], imgs[next]] = [imgs[next], imgs[index]];
      return { ...f, images: imgs };
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isEdit) await api.patch(`/admin/content/pages/${id}`, form, { auth: true });
      else await api.post('/admin/content/pages', form, { auth: true });
      navigate('/admin/content/pages');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && loading) return <p className="admin-form-loading">جارٍ تحميل بيانات الصفحة…</p>;

  return (
    <AdminFormPage
      title={isEdit ? `تعديل صفحة: ${form.title_ar || ''}` : 'صفحة جديدة'}
      subtitle="محتوى صفحات الموقع الثابتة (عن المعهد، شروط، ...)."
      backTo="/admin/content/pages"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card admin-form" onSubmit={save}>
        <AdminFormSection title="بيانات الصفحة">
          <div className="form-grid">
            <div className="form-field">
              <label>Slug (معرّف الرابط)</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required dir="ltr" />
            </div>
            <div className="form-field">
              <label>العنوان (عربي) *</label>
              <input value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>العنوان (إنجليزي)</label>
              <input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>
            <ImageField
              label="الصورة الرئيسية للصفحة"
              value={form.primary_image}
              onChange={(url) => setForm({ ...form, primary_image: url })}
              upload={upload}
              fieldKey="primary_image"
              shape="wide"
              hint="تُضغط الصورة تلقائيًا قبل الرفع (عرض أقصى 1280px)."
            />
          </div>
        </AdminFormSection>

        <AdminFormSection title="صور إضافية (تظهر فوق المحتوى بالتتابع)">
          <div className="form-grid">
            <div className="form-field form-field--full">
              <p className="admin-field-hint">أضف عدة صور (مثل مخططات مجلس الأمناء أو الهيكل التنظيمي) وستُعرض كل صورة تحت الأخرى أعلى الصفحة قبل المحتوى.</p>
              <div className="admin-action-row" style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => imagesInputRef.current?.click()}
                  disabled={imagesBusy}
                >
                  {imagesBusy ? 'جارٍ رفع الصور…' : '+ إضافة صور'}
                </button>
              </div>
              <input
                ref={imagesInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  const files = e.target.files;
                  e.target.value = '';
                  addImages(files);
                }}
              />
              {(form.images || []).length === 0 ? (
                <p className="muted">لا توجد صور إضافية.</p>
              ) : (
                <div className="page-images-admin-list">
                  {(form.images || []).map((src, idx) => (
                    <div key={`${src}-${idx}`} className="page-images-admin-item card">
                      <img src={src} alt={`صورة ${idx + 1}`} className="page-images-admin-thumb" />
                      <div className="page-images-admin-meta">
                        <span className="muted">صورة {idx + 1}</span>
                        <div className="admin-action-row">
                          <button type="button" className="btn btn-sm btn-soft" onClick={() => moveImage(idx, -1)} disabled={idx === 0}>↑</button>
                          <button type="button" className="btn btn-sm btn-soft" onClick={() => moveImage(idx, 1)} disabled={idx === (form.images.length - 1)}>↓</button>
                          <button type="button" className="btn btn-sm btn-danger-soft" onClick={() => removeImage(idx)}>حذف</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="المحتوى">
          <div className="form-grid">
            <div className="form-field form-field--full">
              <label>المحتوى (عربي)</label>
              <RichEditor value={form.content_ar} onChange={(html) => setForm({ ...form, content_ar: html })} rows={12} />
            </div>
          </div>
        </AdminFormSection>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'جارٍ الحفظ…' : isEdit ? 'حفظ' : 'إنشاء'}</button>
          <Link to="/admin/content/pages" className="btn btn-soft">إلغاء</Link>
        </div>
      </form>
    </AdminFormPage>
  );
}
