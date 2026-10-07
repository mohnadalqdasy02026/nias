import { useState } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings.js';

export const REGISTRATION_STEPS = [
  {
    key: 'account',
    num: 1,
    icon: 'user',
    title: 'إنشاء الحساب',
    short: 'أنشئ حسابك على بوابة التنسيق الموحد وفعّله.',
    body: [
      'ادخل إلى بوابة التنسيق الموحد للجامعات اليمنية من الزر أدناه.',
      'أنشئ حسابًا جديدًا برقم هاتفك وبريدك الإلكتروني ثم فعّله برمز التأكيد.',
      'احفظ بيانات الدخول؛ لتعود إليها في مرحلة الاستعلام عن النتائج.',
    ],
  },
  {
    key: 'qualifications',
    num: 2,
    icon: 'doc',
    title: 'إدخال المؤهل',
    short: 'أدخل بيانات الثانوية العامة والمعدل.',
    body: [
      'أدخل رقم جلوسك وبيانات شهادة الثانوية العامة أو ما يعادلها.',
      'تأكد من مطابقة البيانات لشهادة الأصل قبل اعتمادها.',
      'ستُحسب نقاطك التنافسية آليًا وفق معايير التنسيق المعتمدة.',
    ],
  },
  {
    key: 'choices',
    num: 3,
    icon: 'target',
    title: 'تحديد الرغبات',
    short: 'رتب رغباتك بين الكليات والبرامج.',
    body: [
      'تصفح البرامج في صفحة البرامج الأكاديمية واطّلع على الخطة الدراسية وشروط القبول لكل برنامج.',
      'من كلية، تعرّف على أقسامها، ومن كل قسم على برامجه.',
      'رتب رغباتك حسب أولوياتك: الماجستير، البكالوريوس، ثم الدبلوم المتوسط.',
    ],
  },
  {
    key: 'documents',
    num: 4,
    icon: 'folder',
    title: 'رفع المستندات',
    short: 'ارفع صور الوثائق المطلوبة كاملة.',
    body: [
      'صورة شهادة الثانوية العامة أو ما يعادلها.',
      'صورة شخصية حديثة بخلفية بيضاء.',
      'صورة الهوية الوطنية أو البطاقة التعريفية.',
      'أي وثائق إضافية يحددها البرنامج (محضر السلوك، شهادة الميلاد وغيرها).',
      'تأكد من وضوح وسلامة الصور المرفوعة قبل الإرسال.',
    ],
  },
  {
    key: 'submit',
    num: 5,
    icon: 'check',
    title: 'التقديم والنتيجة',
    short: 'أرسل الطلب وتابع نتيجة المفاضلة.',
    body: [
      'راجع بياناتك النهائية ثم اعتمد تقديم الطلب.',
      'يتم الفرز التنافسي وفق المعدلات والمعايير المعتمدة في بوابة التنسيق.',
      'تابع نتيجة القبول عبر البوابة أو رابط الاستعلام عن النتائج في الموقع.',
      'بعد القبول، أكمل إجراءات التسجيل النهائية في المعهد وفق الإعلانات الرسمية.',
    ],
  },
];

const iconPaths = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  doc: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zM14 3v6h6M9 13h6M9 17h6',
  target: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM12 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4z',
  folder: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11zM12 12v4M10 14h4',
  check: 'M22 11.1V12a10 10 0 1 1-5.93-9.14M22 4L12 14l-3-3',
};

function StepIcon({ name, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={iconPaths[name] ?? iconPaths.user} />
    </svg>
  );
}

export default function RegistrationSteps({ steps = REGISTRATION_STEPS, heading, subtitle }) {
  const [active, setActive] = useState(0);
  const settings = useSiteSettings();
  const admissionUrl = settings?.general?.ministry_admission_url || 'https://oasyemen.net';
  const step = steps[active];

  return (
    <section className="regsteps" aria-labelledby="regsteps-title">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title" id="regsteps-title">{heading ?? 'خطوات التسجيل والقبول'}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>

        <div className="regsteps-inner">
          <ol className="regsteps-list">
            {steps.map((s, i) => (
              <li key={s.key}>
                <button
                  type="button"
                  className={`regsteps-item${i === active ? ' is-active' : ''}${i < active ? ' is-done' : ''}`}
                  onClick={() => setActive(i)}
                  aria-current={i === active ? 'step' : undefined}
                >
                  <span className="regsteps-num" aria-hidden="true">{i < active ? '✓' : s.num}</span>
                  <span className="regsteps-item-text">
                    <strong>{s.title}</strong>
                    <small>{s.short}</small>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div className="regsteps-panel">
            <div className="regsteps-panel-head">
              <span className="regsteps-panel-icon"><StepIcon name={step.icon} /></span>
              <div>
                <span className="regsteps-panel-step">الخطوة {step.num} من {steps.length}</span>
                <h3>{step.title}</h3>
              </div>
            </div>
            <ul className="regsteps-panel-body">
              {step.body.map((line) => <li key={line}>{line}</li>)}
            </ul>
            <div className="regsteps-panel-actions">
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => setActive((v) => Math.max(0, v - 1))}
                disabled={active === 0}
              >
                → الخطوة السابقة
              </button>
              {active < steps.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setActive((v) => Math.min(steps.length - 1, v + 1))}
                >
                  الخطوة التالية ←
                </button>
              ) : (
                <a className="btn btn-primary" href={admissionUrl} target="_blank" rel="noopener noreferrer">
                  أكمل التقديم عبر البوابة
                </a>
              )}
            </div>
            <div className="regsteps-cta">
              <span>التقديم يتم إلكترونيًا بالكامل عبر</span>
              <a href={admissionUrl} target="_blank" rel="noopener noreferrer">بوابة التنسيق الموحد ←</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}