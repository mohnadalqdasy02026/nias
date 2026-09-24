import { AppError } from '../utils/AppError.js';

const FIELD_LABELS = {
  first_name: 'الاسم الأول',
  father_name: 'اسم الأب',
  grandfather_name: 'اسم الجد',
  family_name: 'العائلة',
  phone: 'رقم الجوال',
  branch_id: 'الفرع',
  course_id: 'الدورة التدريبية',
  challenge_id: 'تحقق الأمان',
  answer: 'إجابة تحقق الأمان',
  signature_data: 'التوقيع الإلكتروني',
  name: 'الاسم',
  email: 'البريد الإلكتروني',
  subject: 'الموضوع',
  message: 'الرسالة',
  title: 'العنوان',
  title_ar: 'العنوان بالعربية',
  title_en: 'العنوان بالإنجليزية',
  description: 'الوصف',
  start_date: 'تاريخ البداية',
  end_date: 'تاريخ النهاية',
  location: 'المكان',
  capacity: 'المقاعد',
  trainer: 'المدرب',
  image_url: 'الصورة',
  fees: 'الرسوم',
  status: 'الحالة',
  full_name: 'الاسم الكامل',
  full_name_ar: 'الاسم بالعربية',
  full_name_en: 'الاسم بالإنجليزية',
  password: 'كلمة المرور',
  identifier: 'البريد أو اسم المستخدم',
  refreshToken: 'رمز التحديث',
  role: 'الدور',
  roles: 'الأدوار',
  slug: 'الرابط المختصر',
  content_ar: 'المحتوى بالعربية',
  content_en: 'المحتوى بالإنجليزية',
  category_id: 'التصنيف',
  cover_image: 'صورة الغلاف',
  is_featured: 'مميز',
  published_at: 'تاريخ النشر',
  q: 'كلمات البحث',
  college_id: 'الكلية',
  department_id: 'القسم',
  program_type: 'نوع البرنامج',
  outcomes: 'مخرجات التعلم',
  admission_open: 'التقديم مفتوح',
  branch_filter: 'الفلتر',
};

function fieldLabel(path) {
  const key = path[path.length - 1];
  return FIELD_LABELS[key] ?? key;
}

function labelMinimum(field, minimum) {
  if (minimum === 2) return `حقل «${field}» يجب أن يحتوي على حرفين على الأقل`;
  return `حقل «${field}» يجب أن يحتوي على ${minimum} أحرف على الأقل`;
}

function toArabic(issue) {
  const field = fieldLabel(issue.path);
  switch (issue.code) {
    case 'invalid_type':
      if (issue.received === 'undefined' || issue.received === 'null') return `حقل «${field}» مطلوب`;
      return `حقل «${field}» يجب أن يكون ${issue.expected === 'string' ? 'نصًا' : issue.expected === 'number' ? 'رقمًا' : 'من النوع الصحيح'}`;
    case 'invalid_string':
      if (issue.validation === 'email') return `أدخل بريدًا إلكترونيًا صحيحًا في حقل «${field}»`;
      if (issue.validation === 'url') return `أدخل رابطًا صحيحًا في حقل «${field}»`;
      return `قيمة حقل «${field}» غير صالحة`;
    case 'too_small':
      if (issue.type === 'string') return labelMinimum(field, issue.minimum);
      if (issue.type === 'array') return `حقل «${field}» يجب أن يحتوي على ${issue.minimum} عناصر على الأقل`;
      return `حقل «${field}» غير مكتمل`;
    case 'too_big':
      return `حقل «${field}» يجب ألا يتجاوز ${issue.maximum} ${issue.type === 'array' ? 'عناصر' : 'أحرف'}`;
    case 'invalid_enum_value':
      return `قيمة حقل «${field}» غير مسموحة`;
    case 'invalid_value':
      return `قيمة حقل «${field}» غير صحيحة`;
    case 'invalid_date':
      return `أدخل تاريخًا صحيحًا في حقل «${field}»`;
    case 'unrecognized_keys':
      return 'هناك حقول غير معروفة في الطلب';
    case 'custom':
      return issue.message;
    case 'required':
      return `حقل «${field}» مطلوب`;
    default:
      return `حقل «${field}» غير صحيح`;
  }
}

export function validate(schema) {
  return (req, _res, next) => {
    const sources = { body: req.body, query: req.query, params: req.params };

    for (const key of ['body', 'query', 'params']) {
      const target = schema[key];
      if (!target) continue;
      const result = target.safeParse(sources[key]);
      if (!result.success) {
        const details = result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: toArabic(i),
        }));
        const first = details[0];
        return next(
          AppError.unprocessable(
            first ? `تعذّر إتمام العملية: ${first.message}` : 'تعذّر إتمام العملية بسبب بيانات غير صحيحة',
            details,
          ),
        );
      }
      // Replace parsed (coerced) value back onto request
      if (key === 'body') req.body = result.data;
      if (key === 'query') req.query = result.data;
      if (key === 'params') req.params = result.data;
    }

    next();
  };
}