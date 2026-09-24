-- 010 (down): remove demo static pages
DELETE FROM site_pages WHERE slug IN ('about', 'contact', 'terms')
  AND content_ar LIKE '%يستبدل عبر نظام إدارة المحتوى%';