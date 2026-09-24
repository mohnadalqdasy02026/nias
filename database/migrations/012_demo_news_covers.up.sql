-- 012: ربط صور الغلاف التجريبية بأخبار/فعاليات الديمو
-- الملفات الفعلية موجودة تحت server/uploads/demo/ وتُقدَّم عبر /uploads/demo/...

-- رابط الغلاف للخبر المنشور (افتتاح الفصل الجديد)
UPDATE news
   SET cover_image = '/uploads/demo/news-2.svg'
 WHERE title_ar = 'خبر تجريبي: افتتاح الفصل الجديد'
   AND status = 'published'
   AND cover_image IS NULL;

-- رابط الغلاف لخبر placeholder
UPDATE news
   SET cover_image = '/uploads/demo/news-1.svg'
 WHERE title_ar LIKE 'خبر تجريبي (Placeholder)%'
   AND cover_image IS NULL;

-- فعالية تجريبية منشورة (تعرض في "الأخبار والفعاليات")
INSERT INTO news (category_id, content_type, title_ar, title_en, summary_ar, summary_en, body_ar, body_en,
                  cover_image, is_featured, published_at, status)
SELECT c.id, 'event', 'ملتقى NIAS السنوي للإدارة 2026', 'NIAS Annual Management Forum 2026',
       'فعالية تجريبية: ملتقى سنوي يجمع الباحثين والممارسين لمناقشة تحديات الإدارة العامة وتحسين الخدمات.',
       'Demo annual forum gathering researchers and practitioners.',
       'هذا النص تجريبي ليُستبدل بمحتوى الفعالية الفعلي من لوحة الإدارة. يتضمن الملتقى جلسات نقاشية وورش عمل وملصقات بحثية.',
       'This is demo content to be replaced from the admin panel.',
       '/uploads/demo/news-3.svg', FALSE, now(), 'published'
FROM news_categories c WHERE c.slug = 'postgraduate'
ON CONFLICT DO NOTHING;

-- نشاط/تدريب تجريبي منشور (قسم الدورات)
INSERT INTO news (category_id, content_type, title_ar, title_en, summary_ar, summary_en, body_ar, body_en,
                  cover_image, is_featured, published_at, status)
SELECT c.id, 'activity', 'ورشة تدريبية: مهارات القيادة الإدارية', 'Administrative Leadership Skills Workshop',
       'نشاط تجريبي: ورشة عملية لتنمية مهارات القيادة واتخاذ القرار للقيادات الوسطى.',
       'Demo hands-on workshop for leadership skills.',
       'تفاصيل تجريبية للورشة النشطة المرتبطة بوحدة التدريب، تُستبدل من لوحة الإدارة.',
       'Demo details for the training workshop.',
       '/uploads/demo/news-4.svg', FALSE, now(), 'published'
FROM news_categories c WHERE c.slug = 'postgraduate'
ON CONFLICT DO NOTHING;