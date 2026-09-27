import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { branchLabel } from '../../lib/branch.js';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { useAdminRecord } from '../../components/admin/useAdminRecord.js';

const emptyForm = {
  full_name_ar: '',
  full_name_en: '',
  email: '',
  phone: '',
  password: '',
  branch_id: '',
  roles: [],
  status: 'active',
};

const ROLE_COLORS = [
  { id: 0, text: '#0e7c66', bg: '#e3f2ee' },
  { id: 1, text: '#4338ca', bg: '#e8e9fb' },
  { id: 2, text: '#b45309', bg: '#fdf2e2' },
  { id: 3, text: '#be185d', bg: '#fde8ef' },
  { id: 4, text: '#0369a1', bg: '#e0f2fe' },
  { id: 5, text: '#7c3aed', bg: '#f1e8fd' },
  { id: 6, text: '#0f766e', bg: '#e0f4f3' },
  { id: 7, text: '#dc2626', bg: '#fdeaea' },
];

function roleColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return ROLE_COLORS[h % ROLE_COLORS.length];
}

const splitRoles = (rolesList) => (rolesList ?? '').split(', ').filter(Boolean);

export default function UsersAdmin() {
  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const perPage = 20;

  const load = useCallback(async (p = page, fstatus = filter, q = search, r = roleFilter) => {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fstatus) params.set('status', fstatus);
      if (q) params.set('search', q);
      if (r) params.set('role', r);
      if (p > 1) params.set('page', p);
      params.set('limit', perPage);
      const data = await api.get(`/admin/users?${params.toString()}`, { auth: true });
      setItems(data?.items ?? []);
      setTotal(data?.total ?? 0);
    } catch (e) {
      setError(e.message);
    }
  }, [page, filter, search, roleFilter]);

  useEffect(() => {
    load(1, '', '');
    api.get('/admin/roles/all', { auth: true }).then(setRoles).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (u, status) => {
    setBusy(u.id);
    try {
      await api.patch(`/admin/users/${u.id}`, { status }, { auth: true });
      await load(page, filter, search, roleFilter);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`حذف المستخدم "${u.full_name_ar}" نهائيًا؟`)) return;
    setBusy(u.id);
    try {
      await api.del(`/admin/users/${u.id}`, { auth: true });
      await load(page, filter, search, roleFilter);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const runSearch = () => { setPage(1); load(1, filter, search, roleFilter); };

  const roleMeta = useMemo(() => {
    const m = new Map();
    for (const r of roles) m.set(r.name, r);
    return m;
  }, [roles]);

  const roleChips = (rolesList) =>
    splitRoles(rolesList).map((name) => {
      const c = roleColor(name);
      return (
        <span key={name} className="user-role-chip" style={{ color: c.text, background: c.bg }} title={roleMeta.get(name)?.description ?? name}>
          {name}
        </span>
      );
    });

  return (
    <section>
      <h1 className="admin-page-title">المستخدمون والصلاحيات</h1>
      <p className="muted">إنشاء الحسابات، تعيين الأدوار (التي تحدد صلاحيات الأقسام)، وحظر الحسابات.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-toolbar">
        <input className="admin-search" placeholder="بحث بالاسم أو البريد..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }} />
        <button type="button" className="btn btn-soft" onClick={runSearch}>بحث</button>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); load(1, filter, search, e.target.value); }} title="تصفية بالدور">
          <option value="">كل الأدوار</option>
          {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
        </select>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); load(1, e.target.value, search, roleFilter); }}>
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="banned">محظور</option>
        </select>
        <Link to="new" className="btn btn-primary">+ مستخدم جديد</Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>البريد</th>
              <th>الفرع</th>
              <th>الأدوار / الصلاحيات</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => {
              const userRoleNames = splitRoles(u.roles_list);
              const permCount = userRoleNames.reduce((acc, n) => acc + (roleMeta.get(n)?.permissions_count ?? 0), 0);
              return (
                <tr key={u.id}>
                  <td data-label="الاسم"><strong>{u.full_name_ar}</strong></td>
                  <td data-label="البريد" dir="ltr">{u.email ?? '—'}</td>
                  <td data-label="الفرع">{u.branch_name_ar ? <span className="badge-msg badge-success">{branchLabel(u.branch_name_ar)}</span> : '—'}</td>
                  <td data-label="الأدوار / الصلاحيات">
                    {userRoleNames.length > 0
                      ? <div className="user-roles-cell">{roleChips(u.roles_list)}<span className="user-perm-count">≈ {permCount} صلاحية</span></div>
                      : <span className="muted">—</span>}
                  </td>
                  <td data-label="الحالة"><span className={`badge-msg badge-${u.status === 'active' ? 'success' : 'archived'}`}>{u.status === 'active' ? 'نشط' : 'محظور'}</span></td>
                  <td data-label="إجراءات" className="table-actions">
                    <div className="admin-action-row">
                      <Link to={String(u.id)} className="btn btn-sm btn-soft">تعديل</Link>
                      {u.status === 'active' ? (
                        <button type="button" className="btn btn-sm btn-soft" disabled={busy === u.id} onClick={() => setStatus(u, 'banned')}>حظر</button>
                      ) : (
                        <button type="button" className="btn btn-sm btn-soft" disabled={busy === u.id} onClick={() => setStatus(u, 'active')}>إلغاء الحظر</button>
                      )}
                      <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === u.id} onClick={() => remove(u)}>حذف</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && !error && <p className="muted admin-empty">لا يوجد مستخدمون.</p>}
      </div>

      {total > perPage && (
        <div className="admin-pagination">
          <button type="button" className="btn btn-sm btn-soft" disabled={page === 1} onClick={() => { const np = page - 1; setPage(np); load(np, filter, search, roleFilter); }}>السابق</button>
          <span>صفحة {page} من {Math.max(1, Math.ceil(total / perPage))}</span>
          <button type="button" className="btn btn-sm btn-soft" disabled={page >= Math.ceil(total / perPage)} onClick={() => { const np = page + 1; setPage(np); load(np, filter, search, roleFilter); }}>التالي</button>
        </div>
      )}
    </section>
  );
}

