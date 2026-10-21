import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { ImageField, useImageUpload } from '../../components/admin/ImageField.jsx';
import { useAdminRecord } from '../../components/admin/useAdminRecord.js';
import Can from '../../components/admin/Can.jsx';

const dateOnly = (value) => (value ? String(value).slice(0, 10) : '');

const emptyForm = {
  title: '',
  description: '',
  cover_image: '',
  event_date: '',
  sort_order: '0',
  is_published: true,
};

const toForm = (a) => ({
  title: a?.title ?? '',
  description: a?.description ?? '',
  cover_image: a?.cover_image ?? '',
  event_date: dateOnly(a?.event_date),
  sort_order: a?.sort_order != null ? String(a.sort_order) : '0',
  is_published: a?.is_published ?? true,
});

export default function GalleryAdmin() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems((await api.get('/admin/gallery', { auth: true })) ?? []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (album) => {
    if (!window.confirm(`هل تريد حذف الألبوم «${album.title}» وكل صوره؟`)) return;
    setBusy(album.id);
    setError(null);
    try {
      await api.del(`/admin/gallery/${album.id}`, { auth: true });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">ألبومات المعرض</h1>
      <p className="muted">أنشئ فعالية/ألبوماً وارفع صوره المتعددة. تظهر الفعاليات في صفحة المعرض العامة، وعند اختيار الفعالية تظهر صورها الخاصة.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <Can perm="gallery.manage"><Link to="new" className="btn btn-primary">ألبوم جديد</Link></Can>
        <button type="button" className="btn btn-soft" onClick={load}>تحديث</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الألبوم</th>
              <th>الغلاف</th>
              <th>عدد الصور</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td data-label="الألبوم">
                  <strong>{a.title}</strong>
                  {a.description && <div className="muted">{a.description}</div>}
                </td>
                <td data-label="الغلاف">
                  {a.effective_cover
                    ? <img src={a.effective_cover} alt="" className="table-thumb" />
                    : <span className="table-muted">—</span>}
                </td>
                <td data-label="عدد الصور">
                  <span className="badge-msg badge-success">{a.image_count}</span>
                </td>
                <td data-label="التاريخ" className="table-muted">{dateOnly(a.event_date) || '—'}</td>
                <td data-label="الحالة" className="table-muted">{a.is_published ? 'منشور' : 'مخفي'}</td>
                <td data-label="إجراءات" className="table-actions">
                  <div className="admin-action-row">
                    <Can perm="gallery.manage"><Link to={`${a.id}/images`} className="btn btn-sm btn-primary">الصور</Link></Can>
                    <Can perm="gallery.manage"><Link to={String(a.id)} className="btn btn-sm btn-soft">تعديل</Link></Can>
                    <Can perm="gallery.manage"><button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === a.id} onClick={() => remove(a)}>حذف</button></Can>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="muted admin-empty">لا توجد ألبومات بعد.</p>}
      </div>
    </section>
  );
}

