import { useEffect, useState, useCallback, Fragment } from 'react';
import { api } from '../../api/client.js';

const statusLabel = {
  pending: 'قيد المراجعة',
  confirmed: 'مؤكد',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

const workflow = [
  { value: 'confirmed', label: 'تأكيد' },
  { value: 'in_progress', label: 'بدء التنفيذ' },
  { value: 'completed', label: 'إكمال' },
];

export default function TrainingEnrollments() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [openId, setOpenId] = useState(null);
  const perPage = 20;

  const load = useCallback(async (fstatus = filter, p = page) => {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fstatus) params.set('status', fstatus);
      if (p > 1) params.set('page', p);
      params.set('limit', perPage);
      const data = await api.get(`/admin/training/enrollments?${params.toString()}`, { auth: true });
      setItems(data.items ?? data);
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

  const setStatus = async (id, status) => {
    setBusy(id);
    try {
      await api.patch(`/admin/training/enrollments/${id}/status`, { status }, { auth: true });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">تسجيلات التدريب</h1>
      <p className="muted">مراجعة ومتابعة طلبات التسجيل في الدورات.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <select value={filter} onChange={(e) => { setFilter(e.target.value); load(e.target.value, 1); }}>
          <option value="">كل الحالات</option>
          {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>المتدرب</th>
              <th>الجوال</th>
              <th>الدورة</th>
              <th>الحالة</th>
              <th>التاريخ</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <Fragment key={e.id}>
                  <tr key={e.id}>
                  <td data-label="المتدرب">{e.full_name}</td>
                  <td data-label="الجوال" dir="ltr">{e.phone}</td>
                  <td data-label="الدورة">{e.course_title}</td>
                  <td data-label="الحالة"><span className={`badge-msg badge-${e.status === 'cancelled' ? 'archived' : 'draft'}`}>{statusLabel[e.status]}</span></td>
                  <td data-label="التاريخ">{new Date(e.enrolled_at).toLocaleString('ar-YE')}</td>
                  <td data-label="إجراءات" className="table-actions">
                    {e.status !== 'cancelled' && workflow.map((w) => (
                      <button key={w.value} type="button" className="btn btn-sm btn-soft" disabled={busy === e.id} onClick={() => setStatus(e.id, w.value)}>{w.label}</button>
                    ))}
                    {e.status === 'cancelled' && (
                      <button type="button" className="btn btn-sm btn-soft" disabled={busy === e.id} onClick={() => setStatus(e.id, 'pending')}>إعادة فتح</button>
                    )}
                    {e.status !== 'cancelled' && (
                      <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === e.id} onClick={() => setStatus(e.id, 'cancelled')}>إلغاء</button>
                    )}
                    <button type="button" className="btn btn-sm btn-soft" onClick={() => setOpenId(openId === e.id ? null : e.id)}>{openId === e.id ? 'إخفاء' : 'تفاصيل'}</button>
                  </td>
                </tr>
                {openId === e.id && (
                  <tr className="admin-detail-row" key={`${e.id}-d`}>
                    <td colSpan={6}>
                      <strong>الفرع:</strong> {e.branch_name ?? '—'} | <strong>الرسوم:</strong> {e.fees ?? '—'} | <strong>المقاعد:</strong> {e.capacity ?? '—'} | <strong>حالة الدورة:</strong> {e.course_status ?? '—'}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="muted admin-empty">لا توجد تسجيلات.</p>}
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