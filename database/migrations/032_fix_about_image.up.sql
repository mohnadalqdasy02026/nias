-- ============================================================
-- NIAS Academy - 032: fix broken about page hero image
--  - The about page referenced /uploads/TbJOggRH63K7EaWeNSu8.webp
--    which does not exist (404 on the live site). Point it at
--    the real shipped image that is served from /uploads/design.
-- ============================================================

UPDATE site_pages
SET primary_image = '/uploads/design/site/about_National.jpg'
WHERE slug = 'about'
  AND primary_image IS DISTINCT FROM '/uploads/design/site/about_National.jpg'
  AND (
        primary_image IS NULL
     OR primary_image = ''
     OR primary_image NOT IN (
          SELECT file_path
          FROM media_library
          WHERE file_path IS NOT NULL
        )
     OR primary_image NOT LIKE '/uploads/design/site/%'
     OR primary_image NOT LIKE '%about%'
  );