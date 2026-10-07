import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import RegistrationSteps from '../components/RegistrationSteps.jsx';

const requiredDocs = [
  { title: 'شهادة الثانوية العامة', text: 'أصل الشهادة أو ما يعادلها مع صورة واضحة تُرفع في البوابة.' },
  { title: 'صورة شخصية', text: 'صورة حديثة بخلفية بيضاء وبمواصفات الصور الرسمية.' },
  { title: 'الهوية الوطنية', text: 'صورة من البطاقة الشخصية أو شهادة الميلاد إن لم تكن الهوية صدرت.' },
  { title: 'وثائق إضافية', text: 'محضر السلوك، والوثائق التي يحددها برنامج القبول إن وجدت.' },
];

const applyNotes = [
  { title: 'الفرز التنافسي', text: 'يُقبل الطلاب وفق المفاضلة بين المتقدمين من الأعلى معدلًا فالأقل، حسب الأماكن المتاحة.' },
  { title: 'التقديم إلكتروني', text: 'جميع خطوات التقديم تتم عبر بوابة التنسيق الموحد دون مراجعة الحضور إلا بعد إعلان النتائج.' },
  { title: 'راجع شروط البرنامج', text: 'اطّلع على شروط القبول والخطة الدراسية من صفحة البرنامج قبل اختياره في الرغبات.' },
  { title: 'نتائج القبول', text: 'تُعلن النتائج عبر بوابة التنسيق، ويمكن متابعتها أيضًا من رابط «الاستعلام عن نتائج القبول» في الموقع.' },
];

export default function Apply() {
  const settings = useSiteSettings();
  const admissionUrl = settings?.general?.ministry_admission_url || 'https://oasyemen.net';

  usePageMeta(
    'التسجيل والقبول',
    'خطوات التقديم والتسجيل في كليات وبرامج المعهد الوطني للعلوم الإدارية عبر بوابة التنسيق الموحد المعتمدة.',
  );

  return (
    <>
      <section className="programs-hero">
        <div className="container programs-hero-inner">
          <p className="programs-hero-eyebrow">قبول الطلاب — عبر بوابة التنسيق الموحد</p>
          <h1>التسجيل والقبول</h1>
          <p className="programs-hero-sub">
            يقدّم المعهد الوطني للعلوم الإدارية برامج البكالوريوس والماجستير والدبلوم المتوسط،
            وتتم عملية التقديم إلكترونيًا بالكامل عبر بوابة التنسيق الموحد لوزارة التربية
            والتعليم والبحث العلمي. راجع الخطوات بالترتيب ثم ابدأ رحلتك الأكاديمية.
          </p>
          <div className="programs-hero-strip">
            <div className="ph-stat">
              <span className="ph-stat-num">5</span>
              <span className="ph-stat-label">خطوات سهلة</span>
            </div>
            <div className="ph-stat">
              <span className="ph-stat-num">13</span>
              <span className="ph-stat-label">برنامجًا معتمدًا</span>
            </div>
            <div className="ph-stat">
              <span className="ph-stat-num">بكالوريوس</span>
              <span className="ph-stat-label">ماجستير ودبلوم</span>
            </div>
          </div>
        </div>
      </section>

      <RegistrationSteps />

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">المستندات المطلوبة</h2>
            <p className="section-subtitle">جهّز هذه الوثائق قبل بدء التقديم لتقدم طلبك دون تأخير.</p>
          </div>
          <div className="apply-docs-grid">
            {requiredDocs.map((d) => (
              <div key={d.title} className="card apply-doc-card">
                <span className="apply-doc-mark" aria-hidden="true">?✓</span>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">معلومات هامة</h2>
            <p className="section-subtitle">نصائح ترشدك أثناء التقديم وتجنبك الأخطاء الشائعة.</p>
          </div>
          <div className="apply-notes-grid">
            {applyNotes.map((n) => (
              <article key={n.title} className="apply-note">
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
              <h3>جاهز للبدء؟</h3>
              <p>افتح حسابك على بوابة التنسيق الموحد وابدأ خطوات التقديم الآن.</p>
            </div>
            <a className="btn btn-primary" href={admissionUrl} target="_blank" rel="noopener noreferrer" aria-label="الانتقال إلى بوابة التنسيق الموحد للجامعات اليمنية (رابط خارجي)">
              سجّل عبر البوابة
            </a>
            <Link to="/programs" className="btn btn-soft">استعرض البرامج</Link>
          </div>
        </div>
      </section>
    </>
  );
}