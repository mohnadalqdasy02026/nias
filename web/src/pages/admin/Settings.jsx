import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { bustSiteSettings } from '../../hooks/useSiteSettings.js';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { ImageField, useImageUpload } from '../../components/admin/ImageField.jsx';
import { DEFAULT_MAIN, DEFAULT_MORE, DEFAULT_NAV_LABELS, resolveNav } from '../../lib/navigation.js';
import { DEFAULT_APPLY, bodyToText, textToBody } from '../../lib/applyContent.js';
import { DEFAULT_ADMISSION, linesToText, textToLines } from '../../lib/admissionContent.js';
import { DEFAULT_IMAGES } from '../../lib/imagesContent.js';

const emptyGeneral = {
  site_name_ar: '',
  site_name_en: '',
  logo: '',
  favicon: '',
  primary_color: '#0e7c66',
  ministry_admission_url: 'https://oasyemen.net',
  ministry_results_url: '',
};

const emptyHome = {
  hero_eyebrow: '',
  hero_title: '',
  hero_subtitle: '',
  hero_images: [],
  features: [
    { icon: '', title: '', text: '' },
    { icon: '', title: '', text: '' },
    { icon: '', title: '', text: '' },
    { icon: '', title: '', text: '' },
  ],
  cta_title: '',
  cta_text: '',
  regcta_title: '',
  regcta_text: '',
  colleges_title: '',
  colleges_subtitle: '',
  colleges_link: '',
  programs_title: '',
  programs_subtitle: '',
  programs_link: '',
  training_title: '',
  training_subtitle: '',
  news_title: '',
  news_subtitle: '',
};

const emptyStats = {
  students_male: '',
  students_female: '',
};

const emptyNavigation = {
  main: DEFAULT_MAIN.map((d) => ({ ...d, visible: true })),
  more: DEFAULT_MORE.map((d) => ({ ...d, visible: true })),
  labels: { ...DEFAULT_NAV_LABELS },
};

const emptyContact = {
  address: '',
  phone: '',
  email: '',
  whatsapp: '',
  map_url: '',
  hours: '',
  social_telegram: '',
  social_facebook: '',
  social_youtube: '',
  footer_credits: '',
};

const IMAGE_FIELDS = [
  { key: 'logo', label: 'شعار الموقع' },
  { key: 'og_image', label: 'صورة المشاركة (OG)' },
  { key: 'program_bachelor', label: 'غلاف البكالوريوس' },
  { key: 'program_master', label: 'غلاف الماجستير' },
  { key: 'program_diploma', label: 'غلاف الدبلوم' },
  { key: 'course_cover', label: 'غلاف البرنامج التدريبي' },
  { key: 'college_default', label: 'الصورة الافتراضية للكليات' },
];

const TABS = [
  { key: 'general', label: 'إعدادات عامة' },
  { key: 'home', label: 'الصفحة الرئيسية' },
  { key: 'images', label: 'الصور الافتراضية' },
  { key: 'stats', label: 'عدادات الإحصائيات' },
  { key: 'navigation', label: 'القائمة العلوية' },
  { key: 'apply', label: 'صفحة التسجيل' },
  { key: 'admission', label: 'شروط القبول' },
  { key: 'contact', label: 'التواصل والتذييل' },
];

