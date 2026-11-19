-- Rename Sana'a branch/headquarters references to الديوان العام (keep slug 'sanaa' for compatibility).
UPDATE institute_branches
SET
  name_ar = 'الديوان العام',
  name_en = 'General Bureau',
  address = COALESCE(NULLIF(regexp_replace(address, 'أمانة العاصمة\s*صنعاء\s*[-—]\s*شارع العدل', 'الديوان العام - شارع العدل، أمانة العاصمة'), address), 'الديوان العام - شارع العدل، أمانة العاصمة')
WHERE slug = 'sanaa';

-- Update known demo/venue location strings in training courses.
UPDATE training_courses
SET location = replace(location, 'صنعاء — المعهد الوطني', 'الديوان العام — المعهد الوطني')
WHERE location LIKE '%صنعاء — المعهد الوطني%';

UPDATE training_courses
SET location = 'الديوان العام'
WHERE location = 'صنعاء';

-- Update conference demo location strings where present.
UPDATE conferences
SET location = replace(location, 'صنعاء', 'الديوان العام')
WHERE location LIKE '%صنعاء%';
