-- ============================================================
-- NIAS Academy - 026: replace demo data with real content
--  - Removes clearly demo-labelled records (dev seeds) from every
--    content table, on both local and production databases.
--  - Adds the real published news / academic programs / training
--    courses collected from the official NIAS website and the
--    local "true-data" database.
--  - Fixes the broken dean photo path on branch 1 (diwan).
--  - Resets gallery + downloads to real images.
-- Safe to run when some rows already exist (idempotent).
-- ============================================================

-- 1. Programs first (their college FK is ON DELETE SET NULL) ---
-- demo placeholders, test programs and the stray "هنودي" test row
DELETE FROM academic_programs WHERE name_ar ILIKE '%تجريبي%';
DELETE FROM academic_programs WHERE status = 'inactive'
   AND (name_ar ILIKE 'برنامج اختبار القدرة%' OR name_ar = 'هنودي');
-- stray manually-added test row on the dev DB
DELETE FROM academic_programs WHERE name_ar = 'هنودي';

-- 2. Demo faculty members (no real department reference) --------
DELETE FROM faculty_members WHERE name_ar ILIKE '%تجريبي%'
   AND department_id IS NULL;

-- 3. Demo college (cascades to its demo department) -------------
DELETE FROM colleges WHERE name_ar ILIKE '%تجريبي%' OR name_en ILIKE 'demo college';

-- 4. News -------------------------------------------------------
DELETE FROM news WHERE cover_image LIKE '/uploads/demo/%'
   OR title_ar ILIKE '%تجريبي%';

-- 5. Training courses -------------------------------------------
DELETE FROM training_courses WHERE title ILIKE '%تجريبي%';

-- 6. Gallery / downloads / conferences / trustees --------------
DELETE FROM gallery_items WHERE title ILIKE '%تجريبي%' OR image LIKE '/demo/%';
DELETE FROM download_files WHERE title ILIKE '%تجريبي%' OR file_path LIKE '/demo/%';
DELETE FROM conferences WHERE title ILIKE '%تجريبي%';
DELETE FROM trustees WHERE name ILIKE '%تجريبي%';

-- 7. Broken dean photo on branch 1 (diwan) ---------------------
-- The old media-library path was wiped on redeploy -> 404.
-- Clear it; a real durable image can be re-uploaded later.
UPDATE institute_branches SET dean_image = NULL
WHERE id = 1 AND dean_image IS NOT NULL;

-- 8. Real published news ----------------------------------------
-- Normalise category + stray English titles on whatever rows exist,
-- then insert any row that does not yet exist (idempotent by title).
UPDATE news SET category_id = (SELECT id FROM news_categories WHERE slug = 'courses-training')
WHERE title_ar = 'المعهد ينفذ ورشة تدريبية ليوم واحد حول الأمن والسلامة'
   AND category_id IS DISTINCT FROM (SELECT id FROM news_categories WHERE slug = 'courses-training');
UPDATE news SET title_en = NULL
WHERE title_en IS NOT DISTINCT FROM 'NIAS Annual Management Forum 2026'
   OR title_en IS NOT DISTINCT FROM 'Administrative Leadership Skills Workshop'
   OR title_en = 'NIAS Annual Management Forum 2026' OR title_en = 'Administrative Leadership Skills Workshop';

UPDATE news SET category_id = (SELECT id FROM news_categories WHERE slug = 'courses-training')
WHERE title_ar = 'يعلن مركز التدريب في المعهد الوطني عن بدء التسجيل في الدورات القصيرة'
   AND category_id IS DISTINCT FROM (SELECT id FROM news_categories WHERE slug = 'courses-training');
UPDATE news SET category_id = (SELECT id FROM news_categories WHERE slug = 'courses-training')
WHERE title_ar = 'بدء التسجيل في الدورات القصيرة'
   AND category_id IS DISTINCT FROM (SELECT id FROM news_categories WHERE slug = 'courses-training');
UPDATE news SET category_id = (SELECT id FROM news_categories WHERE slug = 'news')
WHERE title_ar = 'اختتام برنامجين تدريبيين للمؤسسة العامة للاتصالات'
   AND category_id IS DISTINCT FROM (SELECT id FROM news_categories WHERE slug = 'news');
