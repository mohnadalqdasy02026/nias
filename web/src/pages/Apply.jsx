import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import RegistrationSteps from '../components/RegistrationSteps.jsx';
import { DEFAULT_APPLY } from '../lib/applyContent.js';

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