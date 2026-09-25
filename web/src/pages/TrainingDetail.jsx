import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { branchLabel } from '../lib/branch.js';

const iconPaths = {
  clock: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM12 6v6l4 2',
  locations: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  grad: 'M22 10l-10-5L2 10l10 5 10-5zM6 12v5c3 2 7 2 10 0v-5M22 10v6',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  money: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM20 17v4',
};

const fallbackCover = '/uploads/design/site/main_1786901865_894.jpg';

function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={iconPaths[name] ?? iconPaths.book} />
    </svg>
  );
}

const currency = (value) => {
  if (value == null || value === '') return null;
  return `${Number(value).toLocaleString('en-US')} ريال يمني`;
};

export default function TrainingDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  usePageMeta(course?.title ? `دورة ${course.title}` : 'الدورة التدريبية', 'تفاصيل الدورة التدريبية في المعهد الوطني للعلوم الإدارية.');

  useEffect(() => {
    setError(null);
    setCourse(null);
    api.get(`/public/training-courses/${id}`)
      .then(setCourse)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <div className="card program-detail-empty">
            <h2>الدورة غير موجودة</h2>
            <p className="muted">تعذر العثور على هذه الدورة أو أنها غير مفتوحة حاليًا.</p>
            <Link to="/training" className="btn btn-primary">العودة إلى الدورات</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="section">
        <div className="container"><p className="muted">جاري التحميل...</p></div>
      </section>
    );
  }

  const cover = course.image_url || fallbackCover;
  const branch = course.branch_name_ar ? branchLabel(course.branch_name_ar) : null;

  const facts = [
    { icon: 'locations', label: 'الفرع', value: branch ?? '—' },
    { icon: 'locations', label: 'المكان', value: course.location ?? '—' },
    { icon: 'clock', label: 'المدة', value: course.start_date && course.end_date ? `${new Date(course.start_date).toLocaleDateString('ar-YE')} — ${new Date(course.end_date).toLocaleDateString('ar-YE')}` : '—' },
    { icon: 'grad', label: 'المدرب', value: course.trainer ?? '—' },
    { icon: 'users', label: 'المقاعد المتاحة', value: course.capacity != null ? `${course.capacity} مقعد` : '—' },
    { icon: 'money', label: 'الرسوم', value: currency(course.fees) ?? '—' },
  ];

  return (
    <>
      <section className="program-detail-hero">
        <div className="container program-detail-hero-inner">
          <p className="programs-hero-eyebrow">الدورات التدريبية — التفاصيل</p>
          <h1>{course.title}</h1>
          <p className="programs-hero-sub">
            {course.category ?? 'دورة تدريبية'}
            {branch ? <> — <span>{branch}</span></> : null}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container program-detail-layout">
          <div className="program-detail-main">
            <div className="program-detail-cover">
              <img src={cover} alt={course.title} />
            </div>

            <div className="card program-detail-card">
              <h2>نبذة عن الدورة</h2>
              <p className="program-detail-text">{course.description || 'لا يوجد وصف متاح لهذه الدورة حاليًا.'}</p>
            </div>

            <div className="card program-detail-card">
              <h2>تنظيم الدورة</h2>
              <p className="program-detail-text">
                تُنفَّذ الدورة في مقر الفرع المحدد أعلاه، بتنسيق من مركز التدريب في المعهد الوطني للعلوم
                الإدارية. تُمنح شهادة حضور معتمدة بنهاية الدورة لمن يكمل المتطلبات بنجاح.
              </p>
            </div>

            <div className="card admission-cta admission-cta--bottom">
              <div>
                <h3>سجّل الآن في هذه الدورة</h3>
                <p>املأ نموذج التسجيل وسيتواصل معك فرع المعهد لتأكيد مقعدك في الدورة.</p>
              </div>
              <Link to={`/training/register?course=${course.id}`} className="btn btn-primary">
                سجّل في الدورة
              </Link>
            </div>
          </div>

          <aside className="program-detail-side">
            <div className="card program-detail-card program-detail-overview">
              <h3>لمحة سريعة</h3>
              <ul className="program-detail-facts">
                {facts.map((f) => (
                  <li key={f.label}>
                    <span className="program-detail-fact-icon"><Icon name={f.icon} size={17} /></span>
                    <div>
                      <small>{f.label}</small>
                      <strong>{f.value}</strong>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/training" className="btn btn-soft program-detail-back">العودة إلى جميع الدورات</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}