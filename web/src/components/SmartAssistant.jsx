import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';

const QUICK_QUESTIONS = [
  { key: 'programs', label: 'الأقسام والتخصصات' },
  { key: 'about', label: 'عن المعهد' },
  { key: 'colleges', label: 'كليات المعهد' },
  { key: 'master', label: 'الدراسات العليا' },
  { key: 'fees', label: 'رسوم الدراسة' },
  { key: 'contact', label: 'أرقام التواصل' },
  { key: 'address', label: 'عنوان المعهد' },
  { key: 'branches', label: 'فروع المعهد' },
];

const PROGRAM_TYPE_LABELS = {
  bachelor: 'بكالوريوس',
  master_academic: 'ماجستير أكاديمي',
  master_executive: 'ماجستير تنفيذي',
  diploma: 'دبلوم متوسط',
};

const KEYWORDS = [
  ['branches', ['فرع', 'فروع']],
  ['contact', ['تواصل', 'هاتف', 'رقم', 'واتساب', 'بريد', 'ايميل', 'إيميل']],
  ['address', ['عنوان', 'موقع', 'مكان']],
  ['master', ['ماجستير', 'دراسات عليا']],
  ['colleges', ['كلية', 'كليات']],
  ['programs', ['تخصص', 'تخصصات', 'برنامج', 'برامج', 'اقسام', 'أقسام', 'قسم']],
  ['fees', ['رسوم', 'تكلفة', 'سعر']],
  ['about', ['عن المعهد', 'نبذة', 'المعهد']],
];

const detectQuestion = (text) => {
  const t = text.trim();
  if (!t) return null;
  for (const [key, words] of KEYWORDS) {
    if (words.some((w) => t.includes(w))) return key;
  }
  return null;
};

