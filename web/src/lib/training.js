export const TRAINING_CATEGORY_LABELS = {
  course: 'دورة تدريبية',
  qualifying: 'برنامج تأهيلي',
  seminar: 'ندوة',
  activity: 'نشاط تدريبى',
};

// تبويبات قسم التدريب على الموقع العام، بالترتيب المعتمد.
export const TRAINING_TABS = [
  { key: 'course', label: 'الدورات التدريبية' },
  { key: 'qualifying', label: 'البرامج التأهيلية' },
  { key: 'seminar', label: 'الندوات' },
  { key: 'activity', label: 'الأنشطة التدريبية' },
];

export const trainingCategoryLabel = (key) => TRAINING_CATEGORY_LABELS[key] ?? TRAINING_CATEGORY_LABELS.course;

// صيغة المفرد للتصنيف مع أداة الإشارة، لاستخدامها في نصوص صفحة التفاصيل.
const CATEGORY_NOUNS = {
  course: { text: 'الدورة', demo: 'هذه الدورة' },
  qualifying: { text: 'البرنامج التأهيلي', demo: 'هذا البرنامج التأهيلي' },
  seminar: { text: 'الندوة', demo: 'هذه الندوة' },
  activity: { text: 'النشاط التدريبى', demo: 'هذا النشاط التدريبى' },
};

export const trainingCategoryNoun = (key) => CATEGORY_NOUNS[key] ?? CATEGORY_NOUNS.course;
