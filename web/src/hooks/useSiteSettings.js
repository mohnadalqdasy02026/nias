import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { DEFAULT_MAIN, DEFAULT_MORE, DEFAULT_NAV_LABELS } from '../lib/navigation.js';
import { DEFAULT_APPLY } from '../lib/applyContent.js';

const DEFAULTS = {
  general: {
    site_name_ar: 'المعهد الوطني للعلوم الإدارية',
    site_name_en: 'NIAS Academy',
    logo: '/uploads/design/site/logo.jpg',
    favicon: '/uploads/design/site/logo.ico',
    primary_color: '#0e7c66',
    ministry_admission_url: 'https://oasyemen.net',
    ministry_results_url: '',
  },
  home: {},
  navigation: {
    main: DEFAULT_MAIN.map((d) => ({ ...d, visible: true })),
    more: DEFAULT_MORE.map((d) => ({ ...d, visible: true })),
    labels: { ...DEFAULT_NAV_LABELS },
  },
  apply: DEFAULT_APPLY,
  contact: {
    address: 'أمانة العاصمة صنعاء — شارع العدل',
    phone: '01222537',
    email: 'nias@nias-ye.academy',
    whatsapp: '9671222537',
    hours: '',
    social_telegram: 'https://t.me/nias_academy',
    social_facebook: 'https://www.facebook.com/nias.academy',
    social_youtube: 'https://www.youtube.com/@nias_academy',
    footer_credits: 'حلول كود — مصمم ومطور الموقع  •  جميع الحقوق محفوظة للمعهد الوطني للعلوم الإدارية',
  },
};

let cache = null;
let pending = null;

export function bustSiteSettings() {
  cache = null;
  pending = null;
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function shade(hex, factor, mix) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const lerp = (a, b) => Math.round(a + (b - a) * factor);
  const c = { r: lerp(rgb.r, mix.r), g: lerp(rgb.g, mix.g), b: lerp(rgb.b, mix.b) };
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

function applyPrimary(color) {
  const root = document.documentElement;
  if (!root) return;
  const colorVal = color || '#0e7c66';
  root.style.setProperty('--color-primary', colorVal);
  root.style.setProperty('--color-primary-dark', shade(colorVal, 0.3, { r: 0, g: 0, b: 0 }));
  root.style.setProperty('--color-primary-deep', shade(colorVal, 0.55, { r: 0, g: 0, b: 0 }));
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (cache) {
        return Promise.resolve(cache);
      }
      if (!pending) {
        pending = api.get('/public/settings').catch(() => null).finally(() => {
          return null;
        });
      }
      return pending;
    };
    const handle = () => {
      load().then((data) => {
        if (!alive) return;
        const merged = data
          ? {
              general: { ...DEFAULTS.general, ...(data.general ?? {}) },
              home: { ...DEFAULTS.home, ...(data.home ?? {}) },
              contact: { ...DEFAULTS.contact, ...(data.contact ?? {}) },
              navigation: {
                ...DEFAULTS.navigation,
                ...(data.navigation ?? {}),
                labels: { ...DEFAULTS.navigation.labels, ...(data.navigation?.labels ?? {}) },
              },
              apply: { ...DEFAULTS.apply, ...(data.apply ?? {}) },
            }
          : { ...DEFAULTS, home: { ...DEFAULTS.home }, contact: { ...DEFAULTS.contact } };
        cache = merged;
        setSettings(merged);
        applyPrimary(merged.general.primary_color);
      });
    };
    handle();
    window.addEventListener('nias:settings-updated', handle);
    return () => {
      alive = false;
      window.removeEventListener('nias:settings-updated', handle);
    };
  }, []);

  return settings;
}