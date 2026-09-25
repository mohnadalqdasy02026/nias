// Sections that actually exist in the site, grouped by admin/publish feature.
// Built from the real routes list in server/src/routes (requirePermission checks).

export const AREAS = [
  { key: 'dashboard', label: 'لوحة التحكم', icon: 'dashboard' },
  { key: 'news', label: 'الأخبار والفعاليات', icon: 'media' },
  { key: 'pages', label: 'الصفحات الثابتة', icon: 'settings' },
  { key: 'messages', label: 'رسائل التواصل', icon: 'other' },
  { key: 'training', label: 'الدورات التدريبية', icon: 'training' },
  { key: 'enrollments', label: 'التسجيلات والمتدربون', icon: 'students' },
  { key: 'media', label: 'مكتبة الوسائط', icon: 'media' },
  { key: 'programs', label: 'البرامج الأكاديمية', icon: 'programs' },
  { key: 'colleges', label: 'الكليات', icon: 'building' },
  { key: 'branches', label: 'فروع المعهد', icon: 'settings' },
  { key: 'site', label: 'إعدادات الموقع', icon: 'settings' },
  { key: 'accounts', label: 'المستخدمون والأدوار', icon: 'accounts' },
];

// Explicit code -> area mapping for the features that actually exist.
const CODE_AREA = {
  'dashboard.access': 'dashboard',

  'news.read': 'news',
  'news.create': 'news',
  'news.update': 'news',
  'news.delete': 'news',
  'news_categories.read': 'news',
  'news_categories.create': 'news',
  'news_categories.update': 'news',
  'news_categories.delete': 'news',

  'site_pages.read': 'pages',
  'site_pages.create': 'pages',
  'site_pages.update': 'pages',
  'site_pages.delete': 'pages',

  'contact_messages.read': 'messages',
  'contact_messages.update': 'messages',
  'contact_messages.delete': 'messages',

  'training_courses.read': 'training',
  'training_courses.create': 'training',
  'training_courses.update': 'training',
  'training_courses.delete': 'training',

  'training_enrollments.read': 'enrollments',
  'training_enrollments.review': 'enrollments',
  'training_users.read': 'enrollments',

  'media_library.read': 'media',
  'media_library.create': 'media',
  'media_library.update': 'media',
  'media_library.delete': 'media',

  'academic_programs.read': 'programs',
  'academic_programs.create': 'programs',
  'academic_programs.update': 'programs',
  'academic_programs.delete': 'programs',

  'colleges.read': 'colleges',
  'colleges.manage': 'colleges',

  'branches.read': 'branches',
  'branches.manage': 'branches',

  'site_settings.read': 'site',
  'site_settings.update': 'site',

  'users.view': 'accounts',
  'users.manage': 'accounts',
  'roles.manage': 'accounts',
};

export const EXISTING_CODES = Object.keys(CODE_AREA);

export function areaOf(code) {
  return CODE_AREA[code] ?? null;
}

export const ACTION_LABELS = {
  access: 'دخول',
  read: 'قراءة',
  view: 'عرض',
  create: 'إنشاء',
  update: 'تعديل',
  delete: 'حذف',
  manage: 'إدارة كاملة',
  review: 'مراجعة',
};

export function actionLabel(code) {
  const parts = code.split('.');
  if (parts.length >= 2) return ACTION_LABELS[parts[parts.length - 1]] ?? parts[parts.length - 1];
  return code;
}

export function actionCode(code) {
  return code.split('.').pop();
}

export const AREA_ICON_PATHS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  training: 'M1 15l20-10M3 9l18 10M4 12l16-8',
  media: 'M2 20l6-16 4 9 3-6 7 13z',
  pages: 'M4 4h16v16H4zM8 4v16M12 8h4M12 12h4',
  programs: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  building: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 9h.01M15 9h.01M9 13h.01M15 13h.01',
  colleges: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 9h.01M15 9h.01M9 13h.01M15 13h.01',
  students: 'M2 21h20M17 21v-4a5 5 0 0 0-10 0v4M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06',
  accounts: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  other: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10',
};

// ---------- Department templates (quick roles) — only for what actually exists ----------
export const TEMPLATES = [
  {
    key: 'training',
    name: 'قسم التدريب',
    desc: 'الدورات التدريبية وإنشاء الدورات والتسجيلات فقط.',
    codes: [
      'dashboard.access',
      'training_courses.read', 'training_courses.create', 'training_courses.update',
      'training_enrollments.read',
    ],
  },
  {
    key: 'media',
    name: 'قسم الإعلام',
    desc: 'الأخبار والفعاليات، رسائل التواصل، ومكتبة الوسائط فقط.',
    codes: [
      'dashboard.access',
      'news.read', 'news.create', 'news.update', 'news.delete',
      'news_categories.read',
      'contact_messages.read', 'contact_messages.update',
      'media_library.read', 'media_library.create', 'media_library.update', 'media_library.delete',
    ],
  },
  {
    key: 'pages',
    name: 'قسم الصفحات',
    desc: 'الصفحات الثابتة (عن المعهد...) ورسائل التواصل فقط.',
    codes: [
      'dashboard.access',
      'site_pages.read', 'site_pages.create', 'site_pages.update', 'site_pages.delete',
      'contact_messages.read',
    ],
  },
  {
    key: 'programs',
    name: 'قسم البرامج',
    desc: 'البرامج الأكاديمية ورفع صورها عبر مكتبة الوسائط فقط.',
    codes: [
      'dashboard.access',
      'academic_programs.read', 'academic_programs.create', 'academic_programs.update', 'academic_programs.delete',
      'media_library.read',
    ],
  },
  {
    key: 'branches',
    name: 'قسم الفروع',
    desc: 'إدارة بيانات فروع المعهد (العميد، العنوان، الهاتف).',
    codes: [
      'dashboard.access',
      'branches.read', 'branches.manage',
    ],
  },
  {
    key: 'colleges',
    name: 'قسم الكليات',
    desc: 'إدارة بيانات الكليات والعمادات (الصور، الرؤية، العميد).',
    codes: [
      'dashboard.access',
      'colleges.read', 'colleges.manage',
    ],
  },
  {
    key: 'accounts',
    name: 'قسم المستخدمين',
    desc: 'الحسابات والأدوار والصلاحيات فقط (صلاحيات حساسة).',
    codes: [
      'dashboard.access',
      'users.view', 'users.manage',
      'roles.manage',
    ],
  },
];

export function templateByKey(key) {
  return TEMPLATES.find((t) => t.key === key);
}