UPDATE news SET category_id = (SELECT id FROM news_categories WHERE slug = 'events-and-activities')
WHERE title_ar = 'فعالية للقطاع النسائي بوزارة الخدمة المدنية بذكرى المولد النبوي الشريف'
   AND category_id IS DISTINCT FROM (SELECT id FROM news_categories WHERE slug = 'events-and-activities');
UPDATE news SET category_id = (SELECT id FROM news_categories WHERE slug = 'courses-training')
WHERE title_ar = 'المعهد يختتم برنامج الإكسل المتقدم للهيئة العامة للزكاة'
   AND category_id IS DISTINCT FROM (SELECT id FROM news_categories WHERE slug = 'courses-training');
INSERT INTO news (category_id, content_type, status, title_ar, title_en,
                  summary_ar, body_ar, cover_image, is_featured,
                  published_at, branch_id)
SELECT c.id, 'news', 'published',
       'المعهد ينفذ ورشة تدريبية ليوم واحد حول الأمن والسلامة',
       NULL,
       'ورشة تدريبية حول الأمن والسلامة بالمعهد الوطني للعلوم الإدارية.',
       '<p>ورشة تدريبية حول الأمن والسلامة بالمعهد الوطني للعلوم الإدارية.</p>',
       '/uploads/design/site/main_1787071099_197.jpg', TRUE,
       '2026-08-28 09:00:00+03', 1
FROM news_categories c WHERE c.slug = 'courses-training'
   AND NOT EXISTS (SELECT 1 FROM news n WHERE n.title_ar = 'المعهد ينفذ ورشة تدريبية ليوم واحد حول الأمن والسلامة');

INSERT INTO news (category_id, content_type, status, title_ar, title_en,
                  summary_ar, body_ar, cover_image, is_featured,
                  published_at, branch_id)
SELECT c.id, 'news', 'published',
       'يعلن مركز التدريب في المعهد الوطني عن بدء التسجيل في الدورات القصيرة',
       NULL,
       'بدء التسجيل في الدورات التدريبية القصيرة بمركز التدريب بالمعهد الوطني.',
       '<p>بدء التسجيل في الدورات التدريبية القصيرة بمركز التدريب بالمعهد الوطني.</p>',
       '/uploads/design/site/main_1786901865_894.jpg', TRUE,
       '2026-08-15 09:00:00+03', 1
FROM news_categories c WHERE c.slug = 'courses-training'
   AND NOT EXISTS (SELECT 1 FROM news n WHERE n.title_ar = 'يعلن مركز التدريب في المعهد الوطني عن بدء التسجيل في الدورات القصيرة');

INSERT INTO news (category_id, content_type, status, title_ar, title_en,
                  summary_ar, body_ar, cover_image, is_featured,
                  published_at, branch_id)
SELECT c.id, 'news', 'published',
       'بدء التسجيل في الدورات القصيرة',
       NULL,
       'مركز التدريب يفتح باب التسجيل في الدورات القصيرة للعام الجديد.',
       '<p>مركز التدريب يفتح باب التسجيل في الدورات القصيرة للعام الجديد.</p>',
       '/uploads/design/site/main_1786899199_299.jpg', FALSE,
       '2026-08-15 09:00:00+03', 1
FROM news_categories c WHERE c.slug = 'courses-training'
   AND NOT EXISTS (SELECT 1 FROM news n WHERE n.title_ar = 'بدء التسجيل في الدورات القصيرة');

INSERT INTO news (category_id, content_type, status, title_ar, title_en,
                  summary_ar, body_ar, cover_image, is_featured,
                  published_at, branch_id)
SELECT c.id, 'news', 'published',
       'اختتام برنامجين تدريبيين للمؤسسة العامة للاتصالات',
       NULL,
       'اختتم المعهد برنامجين تدريبيين لكوادر المؤسسة العامة للاتصالات.',
       '<p>اختتم المعهد برنامجين تدريبيين لكوادر المؤسسة العامة للاتصالات.</p>',
       '/uploads/design/site/main_1785948565_301.jpg', FALSE,
       '2026-08-05 09:00:00+03', 1
FROM news_categories c WHERE c.slug = 'news'
   AND NOT EXISTS (SELECT 1 FROM news n WHERE n.title_ar = 'اختتام برنامجين تدريبيين للمؤسسة العامة للاتصالات');

INSERT INTO news (category_id, content_type, status, title_ar, title_en,
                  summary_ar, body_ar, cover_image, is_featured,
                  published_at, branch_id)
