-- ============================================================
-- NIAS Academy - 041: dean + organizational structure pages
--  - Mirrors the two institutional pages from the official site.
--  - Both are regular site_pages, so their text/image stay editable
--    from Admin > الصفحات الثابتة.
--  - The structure chart ships with the web build at
--    /uploads/design/site/structure.png and is referenced from the
--    page content (replaceable via the admin editor).
-- ============================================================

INSERT INTO site_pages (slug, title_ar, title_en, content_ar, content_en, status) VALUES
    (
        'dean',
        'كلمة عميد المعهد',
        'Dean''s Message',
        NULL,
        NULL,
        'published'
    ),
    (
        'structure',
        'الهيكل التنظيمي',
        'Organizational Structure',
        '<p><img src="/uploads/design/site/structure.png" alt="الهيكل التنظيمي للمعهد" style="max-width:100%;height:auto;border-radius:12px;" /></p>',
        '<p><img src="/uploads/design/site/structure.png" alt="Organizational structure" style="max-width:100%;height:auto;border-radius:12px;" /></p>',
        'published'
    )
ON CONFLICT (slug) DO NOTHING;