export function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { record, loading } = useAdminRecord({ id, path: '/admin/users' });
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/roles/all', { auth: true }).then(setRoles).catch((e) => setError(e.message));
    api.get('/public/branches').then(setBranches).catch(() => {});
  }, []);

  useEffect(() => {
    if (!record) return;
    setForm({
      full_name_ar: record.full_name_ar ?? '',
      full_name_en: record.full_name_en ?? '',
      email: record.email ?? '',
      phone: record.phone ?? '',
      password: '',
      branch_id: record.branch_id ? String(record.branch_id) : '',
      roles: splitRoles(record.roles_list),
      status: record.status ?? 'active',
    });
  }, [record]);

  const toggleRole = (name) => {
    const has = form.roles.includes(name);
    setForm({ ...form, roles: has ? form.roles.filter((r) => r !== name) : [...form.roles, name] });
  };

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const body = {
      full_name_ar: form.full_name_ar,
      full_name_en: form.full_name_en || null,
      email: form.email || null,
      phone: form.phone || null,
      branch_id: form.branch_id === '' ? null : Number(form.branch_id),
      roles: form.roles,
      status: form.status,
    };
    try {
      if (isEdit) {
        if (form.password) body.password = form.password;
        await api.patch(`/admin/users/${id}`, body, { auth: true });
      } else {
        await api.post('/admin/users', { ...body, password: form.password }, { auth: true });
      }
      navigate('/admin/users');
    } catch (err) {
      const details = Array.isArray(err.details) && err.details.length > 0
        ? err.details.map((d) => `${d.field}: ${d.message}`).join(' — ')
        : null;
      setError(details ? `${err.message}: ${details}` : err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && loading) return <p className="admin-form-loading">جارٍ تحميل بيانات المستخدم…</p>;

  return (
    <AdminFormPage
      title={isEdit ? `تعديل مستخدم: ${form.full_name_ar || ''}` : 'مستخدم جديد'}
      subtitle="إنشاء الحسابات، تعيين الأدوار (التي تحدد صلاحيات الأقسام)، وحظر الحسابات."
      backTo="/admin/users"
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="card admin-form" onSubmit={save}>
        <AdminFormSection title="بيانات الحساب">
          <div className="form-grid">
            <div className="form-field">
              <label>الاسم بالعربية *</label>
              <input value={form.full_name_ar} onChange={(e) => setForm({ ...form, full_name_ar: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>الاسم بالإنجليزية</label>
              <input value={form.full_name_en} onChange={(e) => setForm({ ...form, full_name_en: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>رقم الجوال</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" />
            </div>
            <div className="form-field">
              <label>{isEdit ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور *'}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} dir="ltr" minLength={8} required={!isEdit} />
            </div>
            <div className="form-field">
              <label>الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">نشط</option>
                <option value="banned">محظور</option>
              </select>
            </div>
            <div className="form-field">
              <label>الفرع</label>
              <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}>
                <option value="">بدون فرع</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{branchLabel(b.name_ar) ?? b.name_ar}</option>)}
              </select>
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="الأدوار (تحدد صلاحيات الأقسام التي يدخلها الحساب)">
          <div className="form-grid">
            <div className="form-field form-field--full">
              <div className="role-checks">
                {roles.map((r) => {
                  const on = form.roles.includes(r.name);
                  const c = roleColor(r.name);
                  return (
                    <label key={r.id} className={`role-pick${on ? ' role-pick--on' : ''}`} style={on ? { borderColor: c.text, background: c.bg } : undefined}>
                      <input type="checkbox" checked={on} onChange={() => toggleRole(r.name)} />
                      <span className="role-pick-meta">
                        <strong>{r.name}</strong>
                        <small>{r.description ?? `${r.permissions_count} صلاحية`}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </AdminFormSection>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'جارٍ الحفظ…' : isEdit ? 'حفظ' : 'إنشاء'}</button>
          <Link to="/admin/users" className="btn btn-soft">إلغاء</Link>
        </div>
      </form>
    </AdminFormPage>
  );
}
