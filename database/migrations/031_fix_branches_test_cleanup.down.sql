-- ============================================================
-- NIAS Academy - 031 down
--  - Reverts the normalisation of branch fixtures (names/coords).
--  - Restores the test contact message that was deleted.
-- ============================================================

UPDATE institute_branches SET
    name_ar = 'المعهد الوطني للعلوم الإدارية — الديوان',
    address = 'أمانة العاصمة صنعاء - شارع العدل — الجمهورية اليمنية',
    phone   = '01222537',
    latitude  = 0,
    longitude = 0
WHERE slug = 'sanaa';

UPDATE institute_branches SET
    name_ar = 'المعهد الوطني للعلوم الإدارية — فرع محافظة عدن',
    address = 'عدن — الجمهورية اليمنية',
    latitude = NULL, longitude = NULL
WHERE slug = 'aden';

UPDATE institute_branches SET
    name_ar = 'المعهد الوطني للعلوم الإدارية — فرع إب',
    address = 'إب — الجمهورية اليمنية',
    latitude = NULL, longitude = NULL
WHERE slug = 'taiz';

UPDATE institute_branches SET
    name_ar = 'المعهد الوطني للعلوم الإدارية — فرع محافظة حضرموت',
    address = 'حضرموت — الجمهورية اليمنية',
    latitude = NULL, longitude = NULL
WHERE slug = 'hodeidah';

UPDATE institute_branches SET
    name_ar = 'المعهد الوطني للعلوم الإدارية — فرع محافظة الحديدة',
    address = 'الحديدة — الجمهورية اليمنية',
    latitude = NULL, longitude = NULL
WHERE slug = 'ibb';

UPDATE institute_branches SET
    name_ar = 'المعهد الوطني للعلوم الإدارية — فرع محافظة صعدة',
    address = 'صعدة — الجمهورية اليمنية',
    latitude = NULL, longitude = NULL
WHERE slug = 'mukalla';

INSERT INTO contact_messages (name, email, phone, subject, message, status, created_at, updated_at)
SELECT 'test', 't@t.com', NULL, 'x', 'test message', 'new', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM contact_messages WHERE email = 't@t.com' AND name = 'test');