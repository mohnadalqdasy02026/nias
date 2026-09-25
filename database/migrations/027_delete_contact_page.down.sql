-- restore the "contact" static page row
INSERT INTO site_pages (slug, title_ar, title_en, content_ar, content_en, primary_image, status, created_at, updated_at, deleted_at)
VALUES (
  'contact',
  'تواصل معنا',
  'Contact',
  E'<h2>تواصل معنا</h2>\n<p>يمكنكم التواصل مع المعهد الوطني للعلوم الإدارية عبر القنوات التالية، أو عبر نموذج التواصل أو زيارة أقرب فرع من فروع المعهد في محافظات الجمهورية.</p>\n<h2>معلومات الاتصال</h2>\n<ul>\n  <li><strong>العنوان:</strong> أمانة العاصمة صنعاء - شارع العدل — الجمهورية اليمنية</li>\n  <li><strong>الهاتف:</strong> 01222537</li>\n  <li><strong>البريد الإلكتروني:</strong> nias@nias-ye.academy</li>\n</ul>\n<p>فروع المعهد: صنعاء (المركز الرئيسي)، عدن، إب، حضرموت، الحديدة، صعدة.</p>',
  'Demo contact page content.',
  NULL,
  'published',
  NOW(),
  NOW(),
  NULL
)
ON CONFLICT (slug) DO NOTHING;