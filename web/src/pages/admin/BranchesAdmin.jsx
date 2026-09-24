import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const emptyForm = {
  name_ar: '',
  name_en: '',
  address: '',
  phone: '',
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
      dean_name_ar: b?.dean_name_ar ?? '',
      dean_name_en: b?.dean_name_en ?? '',
      dean_message_ar: b?.dean_message_ar ?? '',
      dean_message_en: b?.dean_message_en ?? '',
    });
  };

  const cancel = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

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
      <h1 className="admin-page-title">فروع المعهد</h1>
      <p className="muted">تعديل بيانات الفروع (اسم العميد، كلمة العميد، العنوان، الهاتف). تنعكس مباشرة على قائمة الموقع وصفحة كل فرع.</p>

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
            <div className="form-field">
              <label>عميد الفرع (عربي)</label>
              <input value={form.dean_name_ar} onChange={(e) => setForm({ ...form, dean_name_ar: e.target.value })} />
            </div>
            <div className="form-field">
              <label>عميد الفرع (إنجليزي)</label>
              <input value={form.dean_name_en} onChange={(e) => setForm({ ...form, dean_name_en: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>الهاتف</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field form-field--full">
              <label>العنوان</label>
              <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="form-field form-field--full">
              <label>كلمة العميد (عربي)</label>
              <textarea rows={5} value={form.dean_message_ar} onChange={(e) => setForm({ ...form, dean_message_ar: e.target.value })} placeholder="نص كلمة العميد الذي يظهر في صفحة الفرع..." />
            </div>
            <div className="form-field form-field--full">
              <label>كلمة العميد (إنجليزي)</label>
              <textarea rows={5} dir="ltr" value={form.dean_message_en} onChange={(e) => setForm({ ...form, dean_message_en: e.target.value })} />
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