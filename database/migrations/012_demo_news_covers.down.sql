-- 012 down: إزالة فعاليات/أنشطة الديمو المصاحبة لهذه الهجرة واسترجاع أخبار الديمو دون غلاف
DELETE FROM news
 WHERE content_type IN ('event', 'activity')
   AND title_ar IN ('ملتقى NIAS السنوي للإدارة 2026', 'ورشة تدريبية: مهارات القيادة الإدارية');

UPDATE news
   SET cover_image = NULL
 WHERE title_ar IN ('خبر تجريبي: افتتاح الفصل الجديد')
    OR title_ar LIKE 'خبر تجريبي (Placeholder)%';