function field(name, value, onChange, label, as = 'input', dir, rows) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {as === 'textarea'
        ? <textarea rows={rows ?? 3} dir={dir} value={value ?? ''} onChange={(e) => onChange(name, e.target.value)} />
        : <input dir={dir} value={value ?? ''} onChange={(e) => onChange(name, e.target.value)} />}
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('general');
  const [general, setGeneral] = useState(emptyGeneral);
  const [home, setHome] = useState(emptyHome);
  const [stats, setStats] = useState(emptyStats);
  const [contact, setContact] = useState(emptyContact);
  const [navigation, setNavigation] = useState(emptyNavigation);
  const [apply, setApply] = useState(() => structuredClone(DEFAULT_APPLY));
  const [admission, setAdmission] = useState(() => structuredClone(DEFAULT_ADMISSION));
  const [images, setImages] = useState(() => structuredClone(DEFAULT_IMAGES));
  const [galleryImages, setGalleryImages] = useState([]);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [standalone, albums] = await Promise.all([
          api.get('/public/gallery').catch(() => []),
          api.get('/public/gallery/albums').catch(() => []),
        ]);
        const full = await Promise.all(
          (albums ?? []).map((a) => api.get(`/public/gallery/albums/${a.id}`).catch(() => null)),
        );
        const collected = [];
        for (const s of standalone ?? []) {
          if (s?.image) collected.push({ url: s.image, title: s.title });
        }
        for (const a of full) {
          for (const im of a?.images ?? []) {
            if (im?.image) collected.push({ url: im.image, title: im.title || a.title });
          }
        }
        setGalleryImages(collected.filter((x, i) => collected.findIndex((y) => y.url === x.url) === i));
      } catch {
        /* picker is optional */
      }
    })();
  }, []);

  useEffect(() => {
    api.get('/public/settings', { auth: true })
      .then((data) => {
        const g = data.general ?? {};
        const h = data.home ?? {};
        const s = data.stats ?? {};
        const c = data.contact ?? {};
        const nav = data.navigation ?? {};
        setGeneral({ ...emptyGeneral, ...g });
        setHome({
          ...emptyHome,
          ...h,
          hero_images: h.hero_images?.filter(Boolean) ?? [],
          features: h.features?.length ? h.features : emptyHome.features,
        });
        setStats({ ...emptyStats, ...s });
        setContact({ ...emptyContact, ...c });
        setNavigation({
          main: resolveNav(DEFAULT_MAIN, nav.main),
          more: resolveNav(DEFAULT_MORE, nav.more),
          labels: { ...DEFAULT_NAV_LABELS, ...(nav.labels ?? {}) },
        });
        setApply(
          data.apply && Object.keys(data.apply).length
            ? { ...structuredClone(DEFAULT_APPLY), ...data.apply }
            : structuredClone(DEFAULT_APPLY),
        );
        setAdmission(
          data.admission && Object.keys(data.admission).length
            ? { ...structuredClone(DEFAULT_ADMISSION), ...data.admission }
            : structuredClone(DEFAULT_ADMISSION),
        );
        setImages(
          data.images && Object.keys(data.images).length
            ? { ...structuredClone(DEFAULT_IMAGES), ...data.images }
            : structuredClone(DEFAULT_IMAGES),
        );
      })
      .catch((e) => setError(e.message));
  }, []);

  const setG = (k, v) => setGeneral((p) => ({ ...p, [k]: v }));
  const setH = (k, v) => setHome((p) => ({ ...p, [k]: v }));
  const setS = (k, v) => setStats((p) => ({ ...p, [k]: v }));
  const setC = (k, v) => setContact((p) => ({ ...p, [k]: v }));

  const setNavItem = (group, index, patch) =>
    setNavigation((p) => ({
      ...p,
      [group]: p[group].map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));

  const moveNavItem = (group, index, dir) =>
    setNavigation((p) => {
      const list = [...p[group]];
      const target = index + dir;
      if (target < 0 || target >= list.length) return p;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...p, [group]: list };
    });

  const setNavLabel = (k, v) => setNavigation((p) => ({ ...p, labels: { ...p.labels, [k]: v } }));

  const setA = (k, v) => setApply((p) => ({ ...p, [k]: v }));
  const setApplyRow = (list, key, i, k, v) =>
    setApply((p) => ({ ...p, [list]: p[list].map((it, idx) => (idx === i ? { ...it, [k]: v } : it)) }));
  const addApplyRow = (list, item) => setApply((p) => ({ ...p, [list]: [...p[list], item] }));
  const removeApplyRow = (list, i) => setApply((p) => ({ ...p, [list]: p[list].filter((_, idx) => idx !== i) }));
  const setStep = (i, k, v) => setApply((p) => ({ ...p, steps: p.steps.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) }));
  const setStepBody = (i, text) => setApply((p) => ({ ...p, steps: p.steps.map((s, idx) => (idx === i ? { ...s, body: textToBody(text) } : s)) }));

  const logoUpload = useImageUpload({
    onUploaded: (_key, url) => setG('logo', url),
    onError: setError,
    altText: () => 'شعار الموقع',
  });

  const heroUpload = useImageUpload({
    onUploaded: (_key, url) => setHome((p) => ({ ...p, hero_images: [...(p.hero_images ?? []), url] })),
    onError: setError,
    altText: () => home.hero_title || 'صورة خلفية الهيرو',
  });

  const imagesUpload = useImageUpload({
    onUploaded: (key, url) => setImages((p) => ({ ...p, [key]: url })),
    onError: setError,
    altText: () => 'صورة الموقع',
  });

  const removeHeroImage = (index) => {
    setHome((p) => ({ ...p, hero_images: (p.hero_images ?? []).filter((_, i) => i !== index) }));
  };

  const addHeroFromGallery = (url) => {
    setHome((p) => {
      const list = p.hero_images ?? [];
      return list.includes(url) ? p : { ...p, hero_images: [...list, url] };
    });
  };

  const notifySaved = (message) => {
    bustSiteSettings();
    window.dispatchEvent(new Event('nias:settings-updated'));
    setSaved(message);
  };

  const saveGeneral = async (e) => {
    e.preventDefault();
    setBusy('general');
    setError(null);
    setSaved(null);
    try {
      await api.patch('/admin/settings/general', general, { auth: true });
      notifySaved('تم حفظ الإعدادات العامة.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const saveHome = async (e) => {
    e.preventDefault();
    setBusy('home');
    setError(null);
    setSaved(null);
    try {
      await api.patch('/admin/settings/home', home, { auth: true });
      notifySaved('تم حفظ إعدادات الصفحة الرئيسية.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const saveImages = async (e) => {
    e.preventDefault();
    setBusy('images');
    setError(null);
    setSaved(null);
    try {
      await api.patch('/admin/settings/images', images, { auth: true });
      notifySaved('تم حفظ الصور الافتراضية.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const saveStats = async (e) => {
    e.preventDefault();
    setBusy('stats');
    setError(null);
    setSaved(null);
    try {
      await api.patch('/admin/settings/stats', stats, { auth: true });
      notifySaved('تم حفظ عدادات الإحصائيات.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const saveNavigation = async (e) => {
    e.preventDefault();
    setBusy('navigation');
    setError(null);
    setSaved(null);
    try {
      await api.patch('/admin/settings/navigation', navigation, { auth: true });
      notifySaved('تم حفظ القائمة العلوية.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const setAdm = (k, v) => setAdmission((p) => ({ ...p, [k]: v }));
  const setAdmList = (k, text) => setAdmission((p) => ({ ...p, [k]: textToLines(text) }));

  const saveAdmission = async (e) => {
    e.preventDefault();
    setBusy('admission');
    setError(null);
    setSaved(null);
    try {
      const payload = {
        ...admission,
        bachelor: Array.isArray(admission.bachelor) ? admission.bachelor : textToLines(admission.bachelor),
        diploma: Array.isArray(admission.diploma) ? admission.diploma : textToLines(admission.diploma),
        master: Array.isArray(admission.master) ? admission.master : textToLines(admission.master),
      };
      await api.patch('/admin/settings/admission', payload, { auth: true });
      notifySaved('تم حفظ شروط القبول.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const saveApply = async (e) => {
    e.preventDefault();
    setBusy('apply');
    setError(null);
    setSaved(null);
    try {
      const payload = {
        ...apply,
        steps: apply.steps.map((s) => ({ ...s, body: Array.isArray(s.body) ? s.body : textToBody(s.body) })),
      };
      await api.patch('/admin/settings/apply', payload, { auth: true });
      notifySaved('تم حفظ محتوى صفحة التسجيل.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const saveContact = async (e) => {
    e.preventDefault();
    setBusy('contact');
    setError(null);
    setSaved(null);
    try {
      await api.patch('/admin/settings/contact', contact, { auth: true });
      notifySaved('تم حفظ معلومات التواصل والتذييل.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const setFeature = (i, k, v) => {
    setHome((p) => ({
      ...p,
      features: p.features.map((f, idx) => (idx === i ? { ...f, [k]: v } : f)),
    }));
  };

  const renderNavGroup = (group) => (
    <div className="nav-editor">
      {navigation[group].map((item, i) => (
        <div className="nav-editor-row" key={item.to}>
          <input
            className="nav-editor-label"
            value={item.label}
            onChange={(e) => setNavItem(group, i, { label: e.target.value })}
          />
          <code className="nav-editor-route" dir="ltr">{item.to}</code>
          <label className="nav-editor-visible">
            <input
              type="checkbox"
              checked={item.visible !== false}
              onChange={(e) => setNavItem(group, i, { visible: e.target.checked })}
            />
            ظاهر
          </label>
          <div className="nav-editor-move">
            <button type="button" className="btn btn-sm btn-soft" disabled={i === 0} onClick={() => moveNavItem(group, i, -1)} aria-label="أعلى">▲</button>
            <button type="button" className="btn btn-sm btn-soft" disabled={i === navigation[group].length - 1} onClick={() => moveNavItem(group, i, 1)} aria-label="أسفل">▼</button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AdminFormPage
      title="إعدادات الموقع"
      subtitle="تعديل الشعار، الاسم، الألوان، ومحتوى الصفحة الرئيسية. تُطبق مباشرة على الموقع العام."
    >
      <div className="admin-subtabs" role="tablist" aria-label="أقسام الإعدادات">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`admin-subtab${tab === t.key ? ' admin-subtab--active' : ''}`}
            onClick={() => { setTab(t.key); setSaved(null); setError(null); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {saved && <div className="alert alert-success" role="alert">{saved}</div>}

      {tab === 'general' && (
        <form className="card admin-form" onSubmit={saveGeneral}>
          <AdminFormSection title="الهوية">
            <div className="form-grid">
              {field('site_name_ar', general.site_name_ar, setG, 'اسم الموقع (عربي)')}
              {field('site_name_en', general.site_name_en, setG, 'اسم الموقع (إنجليزي)', 'input', 'ltr')}
              <div className="form-field">
                <label>اللون الرئيسي للموقع</label>
                <div className="settings-color-row">
                  <input type="color" value={general.primary_color} onChange={(e) => setG('primary_color', e.target.value)} />
                  <input type="text" dir="ltr" value={general.primary_color} onChange={(e) => setG('primary_color', e.target.value)} />
                </div>
              </div>
              <div className="form-field">
                <label>شعار الموقع</label>
                <div className="settings-logo-row">
                  {general.logo && <img src={general.logo} alt="الشعار الحالي" className="settings-logo-preview" />}
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={logoUpload.busyKey === 'logo'}
                    onClick={logoUpload.pick('logo')}
                  >
                    {logoUpload.busyKey === 'logo' ? 'جارٍ الرفع…' : general.logo ? 'تغيير الشعار' : 'رفع شعار'}
                  </button>
                </div>
                {general.logo && <small className="muted" dir="ltr">{general.logo}</small>}
                <input
                  ref={logoUpload.registerInput('logo')}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    logoUpload.compressAndUpload(file, 'logo');
                  }}
                />
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="روابط وزارة التربية والتعليم والبحث العلمي">
            <div className="form-grid">
              {field('ministry_admission_url', general.ministry_admission_url, setG, 'بوابة التسجيل والتنسيق الإلكتروني', 'input', 'ltr')}
              {field('ministry_results_url', general.ministry_results_url, setG, 'بوابة الاستعلام عن النتائج (اختياري)', 'input', 'ltr')}
              <p className="muted form-field--full">
                تظهر هذان الروابط في الرئيسية وصفحة البرامج والتذييل. يُخفى رابط الاستعلام عن النتائج من الموقع ما لم يُدخل.
              </p>
            </div>
          </AdminFormSection>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'general' || logoUpload.busyKey === 'logo'}>
              {busy === 'general' ? 'جارٍ الحفظ…' : 'حفظ الإعدادات العامة'}
            </button>
          </div>
        </form>
      )}

      {tab === 'home' && (
        <form className="card admin-form" onSubmit={saveHome}>
          <AdminFormSection title="الهيرو">
            <div className="form-grid">
              {field('hero_eyebrow', home.hero_eyebrow, setH, 'نص البانر الصغير')}
              {field('hero_title', home.hero_title, setH, 'العنوان الرئيسي')}
              {field('hero_subtitle', home.hero_subtitle, setH, 'الوصف تحت العنوان', 'textarea', undefined, 3)}
              {field('cta_title', home.cta_title, setH, 'عنوان الدعوة السفلية')}
              {field('cta_text', home.cta_text, setH, 'نص الدعوة السفلية', 'textarea', undefined, 2)}
            </div>
          </AdminFormSection>

          <AdminFormSection title="صور خلفية الهيرو (تتبدل كل 5 ثوانٍ)">
            <p className="muted">اضف صورة واحدة أو أكثر (من الجهاز أو من معرض الصور)؛ تُعرض كخلفية متحركة في أعلى الصفحة الرئيسية. لا توجد صورة ثابتة — كل ما تضيفه هنا فقط هو ما يظهر.</p>
            <div className="settings-hero-row">
              {(home.hero_images ?? []).map((url, i) => (
                <div key={`${url}-${i}`} className="settings-hero-thumb">
                  <img src={url} alt={`صورة الهيرو ${i + 1}`} />
                  <button type="button" className="btn btn-sm btn-danger-soft" onClick={() => removeHeroImage(i)}>إزالة</button>
                </div>
              ))}
            </div>
            <div className="settings-hero-upload">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={heroUpload.busyKey === 'hero'}
                onClick={heroUpload.pick('hero')}
              >
                {heroUpload.busyKey === 'hero' ? 'جارٍ الرفع…' : 'إضافة صورة'}
              </button>
              <span className="muted">تُضغط الصور تلقائيًا وتُخزَّن بشكل دائم.</span>
            </div>
            <input
              ref={heroUpload.registerInput('hero')}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                heroUpload.compressAndUpload(file, 'hero');
              }}
            />
            {galleryImages.length > 0 && (
              <div className="settings-gallery-picker">
                <p className="muted">اختر من صور المعرض لإضافتها إلى خلفيات الهيرو:</p>
                <div className="settings-gallery-grid">
                  {galleryImages.map((img) => {
                    const picked = (home.hero_images ?? []).includes(img.url);
                    return (
                      <button
                        key={img.url}
                        type="button"
                        className={`settings-gallery-option${picked ? ' is-picked' : ''}`}
                        title={img.title || 'صورة المعرض'}
                        onClick={() => addHeroFromGallery(img.url)}
                        disabled={picked}
                      >
                        <img src={img.url} alt={img.title || 'صورة المعرض'} loading="lazy" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </AdminFormSection>

          <AdminFormSection title="المميزات (بطاقات تحت العنوان)">
            {home.features.map((f, i) => (
              <div key={i} className="settings-feature-row">
                {field(`f${i}icon`, f.icon, (k, v) => setFeature(i, 'icon', v), `ميزة ${i + 1} — أيقونة (رمز)`, 'input', 'ltr')}
                {field(`f${i}title`, f.title, (k, v) => setFeature(i, 'title', v), `ميزة ${i + 1} — العنوان`)}
                {field(`f${i}text`, f.text, (k, v) => setFeature(i, 'text', v), `ميزة ${i + 1} — النص`, 'textarea', undefined, 2)}
              </div>
            ))}
          </AdminFormSection>

          <AdminFormSection title="عناوين الأقسام">
            <div className="form-grid">
              {field('regcta_title', home.regcta_title, setH, 'قسم التسجيل — العنوان')}
              {field('regcta_text', home.regcta_text, setH, 'قسم التسجيل — النص', 'textarea', undefined, 2)}
              {field('colleges_title', home.colleges_title, setH, 'الكليات — العنوان')}
              {field('colleges_subtitle', home.colleges_subtitle, setH, 'الكليات — الوصف')}
              {field('colleges_link', home.colleges_link, setH, 'الكليات — نص الرابط')}
              {field('programs_title', home.programs_title, setH, 'البرامج الأكاديمية — العنوان')}
              {field('programs_subtitle', home.programs_subtitle, setH, 'البرامج الأكاديمية — الوصف')}
              {field('programs_link', home.programs_link, setH, 'البرامج الأكاديمية — نص الرابط')}
              {field('training_title', home.training_title, setH, 'البرامج التدريبية — العنوان')}
              {field('training_subtitle', home.training_subtitle, setH, 'البرامج التدريبية — الوصف')}
              {field('news_title', home.news_title, setH, 'الأخبار — العنوان')}
              {field('news_subtitle', home.news_subtitle, setH, 'الأخبار — الوصف')}
            </div>
          </AdminFormSection>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'home' || heroUpload.busyKey === 'hero'}>
              {busy === 'home' ? 'جارٍ الحفظ…' : 'حفظ إعدادات الصفحة الرئيسية'}
            </button>
          </div>
        </form>
      )}

      {tab === 'stats' && (
        <form className="card admin-form" onSubmit={saveStats}>
          <AdminFormSection
            title="عدادات الإحصائيات"
            hint="عدد الطلاب والطالبات يظهر في أعلى الصفحة الرئيسية ضمن عدادات المعهد. اترك الحقل فارغًا لاعتماد العدد المسجّل في النظام."
          >
            <div className="form-grid">
              {field('students_male', stats.students_male, setS, 'عدد الطلاب', 'input', 'ltr')}
              {field('students_female', stats.students_female, setS, 'عدد الطالبات', 'input', 'ltr')}
            </div>
          </AdminFormSection>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'stats'}>
              {busy === 'stats' ? 'جارٍ الحفظ…' : 'حفظ عدادات الإحصائيات'}
            </button>
          </div>
        </form>
      )}

      {tab === 'images' && (
        <form className="card admin-form" onSubmit={saveImages}>
          <AdminFormSection
            title="الصور الافتراضية"
            hint="تُستخدم هذه الصور عند عدم وجود صورة مخصّصة للعنصر. يمكنك رفع صورة جديدة لكل حقل عبر زر «رفع صورة»."
          >
            <div className="settings-images-grid">
              {IMAGE_FIELDS.map((f) => (
                <ImageField
                  key={f.key}
                  label={f.label}
                  value={images[f.key]}
                  onChange={(url) => setImages((p) => ({ ...p, [f.key]: url }))}
                  upload={imagesUpload}
                  fieldKey={f.key}
                />
              ))}
            </div>
          </AdminFormSection>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'images' || imagesUpload.busyKey}>
              {busy === 'images' ? 'جارٍ الحفظ…' : 'حفظ الصور الافتراضية'}
            </button>
          </div>
        </form>
      )}

      {tab === 'admission' && (
        <form className="card admin-form" onSubmit={saveAdmission}>
          <AdminFormSection title="شروط القبول حسب نوع البرنامج" hint="سطر واحد لكل شرط. تُطبَّق على صفحات كل البرامج من نفس النوع.">
            <div className="form-grid">
              {field('bachelor', linesToText(admission.bachelor), setAdmList, 'البكالوريوس', 'textarea', undefined, 6)}
              {field('diploma', linesToText(admission.diploma), setAdmList, 'الدبلوم المتوسط', 'textarea', undefined, 5)}
              {field('master', linesToText(admission.master), setAdmList, 'الماجستير (أكاديمي وتنفيذي)', 'textarea', undefined, 5)}
            </div>
          </AdminFormSection>

          <AdminFormSection title="دعوة التسجيل داخل صفحة البرنامج">
            <div className="form-grid">
              {field('cta_title', admission.cta_title, setAdm, 'العنوان')}
              {field('cta_text', admission.cta_text, setAdm, 'النص', 'textarea', undefined, 3)}
              {field('cta_button', admission.cta_button, setAdm, 'زر التسجيل')}
            </div>
          </AdminFormSection>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'admission'}>
              {busy === 'admission' ? 'جارٍ الحفظ…' : 'حفظ شروط القبول'}
            </button>
          </div>
        </form>
      )}

      {tab === 'apply' && (
        <form className="card admin-form" onSubmit={saveApply}>
          <AdminFormSection title="واجهة الصفحة">
            <div className="form-grid">
              {field('hero_eyebrow', apply.hero_eyebrow, setA, 'النص الصغير')}
              {field('hero_title', apply.hero_title, setA, 'العنوان')}
              {field('hero_text', apply.hero_text, setA, 'النص التعريفي', 'textarea', undefined, 4)}
            </div>
            <div className="apply-stats-editor">
              {apply.stats.map((s, i) => (
                <div className="apply-stat-row" key={i}>
                  {field(`s${i}v`, s.value, (k, v) => setApplyRow('stats', 'stats', i, 'value', v), `بطاقة ${i + 1} — الرقم`)}
                  {field(`s${i}l`, s.label, (k, v) => setApplyRow('stats', 'stats', i, 'label', v), `بطاقة ${i + 1} — الوصف`)}
                </div>
              ))}
            </div>
          </AdminFormSection>

          <AdminFormSection title="خطوات التسجيل">
            <div className="form-grid">
              {field('steps_heading', apply.steps_heading, setA, 'عنوان القسم')}
              {field('steps_subtitle', apply.steps_subtitle, setA, 'الوصف تحت العنوان')}
            </div>
            {apply.steps.map((s, i) => (
              <div className="apply-step-editor" key={s.key}>
                <p className="apply-step-editor-title">الخطوة {i + 1}</p>
                <div className="form-grid">
                  {field(`st${i}t`, s.title, (k, v) => setStep(i, 'title', v), 'العنوان')}
                  {field(`st${i}s`, s.short, (k, v) => setStep(i, 'short', v), 'الوصف المختصر')}
                  {field(`st${i}b`, bodyToText(s.body), (k, v) => setStepBody(i, v), 'التفاصيل (سطر لكل نقطة)', 'textarea', undefined, 5)}
                </div>
              </div>
            ))}
          </AdminFormSection>

          <AdminFormSection title="المستندات المطلوبة">
            <div className="form-grid">
              {field('docs_title', apply.docs_title, setA, 'العنوان')}
              {field('docs_subtitle', apply.docs_subtitle, setA, 'الوصف تحت العنوان')}
            </div>
            {apply.docs.map((d, i) => (
              <div className="apply-list-row" key={i}>
                {field(`d${i}t`, d.title, (k, v) => setApplyRow('docs', 'docs', i, 'title', v), 'العنوان')}
                {field(`d${i}x`, d.text, (k, v) => setApplyRow('docs', 'docs', i, 'text', v), 'النص')}
                <button type="button" className="btn btn-sm btn-soft" onClick={() => removeApplyRow('docs', i)}>حذف</button>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline" onClick={() => addApplyRow('docs', { title: '', text: '' })}>إضافة مستند</button>
          </AdminFormSection>

          <AdminFormSection title="معلومات هامة">
            <div className="form-grid">
              {field('notes_title', apply.notes_title, setA, 'العنوان')}
              {field('notes_subtitle', apply.notes_subtitle, setA, 'الوصف تحت العنوان')}
            </div>
            {apply.notes.map((n, i) => (
              <div className="apply-list-row" key={i}>
                {field(`n${i}t`, n.title, (k, v) => setApplyRow('notes', 'notes', i, 'title', v), 'العنوان')}
                {field(`n${i}x`, n.text, (k, v) => setApplyRow('notes', 'notes', i, 'text', v), 'النص')}
                <button type="button" className="btn btn-sm btn-soft" onClick={() => removeApplyRow('notes', i)}>حذف</button>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline" onClick={() => addApplyRow('notes', { title: '', text: '' })}>إضافة ملاحظة</button>
          </AdminFormSection>

          <AdminFormSection title="دعوة البدء">
            <div className="form-grid">
              {field('cta_title', apply.cta_title, setA, 'العنوان')}
              {field('cta_text', apply.cta_text, setA, 'النص')}
              {field('cta_button', apply.cta_button, setA, 'زر البوابة')}
              {field('cta_button2', apply.cta_button2, setA, 'زر استعراض البرامج')}
            </div>
          </AdminFormSection>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'apply'}>
              {busy === 'apply' ? 'جارٍ الحفظ…' : 'حفظ محتوى التسجيل'}
            </button>
          </div>
        </form>
      )}

      {tab === 'navigation' && (
        <form className="card admin-form" onSubmit={saveNavigation}>
          <AdminFormSection title="تسميات القوائم المنسدلة">
            <div className="form-grid">
              {field('more', navigation.labels.more, setNavLabel, 'تسمية قائمة «المزيد»')}
              {field('branches', navigation.labels.branches, setNavLabel, 'تسمية قائمة «فروع المعهد»')}
            </div>
          </AdminFormSection>

          <AdminFormSection title="الروابط الرئيسية" hint="عدّل التسمية، أظهر/أخفِ، ورتّب. المسار ثابت لا يتغير.">
            {renderNavGroup('main')}
          </AdminFormSection>

          <AdminFormSection title="قائمة «المزيد»" hint="تظهر داخل القائمة المنسدلة على اليمين.">
            {renderNavGroup('more')}
          </AdminFormSection>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'navigation'}>
              {busy === 'navigation' ? 'جارٍ الحفظ…' : 'حفظ القائمة العلوية'}
            </button>
          </div>
        </form>
      )}

      {tab === 'contact' && (
        <form className="card admin-form" onSubmit={saveContact}>
          <AdminFormSection title="معلومات التواصل" hint="تظهر في صفحة «تواصل معنا» وفي تذييل الصفحة الرئيسية.">
            <div className="form-grid">
              {field('address', contact.address, setC, 'العنوان')}
              {field('phone', contact.phone, setC, 'الهاتف', 'input', 'ltr')}
              {field('email', contact.email, setC, 'البريد الإلكتروني', 'input', 'ltr')}
              {field('whatsapp', contact.whatsapp, setC, 'رقم واتساب (بصيغة دولية دون +)', 'input', 'ltr')}
              {field('hours', contact.hours, setC, 'أوقات العمل')}
            </div>
          </AdminFormSection>

          <AdminFormSection title="روابط التواصل الاجتماعي" hint="اترك أي حقل فارغًا لإخفاء أيقونته من التذييل.">
            <div className="form-grid">
              {field('social_telegram', contact.social_telegram, setC, 'تليجرام', 'input', 'ltr')}
              {field('social_facebook', contact.social_facebook, setC, 'فيسبوك', 'input', 'ltr')}
              {field('social_youtube', contact.social_youtube, setC, 'يوتيوب', 'input', 'ltr')}
            </div>
          </AdminFormSection>

          <AdminFormSection title="الموقع الجغرافي" hint="رابط تضمين خريطة جوجل (Google Maps Embed) — يظهر قسم «الموقع الجغرافي» أسفل تذييل الصفحة الرئيسية.">
            <div className="form-grid">
              {field('map_url', contact.map_url, setC, 'رابط تضمين الخريطة', 'input', 'ltr')}
            </div>
          </AdminFormSection>

          <AdminFormSection title="التذييل" hint="يظهر أسفل الصفحة الرئيسية فقط.">
            <div className="form-grid">
              {field('footer_credits', contact.footer_credits, setC, 'سطر الحقوق أسفل التذييل')}
            </div>
          </AdminFormSection>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'contact'}>
              {busy === 'contact' ? 'جارٍ الحفظ…' : 'حفظ معلومات التواصل'}
            </button>
          </div>
        </form>
      )}
    </AdminFormPage>
  );
}
