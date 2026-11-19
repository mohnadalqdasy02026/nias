-- Remove the hardcoded structure.png image from the structure page content.
-- The image is now managed via the "images" array on site_pages (uploaded from admin).
UPDATE site_pages
SET content_ar = REPLACE(content_ar, '<p><img src="/uploads/design/site/structure.png" alt="الهيكل التنظيمي للمعهد" style="max-width:100%;height:auto;border-radius:12px;" /></p>', ''),
    content_en = REPLACE(content_en, '<p><img src="/uploads/design/site/structure.png" alt="Organizational structure" style="max-width:100%;height:auto;border-radius:12px;" /></p>', '')
WHERE slug = 'structure';
