import { Link } from 'react-router-dom';

/**
 * Chrome for every admin add/edit screen: a page header with a back link to the
 * list it belongs to, plus optional grouping sections.
 */
export default function AdminFormPage({ title, subtitle, backTo, backLabel = 'رجوع للقائمة', children, actions }) {
  return (
    <>
      <div className="admin-form-page-head">
        <div>
          <h1 className="admin-form-page-title">{title}</h1>
          {subtitle && <p className="admin-form-page-sub">{subtitle}</p>}
        </div>
        {backTo && (
          <Link to={backTo} className="btn btn-outline">
            <span aria-hidden="true">→</span> {backLabel}
          </Link>
        )}
      </div>
      {children}
      {actions && <div className="admin-form-actions">{actions}</div>}
    </>
  );
}

export function AdminFormSection({ title, hint, children }) {
  return (
    <section className="admin-form-section">
      {title && <span className="admin-form-section-title">{title}</span>}
      {hint && <span className="admin-form-section-hint">{hint}</span>}
      {children}
    </section>
  );
}
