import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/client.js';
import { bustSiteSettings } from '../../hooks/useSiteSettings.js';

const emptyGeneral = {
  site_name_ar: '',
  site_name_en: '',
  logo: '',
  favicon: '',
  primary_color: '#0e7c66',
};

const emptyHome = {
  hero_eyebrow: '',
  hero_title: '',
  hero_subtitle: '',
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

function field(name, value, onChange, label, as = 'input', dir, rows) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {as === 'textarea'
        ? <textarea rows={rows ?? 3} dir={dir} value={value} onChange={(e) => onChange(name, e.target.value)} />
        : <input dir={dir} value={value} onChange={(e) => onChange(name, e.target.value)} />}
    </div>
  );
}

export default function Settings() {
  const [general, setGeneral] = useState(emptyGeneral);
  const [home, setHome] = useState(emptyHome);
  const [stats, setStats] = useState(emptyStats);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const logoRef = useRef(null);

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
          features: h.features?.length ? h.features : emptyHome.features,
        });
        setStats({ ...emptyStats, ...s });
      })
      .catch((e) => setError(e.message));
  }, []);

  const setG = (k, v) => setGeneral((p) => ({ ...p, [k]: v }));
  const setH = (k, v) => setHome((p) => ({ ...p, [k]: v }));
  const setS = (k, v) => setStats((p) => ({ ...p, [k]: v }));

  const compressAndUploadLogo = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('الرجاء اختيار ملف صورة.');
      return;
    }
    setLogoBusy(true);
    setError(null);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('تعذر قراءة الملف'));
        reader.readAsDataURL(file);
      });
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('تعذر فتح الصورة'));
        image.src = dataUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const isPng = file.type === 'image/png';
      const outType = isPng ? 'image/webp' : 'image/jpeg';
      const compressed = canvas.toDataURL(outType, 0.9);
      const base64 = compressed.slice(compressed.indexOf(',') + 1);
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'logo';
      const savedMedia = await api.post(
        '/admin/media',
        { file_name: `logo-${baseName}.${isPng ? 'webp' : 'jpg'}`, mime_type: outType, data_base64: base64, alt_text: 'شعار الموقع' },
        { auth: true },
      );
      setG('logo', savedMedia.url);
      if (logoRef.current) logoRef.current.value = '';
    } catch (e) {
      setError(e.message);
    } finally {
      setLogoBusy(false);
    }
  };

  const notifySaved = () => {
    bustSiteSettings();
    window.dispatchEvent(new Event('nias:settings-updated'));
  };

  const saveGeneral = async (e) => {
    e.preventDefault();
    setBusy('general');
    setError(null);
    setSaved(null);
    try {
      await api.patch('/admin/settings/general', general, { auth: true });
      notifySaved();
      setSaved('تم حفظ الإعدادات العامة.');
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
      notifySaved();
      setSaved('تم حفظ إعدادات الصفحة الرئيسية.');
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
      notifySaved();
      setSaved('تم حفظ عدادات الإحصائيات.');
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
    <section>
      <h1 className="admin-page-title">إعدادات الموقع</h1>
      <p className="muted">تعديل الشعار، الاسم، الألوان، ومحتوى الصفحة الرئيسية. تُطبق مباشرة على الموقع العام.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {saved && <div className="alert alert-success" role="alert">{saved}</div>}

      <div className="admin-dash-grid">
        <form className="card admin-form" onSubmit={saveGeneral}>
          <h3>إعدادات عامة</h3>
          <div className="form-grid">
            {field('site_name_ar', general.site_name_ar, (k, v) => setG(k, v), 'اسم الموقع (عربي)')}
            {field('site_name_en', general.site_name_en, (k, v) => setG(k, v), 'اسم الموقع (إنجليزي)', 'input', 'ltr')}
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
                <input type="file" accept="image/*" ref={logoRef} onChange={(e) => compressAndUploadLogo(e.target.files[0])} />
              </div>
              {general.logo && <small className="muted" dir="ltr">{general.logo}</small>}
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'general' || logoBusy}>
              {busy === 'general' ? 'حفظ...' : 'حفظ الإعدادات العامة'}
            </button>
          </div>
        </form>

        <form className="card admin-form" onSubmit={saveHome}>
          <h3>الصفحة الرئيسية</h3>
          <div className="form-grid">
            {field('hero_eyebrow', home.hero_eyebrow, setH, 'نص البانر الصغير')}
            {field('hero_title', home.hero_title, setH, 'العنوان الرئيسي')}
            {field('hero_subtitle', home.hero_subtitle, setH, 'الوصف تحت العنوان', 'textarea', undefined, 3)}
            {field('cta_title', home.cta_title, setH, 'عنوان الدعوة السفلية')}
            {field('cta_text', home.cta_text, setH, 'نص الدعوة السفلية', 'textarea', undefined, 2)}
          </div>

          <h4 className="admin-settings-subtitle">المميزات (بطاقات تحت العنوان)</h4>
          {home.features.map((f, i) => (
            <div key={i} className="settings-feature-row">
              {field(`f${i}icon`, f.icon, (k, v) => setFeature(i, 'icon', v), `ميزة ${i + 1} — أيقونة (رمز)`, 'input', 'ltr')}
              {field(`f${i}title`, f.title, (k, v) => setFeature(i, 'title', v), `ميزة ${i + 1} — العنوان`)}
              {field(`f${i}text`, f.text, (k, v) => setFeature(i, 'text', v), `ميزة ${i + 1} — النص`, 'textarea', undefined, 2)}
            </div>
          ))}

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'home'}>
              {busy === 'home' ? 'حفظ...' : 'حفظ إعدادات الصفحة الرئيسية'}
            </button>
          </div>
        </form>

        <form className="card admin-form" onSubmit={saveStats}>
          <h3>عدادات الإحصائيات</h3>
          <p className="muted">عدد الطلاب والطالبات يظهر في أعلى الصفحة الرئيسية ضمن عدادات المعهد. اترك الحقل فارغًا لاعتماد العدد المسجّل في النظام.</p>
          <div className="form-grid">
            {field('students_male', stats.students_male, setS, 'عدد الطلاب', 'input', 'ltr')}
            {field('students_female', stats.students_female, setS, 'عدد الطالبات', 'input', 'ltr')}
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy === 'stats'}>
              {busy === 'stats' ? 'حفظ...' : 'حفظ عدادات الإحصائيات'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}