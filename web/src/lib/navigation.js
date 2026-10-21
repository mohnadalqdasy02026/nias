export const DEFAULT_MAIN = [
  { to: '/', label: 'الرئيسية' },
  { to: '/about', label: 'عن المعهد' },
  { to: '/programs', label: 'البرامج الأكاديمية' },
  { to: '/colleges', label: 'الكليات والأقسام' },
  { to: '/apply', label: 'التسجيل والقبول' },
  { to: '/training', label: 'التدريب' },
];

export const DEFAULT_MORE = [
  { to: '/dean', label: 'كلمة العميد' },
  { to: '/structure', label: 'الهيكل التنظيمي' },
  { to: '/trustees', label: 'مجلس الأمناء' },
  { to: '/conferences', label: 'المؤتمرات العلمية' },
  { to: '/news', label: 'الأخبار والفعاليات' },
  { to: '/gallery', label: 'المعرض' },
  { to: '/downloads', label: 'التحميلات' },
  { to: '/journal', label: 'المجلة العلمية' },
  { to: '/faculty', label: 'هيئة التدريس' },
  { to: '/contact', label: 'تواصل معنا' },
];

export const DEFAULT_NAV_LABELS = {
  more: 'المزيد',
  branches: 'فروع المعهد',
  links: 'روابط سريعة',
  about: 'عن المعهد',
};

// The "More" dropdown groups the institute-introduction pages under one
// collapsible "عن المعهد" entry instead of listing them flat.
export const ABOUT_GROUP_ITEMS = ['/dean', '/structure', '/trustees', '/conferences'];

// Merge saved navigation (order + label + visibility) with the code defaults.
// Saved routes drive the order; any newly added default route is appended so
// new menu entries from the codebase always show up.
export function resolveNav(defaults, saved) {
  if (!Array.isArray(saved) || saved.length === 0) {
    return defaults.map((d) => ({ ...d, visible: true }));
  }
  const list = saved
    .map((s) => {
      const d = defaults.find((x) => x.to === s.to);
      return d ? { to: d.to, label: s.label ?? d.label, visible: s.visible !== false } : null;
    })
    .filter(Boolean);
  for (const d of defaults) {
    if (!saved.some((s) => s.to === d.to)) list.push({ ...d, visible: true });
  }
  return list;
}
