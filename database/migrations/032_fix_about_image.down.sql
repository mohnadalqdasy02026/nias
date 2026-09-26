-- ============================================================
-- NIAS Academy - 032 down: revert about hero image to old path
-- ============================================================

UPDATE site_pages
SET primary_image = '/uploads/TbJOggRH63K7EaWeNSu8.webp'
WHERE slug = 'about'
  AND primary_image = '/uploads/design/site/about_National.jpg';