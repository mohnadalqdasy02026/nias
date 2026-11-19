export const TRAINING_CATEGORY_LABELS = {
  course: 'دورة تدريبية',
  qualifying: 'برنامج تدريبي',
  seminar: 'ندوة',
  activity: 'نشاط تدريبي',
};

// تبويبات قسم التدريب على الموقع العام، بالترتيب المعتمد.
export const TRAINING_TABS = [
  { key: 'course', label: 'الدورات التدريبية' },
  { key: 'qualifying', label: 'البرامج التدريبية' },
  { key: 'seminar', label: 'الندوات' },
  { key: 'activity', label: 'الأنشطة التدريبية' },
];

export const trainingCategoryLabel = (key) => TRAINING_CATEGORY_LABELS[key] ?? TRAINING_CATEGORY_LABELS.course;

// صيغة المفرد للتصنيف مع أداة الإشارة، لاستخدامها في نصوص صفحة التفاصيل.
const CATEGORY_NOUNS = {
  course: { text: 'الدورة', demo: 'هذه الدورة' },
  qualifying: { text: 'البرنامج التدريبي', demo: 'هذا البرنامج التدريبي' },
  seminar: { text: 'الندوة', demo: 'هذه الندوة' },
  activity: { text: 'النشاط التدريبي', demo: 'هذا النشاط التدريبي' },
};

export const trainingCategoryNoun = (key) => CATEGORY_NOUNS[key] ?? CATEGORY_NOUNS.course;
