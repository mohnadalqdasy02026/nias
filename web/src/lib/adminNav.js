// Single source of truth for the admin panel structure. The sidebar, the
// login redirect and the per-page action buttons all read the permission
// names from here so a section never shows up for someone who cannot use it.
export const ADMIN_NAV = [
  {
    title: 'عام',
    items: [
      { to: '/admin', label: 'لوحة الملخص', end: true, perm: 'dashboard.access' },
    ],
  },
  {
    title: 'المحتوى',
    items: [
      { to: '/admin/content/news', label: 'الأخبار', perm: 'news.read' },
      { to: '/admin/content/pages', label: 'الصفحات الثابتة', perm: 'site_pages.read' },
      { to: '/admin/gallery', label: 'ألبومات المعرض', perm: 'gallery.read' },
      { to: '/admin/downloads', label: 'التحميلات', perm: 'downloads.read' },
      { to: '/admin/journal', label: 'المجلة', perm: 'journal.read' },
    ],
  },
  {
    title: 'التدريب',
    items: [
      { to: '/admin/training/courses', label: 'الدورات', perm: 'training_courses.read' },
      { to: '/admin/training/enrollments', label: 'التسجيلات', perm: 'training_enrollments.read' },
    ],
  },
  {
    title: 'التواصل',
    items: [
      { to: '/admin/messages', label: 'رسائل التواصل', perm: 'contact_messages.read' },
    ],
  },
  {
    title: 'البرامج',
    items: [
      { to: '/admin/programs', label: 'البرامج الأكاديمية', perm: 'academic_programs.read' },
      { to: '/admin/colleges', label: 'الكليات', perm: 'colleges.read' },
      { to: '/admin/departments', label: 'الأقسام العلمية', perm: 'colleges.read' },
      { to: '/admin/faculty', label: 'الكادر الأكاديمي', perm: 'faculty_members.read' },
    ],
  },
  {
    title: 'الإعدادات',
    items: [
      { to: '/admin/settings/site', label: 'الصفحة الرئيسية', perm: 'site_settings.read' },
      { to: '/admin/branches', label: 'إعدادات الفروع', perm: 'branches.read' },
    ],
  },
  {
    title: 'الحسابات',
    items: [
      { to: '/admin/users', label: 'المستخدمون', perm: 'users.view' },
      { to: '/admin/roles', label: 'الأدوار والصلاحيات', perm: 'roles.manage' },
    ],
  },
];

export function hasPermission(permissions, perm) {
  if (!perm) return true;
  return Array.isArray(permissions) && permissions.includes(perm);
}

// The first screen the account is actually allowed to open.
export function firstPermittedRoute(permissions) {
  for (const section of ADMIN_NAV) {
    for (const item of section.items) {
      if (hasPermission(permissions, item.perm)) return item.to;
    }
  }
  return null;
}

// Does the account hold the permission the given admin path needs?
export function canOpenPath(permissions, pathname) {
  if (!pathname) return true;
  const path = pathname.split('?')[0].replace(/\/+$/, '') || '/admin';
  let match = null;
  for (const section of ADMIN_NAV) {
    for (const item of section.items) {
      const base = item.to.replace(/\/+$/, '');
      if (path === base || path.startsWith(`${base}/`)) {
        if (!match || base.length > match.to.replace(/\/+$/, '').length) match = item;
      }
    }
  }
  if (!match) return true; // unknown path: let the route guard decide
  return hasPermission(permissions, match.perm);
}
