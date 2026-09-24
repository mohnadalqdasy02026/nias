import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const DEFAULTS = {
  general: {
    site_name_ar: 'المعهد الوطني للعلوم الإدارية',
    site_name_en: 'NIAS Academy',
    logo: '/uploads/design/site/logo.jpg',
    favicon: '/uploads/design/site/logo.ico',
    primary_color: '#0e7c66',
  },
  home: {},
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
            }
          : { ...DEFAULTS, home: { ...DEFAULTS.home } };
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