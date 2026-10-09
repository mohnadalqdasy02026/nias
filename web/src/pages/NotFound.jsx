import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function NotFound() {
  usePageMeta('الصفحة غير موجودة', 'عذرًا، الصفحة التي تبحث عنها غير موجودة في المعهد الوطني للعلوم الإدارية.');

  return (
    <section className="section notfound-section">
      <div className="container notfound-box">
        <p className="notfound-code" aria-hidden="true">404</p>
        <h1 className="section-title">الصفحة غير موجودة</h1>
        <p className="muted">عذرًا، الصفحة التي تبحث عنها غير موجودة أو انتقلت إلى عنوان آخر.</p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary">العودة إلى الرئيسية</Link>
          <Link to="/contact" className="btn btn-outline">تواصل معنا</Link>
        </div>
      </div>
    </section>
  );
}