export function AlbumForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { record, loading } = useAdminRecord({ id, path: '/admin/gallery' });
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (record) setForm(toForm(record));
  }, [record]);

  const upload = useImageUpload({
    onUploaded: (key, url) => setForm((f) => ({ ...f, [key]: url })),
    onError: setError,
    altText: () => form.title || 'ألبوم',
  });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      cover_image: form.cover_image.trim() || null,
      event_date: form.event_date || null,
      sort_order: Number(form.sort_order) || 0,
      is_published: Boolean(form.is_published),
    };
    try {
      if (isEdit) {
        await api.patch(`/admin/gallery/${id}`, payload, { auth: true });
        navigate(`/admin/gallery/${id}/images`);
      } else {
        const album = await api.post('/admin/gallery', payload, { auth: true });
        navigate(`/admin/gallery/${album.id}/images`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && loading) return <p className="admin-form-loading">جارٍ تحميل بيانات الألبوم…</p>;

  return (
    <AdminFormPage
      title={isEdit ? `تعديل ألبوم: ${form.title || ''}` : 'ألبوم جديد'}
      subtitle="بعد الحفظ ستنتقل لصفحة رفع صور الفعالية."
      backTo="/admin/gallery"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card admin-form" onSubmit={save}>
        <AdminFormSection title="البيانات الأساسية">
          <div className="form-grid">
            <div className="form-field">
              <label>عنوان الفعالية *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>تاريخ الفعالية</label>
              <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            </div>
            <div className="form-field">
              <label>الترتيب</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            </div>
            <div className="form-field">
              <label>الحالة</label>
              <select value={form.is_published ? '1' : '0'} onChange={(e) => setForm({ ...form, is_published: e.target.value === '1' })}>
                <option value="1">منشور</option>
                <option value="0">مخفي</option>
              </select>
            </div>
            <div className="form-field form-field--full">
              <label>وصف الفعالية</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="صورة الغلاف" hint="إن لم تُحدَّد صورة غلاف، تُستخدم أول صورة من صور الفعالية تلقائيًا.">
          <div className="form-grid">
            <ImageField
              label="صورة الغلاف"
              value={form.cover_image}
              onChange={(url) => setForm({ ...form, cover_image: url })}
              upload={upload}
              fieldKey="cover_image"
              shape="wide"
            />
          </div>
        </AdminFormSection>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</button>
          <Link to="/admin/gallery" className="btn btn-soft">إلغاء</Link>
        </div>
      </form>
    </AdminFormPage>
  );
}

export function AlbumImages() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setAlbum(await api.get(`/admin/gallery/${id}`, { auth: true }));
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = useImageUpload({
    onUploaded: async (_key, url) => {
      try {
        const image = await api.post(`/admin/gallery/${id}/images`, { image: url, title: '' }, { auth: true });
        setAlbum((a) => ({ ...a, images: [...(a?.images ?? []), image] }));
      } catch (e) {
        setError(e.message);
      }
    },
    onError: setError,
    altText: () => album?.title || 'صورة الفعالية',
  });

  const onPickMany = async (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    for (let i = 0; i < files.length; i += 1) {
      await upload.compressAndUpload(files[i], `new-${Date.now()}-${i}`);
    }
  };

  const images = album?.images ?? [];

  const persistOrder = async (list) => {
    setAlbum((a) => ({ ...a, images: list }));
    try {
      await Promise.all(
        list.map((img, index) =>
          img.sort_order === index
            ? null
            : api.patch(`/admin/gallery/images/${img.id}`, { sort_order: index }, { auth: true }),
        ),
      );
    } catch (e) {
      setError(e.message);
    }
  };

  const move = (index, dir) => {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  };

  const removeImage = async (img) => {
    if (!window.confirm('حذف هذه الصورة؟')) return;
    setBusyId(img.id);
    setError(null);
    try {
      await api.del(`/admin/gallery/images/${img.id}`, { auth: true });
      setAlbum((a) => ({ ...a, images: (a?.images ?? []).filter((x) => x.id !== img.id) }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const renameImage = async (img, title) => {
    try {
      await api.patch(`/admin/gallery/images/${img.id}`, { title }, { auth: true });
      setAlbum((a) => ({
        ...a,
        images: (a?.images ?? []).map((x) => (x.id === img.id ? { ...x, title } : x)),
      }));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <AdminFormPage
      title={album ? `صور الفعالية: ${album.title}` : 'صور الفعالية'}
      subtitle="ارفع عدة صور دفعة واحدة، ويمكنك إعادة ترتيبها بالأسهم."
      backTo="/admin/gallery"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="card admin-form">
        <AdminFormSection title="رفع صور" hint="يمكنك تحديد أكثر من صورة معاً.">
          <div className="course-image-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={upload.pick('new-many')}
              disabled={upload.busyKey !== null}
            >
              {upload.busyKey ? 'جارٍ الرفع…' : 'إضافة صور'}
            </button>
            <input ref={upload.registerInput('new-many')} type="file" accept="image/*" multiple hidden onChange={onPickMany} />
          </div>
        </AdminFormSection>

        {images.length === 0 ? (
          <p className="muted admin-empty">لا توجد صور في هذا الألبوم بعد.</p>
        ) : (
          <div className="album-images-grid">
            {images.map((img, index) => (
              <div key={img.id} className="album-image-card">
                <div className="album-image-thumb">
                  <img src={img.image} alt={img.title || ''} loading="lazy" />
                </div>
                <input
                  className="album-image-caption"
                  defaultValue={img.title ?? ''}
                  placeholder="وصف الصورة (اختياري)"
                  onBlur={(e) => {
                    if (e.target.value !== (img.title ?? '')) renameImage(img, e.target.value);
                  }}
                />
                <div className="album-image-actions">
                  <button type="button" className="btn btn-sm btn-soft" onClick={() => move(index, -1)} disabled={index === 0} aria-label="تحريك لليسار">‹</button>
                  <button type="button" className="btn btn-sm btn-soft" onClick={() => move(index, 1)} disabled={index === images.length - 1} aria-label="تحريك لليمين">›</button>
                  <button type="button" className="btn btn-sm btn-danger-soft" onClick={() => removeImage(img)} disabled={busyId === img.id}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminFormPage>
  );
}