SELECT c.id, 'event', 'published',
       'فعالية للقطاع النسائي بوزارة الخدمة المدنية بذكرى المولد النبوي الشريف',
       NULL,
       'فعالية خطابية وثقافية للقطاع النسائي بالمعهد الوطني بمناسبة ذكرى المولد النبوي الشريف.',
       '<p>فعالية خطابية وثقافية للقطاع النسائي بالمعهد الوطني بمناسبة ذكرى المولد النبوي الشريف.</p>',
       '/uploads/design/site/main_1787497216_201.jpg', FALSE,
       '2026-08-20 09:00:00+03', 1
FROM news_categories c WHERE c.slug = 'events-and-activities'
   AND NOT EXISTS (SELECT 1 FROM news n WHERE n.title_ar = 'فعالية للقطاع النسائي بوزارة الخدمة المدنية بذكرى المولد النبوي الشريف');

INSERT INTO news (category_id, content_type, status, title_ar, title_en,
                  summary_ar, body_ar, cover_image, is_featured,
                  published_at, branch_id)
SELECT c.id, 'activity', 'published',
       'المعهد يختتم برنامج الإكسل المتقدم للهيئة العامة للزكاة',
       NULL,
       'ختام برنامج تدريبي في أساسيات الإكسل المتقدم لكوادر الهيئة العامة للزكاة.',
       '<p>ختام برنامج تدريبي في أساسيات الإكسل المتقدم لكوادر الهيئة العامة للزكاة.</p>',
       '/uploads/design/site/main_1778690951_693.jpg', FALSE,
       '2026-07-10 09:00:00+03', 1
FROM news_categories c WHERE c.slug = 'courses-training'
   AND NOT EXISTS (SELECT 1 FROM news n WHERE n.title_ar = 'المعهد يختتم برنامج الإكسل المتقدم للهيئة العامة للزكاة');

-- 9. Real academic programs (13 active) --------------------------
INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 2, 2, 'بكالوريوس إدارة أعمال', NULL, 'bachelor',
       'برنامج بكالوريوس إدارة أعمال يهدف إلى إعداد كوادر مؤهلة علميًا ومهنيًا في مجال الإدارة العامة وإدارة الأعمال، قادرة على قيادة المنظمات واتخاذ القرارات الاستراتيجية والتعامل مع متغيرات بيئة الأعمال الحديثة. ويغطي البرنامج مجالات أساسية مثل إدارة الموارد البشرية، التسويق، الإدارة المالية، السلوك التنظيمي، إدارة العمليات، وريادة الأعمال، إلى جانب تدريبات عملية وحالات دراسية من الواقع اليمني والإقليمي، بما يؤهل الخريج للعمل في القطاعين العام والخاص والمؤسسات المالية والخدمية.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'بكالوريوس إدارة أعمال');

INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 2, 3, 'بكالوريوس المحاسبة والمراجعة', NULL, 'bachelor',
       'برنامج بكالوريوس المحاسبة والمراجعة يهدف إلى تخريج محاسبين ومراجعين مؤهلين للعمل في الشركات والمؤسسات المالية والمصارف ومكاتب المراجعة والتدقيق، وإعداد كوادر قادرة على إمساك الدفاتر وإعداد القوائم المالية وفق المعايير المحاسبية والعمل على تطويرها بما يتناسب مع البيئة اليمنية. يشمل البرنامج مساقات متخصصة في المحاسبة المالية، محاسبة التكاليف والشركات، المحاسبة الحكومية، الزكاة والضرائب، المراجعة والتدقيق، النظم المحاسبية المحوسبة، وإدارة العمليات المالية، مع تطبيقات عملية في القوائم المالية والتقارير المالية.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'بكالوريوس المحاسبة والمراجعة');

INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 2, 4, 'بكالوريوس الاقتصاد والعلوم المالية والمصرفية', NULL, 'bachelor',
       'برنامج بكالوريوس الاقتصاد والعلوم المالية والمصرفية يهدف إلى تأهيل كوادر متخصصة في التحليل الاقتصادي والعلوم المالية والمصرفية، مؤهلة للعمل في البنوك المركزية والمصارف التجارية والإسلامية، والمؤسسات المالية، ووحدات إدارة القروض والاستثمار. يتناول البرنامج مبادئ الاقتصاد الجزئي والكلي، اقتصاديات النقود والبنوك، السياسات النقدية والمالية، التمويل والاستثمار، إدارة المصارف، والتمويل الإسلامي، إلى جانب التحليل المالي وتقييم الفرص الاستثمارية بأدوات كمية حديثة.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'بكالوريوس الاقتصاد والعلوم المالية والمصرفية');

INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 3, 6, 'بكالوريوس النظم وتقنية المعلومات', NULL, 'bachelor',
       'برنامج بكالوريوس النظم وتقنية المعلومات يهدف إلى إعداد كوادر متخصصة في تحليل وتصميم وتطوير نظم المعلومات وإدارتها، مؤهلة للعمل في إدارات تقنية المعلومات في المؤسسات الحكومية والخاصة وشركات البرمجيات. يغطي البرنامج أساسيات البرمجة، قواعد البيانات، تحليل وتصميم النظم، شبكات الحاسوب، الأمن السيبراني، إدارة مشاريع تقنية المعلومات، والتجارة الإلكترونية، مع مشاريع تطبيقية تُعرّض الطالب لبيئة العمل التقنية الحقيقية بالشكل الذي يلبي متطلبات سوق العمل الحديث.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'بكالوريوس النظم وتقنية المعلومات');

INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 2, 5, 'بكالوريوس القانون والإدارة المحلية', NULL, 'bachelor',
       'برنامج بكالوريوس القانون والإدارة المحلية يهدف إلى إعداد متخصصين في العلوم القانونية والإدارية القادرين على فهم التشريعات والقوانين وإدارة العمل الحكومي والمحلي، والعمل في الجهات القضائية والإدارية ومكاتب المحاماة ووحدات الإدارة المحلية. يتناول البرنامج مدخل إلى العلوم القانونية، القانون الإداري والدستوري، القانون التجاري والمدني، الإدارة المحلية والحكم الرشيد، التشريعات اليمنية، وإعداد العقود واللوائح، بما يؤهل الخريج للعمل في مرافق العدالة والمؤسسات العامة.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'بكالوريوس القانون والإدارة المحلية');

INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 5, 10, 'ماجستير أكاديمي إدارة عامة', NULL, 'master_academic',
       'برنامج الماجستير الأكاديمي في الإدارة العامة برنامج دراسات عليا يهدف إلى إعداد باحثين وأكاديميين في مجال الإدارة العامة، وتمكين الدارسين من إجراء البحوث والدراسات المتعمقة في السياسات العامة والتخطيط والتطوير الإداري. يعتمد البرنامج على المنهج العلمي الحديث، ويهدف إلى تطوير قدرات الدارسين على التحليل النقدي للظواهر الإدارية وتقييم السياسات والبرامج العامة، ورفع كفاءة المؤسسات العامة من خلال كوادر متمكنة من الأدوات البحثية المتقدمة.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'ماجستير أكاديمي إدارة عامة');

INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 5, 10, 'ماجستير إدارة عامة وموارد بشرية', NULL, 'master_executive',
       'برنامج الماجستير التنفيذي في الإدارة العامة والموارد البشرية موجه للقيادات والممارسين العاملين في مجال الإدارة والموارد البشرية، ويهدف إلى تطوير مهاراتهم القيادية والإدارية بما يمكنهم من التعامل مع تحديات العصر. يركز البرنامج على التطبيقات العملية: إدارة الأداء، التخطيط الاستراتيجي، القيادة التحويلية، إدارة التغيير، التعويضات والحوافز، وإعداد السياسات والتقارير التنفيذية، ضمن جدول دراسي مرن يلائم طبيعة عمل الممارسين.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'ماجستير إدارة عامة وموارد بشرية');

INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 4, 9, 'دبلوم متوسط محاسبة', NULL, 'diploma',
       'برنامج الدبلوم المتوسط في المحاسبة برنامج عملي مهني يهدف إلى إعداد كوادر محاسبية مؤهلة لإمساك الدفاتر والسجلات المحاسبية وإعداد القيود والتسويات والقوائم المالية في المؤسسات المختلفة. يغطي البرنامج المبادئ المحاسبية، المحاسبة المالية، محاسبة التكاليف، الزكاة والضرائب، والبرامج المحاسبية المحوسبة، مع تأكيد قوي على التطبيق العملي والعمل المكتبي، بما يهيئ الدارس للانخراط المباشر في سوق العمل بعد التخرج.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'دبلوم متوسط محاسبة');

INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 4, 8, 'دبلوم متوسط إدارة أعمال', NULL, 'diploma',
       'برنامج الدبلوم المتوسط في إدارة الأعمال برنامج تطبيقي يهدف إلى تأهيل الدارسين للعمل في الوظائف الإدارية والإشرافية في المؤسسات العامة والخاصة في فترة زمنية قصيرة. يتضمن البرنامج مساقات في مبادئ الإدارة، إدارة المكاتب، إدارة الموارد البشرية، التسويق، السلوك التنظيمي، وأساسيات المحاسبة المالية، إلى جانب تدريبات عملية في السكرتارية وتنظيم الاجتماعات وإعداد المراسلات الإدارية.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'دبلوم متوسط إدارة أعمال');

INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 4, 8, 'دبلوم متوسط إدارة مكاتب', NULL, 'diploma',
       'برنامج الدبلوم المتوسط في إدارة المكاتب مؤهل مهني متخصص لإعداد سكرتيرين ومديري مكاتب محترفين القادرين على إدارة المكاتب وتنظيم الوقت والمواعيد وإعداد الوثائق والمراسلات وتنسيق الاجتماعات والفعاليات. يشمل البرنامج مهارات الاتصال الإداري الفعال، السكرتارية التنفيذية، إدارة الوثائق والأرشفة الإلكترونية، برامج الحاسوب المكتبية، وآداب الضيافة والاستقبال، بما يوفر فرص عمل واسعة في المؤسسات الحكومية والخاصة.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'دبلوم متوسط إدارة مكاتب');

INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 4, 8, 'دبلوم متوسط برمجة حاسوب', NULL, 'diploma',
       'برنامج الدبلوم المتوسط في برمجة الحاسوب برنامج تقني مهني يهدف إلى تأهيل مبرمجين قادرين على تطوير التطبيقات والمواقع والبرمجيات الخدمية وبرمجة قواعد البيانات. يغطي البرنامج أساسيات البرمجة بلغات حديثة، هياكل البيانات، قواعد البيانات، تطوير تطبيقات الويب والمواقع الديناميكية، ومبادئ إدارة المشاريع التقنية، مع مشاريع تخرج تطبيقية يكتسب من خلالها الدارس تجربة عملية كاملة في دورة حياة تطوير البرمجيات.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'دبلوم متوسط برمجة حاسوب');

INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 4, 8, 'دبلوم متوسط جرافكس وملتيميديا', NULL, 'diploma',
       'برنامج الدبلوم المتوسط في الجرافكس والوسائط المتعددة برنامج إبداعي تقني يهدف إلى إعداد مصممين جرافيك وفنيي وسائط متعددة مؤهلين للعمل في مكاتب التصميم والإعلان والمؤسسات الإعلامية. يشمل البرنامج أساسيات التصميم البصري، برامج التصميم والإخراج الفني، تصميم الشعارات والهوية البصرية، المونتاج وتحريك الرسوم، وإنتاج محتوى الوسائط المتعددة للويب ووسائل التواصل الاجتماعي، بما يمكن الخريج من بناء محفظة أعمال احترافية.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'دبلوم متوسط جرافكس وملتيميديا');

INSERT INTO academic_programs (college_id, department_id, name_ar, name_en,
                               program_type, description, admission_open, status, branch_id)
SELECT 4, 8, 'دبلوم متوسط إدارة مستشفيات وإدارة صحية', NULL, 'diploma',
       'برنامج الدبلوم المتوسط في إدارة المستشفيات والإدارة الصحية برنامج متخصص يهدف إلى تأهيل كوادر إدارية للعمل في المرافق الصحية من مستشفيات ومراكز طبية ومؤسسات الرعاية الصحية. يغطي البرنامج مبادئ الإدارة الصحية، إدارة المستشفيات والسجلات الطبية، إدارة الموارد البشرية الصحية، الاقتصاد الصحي والسياسات الصحية، والجودة والسلامة في المنشآت الصحية، بما يمكن الخريج من شغل المناصب الإدارية المساندة في القطاع الصحي العام والخاص.',
       TRUE, 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM academic_programs p WHERE p.name_ar = 'دبلوم متوسط إدارة مستشفيات وإدارة صحية');

