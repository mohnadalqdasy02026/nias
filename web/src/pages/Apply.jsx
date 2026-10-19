import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import RegistrationSteps from '../components/RegistrationSteps.jsx';
import { DEFAULT_APPLY } from '../lib/applyContent.js';
import { programTypeLabel } from '../lib/admissionContent.js';

function AdmissionsTable() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    api
      .get('/public/programs')
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const query = q.trim();
  const filtered = query
    ? rows.filter((p) =>
        [
          p.name_ar,
          p.name_en,
          p.college_name_ar,
          p.department_name_ar,
          p.branch_name_ar,
          programTypeLabel[p.program_type],
        ].some((v) => (v || '').includes(query)),
      )
    : rows;

  return (
    <div className="dept-table-block">
      <div className="dept-table-toolbar">
        <span className="dept-table-count">{filtered.length} برنامجًا</span>
        <input
          type="search"
          className="dept-table-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث باسم البرنامج أو الكلية أو القسم…"
          aria-label="بحث في الأقسام والتخصصات"
        />
      </div>

      <div className="program-plan-table-wrap">
        <table className="program-plan-table dept-table">
          <thead>
            <tr>
              <th>الفرع</th>
              <th>الكلية</th>
              <th>البرنامج الأكاديمي</th>
              <th>نوع البرنامج</th>
              <th>القسم</th>
              <th>عرض</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <Fragment key={p.id}>
                <tr>
                  <td>{p.branch_name_ar || '—'}</td>
                  <td>{p.college_name_ar || '—'}</td>
                  <td>
                    <span className="program-plan-name">{p.name_ar}</span>
                    {p.name_en ? <span className="dept-table-en">{p.name_en}</span> : null}
                  </td>
                  <td>
                    <span className="program-plan-optional">
                      {programTypeLabel[p.program_type] ?? p.program_type}
                    </span>
                  </td>
                  <td>{p.department_name_ar || '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-soft"
                      onClick={() => setOpenId(openId === p.id ? null : p.id)}
                      aria-expanded={openId === p.id}
                    >
                      {openId === p.id ? 'إخفاء' : 'عرض'}
                    </button>
                  </td>
                </tr>
                {openId === p.id ? (
                  <tr className="dept-table-details-row">
                    <td colSpan={6}>
                      <div className="dept-table-details">
                        {p.description ? (
                          <p>{p.description}</p>
                        ) : (
                          <p className="dept-table-muted">لا يوجد وصف متاح لهذا البرنامج.</p>
                        )}
                        <div className="dept-table-details-actions">
                          <span className={`dept-table-status${p.admission_open ? ' is-open' : ''}`}>
                            {p.admission_open ? 'القبول مفتوح' : 'القبول مغلق'}
                          </span>
                          <Link className="btn btn-sm btn-outline" to={`/programs/${p.id}`}>
                            صفحة البرنامج
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {!filtered.length ? <p className="dept-table-empty">لا توجد برامج مطابقة لبحثك.</p> : null}
    </div>
  );
}

export default function Apply() {
  const settings = useSiteSettings();
  const a = { ...DEFAULT_APPLY, ...(settings?.apply ?? {}) };
  const stats = a.stats?.length ? a.stats : DEFAULT_APPLY.stats;
  const docs = a.docs?.length ? a.docs : DEFAULT_APPLY.docs;
  const notes = a.notes?.length ? a.notes : DEFAULT_APPLY.notes;
  const admissionUrl = settings?.general?.ministry_admission_url || 'https://oasyemen.net';

  usePageMeta(
    a.hero_title || 'التسجيل والقبول',
    a.hero_text || 'خطوات التقديم والتسجيل في كليات وبرامج المعهد الوطني للعلوم الإدارية عبر بوابة التنسيق الموحد المعتمدة.',
  );

  return (
    <>
      <section className="programs-hero">
        <div className="container programs-hero-inner">
          <p className="programs-hero-eyebrow">{a.hero_eyebrow}</p>
          <h1>{a.hero_title}</h1>
          <p className="programs-hero-sub">{a.hero_text}</p>
          <div className="programs-hero-strip">
            {stats.map((s, i) => (
              <div className="ph-stat" key={i}>
                <span className="ph-stat-num">{s.value}</span>
                <span className="ph-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RegistrationSteps />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">{a.table_title}</h2>
            <p className="section-subtitle">{a.table_subtitle}</p>
          </div>
          <AdmissionsTable />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">{a.docs_title}</h2>
            <p className="section-subtitle">{a.docs_subtitle}</p>
          </div>
          <ol className="content-list apply-doc-list">
            {docs.map((d, i) => (
              <li key={i}>
                <strong>{d.title}</strong> — {d.text}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">{a.notes_title}</h2>
            <p className="section-subtitle">{a.notes_subtitle}</p>
          </div>
          <div className="apply-notes-grid">
            {notes.map((n, i) => (
              <article key={i} className="apply-note">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8h.01M12 12v4" /></svg>
                <div>
                  <h3>{n.title}</h3>
                  <p>{n.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="card admission-cta admission-cta--bottom">
            <div>
              <h3>{a.cta_title}</h3>
              <p>{a.cta_text}</p>
            </div>
            <a className="btn btn-primary" href={admissionUrl} target="_blank" rel="noopener noreferrer" aria-label="الانتقال إلى بوابة التنسيق الموحد للجامعات اليمنية (رابط خارجي)">
              {a.cta_button}
            </a>
            <Link to="/programs" className="btn btn-soft">{a.cta_button2}</Link>
          </div>
        </div>
      </section>
    </>
  );
}