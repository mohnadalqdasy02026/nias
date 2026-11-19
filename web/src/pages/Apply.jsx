import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import RegistrationSteps from '../components/RegistrationSteps.jsx';
import { DEFAULT_APPLY } from '../lib/applyContent.js';
import { programTypeLabel } from '../lib/admissionContent.js';
import { trainingCategoryLabel } from '../lib/training.js';

const ENROLLMENT_STATUS = {
  pending: 'قيد المراجعة',
  confirmed: 'مؤكد',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

const TRAINEE_STEPS = [
  {
    key: 'choose',
    num: 1,
    icon: 'target',
    title: 'اختيار البرنامج والفرع',
    short: 'تصفح البرامج التدريبية النشطة واختر ما يناسبك.',
    body: [
      'استعرض البرامج والدورات التدريبية المتاحة حاليًا في صفحة التدريب.',
      'اختر البرنامج المناسب وحدد الفرع الذي ترغب بالتسجيل فيه.',
      'تأكد من أن البرنامج نشط ومتاح للتسجيل قبل إرسال الطلب.',
    ],
  },
  {
    key: 'data',
    num: 2,
    icon: 'user',
    title: 'إدخال بيانات المتدرب',
    short: 'أكمل بياناتك الأساسية بدقة.',
    body: [
      'أدخل الاسم الرباعي ورقم الجوال بشكل صحيح.',
      'اختر الفرع والبرنامج التدريبي من القوائم المتاحة.',
      'استخدم رقم جوال يمكنك متابعة الطلب من خلاله.',
    ],
  },
  {
    key: 'confirm',
    num: 3,
    icon: 'folder',
    title: 'المراجعة والموافقة',
    short: 'راجع البيانات ووافق على شروط التسجيل.',
    body: [
      'تحقق من صحة البيانات قبل الإرسال، خاصة رقم الجوال والبرنامج المختار.',
      'أكمل تحقق الأمان (CAPTCHA) وأقر بصحة المعلومات.',
      'يمكنك إضافة توقيع إلكتروني اختياري باسمك.',
    ],
  },
  {
    key: 'submit',
    num: 4,
    icon: 'check',
    title: 'إرسال الطلب',
    short: 'أرسل طلب التسجيل واحفظ رقم الطلب.',
    body: [
      'عند الإرسال ستستلم رقم تسجيل (رقم طلب). احتفظ به.',
      'تكون الحالة المبدئية عادة «قيد المراجعة» حتى يؤكد الفرع الطلب.',
      'سيتواصل معك فرع المعهد لاستكمال إجراءات التأكيد عند الحاجة.',
    ],
  },
  {
    key: 'track',
    num: 5,
    icon: 'doc',
    title: 'متابعة حالة الطلب',
    short: 'تابع حالة تسجيلك برقم الطلب والجوال.',
    body: [
      'استخدم خدمة «تتبع طلب التدريب» أسفل الصفحة.',
      'أدخل رقم التسجيل ورقم الجوال المطابق لبيانات الطلب.',
      'ستظهر لك حالة الطلب والبرنامج والفرع والتواريخ المتاحة.',
    ],
  },
];

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

const emptyTraineeForm = {
  first_name: '',
  father_name: '',
  grandfather_name: '',
  family_name: '',
  phone: '',
  branch_id: '',
  course_id: '',
  signature_data: '',
};

function TraineeRegisterAndTrack({ preselectedCourseId }) {
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [captcha, setCaptcha] = useState(null);
  const [form, setForm] = useState(emptyTraineeForm);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [trackId, setTrackId] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState(null);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    api.get('/public/branches').then(setBranches).catch(() => {});
    api.get('/public/training-courses').then((d) => {
      const list = Array.isArray(d) ? d : [];
      setCourses(list);
      const pre = Number(preselectedCourseId);
      if (list.some((c) => Number(c.id) === pre)) {
        setForm((prev) => ({ ...prev, course_id: String(pre) }));
      }
    }).catch(() => {});
    api.get('/public/training/register/config').then(setCaptcha).catch(() => {});
  }, [preselectedCourseId]);

  const refreshCaptcha = () => {
    setCaptcha(null);
    api.get('/public/training/register/config').then(setCaptcha).catch(() => {});
  };

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleRegister = async (e) => {
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
      setTrackId(String(data.enrollmentId ?? ''));
      setTrackPhone(form.phone);
    } catch (err) {
      setError(err);
      refreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    setTrackError(null);
    setTrackResult(null);
    if (!trackId || !trackPhone) return;
    setTracking(true);
    try {
      const qs = `enrollmentId=${encodeURIComponent(trackId)}&phone=${encodeURIComponent(trackPhone)}`;
      const data = await api.get(`/public/training/track?${qs}`);
      setTrackResult(data);
    } catch (err) {
      setTrackError(err);
    } finally {
      setTracking(false);
    }
  };

  return (
    <div className="trainee-apply-grid">
      <section className="card" id="trainee-register" aria-labelledby="trainee-register-title">
        <h3 id="trainee-register-title">نموذج تسجيل المتدرب</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          التسجيل متاح للبرامج والدورات التدريبية <strong>النشطة</strong> فقط. بعد الإرسال ستحصل على رقم طلب للمتابعة.
        </p>

        {done ? (
          <div className="alert alert-success" role="status">
            <p style={{ margin: '0 0 8px' }}>تم استلام طلب تسجيلك بنجاح.</p>
            <p style={{ margin: 0 }}>
              رقم التسجيل: <code>{done.enrollmentId}</code>
              {done.courseTitle ? <> — البرنامج: <strong>{done.courseTitle}</strong></> : null}
              <br />
              الحالة الحالية: <strong>قيد المراجعة</strong>. احتفظ برقم التسجيل ورقم الجوال لمتابعة الطلب.
            </p>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a className="btn btn-sm btn-primary" href="#track">تتبع الطلب الآن</a>
              <Link className="btn btn-sm btn-soft" to="/training">استعراض البرامج التدريبية</Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="alert alert-danger" role="alert">
                <p style={{ margin: 0 }}>{error.message}</p>
                {error.details?.length > 0 && (
                  <ul className="alert-details">
                    {error.details.map((d, i) => <li key={i}>{d.message}</li>)}
                  </ul>
                )}
              </div>
            )}
            <form onSubmit={handleRegister} className="admin-form" style={{ boxShadow: 'none', padding: 0, border: 0 }}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="ta-first-name">الاسم الأول *</label>
                  <input id="ta-first-name" value={form.first_name} onChange={set('first_name')} required />
                </div>
                <div className="form-field">
                  <label htmlFor="ta-father-name">اسم الأب *</label>
                  <input id="ta-father-name" value={form.father_name} onChange={set('father_name')} required />
                </div>
                <div className="form-field">
                  <label htmlFor="ta-grandfather-name">اسم الجد *</label>
                  <input id="ta-grandfather-name" value={form.grandfather_name} onChange={set('grandfather_name')} required />
                </div>
                <div className="form-field">
                  <label htmlFor="ta-family-name">العائلة *</label>
                  <input id="ta-family-name" value={form.family_name} onChange={set('family_name')} required />
                </div>
                <div className="form-field">
                  <label htmlFor="ta-phone">رقم الجوال *</label>
                  <input id="ta-phone" value={form.phone} onChange={set('phone')} required dir="ltr" inputMode="tel" placeholder="77XXXXXXXX" />
                </div>
                <div className="form-field">
                  <label htmlFor="ta-branch">الفرع *</label>
                  <select id="ta-branch" value={form.branch_id} onChange={set('branch_id')} required>
                    <option value="">اختر الفرع</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
                  </select>
                </div>
                <div className="form-field form-field--full">
                  <label htmlFor="ta-course">البرنامج/الدورة التدريبية (نشط) *</label>
                  <select id="ta-course" value={form.course_id} onChange={set('course_id')} required>
                    <option value="">اختر البرنامج</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {trainingCategoryLabel(c.category)}: {c.title}
                      </option>
                    ))}
                  </select>
                  {courses.length === 0 && <small className="muted">لا توجد برامج تدريبية نشطة متاحة حاليًا.</small>}
                </div>
                <div className="form-field">
                  <label htmlFor="ta-captcha">تحقق أمان (CAPTCHA) *</label>
                  {captcha ? (
                    <>
                      <div className="captcha-row">
                        <strong>{captcha.question}</strong>
                        <button type="button" className="btn btn-sm btn-soft" onClick={refreshCaptcha}>تغيير</button>
                      </div>
                      <input id="ta-captcha" name="answer" type="number" required placeholder="أدخل الناتج" />
                    </>
                  ) : (
                    <p className="muted">جارٍ التحضير...</p>
                  )}
                </div>
                <div className="form-field">
                  <label htmlFor="ta-signature">التوقيع الإلكتروني (اختياري)</label>
                  <input id="ta-signature" value={form.signature_data} onChange={set('signature_data')} placeholder="اكتب اسمك للتوقيع" />
                </div>
                <div className="form-field form-field--full">
                  <label className="checkbox-line">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
                    أقرّ بصحة المعلومات المقدمة وأوافق على شروط التسجيل في البرامج التدريبية. *
                  </label>
                </div>
              </div>
              <p className="muted" style={{ fontSize: 13, margin: '8px 0 0' }}>
                ملاحظة خصوصية: تُستخدم بياناتك لغرض التسجيل والتواصل والمتابعة فقط. احتفظ برقم الطلب ولا تشاركه إلا مع المعهد.
              </p>
              <div className="admin-form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting || !agreed || courses.length === 0}>
                  {submitting ? 'جارٍ الإرسال...' : 'إرسال طلب التسجيل'}
                </button>
              </div>
            </form>
          </>
        )}
      </section>

      <section className="card" id="track" aria-labelledby="trainee-track-title">
        <h3 id="trainee-track-title">تتبع طلب التدريب</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          أدخل رقم التسجيل ورقم الجوال المستخدم عند التسجيل للاطلاع على حالة الطلب.
        </p>
        <form onSubmit={handleTrack} className="admin-form" style={{ boxShadow: 'none', padding: 0, border: 0 }}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="track-id">رقم التسجيل *</label>
              <input id="track-id" value={trackId} onChange={(e) => setTrackId(e.target.value)} required inputMode="numeric" dir="ltr" placeholder="مثال: 123" />
            </div>
            <div className="form-field">
              <label htmlFor="track-phone">رقم الجوال *</label>
              <input id="track-phone" value={trackPhone} onChange={(e) => setTrackPhone(e.target.value)} required dir="ltr" inputMode="tel" placeholder="77XXXXXXXX" />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-outline" disabled={tracking}>{tracking ? 'جارٍ الاستعلام...' : 'عرض حالة الطلب'}</button>
          </div>
        </form>

        {trackError && (
          <div className="alert alert-danger" role="alert" style={{ marginTop: 12 }}>
            {trackError.message}
          </div>
        )}

        {trackResult && (
          <div className="apply-note" style={{ marginTop: 12 }}>
            <div>
              <h3 style={{ marginTop: 0 }}>نتيجة المتابعة</h3>
              <ul className="content-list" style={{ margin: 0 }}>
                <li><strong>رقم الطلب:</strong> <code>{trackResult.id}</code></li>
                <li><strong>الحالة:</strong> {ENROLLMENT_STATUS[trackResult.status] ?? trackResult.status}</li>
                <li><strong>البرنامج:</strong> {trackResult.course_title || '—'}</li>
                <li><strong>الفرع:</strong> {trackResult.branch_name || '—'}</li>
                {trackResult.start_date ? <li><strong>تاريخ البدء:</strong> {new Date(trackResult.start_date).toLocaleDateString('ar-YE')}</li> : null}
                {trackResult.end_date ? <li><strong>تاريخ الانتهاء:</strong> {new Date(trackResult.end_date).toLocaleDateString('ar-YE')}</li> : null}
                {trackResult.location ? <li><strong>المكان:</strong> {trackResult.location}</li> : null}
              </ul>
              <p className="muted" style={{ margin: '8px 0 0', fontSize: 13 }}>
                الاستعلام متاح بالرقم والجوال فقط لحماية بياناتك. إن احتجت مساعدة تواصل مع الفرع المختص.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function Apply() {
  const settings = useSiteSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const track = searchParams.get('track') === 'trainee' ? 'trainee' : 'student';
  const preselectedCourseId = searchParams.get('course');

  const a = { ...DEFAULT_APPLY, ...(settings?.apply ?? {}) };
  const stats = a.stats?.length ? a.stats : DEFAULT_APPLY.stats;
  const docs = a.docs?.length ? a.docs : DEFAULT_APPLY.docs;
  const notes = a.notes?.length ? a.notes : DEFAULT_APPLY.notes;
  const admissionUrl = settings?.general?.ministry_admission_url || 'https://oasyemen.net';

  usePageMeta(
    a.hero_title || 'التسجيل والقبول',
    track === 'trainee'
      ? 'بوابة موحدة للتسجيل كمتدرب في البرامج والدورات التدريبية ومتابعة حالة الطلب في المعهد الوطني للعلوم الإدارية.'
      : (a.hero_text || 'خطوات التقديم والتسجيل في كليات وبرامج المعهد الوطني للعلوم الإدارية عبر بوابة التنسيق الموحد المعتمدة.'),
  );

  useEffect(() => {
    if (track === 'trainee' && location.hash === '#track') {
      const el = document.getElementById('track');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [track, location.hash]);

  const setTrack = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set('track', next);
    if (next !== 'trainee') params.delete('course');
    setSearchParams(params, { replace: true });
  };

  const studentHeroText = a.hero_text || DEFAULT_APPLY.hero_text;
  const heroEyebrow = track === 'trainee' ? 'بوابة موحدة — التسجيل والمتابعة' : a.hero_eyebrow;
  const heroTitle = track === 'trainee' ? 'التسجيل كمتدرب' : a.hero_title;
  const heroText = track === 'trainee'
    ? 'سجّل في البرامج والدورات التدريبية النشطة عبر الموقع، واحفظ رقم الطلب لمتابعة حالتك في أي وقت برقم التسجيل والجوال.'
    : studentHeroText;

  const heroStats = useMemo(() => {
    if (track === 'trainee') {
      return [
        { value: '5', label: 'خطوات واضحة' },
        { value: 'نشط', label: 'برامج متاحة للتسجيل' },
        { value: 'متابعة', label: 'برقم الطلب والجوال' },
      ];
    }
    return stats;
  }, [track, stats]);

  return (
    <>
      <section className="programs-hero">
        <div className="container programs-hero-inner">
          <p className="programs-hero-eyebrow">{heroEyebrow}</p>
          <h1>{heroTitle}</h1>
          <p className="programs-hero-sub">{heroText}</p>

          <div className="apply-track-switch" role="tablist" aria-label="نوع التسجيل">
            <button
              type="button"
              role="tab"
              aria-selected={track === 'student'}
              className={`programs-tab${track === 'student' ? ' programs-tab--active' : ''}`}
              onClick={() => setTrack('student')}
            >
              <span>سجّل كطالب (أكاديمي)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={track === 'trainee'}
              className={`programs-tab${track === 'trainee' ? ' programs-tab--active' : ''}`}
              onClick={() => setTrack('trainee')}
            >
              <span>سجّل كمتدرب (تدريب)</span>
            </button>
          </div>

          <div className="programs-hero-strip">
            {heroStats.map((s, i) => (
              <div className="ph-stat" key={i}>
                <span className="ph-stat-num">{s.value}</span>
                <span className="ph-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {track === 'student' ? (
        <>
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
              <p className="muted" style={{ marginTop: 12 }}>
                للتسجيل في البرامج والدورات التدريبية، انتقل إلى <button type="button" className="linklike" onClick={() => setTrack('trainee')} style={{ background: 'none', border: 0, padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>مسار المتدربين</button>.
              </p>
            </div>
          </section>
        </>
      ) : (
        <>
          <RegistrationSteps
            steps={TRAINEE_STEPS}
            heading="خطوات التسجيل كمتدرب"
            subtitle="خطوات واضحة للتسجيل في البرامج والدورات التدريبية ومتابعة حالة الطلب."
            finalCta={{ label: 'انتقل إلى نموذج التسجيل', href: '#trainee-register', external: false }}
            footnote={{ text: 'التسجيل والمتابعة يتمان عبر موقع المعهد مباشرة (بدون بوابة خارجية).', label: null, href: null }}
          />

          <section className="section">
            <div className="container">
              <div className="section-head">
                <h2 className="section-title">التسجيل والمتابعة</h2>
                <p className="section-subtitle">أكمل نموذج التسجيل، ثم استخدم رقم الطلب والجوال لمتابعة الحالة.</p>
              </div>
              <TraineeRegisterAndTrack preselectedCourseId={preselectedCourseId} />
            </div>
          </section>

          <section className="section section-alt">
            <div className="container">
              <div className="section-head">
                <h2 className="section-title">ملاحظات مهمة للمتدربين</h2>
                <p className="section-subtitle">إرشادات تساعدك على إتمام التسجيل والمتابعة بسلاسة.</p>
              </div>
              <div className="apply-notes-grid">
                {[
                  { title: 'البرامج النشطة فقط', text: 'يظهر للتسجيل البرامج والدورات ذات الحالة «نشط». إذا لم تجد البرنامج، فقد يكون غير متاح حاليًا.' },
                  { title: 'احتفظ برقم الطلب', text: 'رقم التسجيل مع رقم الجوال هما مفتاح متابعة حالة طلبك، فلا تشاركه إلا مع المعهد عند الحاجة.' },
                  { title: 'خصوصية البيانات', text: 'تُستخدم بياناتك لأغراض التسجيل والتواصل والمتابعة. لا تشارك كلمات مرور أو بيانات حساسة خارج القنوات الرسمية.' },
                  { title: 'الدعم والتواصل', text: 'للاستفسار أو تعديل البيانات تواصل مع الفرع المختص أو عبر صفحة تواصل معنا.' },
                ].map((n, i) => (
                  <article key={i} className="apply-note">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8h.01M12 12v4" /></svg>
                    <div>
                      <h3>{n.title}</h3>
                      <p>{n.text}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="card admission-cta admission-cta--bottom" style={{ marginTop: 20 }}>
                <div>
                  <h3>هل تبحث عن القبول الأكاديمي؟</h3>
                  <p>التقديم للبرامج الأكاديمية (بكالوريوس/ماجستير/دبلوم) يتم عبر مسار الطالب وبوابة التنسيق الموحد.</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setTrack('student')}>الانتقال لمسار الطالب</button>
                <Link to="/training" className="btn btn-soft">استعراض البرامج التدريبية</Link>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