-- 10. Real training courses (branch 1, open) -------------------
INSERT INTO training_courses (title, description, fees, start_date, end_date,
                              location, capacity, trainer, status, image_url, branch_id)
SELECT 'دورة الأمن السيبراني المتقدمة',
       'برنامج تدريبي متقدم في الأمن السيبراني يغطي حماية الأنظمة والشبكات، إدارة الثغرات، الاستجابة للحوادث، وأساسيات أمن المعلومات، مع تطبيقات عملية على بيئات حقيقية لبناء قدرات المتدربين في تأمين البنية التقنية للمؤسسات.',
       50000, '2026-10-07', '2026-10-23', 'صنعاء — المعهد الوطني', 25,
       'م. عبدالله الحوثي', 'open', '/uploads/design/site/course_cybersecurity.webp', 1
WHERE NOT EXISTS (SELECT 1 FROM training_courses tc WHERE tc.title = 'دورة الأمن السيبراني المتقدمة');

INSERT INTO training_courses (title, description, fees, start_date, end_date,
                              location, capacity, trainer, status, image_url, branch_id)
SELECT 'تطوير تطبيقات الويب',
       'دورة عملية في تطوير تطبيقات الويب تشمل أساسيات HTML/CSS/JavaScript، بناء الواجهات التفاعلية، الربط مع قواعد البيانات، ونشر التطبيقات، بما يؤهل المتدرب لإنتاج تطبيقات ويب متكاملة تواكب متطلبات سوق العمل.',
       60000, '2026-10-07', '2026-10-23', 'صنعاء — المعهد الوطني', 25,
       'م. عمر الشرعبي', 'open', '/uploads/design/site/course_webdev.webp', 1
WHERE NOT EXISTS (SELECT 1 FROM training_courses tc WHERE tc.title = 'تطوير تطبيقات الويب');

INSERT INTO training_courses (title, description, fees, start_date, end_date,
                              location, capacity, trainer, status, image_url, branch_id)
SELECT 'إدارة المشاريع PMP',
       'دورة إعداد لمحترفي إدارة المشاريع وفق منهجية معهد إدارة المشاريع PMI، تغطي نطاق المشروع والجدول الزمني والتكاليف والجودة والمخاطر وعمليات التواصل، مع تطبيقات عملية وحالات دراسية تمهيدًا لاجتياز شهادة PMP.',
       80000, '2026-10-07', '2026-10-23', 'صنعاء — المعهد الوطني', 25,
       'د. محمد العريقي', 'open', '/uploads/design/site/course_pmp.webp', 1
WHERE NOT EXISTS (SELECT 1 FROM training_courses tc WHERE tc.title = 'إدارة المشاريع PMP');

-- Also point existing local rows at the durable images ----------
UPDATE training_courses SET image_url = '/uploads/design/site/course_cybersecurity.webp'
WHERE title = 'دورة الأمن السيبراني المتقدمة' AND image_url IS DISTINCT FROM '/uploads/design/site/course_cybersecurity.webp';
UPDATE training_courses SET image_url = '/uploads/design/site/course_webdev.webp'
WHERE title = 'تطوير تطبيقات الويب' AND image_url IS DISTINCT FROM '/uploads/design/site/course_webdev.webp';
UPDATE training_courses SET image_url = '/uploads/design/site/course_pmp.webp'
WHERE title = 'إدارة المشاريع PMP' AND image_url IS DISTINCT FROM '/uploads/design/site/course_pmp.webp';

-- 11. Real gallery images ---------------------------------------
-- Reuse durable photos already committed under /uploads/design/site.
-- Each row is inserted only if that exact image is not present yet.
INSERT INTO gallery_items (title, image, sort_order)
SELECT * FROM (VALUES
    ('فعالية خطابية بالمعهد', '/uploads/design/site/main_1787497216_201.jpg', 1),
    ('برنامج تدريبي مكثف', '/uploads/design/site/main_1786788776_852.jpg', 2),
    ('حفل التخرج السنوي', '/uploads/design/site/main_1786901865_894.jpg', 3),
    ('ورش عمل متخصصة', '/uploads/design/site/main_1782830791_165.jpg', 4)
) AS g(title, image, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM gallery_items gi WHERE gi.image = g.image);

-- 12. Downloads -------------------------------------------------
-- No durable real file is available yet: keep the table empty so
-- the public downloads page stops serving a 404 /demo file.

