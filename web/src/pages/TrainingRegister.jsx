import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { trainingCategoryLabel } from '../lib/training.js';

const emptyForm = {
  first_name: '',
  father_name: '',
  grandfather_name: '',
  family_name: '',
  phone: '',
  branch_id: '',
  course_id: '',
  signature_data: '',
};

export default function TrainingRegister() {
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [captcha, setCaptcha] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const preselectedCourseId = searchParams.get('course');

  usePageMeta('التسجيل في البرامج التدريبية', 'سجّل في البرامج التدريبية المفتوحة في المعهد الوطني للعلوم الإدارية.');

  useEffect(() => {
    api.get('/public/branches').then(setBranches).catch(() => {});
    api.get('/public/training-courses').then((d) => {
      setCourses(d ?? []);
      const preselect = Number(preselectedCourseId);
      if (d && d.some((c) => Number(c.id) === preselect)) {
        setForm((prev) => ({ ...prev, course_id: String(preselect) }));
      }
    }).catch(() => {});
    api.get('/public/training/register/config').then(setCaptcha).catch(() => {});
  }, [preselectedCourseId]);

  const refreshCaptcha = () => {
    setCaptcha(null);
    api.get('/public/training/register/config').then(setCaptcha).catch(() => {});
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (!captcha) {
        refreshCaptcha();
        setError(new Error('تعذّر تجهيز تحقق الأمان، أعد المحاولة.'));
        return;
      }
      const data = await api.post('/public/training/register', {
        ...form,
        branch_id: Number(form.branch_id),
        course_id: Number(form.course_id),
        challenge_id: captcha.challengeId,
        answer: Number(e.target.answer.value),
      });
      setDone(data);
    } catch (err) {
      setError(err);
      refreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="section">
        <div className="container page-content">
          <div className="alert alert-success" role="status" style={{ marginBottom: 20 }}>
            تم استلام طلب تسجيلك بنجاح.
          </div>
          <p>
            رقم التسجيل: <code>{done.enrollmentId}</code> — البرنامج: <strong>{done.courseTitle}</strong>
            <br />
            الحالة الحالية: <strong>قيد المراجعة</strong>. سيتواصل معك فرع المعهد لتأكيد التسجيل.
          </p>
          <Link to="/training" className="btn btn-outline back-link">← العودة إلى التدريب</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container page-content">
        <h1 className="section-title">التسجيل في البرامج التدريبية</h1>
        <p className="section-subtitle">املأ البيانات الأربعة (الأسماء) ورقم الجوال واختر الفرع والبرنامج.</p>

        {error && (
          <div className="alert alert-danger" role="alert">
            <p style={{ margin: 0 }}>{error.message}</p>
            {error.details?.length > 0 && (
              <ul className="alert-details">
                {error.details.map((d, i) => (
                  <li key={i}>{d.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card admin-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="tr-first-name">الاسم الأول *</label>
              <input id="tr-first-name" value={form.first_name} onChange={set('first_name')} required />
            </div>
            <div className="form-field">
              <label htmlFor="tr-father-name">اسم الأب *</label>
              <input id="tr-father-name" value={form.father_name} onChange={set('father_name')} required />
            </div>
            <div className="form-field">
              <label htmlFor="tr-grandfather-name">اسم الجد *</label>
              <input id="tr-grandfather-name" value={form.grandfather_name} onChange={set('grandfather_name')} required />
            </div>
            <div className="form-field">
              <label htmlFor="tr-family-name">العائلة *</label>
              <input id="tr-family-name" value={form.family_name} onChange={set('family_name')} required />
            </div>
            <div className="form-field">
              <label htmlFor="tr-phone">رقم الجوال *</label>
              <input id="tr-phone" value={form.phone} onChange={set('phone')} required dir="ltr" inputMode="tel" placeholder="77XXXXXXXX" />
            </div>
            <div className="form-field">
              <label htmlFor="tr-branch">الفرع *</label>
              <select id="tr-branch" value={form.branch_id} onChange={set('branch_id')} required>
                <option value="">اختر الفرع</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
              </select>
            </div>
            <div className="form-field form-field--full">
              <label htmlFor="tr-course">البرنامج التدريبى *</label>
              <select id="tr-course" value={form.course_id} onChange={set('course_id')} required>
                <option value="">اختر البرنامج</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{trainingCategoryLabel(c.category)}: {c.title}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="tr-captcha">تحقق أمان (CAPTCHA) *</label>
              {captcha ? (
                <>
                  <div className="captcha-row">
                    <strong>{captcha.question}</strong>
                    <button type="button" className="btn btn-sm btn-soft" onClick={refreshCaptcha}>تغيير</button>
                  </div>
                  <input id="tr-captcha" name="answer" type="number" required placeholder="أدخل الناتج" />
                </>
              ) : (
                <p className="muted">جارٍ التحضير...</p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="tr-signature">التوقيع الإلكتروني (اختياري)</label>
              <input id="tr-signature" value={form.signature_data} onChange={set('signature_data')} placeholder="اكتب اسمك للتوقيع" />
            </div>

            <div className="form-field form-field--full">
              <label className="checkbox-line">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
                أقرّ بصحة المعلومات المقدمة وأوافق على شروط التسجيل في المعهد. *
              </label>
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-register" disabled={submitting || !agreed}>
              {submitting ? 'جارٍ الإرسال...' : 'إرسال طلب التسجيل'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}