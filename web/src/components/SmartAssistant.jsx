import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useSiteSettings } from '../hooks/useSiteSettings.js';

const QUICK_QUESTIONS = [
  { key: 'programs', label: 'البرامج الأكاديمية' },
  { key: 'training', label: 'التدريب والتسجيل كمتدرب' },
  { key: 'track', label: 'تتبع طلب التدريب' },
  { key: 'apply', label: 'خطوات القبول الأكاديمي' },
  { key: 'branches', label: 'الفروع' },
  { key: 'library', label: 'المكتبة والموارد' },
  { key: 'contact', label: 'التواصل' },
  { key: 'news', label: 'الأخبار والفعاليات' },
];

const NIAS_HINTS = [
  'معهد', 'وطني', 'برنامج', 'برامج', 'تخصص', 'كلية', 'كليات', 'قسم', 'أقسام',
  'قبول', 'تسجيل', 'تنسيق', 'رسوم', 'دراسة', 'بكالوريوس', 'ماجستير', 'دبلوم',
  'تدريب', 'دورة', 'دورات', 'متدرب', 'تتبع', 'طلب', 'مكتبة', 'موارد', 'لوائح', 'نماذج',
  'فرع', 'فروع', 'أخبار', 'فعالية', 'تواصل', 'هاتف', 'بريد', 'عنوان', 'مجلة', 'هيئة',
  'nias',
];

const PROGRAM_TYPE_LABELS = {
  bachelor: 'بكالوريوس',
  master_academic: 'ماجستير أكاديمي',
  master_executive: 'ماجستير تنفيذي',
  diploma: 'دبلوم متوسط',
};

const KEYWORDS = [
  ['track', ['تتبع', 'متابعة طلب', 'حالة الطلب', 'رقم التسجيل']],
  ['training', ['تدريب', 'متدرب', 'دورة', 'دورات', 'برنامج تدريبي', 'نشاط تدريبي', 'ندوة']],
  ['apply', ['قبول', 'تنسيق', 'سجل كطالب', 'تقديم', 'مستندات', 'شروط']],
  ['branches', ['فرع', 'فروع']],
  ['contact', ['تواصل', 'هاتف', 'رقم', 'واتساب', 'بريد', 'ايميل', 'إيميل']],
  ['address', ['عنوان', 'موقع', 'مكان']],
  ['master', ['ماجستير', 'دراسات عليا']],
  ['library', ['مكتبة', 'موارد', 'نماذج', 'لوائح', 'تحميل', 'ملف', 'ملفات']],
  ['news', ['خبر', 'أخبار', 'فعالية', 'فعاليات', 'نشاطات']],
  ['colleges', ['كلية', 'كليات']],
  ['programs', ['تخصص', 'تخصصات', 'برنامج', 'برامج', 'اقسام', 'أقسام', 'قسم']],
  ['fees', ['رسوم', 'تكلفة', 'سعر']],
  ['about', ['عن المعهد', 'نبذة', 'المعهد']],
];

const detectQuestion = (text) => {
  const t = String(text || '').trim();
  if (!t) return null;
  for (const [key, words] of KEYWORDS) {
    if (words.some((w) => t.includes(w))) return key;
  }
  return null;
};

const isLikelyRelevant = (text) => {
  const t = String(text || '').trim().toLowerCase();
  if (!t) return false;
  if (t.length <= 20) return true;
  return NIAS_HINTS.some((k) => t.includes(String(k).toLowerCase()));
};

