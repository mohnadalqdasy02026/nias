import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client.js';

const statusLabel = { new: 'جديدة', read: 'مقروءة', replied: 'تم الرد' };

export default function ContactMessages() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const perPage = 20;

  const load = useCallback(async (status = filter, p = page) => {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (p > 1) params.set('page', p);
      params.set('limit', perPage);
      const data = await api.get(`/admin/contact-messages?${params.toString()}`, { auth: true });
      setItems(data.items);
      setTotal(data.total ?? items.length);
      setPage(p);
    } catch (e) {
      setError(e.message);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatus = async (id, status) => {
    setBusy(id);
    try {
      await api.patch(`/admin/contact-messages/${id}`, { status }, { auth: true });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذه الرسالة نهائيًا؟')) return;
    setBusy(id);
    try {
      await api.del(`/admin/contact-messages/${id}`, { auth: true });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">رسائل التواصل</h1>
      <p className="muted">استفسارات الزوار المقدمة عبر نموذج "تواصل معنا".</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <select value={filter} onChange={(e) => { setFilter(e.target.value); load(e.target.value, 1); }}>
          <option value="">كل الحالات</option>
          <option value="new">جديدة</option>
          <option value="read">مقروءة</option>
          <option value="replied">تم الرد</option>
        </select>
      </div>

      {items.length === 0 && <p className="muted">لا توجد رسائل.</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>البريد</th>
              <th>الموضوع</th>
              <th>الحالة</th>
              <th>التاريخ</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td dir="ltr">{m.email}</td>
                <td>{m.subject ?? m.message.slice(0, 40)}</td>
                <td><span className={`badge-msg badge-${m.status}`}>{statusLabel[m.status]}</span></td>
                <td>{new Date(m.created_at).toLocaleString('ar-YE')}</td>
                <td className="table-actions">
                  {m.status !== 'read' && (
                    <button type="button" className="btn btn-sm btn-soft" disabled={busy === m.id} onClick={() => handleStatus(m.id, 'read')}>مقروءة</button>
                  )}
                  {m.status !== 'replied' && (
                    <button type="button" className="btn btn-sm btn-soft" disabled={busy === m.id} onClick={() => handleStatus(m.id, 'replied')}>تم الرد</button>
                  )}
                  <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === m.id} onClick={() => handleDelete(m.id)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > perPage && (
        <div className="admin-pagination">
          <button type="button" className="btn btn-sm btn-soft" disabled={page === 1} onClick={() => { const np = page - 1; load(filter, np); }}>السابق</button>
          <span>صفحة {page} من {Math.max(1, Math.ceil(total / perPage))}</span>
          <button type="button" className="btn btn-sm btn-soft" disabled={page >= Math.ceil(total / perPage)} onClick={() => { const np = page + 1; load(filter, np); }}>التالي</button>
        </div>
      )}
    </section>
  );
}