export default function SmartAssistant() {
  const settings = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'مرحباً 👋 أنا المساعد الذكي، كيف يمكنني مساعدتك اليوم؟' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef(null);
  const cache = useRef({});

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  const load = async (path) => {
    if (!cache.current[path]) cache.current[path] = await api.get(path);
    return cache.current[path] ?? [];
  };

  const buildReply = async (key) => {
    const contact = settings?.contact ?? {};
    const siteName = settings?.general?.site_name_ar ?? 'المعهد الوطني للعلوم الإدارية';

    if (key === 'about') {
      return {
        text: `${siteName} مؤسسة وطنية معنية ببناء القدرات الإدارية وتأهيل الكوادر في الجمهورية اليمنية.`,
        links: [{ to: '/about', label: 'اقرأ المزيد عن المعهد' }],
      };
    }

    if (key === 'programs') {
      const programs = await load('/public/programs');
      return {
        text: `يقدّم المعهد ${programs.length} برنامجاً أكاديمياً في مختلف الكليات:`,
        items: programs.map((p) => {
          const type = PROGRAM_TYPE_LABELS[p.program_type] ?? p.program_type;
          const college = p.college_name_ar ? ` — ${p.college_name_ar}` : '';
          return `${p.name_ar} (${type}${college})`;
        }),
        links: [{ to: '/programs', label: 'كل البرامج الأكاديمية' }],
      };
    }

    if (key === 'colleges') {
      const colleges = await load('/public/colleges');
      return {
        text: `كليات ومراكز المعهد (${colleges.length}):`,
        items: colleges.map((c) => c.name_ar),
        links: [{ to: '/colleges', label: 'استعرض الكليات والأقسام' }],
      };
    }

    if (key === 'master') {
      const programs = await load('/public/programs');
      const masters = programs.filter((p) => String(p.program_type).startsWith('master'));
      return {
        text: masters.length
          ? `برامج الدراسات العليا (${masters.length}):`
          : 'تُعلن برامج الدراسات العليا مع بداية كل فصل دراسي.',
        items: masters.map((p) => `${p.name_ar} (${PROGRAM_TYPE_LABELS[p.program_type] ?? p.program_type})`),
        links: [{ to: '/programs', label: 'البرامج الأكاديمية' }],
      };
    }

    if (key === 'fees') {
      return {
        text: 'تُحدَّد رسوم الدراسة حسب البرنامج والدرجة العلمية، وتُعلن مع فتح باب القبول والتنسيق. يمكنك مراجعة شروط وخطوات التسجيل أو التواصل مع الإدارة للاستفسار.',
        links: [
          { to: '/apply', label: 'شروط وخطوات التسجيل' },
          { to: '/contact', label: 'تواصل مع الإدارة' },
        ],
      };
    }

    if (key === 'contact') {
      const lines = [
        contact.phone ? `الهاتف: ${contact.phone}` : null,
        contact.email ? `البريد: ${contact.email}` : null,
        contact.whatsapp ? `واتساب: ${contact.whatsapp}` : null,
        contact.hours ? `أوقات العمل: ${contact.hours}` : null,
      ].filter(Boolean);
      return {
        text: lines.length ? 'قنوات التواصل الرسمية:' : 'تجد أرقام التواصل في صفحة «تواصل معنا».',
        items: lines,
        links: [{ to: '/contact', label: 'صفحة التواصل' }],
      };
    }

    if (key === 'address') {
      return {
        text: contact.address ? `عنوان المعهد: ${contact.address}` : 'تجد عنوان المعهد في صفحة التواصل وخرائط الفروع.',
        links: [
          { to: '/contact', label: 'صفحة التواصل' },
          { to: '/branches', label: 'فروع المعهد' },
        ],
      };
    }

    if (key === 'branches') {
      const branches = await load('/public/branches');
      return {
        text: `فروع المعهد (${branches.length}):`,
        items: branches.map((b) => (b.address ? `${b.name_ar} — ${b.address}` : b.name_ar)),
        links: [{ to: '/branches', label: 'تفاصيل الفروع والخرائط' }],
      };
    }

    return {
      text: 'لم أفهم سؤالك تماماً. جرّب أحد الأسئلة السريعة بالأسفل، أو تواصل معنا مباشرة.',
      links: [{ to: '/contact', label: 'تواصل معنا' }],
    };
  };

  const ask = async (key, label) => {
    if (typing) return;
    setMessages((m) => [...m, { role: 'user', text: label }]);
    setTyping(true);
    try {
      const reply = await buildReply(key);
      setMessages((m) => [...m, { role: 'bot', ...reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: 'تعذّر جلب البيانات الآن، حاول مرة أخرى بعد قليل.' }]);
    } finally {
      setTyping(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    const key = detectQuestion(text) ?? 'unknown';
    ask(key, text);
  };

  return (
    <div className={`smart-assistant${open ? ' smart-assistant--open' : ''}`}>
      {open && (
        <div className="smart-assistant-panel" role="dialog" aria-label="المساعد الذكي">
          <div className="smart-assistant-head">
            <div>
              <strong>المساعد الذكي</strong>
              <span>نساعدك في الوصول للمعلومة بسرعة</span>
            </div>
            <button type="button" className="smart-assistant-close" aria-label="إغلاق المساعد" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="smart-assistant-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`smart-msg smart-msg--${m.role}`}>
                <p>{m.text}</p>
                {m.items?.length > 0 && (
                  <ul>
                    {m.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                )}
                {m.links?.length > 0 && (
                  <div className="smart-msg-links">
                    {m.links.map((l) => (
                      <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && <div className="smart-msg smart-msg--bot smart-msg--typing"><span /><span /><span /></div>}
          </div>

          <div className="smart-assistant-quick">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q.key} type="button" onClick={() => ask(q.key, q.label)} disabled={typing}>
                {q.label}
              </button>
            ))}
          </div>

          <form className="smart-assistant-input" onSubmit={submit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا…"
              aria-label="سؤالك"
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={typing || !input.trim()}>إرسال</button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="smart-assistant-toggle"
        aria-label={open ? 'إغلاق المساعد الذكي' : 'فتح المساعد الذكي'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? '×' : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span>المساعد الذكي</span>
          </>
        )}
      </button>
    </div>
  );
}