const WELCOME = {
  role: 'bot',
  text: 'مرحباً 👋 أنا المساعد الذكي للموقع. أساعدك في المسار الأكاديمي، ومسار التدريب (التسجيل كمتدرب وتتبّع الطلب)، الفروع، الأخبار، والمكتبة والموارد.',
};

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Very small, safe formatting for AI replies: **bold**, *italic*,
// `code`, inline [label](/path) links, and bulleted lines.
const formatReply = (text) => {
  let s = escapeHtml(text);
  s = s.replace(/\[([^\]]+)\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  const lines = s.split(/\n+/).map((line) => {
    const bullet = line.match(/^\s*[-•*]\s+(.*)$/);
    if (bullet) return `<span class="smart-line smart-line--bullet">${bullet[1]}</span>`;
    return `<span class="smart-line">${line}</span>`;
  });
  return lines.join('');
};

export default function SmartAssistant() {
  const settings = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const bodyRef = useRef(null);
  const rootRef = useRef(null);
  const cache = useRef({});

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  // Close when clicking/tapping anywhere outside the assistant (panel or toggle).
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      const root = rootRef.current;
      if (root && !root.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    let alive = true;
    api
      .get('/public/assistant/status')
      .then((d) => {
        if (alive) setAiEnabled(Boolean(d?.enabled));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const load = async (path) => {
    if (!cache.current[path]) cache.current[path] = await api.get(path);
    return cache.current[path] ?? [];
  };

  const buildLocalReply = async (key) => {
    const contact = settings?.contact ?? {};
    const siteName = settings?.general?.site_name_ar ?? 'المعهد الوطني للعلوم الإدارية';

    if (key === 'about') {
      return {
        text: `${siteName} مؤسسة وطنية معنية ببناء القدرات الإدارية وتأهيل الكوادر في الجمهورية اليمنية.`,
        links: [{ to: '/about', label: 'عن المعهد' }],
      };
    }

    if (key === 'apply') {
      return {
        text: 'المسار الأكاديمي: التقديم للبرامج الأكاديمية يتم عبر خطوات واضحة وبوابة التنسيق الموحد. راجع الشروط والخطوات والمستندات ثم انتقل للبوابة.',
        links: [
          { to: '/apply?track=student', label: 'التسجيل والقبول (أكاديمي)' },
          { to: '/programs', label: 'البرامج الأكاديمية' },
        ],
      };
    }

    if (key === 'training') {
      const courses = await load('/public/training-courses').catch(() => []);
      return {
        text: courses.length
          ? `تتوفر حالياً ${courses.length} برامج/دورات تدريبية نشطة. يمكنك التسجيل كمتدرب عبر الموقع ومتابعة حالة طلبك.`
          : 'يمكنك التسجيل كمتدرب في البرامج والدورات التدريبية النشطة عبر الموقع ومتابعة حالة طلبك برقم التسجيل والجوال.',
        items: courses.slice(0, 6).map((c) => c.title),
        links: [
          { to: '/apply?track=trainee', label: 'سجّل كمتدرب' },
          { to: '/training', label: 'صفحة التدريب' },
        ],
      };
    }

    if (key === 'track') {
      return {
        text: 'لمتابعة طلب التدريب أدخل رقم التسجيل ورقم الجوال المستخدم عند التسجيل. ستظهر لك الحالة والبرنامج والفرع والتواريخ المتاحة.',
        links: [{ to: '/apply?track=trainee#track', label: 'تتبع طلب التدريب' }],
      };
    }

    if (key === 'library') {
      return {
        text: 'تجد في المكتبة والموارد النماذج واللوائح والأدلة والإصدارات المتاحة للتحميل.',
        links: [{ to: '/downloads', label: 'المكتبة والموارد' }],
      };
    }

    if (key === 'news') {
      return {
        text: 'تابع آخر الأخبار والفعاليات والأنشطة عبر صفحة الأخبار.',
        links: [{ to: '/news', label: 'الأخبار والفعاليات' }],
      };
    }

    if (key === 'programs') {
      const programs = await load('/public/programs');
      return {
        text: `يقدّم المعهد ${programs.length} برنامجاً أكاديمياً:`,
        items: programs.slice(0, 10).map((p) => {
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
        text: `الكليات والمراكز (${colleges.length}):`,
        items: colleges.map((c) => c.name_ar),
        links: [{ to: '/colleges', label: 'الكليات والأقسام' }],
      };
    }

    if (key === 'master') {
      const programs = await load('/public/programs');
      const masters = programs.filter((p) => String(p.program_type).startsWith('master'));
      return {
        text: masters.length ? `برامج الدراسات العليا (${masters.length}):` : 'تُعلن برامج الدراسات العليا وفق خطة القبول المعتمدة.',
        items: masters.map((p) => `${p.name_ar} (${PROGRAM_TYPE_LABELS[p.program_type] ?? p.program_type})`),
        links: [{ to: '/programs', label: 'البرامج الأكاديمية' }],
      };
    }

    if (key === 'fees') {
      return {
        text: 'تُحدَّد الرسوم حسب البرنامج والدرجة، وتُعلن مع فتح القبول/التسجيل. للمعلومة الدقيقة تواصل مع الإدارة أو راجع صفحة البرنامج.',
        links: [
          { to: '/apply', label: 'التسجيل والقبول' },
          { to: '/contact', label: 'تواصل معنا' },
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
        text: lines.length ? 'قنوات التواصل الرسمية:' : 'تجد قنوات التواصل في صفحة «تواصل معنا».',
        items: lines,
        links: [{ to: '/contact', label: 'صفحة التواصل' }],
      };
    }

    if (key === 'address') {
      return {
        text: contact.address ? `العنوان: ${contact.address}` : 'تجد العنوان والفروع في صفحات التواصل والفروع.',
        links: [
          { to: '/contact', label: 'تواصل معنا' },
          { to: '/branches', label: 'الفروع' },
        ],
      };
    }

    if (key === 'branches') {
      const branches = await load('/public/branches');
      return {
        text: `فروع المعهد (${branches.length}):`,
        items: branches.map((b) => (b.address ? `${b.name_ar} — ${b.address}` : b.name_ar)),
        links: [{ to: '/branches', label: 'تفاصيل الفروع' }],
      };
    }

    return {
      text: 'يمكنني مساعدتك في الأسئلة المتعلقة بالمعهد: البرامج الأكاديمية، التدريب والتسجيل كمتدرب، تتبع الطلب، الفروع، الأخبار، والمكتبة والموارد. اختر سؤالاً سريعاً أو اكتب سؤالك.',
      links: [
        { to: '/apply', label: 'التسجيل والقبول' },
        { to: '/contact', label: 'تواصل معنا' },
      ],
    };
  };

  const ask = async (key, label) => {
    if (typing) return;
    const text = String(label || '').trim();
    if (!text) return;
    const userTurn = { role: 'user', text };
    const prior = messages.filter((m) => !m.typing);
    setMessages((m) => [...m, userTurn]);
    setInput('');
    setTyping(true);
    try {
      if (aiEnabled) {
        const history = prior.slice(-10).map((m) => ({ role: m.role, text: m.text }));
        let data;
        try {
          data = await api.post('/public/assistant', { message: text, history });
        } catch (err) {
          // One automatic retry for transient failures (cold start, deploy blip).
          if (err?.status === 429 || err?.status === 400) throw err;
          data = await api.post('/public/assistant', { message: text, history });
        }
        setMessages((m) => [...m, { role: 'bot', text: data?.reply ?? 'تعذّر توليد رد.' }]);
      } else {
        const reply = await buildLocalReply(key ?? detectQuestion(text) ?? 'unknown');
        setMessages((m) => [...m, { role: 'bot', ...reply }]);
      }
    } catch (err) {
      const busy = err?.status === 429;
      const unavailable = err?.status === 503;
      if (!aiEnabled) {
        setMessages((m) => [...m, { role: 'bot', text: 'تعذّر جلب البيانات الآن، حاول مرة أخرى بعد قليل.' }]);
        return;
      }
      // The assistant is disabled server-side: fall back to local replies.
      if (unavailable) setAiEnabled(false);
      // Never mask an AI failure with the generic local reply — say exactly
      // what happened so the visitor retries instead of getting a non-answer.
      setMessages((m) => [
        ...m,
        {
          role: 'bot',
          text: busy
            ? 'الرسائل كثيرة الآن، جرّب بعد قليل.'
            : unavailable
              ? 'المساعد الذكي غير متاح حالياً، أعد المحاولة بعد قليل.'
              : 'تعذّر الوصول إلى المساعد الذكي الآن، حاول مرة أخرى بعد قليل.',
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    if (!isLikelyRelevant(text)) {
      // Still allow, but nudge if clearly off-topic length-wise; server will also handle.
      // We don't hard-block to keep UX smooth.
    }
    ask(detectQuestion(text) ?? 'unknown', text);
  };

  return (
    <div className={`smart-assistant${open ? ' smart-assistant--open' : ''}`} ref={rootRef}>
      {open && (
        <div className="smart-assistant-panel" role="dialog" aria-label="المساعد الذكي">
          <div className="smart-assistant-head">
            <div>
              <strong>المساعد الذكي</strong>
              <span>إرشاد حول الأكاديمية والتدريب والخدمات</span>
            </div>
            <button type="button" className="smart-assistant-close" aria-label="إغلاق المساعد" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="smart-assistant-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`smart-msg smart-msg--${m.role}`}>
                {m.role === 'bot' ? (
                  <p className="smart-msg-text" dangerouslySetInnerHTML={{ __html: formatReply(m.text) }} />
                ) : (
                  <p className="smart-msg-text">{m.text}</p>
                )}
                {m.items?.length > 0 && (
                  <ul>
                    {m.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                )}
                {m.links?.length > 0 && (
                  <div className="smart-msg-links">
                    {m.links.map((l) => (
                      <Link key={`${l.to}-${l.label}`} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
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
              placeholder="اكتب سؤالك عن القبول، التدريب، الفروع..."
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
          <img
            className="smart-assistant-toggle-img"
            src="/uploads/design/site/assistant-bot.png"
            alt=""
            width="56"
            height="56"
          />
        )}
      </button>
    </div>
  );
}
