import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client.js';
import { AREAS, TEMPLATES, areaOf, actionLabel, actionCode, EXISTING_CODES, AREA_ICON_PATHS } from '../../admin/permissions.js';

function AreaIcon({ name, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={AREA_ICON_PATHS[name] ?? AREA_ICON_PATHS.other} />
    </svg>
  );
}

function actionTone(code) {
  const a = actionCode(code);
  if (a === 'read' || a === 'view' || a === 'access') return 'tone-read';
  if (a === 'create') return 'tone-create';
  if (a === 'update' || a === 'review') return 'tone-update';
  if (a === 'delete') return 'tone-delete';
  if (a === 'manage') return 'tone-manage';
  if (a === 'publish') return 'tone-publish';
  return '';
}

export default function RolesAdmin() {
  const [roles, setRoles] = useState([]);
  const [perms, setPerms] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [editing, setEditing] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [templateKey, setTemplateKey] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [r, p] = await Promise.all([
        api.get('/admin/roles/all', { auth: true }),
        api.get('/admin/roles/permissions', { auth: true }),
      ]);
      setRoles(r);
      setPerms(p.filter((x) => EXISTING_CODES.includes(x.code)));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isProtected = (role) => role?.name === 'Administrator';

  const openEditor = async (role) => {
    setEditing(role ? { id: role.id, name: role.name, description: role.description ?? '' } : { id: null, name: '', description: '' });
    setTemplateKey(null);
    setSelectedCodes([]);
    if (role && !isProtected(role)) {
      try {
        const codes = await api.get(`/admin/roles/${role.id}`, { auth: true });
        setSelectedCodes((Array.isArray(codes) ? codes : []).filter((c) => EXISTING_CODES.includes(c)));
      } catch (e) {
        setError(e.message);
      }
    }
  };

  const applyTemplate = (tpl) => {
    setTemplateKey(tpl.key);
    setEditing((ed) => ({ ...(ed ?? { id: null, name: '', description: '' }), name: tpl.name }));
    setSelectedCodes((prev) => {
      const base = prev.includes('dashboard.access') ? prev : [...prev, 'dashboard.access'];
      return [...new Set([...base, ...tpl.codes])];
    });
  };

  const clearTemplate = () => {
    setTemplateKey(null);
    setSelectedCodes((prev) => prev.filter((c) => !TEMPLATES.some((t) => t.codes.includes(c)) && c !== 'dashboard.access'));
  };

  const togglePerm = (code) => {
    setSelectedCodes((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  const toggleArea = (areaPerms, checked) => {
    const codes = areaPerms.map((p) => p.code);
    setSelectedCodes((prev) => {
      const set = new Set(prev);
      for (const c of codes) {
        if (checked) set.add(c);
        else set.delete(c);
      }
      return [...set];
    });
  };

  const groups = useCallback(() => {
    const map = new Map();
    for (const p of perms) {
      const key = areaOf(p.code);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
    return AREAS.map((area) => ({ ...area, perms: map.get(area.key) ?? [] })).filter((g) => g.perms.length > 0);
  }, [perms]);

  const save = async (e) => {
    e.preventDefault();
    setBusy('save');
    setError(null);
    try {
      if (isProtected(editing)) {
        setEditing(null);
        setTemplateKey(null);
        return;
      }
      let saved;
      if (editing.id) {
        saved = await api.patch(`/admin/roles/${editing.id}`, { name: editing.name, description: editing.description }, { auth: true });
      } else {
        saved = await api.post('/admin/roles', { name: editing.name, description: editing.description }, { auth: true });
      }
      if (!isProtected(saved) || (editing.id && !isProtected(editing))) {
        await api.put(`/admin/roles/${saved.id}/permissions`, { permissions: selectedCodes.filter((c) => EXISTING_CODES.includes(c)) }, { auth: true });
      }
      setEditing(null);
      setTemplateKey(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (role) => {
    if (!window.confirm(`حذف الدور "${role.name}" نهائيًا؟`)) return;
    setBusy(role.id);
    setError(null);
    try {
      await api.del(`/admin/roles/${role.id}`, { auth: true });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <h1 className="admin-page-title">الأدوار والصلاحيات</h1>
      <p className="muted">أنشئ أدوارًا جاهزة حسب الأقسام، عدّل الاسم، وخُصّص الصلاحيات لكل دور.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {!editing && (
        <div className="admin-toolbar">
          <span className="muted">{roles.length} دور</span>
          <button type="button" className="btn btn-primary" onClick={() => openEditor(null)}>+ دور جديد</button>
        </div>
      )}

      {editing && (
        <form className="card admin-form" onSubmit={save}>
          <h3>{editing.id ? `تعديل دور: ${editing.name}` : 'دور جديد'}</h3>
          {isProtected(editing) && <p className="muted">دور Administrator محمي — لا يمكن تعديل اسمه أو صلاحياته.</p>}
          <div className="form-grid">
            <div className="form-field">
              <label>اسم الدور *</label>
              <input value={editing.name} dir="ltr" disabled={isProtected(editing)} required onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="form-field">
              <label>الوصف</label>
              <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
          </div>
          <div className="form-field">
            <label>عدد الصلاحيات المحددة: {selectedCodes.length}</label>
          </div>

          {!isProtected(editing) && (
            <div className="perm-wrap">
              <h4 className="perm-wrap-title">قوالب وزارية سريعة — اضغط لوضع صلاحيات قسم كامل</h4>
              <div className="perm-templates">
                {TEMPLATES.map((t) => {
                  const tplActive = templateKey === t.key;
                  const allAssigned = t.codes.every((c) => selectedCodes.includes(c));
                  return (
                    <button
                      key={t.key}
                      type="button"
                      className={`perm-template${tplActive ? ' perm-template--on' : ''}${allAssigned && !tplActive ? ' perm-template--applied' : ''}`}
                      onClick={() => (tplActive ? clearTemplate() : applyTemplate(t))}
                    >
                      <span className="perm-template-icon"><AreaIcon name={t.key in AREA_ICON_PATHS ? t.key : 'other'} /></span>
                      <span className="perm-template-body">
                        <strong>{t.name}</strong>
                        <small>{t.desc}</small>
                      </span>
                      <span className="perm-template-check">{allAssigned ? '✓' : tplActive ? '×' : '+'}</span>
                    </button>
                  );
                })}
              </div>

              <div className="perm-matrix">
                {groups().map((area) => {
                  const areaCodes = area.perms.map((p) => p.code);
                  const areaActive = areaCodes.every((c) => selectedCodes.includes(c));
                  const areaPartial = !areaActive && areaCodes.some((c) => selectedCodes.includes(c));
                  return (
                    <div key={area.key} className={`perm-group perm-group--${area.key}`}>
                      <div className="perm-group-head">
                        <span className="perm-group-icon"><AreaIcon name={area.icon} size={15} /></span>
                        <span className="perm-group-title">{area.label}</span>
                        <label className={`btn btn-sm ${areaActive ? 'btn-soft' : 'btn-outline'} perm-group-toggle`}>
                          <input type="checkbox" checked={areaActive} onChange={(e) => toggleArea(area.perms, e.target.checked)} />
                          {areaActive ? 'الكل' : areaPartial ? 'جزئي' : 'تحديد'}
                        </label>
                      </div>
                      <div className="perm-group-items">
                        {area.perms.map((p) => (
                          <label key={`${area.key}-${p.id}`} className={`checkbox-line perm-item ${selectedCodes.includes(p.code) ? 'perm-item--on' : ''} ${actionTone(p.code)}`}>
                            <input type="checkbox" checked={selectedCodes.includes(p.code)} onChange={() => togglePerm(p.code)} />
                            <span className="perm-item-label">
                              <span className="perm-item-action">{p.description || `${p.code} (${actionLabel(p.code)})`}</span>
                              <code className="perm-item-code">{p.code}</code>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'save' || isProtected(editing)}>{editing.id ? 'حفظ' : 'إنشاء'}</button>
            <button type="button" className="btn btn-soft" onClick={() => { setEditing(null); setTemplateKey(null); }}>إلغاء</button>
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الدور</th>
              <th>الوصف</th>
              <th>الصلاحيات</th>
              <th>المستخدمون</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id}>
                <td data-label="الدور"><strong>{r.name}</strong>{isProtected(r) && <span className="muted"> (محمي)</span>}</td>
                <td data-label="الوصف">{r.description ?? '—'}</td>
                <td data-label="الصلاحيات"><span className={`badge-msg ${r.permissions_count > 0 ? 'badge-success' : 'badge-archived'}`}>{r.permissions_count}</span></td>
                <td data-label="المستخدمون">{r.members_count}</td>
                <td data-label="إجراءات" className="table-actions">
                  <button type="button" className="btn btn-sm btn-soft" disabled={busy === r.id} onClick={() => openEditor(r)}>تعديل</button>
                  <button type="button" className="btn btn-sm btn-danger-soft" disabled={busy === r.id || isProtected(r) || r.members_count > 0} title={r.members_count > 0 ? 'الدور مُسند لمستخدمين' : ''} onClick={() => remove(r)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roles.length === 0 && !error && <p className="muted admin-empty">لا توجد أدوار.</p>}
      </div>
    </section>
  );
}