-- ============================================================
-- NIAS Academy - 042: trustees board + scientific conferences
--  - Mirrors the official "مجلس الأمناء" page (board members chart)
--    and "المؤتمرات العلمية" page (three announced events).
--  - Both are regular site_pages, fully editable from
--    Admin > الصفحات الثابتة.
-- ============================================================

INSERT INTO site_pages (slug, title_ar, title_en, content_ar, content_en, primary_image, status) VALUES
    (
        'trustees',
        'مجلس أمناء المعهد',
        'Board of Trustees',
        '<p>أعضاء مجلس الأمناء</p>',
        '<p>Board members</p>',
        '/uploads/design/site/trustees.png',
        'published'
    ),
    (
        'conferences',
        'المؤتمرات العلمية',
        'Scientific Conferences',
        '<p class="section-subtitle">انضم إلى فعالياتنا الأكاديمية القادمة ووسّع آفاقك.</p>
<div class="conf-list">
  <article class="card conf-card">
    <div class="conf-meta">
      <span class="conf-date">2025-05-15</span>
      <span class="conf-status conf-status--open">التسجيل مفتوح</span>
    </div>
    <h3>المؤتمر الوطني الخامس للعلوم الإدارية</h3>
    <p>يناقش المؤتمر أحدث الاتجاهات في الإدارة العامة والحوكمة الإلكترونية بمشاركة نخبة من الأكاديميين.</p>
    <p class="conf-place">قاعة المؤتمرات الكبرى - صنعاء</p>
  </article>
  <article class="card conf-card">
    <div class="conf-meta">
      <span class="conf-date">2025-03-10</span>
      <span class="conf-status conf-status--soon">قريباً</span>
    </div>
    <h3>ندوة التحول الرقمي في المؤسسات الحكومية</h3>
    <p>ندوة متخصصة تستعرض استراتيجيات التحول الرقمي وتحديات التطبيق في القطاع العام.</p>
    <p class="conf-place">المعهد الوطني - القاعة الرئيسية</p>
  </article>
  <article class="card conf-card">
    <div class="conf-meta">
      <span class="conf-date">2025-02-20</span>
      <span class="conf-status conf-status--done">انتهى</span>
    </div>
    <h3>ورشة عمل: القيادة الإدارية الفعالة</h3>
    <p>ورشة عمل تفاعلية لتطوير مهارات القيادة لدى مدراء الإدارات الوسطى.</p>
    <p class="conf-place">مركز التدريب - القاعة 3</p>
  </article>
</div>',
        NULL,
        NULL,
        'published'
    )
ON CONFLICT (slug) DO NOTHING;
