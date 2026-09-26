-- ============================================================
-- NIAS Academy - 031: fix branch data + clean test message
--  - Normalises branch names against their slugs (local DB had
--    names shifted between rows) and forces the address / coords
--    to match each slug (addresses were also shifted in local DB).
--  - Sets correct Sana'a coordinates for HQ (was 0,0 -> ocean).
--  - Deletes the audit test contact message id=4 (t@t.com).
-- ============================================================

-- 1. Normalise branch names + addresses so slug matches city ----
UPDATE institute_branches SET
    name_ar = CASE slug
        WHEN 'sanaa'    THEN 'صنعاء'
        WHEN 'aden'     THEN 'عدن'
        WHEN 'taiz'     THEN 'تعز'
        WHEN 'hodeidah' THEN 'الحديدة'
        WHEN 'ibb'      THEN 'إب'
        WHEN 'mukalla'  THEN 'المكلا'
        ELSE name_ar END,
    name_en = CASE slug
        WHEN 'sanaa'    THEN 'Sana''a'
        WHEN 'aden'     THEN 'Aden'
        WHEN 'taiz'     THEN 'Taiz'
        WHEN 'hodeidah' THEN 'Al Hudaydah'
        WHEN 'ibb'      THEN 'Ibb'
        WHEN 'mukalla'  THEN 'Mukalla'
        ELSE name_en END,
    address = CASE slug
        WHEN 'sanaa'    THEN 'أمانة العاصمة صنعاء - شارع العدل'
        WHEN 'aden'     THEN 'مديرية خورمكسر - العاصمة عدن'
        WHEN 'taiz'     THEN 'محافظة تعز'
        WHEN 'hodeidah' THEN 'محافظة الحديدة'
        WHEN 'ibb'      THEN 'مدينة إب - مديرية الظهار'
        WHEN 'mukalla'  THEN 'مدينة المكلا - محافظة حضرموت'
        ELSE address END,
    latitude = CASE slug
        WHEN 'sanaa'    THEN 15.3517
        WHEN 'aden'     THEN 12.8156
        WHEN 'taiz'     THEN 13.5776
        WHEN 'hodeidah' THEN 14.8029
        WHEN 'ibb'      THEN 13.9673
        WHEN 'mukalla'  THEN 14.5373
        ELSE latitude END,
    longitude = CASE slug
        WHEN 'sanaa'    THEN 44.2062
        WHEN 'aden'     THEN 45.0213
        WHEN 'taiz'     THEN 44.0200
        WHEN 'hodeidah' THEN 42.9545
        WHEN 'ibb'      THEN 44.1833
        WHEN 'mukalla'  THEN 49.1276
        ELSE longitude END,
    phone = CASE slug
        WHEN 'sanaa'    THEN '01222537'
        ELSE phone END
WHERE slug IN ('sanaa', 'aden', 'taiz', 'hodeidah', 'ibb', 'mukalla');

-- 2. Remove the audit test contact message (t@t.com) ----------
DELETE FROM contact_messages
WHERE email = 't@t.com' AND name = 'test' AND subject = 'x';