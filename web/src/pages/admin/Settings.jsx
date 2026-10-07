import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { bustSiteSettings } from '../../hooks/useSiteSettings.js';
import AdminFormPage, { AdminFormSection } from '../../components/admin/AdminFormPage.jsx';
import { useImageUpload } from '../../components/admin/ImageField.jsx';

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
};

const emptyStats = {
  students_male: '',
  students_female: '',
};

const TABS = [
  { key: 'general', label: 'إعدادات عامة' },
  { key: 'home', label: 'الصفحة الرئيسية' },
  { key: 'stats', label: 'عدادات الإحصائيات' },
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
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    api.get('/public/settings', { auth: true })
      .then((data) => {
        const g = data.general ?? {};
        const h = data.home ?? {};
        const s = data.stats ?? {};
        setGeneral({ ...emptyGeneral, ...g });
        setHome({
          ...emptyHome,
          ...h,
          hero_images: h.hero_images?.filter(Boolean) ?? [],
          features: h.features?.length ? h.features : emptyHome.features,
        });
        setStats({ ...emptyStats, ...s });
      })
      .catch((e) => setError(e.message));
  }, []);

  const setG = (k, v) => setGeneral((p) => ({ ...p, [k]: v }));
  const setH = (k, v) => setHome((p) => ({ ...p, [k]: v }));
  const setS = (k, v) => setStats((p) => ({ ...p, [k]: v }));

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

  const removeHeroImage = (index) => {
    setHome((p) => ({ ...p, hero_images: (p.hero_images ?? []).filter((_, i) => i !== index) }));
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

  const setFeature = (i, k, v) => {
    setHome((p) => ({
      ...p,
      features: p.features.map((f, idx) => (idx === i ? { ...f, [k]: v } : f)),
    }));
  };

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
            <p className="muted">اضف صورة واحدة أو أكثر؛ تُعرض كخلفية متحركة في أعلى الصفحة الرئيسية. أول صورة هي الافتراضية إن لم تتوفر صور.</p>
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
    </AdminFormPage>
  );
}
